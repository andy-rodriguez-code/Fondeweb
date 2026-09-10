// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Programa100Page from './programa-100.jsx'

// Mismo patrón que contactenos.test.jsx: se prueba que los dos
// consentimientos bloqueen y que salgan del payload de campos. No se prueba
// maquetación.
//
// El pad de firma usa un <canvas>, que en jsdom no tiene contexto 2D. Se
// sustituye lo mínimo para que useFirma pueda dibujar y exportar.

function montar() {
  return render(
    <MemoryRouter>
      <Programa100Page />
    </MemoryRouter>,
  )
}

// Se selecciona por id y no por etiqueta: «Número de identificación» y
// «Teléfono» aparecen dos veces —ahorrador y beneficiario— y getByLabelText
// no puede desambiguarlas.
async function llenarLoObligatorio(usuario) {
  await usuario.type(document.getElementById('p100-nombre'), 'Ana Gómez')
  await usuario.type(document.getElementById('p100-documento'), '1098765432')
  await usuario.type(document.getElementById('p100-telefono'), '3174357685')
  await usuario.type(document.getElementById('p100-cuota'), '30000')
}

// La firma vive en el canvas; en jsdom se marca directamente el estado que
// useFirma expone al dibujar.
async function firmar(usuario) {
  const lienzo = document.getElementById('p100-firma')
  await usuario.pointer([
    { target: lienzo, coords: { clientX: 10, clientY: 10 }, keys: '[MouseLeft>]' },
    { target: lienzo, coords: { clientX: 60, clientY: 40 } },
    { target: lienzo, keys: '[/MouseLeft]' },
  ])
}

describe('formulario del Programa 100', () => {
  beforeEach(() => {
    // jsdom no implementa la API de captura de puntero. useFirma la llama en
    // la primera línea de onPointerDown, así que sin esto el trazo lanza y
    // hayFirma nunca se activa.
    Element.prototype.setPointerCapture = vi.fn()
    Element.prototype.releasePointerCapture = vi.fn()

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      scale: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      lineWidth: 0,
      lineCap: '',
      lineJoin: '',
      strokeStyle: '',
    }))
    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => 'data:image/png;base64,iVBORw0KGgo=',
    )

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, radicado: 'P100-2026-0001' }),
    }))
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('cada consentimiento tiene su propio data-error', async () => {
    const usuario = userEvent.setup()
    montar()

    await usuario.click(screen.getByRole('button', { name: 'Guardar registro' }))

    const terminos = screen.getByLabelText('Acepto los términos del Programa 100.')
    const datos = screen.getByLabelText(/Autorizo la política de/)

    expect(terminos.closest('.campo').getAttribute('data-error')).toBe('si')
    expect(datos.closest('.campo').getAttribute('data-error')).toBe('si')
    // Son dos contenedores distintos: no comparten estado.
    expect(terminos.closest('.campo')).not.toBe(datos.closest('.campo'))
  })

  it('la autorización de datos bloquea aunque los términos estén aceptados', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarLoObligatorio(usuario)
    await firmar(usuario)
    await usuario.click(screen.getByLabelText('Acepto los términos del Programa 100.'))
    await usuario.click(screen.getByRole('button', { name: 'Guardar registro' }))

    expect(fetch).not.toHaveBeenCalled()
    expect(
      screen.getByLabelText(/Autorizo la política de/).closest('.campo').getAttribute('data-error'),
    ).toBe('si')
  })

  it('los términos bloquean aunque la autorización esté marcada', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarLoObligatorio(usuario)
    await firmar(usuario)
    await usuario.click(screen.getByLabelText(/Autorizo la política de/))
    await usuario.click(screen.getByRole('button', { name: 'Guardar registro' }))

    expect(fetch).not.toHaveBeenCalled()
    expect(
      screen
        .getByLabelText('Acepto los términos del Programa 100.')
        .closest('.campo')
        .getAttribute('data-error'),
    ).toBe('si')
  })

  it('envía con todo completo y deja las casillas fuera de campos', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarLoObligatorio(usuario)
    await firmar(usuario)
    await usuario.click(screen.getByLabelText('Acepto los términos del Programa 100.'))
    await usuario.click(screen.getByLabelText(/Autorizo la política de/))
    await usuario.click(screen.getByRole('button', { name: 'Guardar registro' }))

    expect(fetch).toHaveBeenCalledOnce()
    const cuerpo = JSON.parse(fetch.mock.calls[0][1].body)

    expect(cuerpo.autoriza).toBe(true)
    expect(cuerpo.campos.autoriza).toBeUndefined()
    expect(cuerpo.campos.acepta).toBeUndefined()
    // El de los términos se guarda como dato legible para la hoja, con otra
    // clave, no como el booleano del estado.
    expect(cuerpo.campos['acepta-terminos']).toBe('Sí')
    expect(cuerpo.campos.nombre).toBe('Ana Gómez')
    expect(cuerpo.firma).toContain('data:image/png;base64,')
  })

  it('lleva el foco al primer error, que puede ser la firma', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarLoObligatorio(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Guardar registro' }))

    expect(fetch).not.toHaveBeenCalled()
    expect(document.activeElement?.id).toBe('p100-firma')
  })

  it('muestra el radicado del servidor en el consecutivo del formato', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarLoObligatorio(usuario)
    await firmar(usuario)
    await usuario.click(screen.getByLabelText('Acepto los términos del Programa 100.'))
    await usuario.click(screen.getByLabelText(/Autorizo la política de/))
    await usuario.click(screen.getByRole('button', { name: 'Guardar registro' }))

    // Aparece en dos lugares a propósito: el consecutivo del encabezado del
    // formato y el aviso de confirmación.
    const apariciones = await screen.findAllByText('P100-2026-0001')
    expect(apariciones).toHaveLength(2)
    expect(document.querySelector('.registro__consecutivo strong').textContent).toBe(
      'P100-2026-0001',
    )
  })

  it('el enlace de la casilla lleva a la política de datos', () => {
    montar()

    expect(
      screen.getByRole('link', { name: 'tratamiento de datos' }).getAttribute('href'),
    ).toBe('/politica-de-datos')
  })
})

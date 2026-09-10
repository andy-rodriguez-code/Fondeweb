// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ContactenosPage from './contactenos.jsx'

// Estas pruebas cubren una sola cosa: que la autorización de tratamiento de
// datos sea de verdad obligatoria. Un «obligatorio» sin prueba es un deseo, y
// acá hay una ley detrás (1581 de 2012).
//
// No se prueba la maquetación ni los textos: eso cambia con el cliente y una
// prueba así solo estorba.

function montar() {
  return render(
    <MemoryRouter>
      <ContactenosPage />
    </MemoryRouter>,
  )
}

async function llenarLosCuatroCampos(usuario) {
  await usuario.type(screen.getByLabelText('Nombre completo'), 'Ana Gómez')
  await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.com')
  await usuario.type(screen.getByLabelText('Teléfono'), '3174357685')
  await usuario.selectOptions(screen.getByLabelText('Asunto'), 'Créditos')
}

describe('formulario de Contáctenos', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, radicado: 'CTC-2026-0001' }),
    }))
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('no envía si falta la autorización de datos, aunque todo lo demás esté lleno', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarLosCuatroCampos(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(fetch).not.toHaveBeenCalled()
    const casilla = screen.getByLabelText(/Autorizo la política de/)
    expect(casilla.closest('.campo').getAttribute('data-error')).toBe('si')
  })

  it('envía cuando la autorización está marcada, y la manda aparte de los campos', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarLosCuatroCampos(usuario)
    await usuario.click(screen.getByLabelText(/Autorizo la política de/))
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(fetch).toHaveBeenCalledOnce()
    const cuerpo = JSON.parse(fetch.mock.calls[0][1].body)
    expect(cuerpo.autoriza).toBe(true)
    // El consentimiento no es un dato del mensaje: no viaja entre los campos.
    expect(cuerpo.campos.autoriza).toBeUndefined()
    expect(cuerpo.campos.nombre).toBe('Ana Gómez')
  })

  it('muestra el radicado que devuelve el servidor', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarLosCuatroCampos(usuario)
    await usuario.click(screen.getByLabelText(/Autorizo la política de/))
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(await screen.findByText('CTC-2026-0001')).toBeTruthy()
  })

  it('el enlace de la casilla lleva a la política de datos', () => {
    montar()

    expect(
      screen.getByRole('link', { name: 'tratamiento de datos' }).getAttribute('href'),
    ).toBe('/politica-de-datos')
  })

  it('marca los cuatro campos obligatorios cuando se envía vacío', async () => {
    const usuario = userEvent.setup()
    montar()

    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(fetch).not.toHaveBeenCalled()
    for (const etiqueta of ['Nombre completo', 'Correo electrónico', 'Teléfono', 'Asunto']) {
      expect(screen.getByLabelText(etiqueta).closest('.campo').getAttribute('data-error')).toBe(
        'si',
      )
    }
  })
})

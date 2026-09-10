import { describe, expect, it, vi, beforeEach } from 'vitest'
import { enviarFormulario, ERRORES } from './enviarFormulario.js'

describe('enviarFormulario', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('devuelve el radicado que asigna el servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, radicado: 'CTC-2026-0007' }),
    }))

    const radicado = await enviarFormulario({
      formulario: 'contacto',
      campos: { nombre: 'Ana' },
      abierto: Date.now() - 9000,
    })

    expect(radicado).toBe('CTC-2026-0007')
  })

  it('manda la demora para que el servidor descarte envíos automáticos', async () => {
    const espia = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, radicado: 'CTC-2026-0008' }),
    })
    vi.stubGlobal('fetch', espia)

    await enviarFormulario({
      formulario: 'contacto',
      campos: {},
      abierto: Date.now() - 9000,
    })

    const cuerpo = JSON.parse(espia.mock.calls[0][1].body)
    expect(cuerpo.demora).toBeGreaterThanOrEqual(9000)
    expect(cuerpo.website).toBe('')
  })

  it('traduce el error del servidor a un mensaje en español', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: 'limite_alcanzado' }),
    }))

    await expect(
      enviarFormulario({ formulario: 'contacto', campos: {}, abierto: Date.now() - 9000 }),
    ).rejects.toThrow(ERRORES.limite_alcanzado)
  })

  it('conserva el campo señalado por el servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: 'campo_requerido', campo: 'telefono' }),
    }))

    const fallo = await enviarFormulario({
      formulario: 'contacto',
      campos: {},
      abierto: Date.now() - 9000,
    }).catch((error) => error)

    expect(fallo.campo).toBe('telefono')
  })

  it('no deja escapar un fallo de red sin traducir', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(
      enviarFormulario({ formulario: 'contacto', campos: {}, abierto: Date.now() - 9000 }),
    ).rejects.toThrow(ERRORES.sin_conexion)
  })

  it('cae en el mensaje genérico si el servidor devuelve algo ilegible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new SyntaxError('Unexpected token <')
      },
    }))

    await expect(
      enviarFormulario({ formulario: 'contacto', campos: {}, abierto: Date.now() - 9000 }),
    ).rejects.toThrow(ERRORES.desconocido)
  })
})

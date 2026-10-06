import type { Sesion } from './tipos'

const BASE: string = import.meta.env.VITE_API_URL ?? '/api'
const CLAVE = 'botica.sesion'

// Evento que avisa a la app que el token dejó de servir (venció o fue rechazado)
export const SESION_VENCIDA = 'sesion-vencida'

export function leerSesion(): Sesion | null {
  try {
    const guardada = localStorage.getItem(CLAVE)
    return guardada ? (JSON.parse(guardada) as Sesion) : null
  } catch {
    return null
  }
}

export function guardarSesion(sesion: Sesion | null) {
  if (sesion) localStorage.setItem(CLAVE, JSON.stringify(sesion))
  else localStorage.removeItem(CLAVE)
}

export class ErrorApi extends Error {
  estado: number

  constructor(estado: number, mensaje: string) {
    super(mensaje)
    this.estado = estado
  }
}

// Única puerta de salida hacia el backend: agrega el token, convierte a JSON
// y transforma las respuestas de error en excepciones con el mensaje del servidor.
export async function api<T>(
  ruta: string,
  opciones: { metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; cuerpo?: unknown } = {},
): Promise<T> {
  const sesion = leerSesion()
  const headers: Record<string, string> = {}
  if (sesion) headers.Authorization = `Bearer ${sesion.accessToken}`
  if (opciones.cuerpo !== undefined) headers['Content-Type'] = 'application/json'

  let respuesta: Response
  try {
    respuesta = await fetch(BASE + ruta, {
      method: opciones.metodo ?? 'GET',
      headers,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
    })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  if (respuesta.ok) return (await respuesta.json()) as T

  // 502, 503 y 504 no vienen del backend sino de lo que está delante (el proxy de Vite o el
  // hosting): significan que el backend está apagado o no responde.
  if ([502, 503, 504].includes(respuesta.status)) {
    throw new ErrorApi(respuesta.status, 'El servidor no está disponible en este momento. Inténtalo de nuevo en un rato.')
  }

  const cuerpo = await respuesta.json().catch(() => null)
  const mensaje: unknown = cuerpo?.message
  const texto = Array.isArray(mensaje) ? mensaje.join('. ') : typeof mensaje === 'string' ? mensaje : 'Ocurrió un error inesperado'

  if (respuesta.status === 401 && sesion) {
    guardarSesion(null)
    window.dispatchEvent(new Event(SESION_VENCIDA))
  }
  throw new ErrorApi(respuesta.status, texto)
}

export function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}

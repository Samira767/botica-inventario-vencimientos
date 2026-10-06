import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, guardarSesion, leerSesion, SESION_VENCIDA } from './api'
import type { Sesion } from './tipos'

interface ContextoSesion {
  sesion: Sesion | null
  entrar: (correo: string, password: string) => Promise<void>
  salir: () => void
}

const Contexto = createContext<ContextoSesion | null>(null)

// Guarda quién inició sesión y lo comparte con toda la app.
// La sesión vive en localStorage para que no se pierda al recargar la página.
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)

  useEffect(() => {
    const alVencer = () => setSesion(null)
    window.addEventListener(SESION_VENCIDA, alVencer)
    return () => window.removeEventListener(SESION_VENCIDA, alVencer)
  }, [])

  async function entrar(correo: string, password: string) {
    const nueva = await api<Sesion>('/auth/login', { metodo: 'POST', cuerpo: { correo, password } })
    guardarSesion(nueva)
    setSesion(nueva)
  }

  function salir() {
    guardarSesion(null)
    setSesion(null)
  }

  return <Contexto.Provider value={{ sesion, entrar, salir }}>{children}</Contexto.Provider>
}

export function useSesion(): ContextoSesion {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useSesion debe usarse dentro de ProveedorSesion')
  return contexto
}

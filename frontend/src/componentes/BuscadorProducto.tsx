import { lazy, Suspense, useEffect, useState } from 'react'
import { api, ErrorApi, mensajeDe } from '../api'
import type { Producto } from '../tipos'

// La librería de cámara es pesada: se descarga recién cuando alguien toca "Escanear"
const Escaner = lazy(() => import('./Escaner.tsx'))

// Busca un producto por nombre, laboratorio o código de barras (escrito o escaneado)
// y avisa cuál se eligió. Lo usan la venta y el ingreso de mercadería.
export default function BuscadorProducto({ alElegir }: { alElegir: (producto: Producto) => void }) {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState<Producto[]>([])
  const [escaneando, setEscaneando] = useState(false)
  const [error, setError] = useState('')

  // Espera a que la persona deje de escribir antes de consultar (no una llamada por tecla)
  useEffect(() => {
    const limpio = texto.trim()
    if (limpio.length < 2) return
    let vigente = true
    const espera = setTimeout(() => {
      api<Producto[]>(`/productos?buscar=${encodeURIComponent(limpio)}`)
        .then((lista) => {
          if (vigente) setResultados(lista.slice(0, 8))
        })
        .catch((e) => vigente && setError(mensajeDe(e)))
    }, 250)
    return () => {
      vigente = false
      clearTimeout(espera)
    }
  }, [texto])

  // Con menos de 2 letras no se busca ni se muestran resultados anteriores
  const visibles = texto.trim().length < 2 ? [] : resultados

  function elegir(producto: Producto) {
    setTexto('')
    setResultados([])
    setError('')
    alElegir(producto)
  }

  async function alLeerCodigo(codigo: string) {
    setEscaneando(false)
    try {
      elegir(await api<Producto>(`/productos/codigo/${encodeURIComponent(codigo)}`))
    } catch (e) {
      setError(e instanceof ErrorApi && e.estado === 404 ? `No hay ningún producto con el código ${codigo}` : mensajeDe(e))
    }
  }

  return (
    <div className="buscador">
      <div className="fila">
        <input
          type="search"
          placeholder="Buscar producto por nombre o código"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setError('')
          }}
          aria-label="Buscar producto"
        />
        <button type="button" className="boton secundario" onClick={() => setEscaneando(!escaneando)}>
          Escanear
        </button>
      </div>

      {escaneando && (
        <Suspense fallback={<p className="tenue">Abriendo cámara…</p>}>
          <Escaner alLeer={alLeerCodigo} alCerrar={() => setEscaneando(false)} />
        </Suspense>
      )}
      {error && <p className="aviso error">{error}</p>}

      {visibles.length > 0 && (
        <ul className="resultados">
          {visibles.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => elegir(p)}>
                <span>
                  <strong>{p.nombre}</strong>
                  <span className="tenue">{[p.presentacion, p.laboratorio].filter(Boolean).join(' · ')}</span>
                </span>
                <span className={p.stock === 0 ? 'etiqueta rojo' : 'etiqueta'}>Stock {p.stock}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { useEffect, useId, useRef, useState } from 'react'

// Lee códigos de barras con la cámara del celular o de la laptop.
// El navegador solo presta la cámara en páginas seguras (https) o en localhost.
export default function Escaner({ alLeer, alCerrar }: { alLeer: (codigo: string) => void; alCerrar: () => void }) {
  const id = 'escaner-' + useId().replace(/:/g, '')
  const [error, setError] = useState('')
  // La cámara lee el mismo código muchas veces por segundo: solo se avisa la primera
  const leido = useRef(false)
  const alLeerRef = useRef(alLeer)
  useEffect(() => {
    alLeerRef.current = alLeer
  })

  useEffect(() => {
    const lector = new Html5Qrcode(id, {
      verbose: false,
      // Solo los formatos de los empaques de farmacia: menos trabajo y menos lecturas falsas
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
    })

    const inicio = lector
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 130 } },
        (texto) => {
          if (leido.current) return
          leido.current = true
          alLeerRef.current(texto.trim())
        },
        () => {},
      )
      .catch(() => {
        setError('No se pudo usar la cámara. Revisa el permiso del navegador o escribe el código a mano.')
      })

    // Al cerrar se apaga la cámara. Se espera a que termine de encender antes de detenerla.
    return () => {
      inicio.then(() => (lector.isScanning ? lector.stop() : undefined)).catch(() => {})
    }
  }, [id])

  return (
    <div className="escaner">
      <div id={id} className="escaner-video" />
      {error && <p className="aviso error">{error}</p>}
      <button type="button" className="boton secundario" onClick={alCerrar}>
        Cerrar cámara
      </button>
    </div>
  )
}

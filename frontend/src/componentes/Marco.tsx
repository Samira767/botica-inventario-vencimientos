import { NavLink, Outlet } from 'react-router-dom'
import { useSesion } from '../sesion.tsx'

// Encabezado y menú comunes a todas las pantallas. En celular el menú queda fijo abajo.
export default function Marco() {
  const { sesion, salir } = useSesion()
  if (!sesion) return null
  const esDueno = sesion.usuario.rol === 'DUENO'

  return (
    <div className="marco">
      <header className="encabezado">
        <div>
          <strong>{sesion.negocio.nombre}</strong>
          <span className="tenue">
            {sesion.usuario.nombre} · {esDueno ? 'Dueño(a)' : 'Vendedor(a)'}
          </span>
        </div>
        <button className="boton secundario chico" onClick={salir}>
          Salir
        </button>
      </header>

      <nav className="menu">
        {esDueno && <NavLink to="/panel">Panel</NavLink>}
        <NavLink to="/venta">Venta</NavLink>
        <NavLink to="/ingreso">Ingreso</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        {esDueno && <NavLink to="/reportes">Reportes</NavLink>}
      </nav>

      <main className="contenido">
        <Outlet />
      </main>
    </div>
  )
}

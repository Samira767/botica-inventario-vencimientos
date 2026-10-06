# Botica – Frontend

Aplicación web del sistema de inventario y vencimientos. React 19 + Vite + TypeScript, diseñada primero para celular.

## Puesta en marcha

Necesita el [backend](../backend/README.md) corriendo en `http://localhost:3001`.

```bash
npm install
npm run dev        # http://localhost:5173
```

En desarrollo no hay que configurar nada: Vite reenvía las llamadas a `/api` hacia el backend ([vite.config.ts](vite.config.ts)). En producción se define `VITE_API_URL` con la URL pública del backend (ver [.env.example](.env.example)).

## Pantallas

| Ruta | Quién | Qué hace |
| --- | --- | --- |
| `/panel` | Dueño | Dinero en riesgo, vencimientos por tramo (se pueden filtrar) y stock bajo |
| `/venta` | Todos | Arma la venta buscando o escaneando productos; al registrar muestra de qué lote entregar |
| `/ingreso` | Todos | Registra un lote que llegó: número, vencimiento, cantidad y costo |
| `/productos` | Todos (editar: dueño) | Catálogo con stock; el dueño crea, edita y desactiva |

## Estructura

| Archivo | Contenido |
| --- | --- |
| [src/api.ts](src/api.ts) | Única función que habla con el backend: agrega el token y convierte los errores |
| [src/sesion.tsx](src/sesion.tsx) | Quién inició sesión (contexto de React + `localStorage`) |
| [src/App.tsx](src/App.tsx) | Rutas según el rol |
| [src/paginas/](src/paginas/) | Una pantalla por archivo |
| [src/componentes/](src/componentes/) | Marco con el menú, buscador de productos y escáner |

## Notas

- **Escáner de códigos**: usa la cámara con `html5-qrcode`. Los navegadores solo prestan la cámara en `https` o en `localhost`, así que desde un celular funciona con la app desplegada, no entrando por la IP de la computadora. Siempre se puede escribir el código a mano.
- **Permisos**: ocultar un botón o una ruta según el rol es solo comodidad. Quien decide es el backend, que responde 403.
- **Sesión**: el token se guarda en `localStorage`; si vence o es rechazado, la app vuelve sola al login.

## Comandos

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga al guardar |
| `npm run build` | Revisa tipos y genera `dist/` para publicar |
| `npm run lint` | Revisa el código con oxlint |

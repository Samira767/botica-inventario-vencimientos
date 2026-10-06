# Botica – Backend

API del sistema de inventario y vencimientos para boticas. NestJS + Prisma 7 + PostgreSQL 16.

## Modelo de datos

| Tabla | Qué guarda |
| --- | --- |
| `usuarios` | Personas que usan el sistema, con rol `DUENO` o `VENDEDOR` |
| `productos` | Catálogo: nombre, laboratorio, presentación, código de barras, precio y stock mínimo |
| `lotes` | Cada ingreso de mercadería: número de lote, fecha de vencimiento, cantidad y costo |
| `ventas` | Cabecera de cada venta: fecha, usuario y total |
| `detalle_venta` | Una línea por cada lote usado en una venta (para FEFO) |
| `movimientos` | Historial de todo lo que cambia el stock: ingresos, ventas, ajustes y bajas por vencimiento |

El stock de un producto no se guarda en `productos`: es la suma de `cantidad_actual` de sus lotes no vencidos. Así nunca hay dos números que se contradigan.

## Requisitos

- Node.js 24 o superior
- Docker Desktop (para la base de datos local)

## Puesta en marcha

```bash
npm install
cp .env.example .env                   # y cambia JWT_SECRET
npm run db:up                          # levanta PostgreSQL en Docker (puerto 5433)
npm run db:generate                    # genera el cliente de Prisma en src/generated
npm run db:migrate                     # crea las tablas
npm run db:seed                        # carga 50 productos y sus lotes
npm run start:dev                      # API en http://localhost:3001/api
```

Usuarios de prueba (contraseña `Demo1234`):

- `dueno@demo.pe` (rol dueño)
- `vendedor@demo.pe` (rol vendedor)

Los datos de prueba calculan los vencimientos desde el día en que ejecutas el seed, así que la demo siempre tiene productos vencidos, por vencer y en buen estado. Los códigos de barras son ficticios.

## Endpoints

Todas las rutas llevan el prefijo `/api` y, salvo el login, piden el encabezado `Authorization: Bearer <token>`.

| Método y ruta | Quién | Qué hace |
| --- | --- | --- |
| `POST /auth/login` | Público | Devuelve `accessToken` y los datos del usuario |
| `GET /auth/me` | Cualquier rol | Usuario del token |
| `GET /productos?buscar=&incluirInactivos=` | Cualquier rol | Lista con `stock` y `stockBajo` calculados |
| `GET /productos/:id` | Cualquier rol | Producto con sus lotes |
| `GET /productos/codigo/:codigoBarras` | Cualquier rol | Búsqueda para el lector de códigos |
| `POST /productos` | DUENO | Crea un producto |
| `PATCH /productos/:id` | DUENO | Edita (o reactiva con `activo: true`) |
| `DELETE /productos/:id` | DUENO | Desactiva (no borra, para conservar el historial) |
| `GET /lotes?productoId=` | Cualquier rol | Lotes ordenados por vencimiento |
| `POST /lotes` | Cualquier rol | Ingresa un lote y registra el movimiento `INGRESO` |
| `POST /ventas` | Cualquier rol | Registra una venta `{ "items": [{ "productoId": 1, "cantidad": 3 }] }` descontando stock con FEFO |
| `GET /ventas` | Cualquier rol | Últimas 50 ventas |
| `GET /ventas/:id` | Cualquier rol | Venta con el detalle de cada lote usado |

## Ventas con FEFO

FEFO (*first expired, first out*): sale primero lo que vence primero. Al registrar una venta:

1. Todo ocurre en **una transacción**: si un producto no tiene stock suficiente, no se descuenta ni se guarda nada (respuesta `409`).
2. Los lotes vendibles del producto (no vencidos y con stock) se leen ordenados por vencimiento con `SELECT ... FOR UPDATE`. Ese bloqueo hace que dos ventas simultáneas del mismo producto se atiendan una después de la otra, y la segunda ve el stock ya descontado.
3. La cantidad se reparte lote por lote ([src/ventas/fefo.ts](src/ventas/fefo.ts)); se guarda una línea de `detalle_venta` y un movimiento `VENTA` por cada lote usado.
4. Como última barrera, la base tiene `CHECK (cantidad_actual >= 0)`.

Las pruebas cubren: venta que usa varios lotes, stock insuficiente, lotes vencidos que no se venden y ventas simultáneas ([test/ventas.e2e-spec.ts](test/ventas.e2e-spec.ts)).

## Comandos

| Comando | Para qué |
| --- | --- |
| `npm run start:dev` | Levanta la API y la reinicia al guardar cambios |
| `npm test` | Pruebas unitarias |
| `npm run test:e2e` | Pruebas de extremo a extremo. Usan su propia base `botica_test`, que se crea, migra y carga sola; no tocan la de desarrollo |
| `npm run db:up` | Levanta PostgreSQL en Docker |
| `npm run db:migrate` | Crea o actualiza las tablas después de cambiar `schema.prisma` |
| `npm run db:generate` | Regenera el cliente de Prisma |
| `npm run db:seed` | Borra todo y vuelve a cargar los datos de prueba |
| `npm run db:studio` | Explora los datos en el navegador |
| `npm run typecheck` | Revisa los tipos de TypeScript |

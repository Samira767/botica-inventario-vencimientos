-- Varios negocios en la misma base: cada fila pasa a llevar su negocio_id.
-- Escrita a mano porque las tablas ya pueden tener datos: se agrega la columna vacía,
-- se asignan las filas existentes a un negocio inicial y recién entonces se vuelve obligatoria.

-- CreateEnum
CREATE TYPE "TipoNegocio" AS ENUM ('BOTICA', 'VETERINARIA');

-- CreateTable
CREATE TABLE "negocios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoNegocio" NOT NULL DEFAULT 'BOTICA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negocios_pkey" PRIMARY KEY ("id")
);

-- Paso 1: columnas todavía opcionales
ALTER TABLE "usuarios" ADD COLUMN "negocio_id" INTEGER;
ALTER TABLE "productos" ADD COLUMN "negocio_id" INTEGER;
ALTER TABLE "lotes" ADD COLUMN "negocio_id" INTEGER;
ALTER TABLE "ventas" ADD COLUMN "negocio_id" INTEGER;
ALTER TABLE "movimientos" ADD COLUMN "negocio_id" INTEGER;

-- Paso 2: si ya había datos, todos pertenecen a un único negocio inicial
INSERT INTO "negocios" ("nombre")
SELECT 'Negocio inicial'
WHERE EXISTS (SELECT 1 FROM "usuarios") OR EXISTS (SELECT 1 FROM "productos");

UPDATE "usuarios" SET "negocio_id" = (SELECT MIN("id") FROM "negocios");
UPDATE "productos" SET "negocio_id" = (SELECT MIN("id") FROM "negocios");
UPDATE "lotes" SET "negocio_id" = (SELECT MIN("id") FROM "negocios");
UPDATE "ventas" SET "negocio_id" = (SELECT MIN("id") FROM "negocios");
UPDATE "movimientos" SET "negocio_id" = (SELECT MIN("id") FROM "negocios");

-- Paso 3: ahora sí, obligatorias
ALTER TABLE "usuarios" ALTER COLUMN "negocio_id" SET NOT NULL;
ALTER TABLE "productos" ALTER COLUMN "negocio_id" SET NOT NULL;
ALTER TABLE "lotes" ALTER COLUMN "negocio_id" SET NOT NULL;
ALTER TABLE "ventas" ALTER COLUMN "negocio_id" SET NOT NULL;
ALTER TABLE "movimientos" ALTER COLUMN "negocio_id" SET NOT NULL;

-- Índices: los de búsqueda pasan a empezar por negocio_id
DROP INDEX "lotes_fecha_vencimiento_idx";
DROP INDEX "productos_nombre_idx";
DROP INDEX "ventas_fecha_idx";
-- El código de barras deja de ser único en toda la base: ahora es único por negocio
DROP INDEX "productos_codigo_barras_key";

CREATE INDEX "detalle_venta_venta_id_idx" ON "detalle_venta"("venta_id");
CREATE INDEX "lotes_negocio_id_fecha_vencimiento_idx" ON "lotes"("negocio_id", "fecha_vencimiento");
CREATE INDEX "movimientos_negocio_id_fecha_idx" ON "movimientos"("negocio_id", "fecha");
CREATE INDEX "productos_negocio_id_nombre_idx" ON "productos"("negocio_id", "nombre");
CREATE UNIQUE INDEX "productos_negocio_id_codigo_barras_key" ON "productos"("negocio_id", "codigo_barras");
CREATE INDEX "usuarios_negocio_id_idx" ON "usuarios"("negocio_id");
CREATE INDEX "ventas_negocio_id_fecha_idx" ON "ventas"("negocio_id", "fecha");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "productos" ADD CONSTRAINT "productos_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prisma no tiene sintaxis para CHECK en schema.prisma, por eso va escrito a mano.
-- Última barrera contra la sobreventa: aunque el código falle, la base rechaza un stock negativo.
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_cantidad_actual_no_negativa" CHECK ("cantidad_actual" >= 0);

import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import type { UsuarioToken } from "../auth/decoradores";
import { hoyEnLima } from "../common/fechas";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { analizarFilas, FilaCruda, ResultadoAnalisis } from "./analisis";

// Consultas que el análisis necesita; sirve tanto el cliente normal como el de una transacción
type Lector = Pick<Prisma.TransactionClient, "producto" | "lote">;

@Injectable()
export class ImportacionService {
  constructor(private readonly prisma: PrismaService) {}

  // No guarda nada: solo dice qué pasaría con cada fila
  vistaPrevia(negocioId: number, filas: FilaCruda[]): Promise<ResultadoAnalisis> {
    return this.analizar(this.prisma, negocioId, filas);
  }

  async confirmar(usuario: UsuarioToken, filas: FilaCruda[]) {
    const { negocioId } = usuario;
    try {
      // Todo o nada: si algo falla a mitad de camino, no queda un inventario a medias
      return await this.prisma.$transaction(
        async (tx) => {
          // Se vuelve a analizar dentro de la transacción: los datos pudieron cambiar
          // desde la vista previa, y nunca se confía en un resultado que envíe el navegador
          const { filas: analizadas, resumen } = await this.analizar(tx, negocioId, filas);
          const correctas = analizadas.filter((f) => f.estado === "OK");
          if (correctas.length === 0) {
            throw new BadRequestException("No hay ninguna fila válida para importar");
          }

          // 1. Productos nuevos
          const idPorClave = new Map<string, number>();
          for (const f of correctas) {
            if (f.productoExistenteId) idPorClave.set(f.claveProducto!, f.productoExistenteId);
          }
          for (const f of correctas.filter((x) => x.productoNuevo)) {
            const producto = await tx.producto.create({ data: { ...f.productoNuevo!, negocioId } });
            idPorClave.set(f.claveProducto!, producto.id);
          }

          // 2. Lotes
          const lotes = await tx.lote.createManyAndReturn({
            data: correctas
              .filter((f) => f.lote)
              .map((f) => ({
                negocioId,
                productoId: idPorClave.get(f.claveProducto!)!,
                numeroLote: f.lote!.numeroLote,
                fechaVencimiento: new Date(`${f.lote!.fechaVencimiento}T00:00:00.000Z`),
                cantidadInicial: f.lote!.cantidad,
                cantidadActual: f.lote!.cantidad,
                costoUnitario: f.lote!.costoUnitario,
              })),
          });

          // 3. Un movimiento INGRESO por lote, igual que en un ingreso manual
          await tx.movimiento.createMany({
            data: lotes.map((lote) => ({
              negocioId,
              tipo: "INGRESO" as const,
              productoId: lote.productoId,
              loteId: lote.id,
              cantidad: lote.cantidadInicial,
              usuarioId: usuario.id,
              motivo: "Importación desde Excel",
            })),
          });

          return {
            importado: {
              productos: correctas.filter((f) => f.productoNuevo).length,
              lotes: lotes.length,
              unidades: resumen.unidades,
            },
            omitidas: resumen.omitidas,
            conError: resumen.conError,
          };
        },
        { timeout: 30_000 },
      );
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException(
          "El inventario cambió mientras se importaba. Vuelve a cargar el archivo para revisar la vista previa.",
        );
      }
      throw e;
    }
  }

  private async analizar(db: Lector, negocioId: number, filas: FilaCruda[]): Promise<ResultadoAnalisis> {
    const [productos, lotes] = await Promise.all([
      db.producto.findMany({
        where: { negocioId },
        select: { id: true, nombre: true, presentacion: true, codigoBarras: true },
      }),
      db.lote.findMany({ where: { negocioId }, select: { productoId: true, numeroLote: true } }),
    ]);
    return analizarFilas(
      filas,
      { productos, lotes: new Set(lotes.map((l) => `${l.productoId}|${l.numeroLote.toUpperCase()}`)) },
      hoyEnLima().toISOString().slice(0, 10),
    );
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { hoyEnLima } from "../common/fechas";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { IngresarLoteDto } from "./dto/ingresar-lote.dto";

@Injectable()
export class LotesService {
  constructor(private readonly prisma: PrismaService) {}

  listar(productoId?: number) {
    return this.prisma.lote.findMany({
      where: productoId ? { productoId } : {},
      include: { producto: { select: { nombre: true, presentacion: true } } },
      orderBy: { fechaVencimiento: "asc" },
    });
  }

  async ingresar(dto: IngresarLoteDto, usuarioId: number) {
    const fechaVencimiento = new Date(`${dto.fechaVencimiento}T00:00:00.000Z`);
    // JavaScript convierte "2027-02-31" en 3 de marzo; si al volver a texto cambia, la fecha no existe
    if (
      Number.isNaN(fechaVencimiento.getTime()) ||
      fechaVencimiento.toISOString().slice(0, 10) !== dto.fechaVencimiento
    ) {
      throw new BadRequestException("La fecha de vencimiento no existe");
    }
    if (fechaVencimiento < hoyEnLima()) {
      throw new BadRequestException("No se puede ingresar un lote que ya está vencido");
    }

    const producto = await this.prisma.producto.findUnique({ where: { id: dto.productoId } });
    if (!producto) throw new NotFoundException("Producto no encontrado");
    if (!producto.activo) throw new BadRequestException("El producto está desactivado");

    try {
      // Lote y movimiento en una sola transacción: o se guardan los dos o ninguno
      return await this.prisma.$transaction(async (tx) => {
        const lote = await tx.lote.create({
          data: {
            productoId: dto.productoId,
            numeroLote: dto.numeroLote.trim(),
            fechaVencimiento,
            cantidadInicial: dto.cantidad,
            cantidadActual: dto.cantidad,
            costoUnitario: dto.costoUnitario,
          },
        });
        await tx.movimiento.create({
          data: {
            tipo: "INGRESO",
            productoId: dto.productoId,
            loteId: lote.id,
            cantidad: dto.cantidad,
            usuarioId,
            motivo: "Ingreso de mercadería",
          },
        });
        return lote;
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("Ese número de lote ya está registrado para este producto");
      }
      throw e;
    }
  }
}

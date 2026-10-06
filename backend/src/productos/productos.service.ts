import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { hoyEnLima } from "../common/fechas";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarProductoDto, CrearProductoDto } from "./dto/producto.dto";

// Todos los métodos reciben negocioId (del token) y solo ven productos de ese negocio.
// Un producto de otro negocio se trata igual que uno inexistente: 404.
@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(negocioId: number, buscar?: string, incluirInactivos = false) {
    const texto = buscar?.trim();
    const productos = await this.prisma.producto.findMany({
      where: {
        negocioId,
        ...(incluirInactivos ? {} : { activo: true }),
        ...(texto
          ? {
              OR: [
                { nombre: { contains: texto, mode: "insensitive" } },
                { laboratorio: { contains: texto, mode: "insensitive" } },
                { codigoBarras: texto },
              ],
            }
          : {}),
      },
      orderBy: { nombre: "asc" },
    });

    const stock = await this.stockPorProducto(negocioId, productos.map((p) => p.id));
    return productos.map((p) => {
      const stockActual = stock.get(p.id) ?? 0;
      return { ...p, stock: stockActual, stockBajo: stockActual < p.stockMinimo };
    });
  }

  async obtener(negocioId: number, id: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id, negocioId },
      include: { lotes: { orderBy: { fechaVencimiento: "asc" } } },
    });
    if (!producto) throw new NotFoundException("Producto no encontrado");
    return this.conStock(producto);
  }

  // Para el lector de código de barras
  async obtenerPorCodigo(negocioId: number, codigoBarras: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { negocioId_codigoBarras: { negocioId, codigoBarras } },
      include: { lotes: { orderBy: { fechaVencimiento: "asc" } } },
    });
    if (!producto) throw new NotFoundException("No hay ningún producto con ese código de barras");
    return this.conStock(producto);
  }

  async crear(negocioId: number, dto: CrearProductoDto) {
    try {
      const producto = await this.prisma.producto.create({ data: { ...dto, negocioId } });
      return { ...producto, stock: 0, stockBajo: producto.stockMinimo > 0 };
    } catch (e) {
      throw this.traducirError(e);
    }
  }

  async actualizar(negocioId: number, id: number, dto: ActualizarProductoDto) {
    try {
      // negocioId en el where: si el producto es de otro negocio, no se encuentra (P2025)
      await this.prisma.producto.update({ where: { id, negocioId }, data: dto });
    } catch (e) {
      throw this.traducirError(e);
    }
    return this.obtener(negocioId, id);
  }

  // No se borra de verdad: ventas y movimientos antiguos siguen apuntando al producto
  async desactivar(negocioId: number, id: number) {
    return this.actualizar(negocioId, id, { activo: false });
  }

  // Stock = suma de cantidad_actual de los lotes no vencidos (no se guarda en productos)
  private async stockPorProducto(negocioId: number, ids: number[]): Promise<Map<number, number>> {
    const grupos = await this.prisma.lote.groupBy({
      by: ["productoId"],
      where: { negocioId, productoId: { in: ids }, fechaVencimiento: { gte: hoyEnLima() } },
      _sum: { cantidadActual: true },
    });
    return new Map(grupos.map((g) => [g.productoId, g._sum.cantidadActual ?? 0]));
  }

  private conStock<
    P extends { stockMinimo: number; lotes: { fechaVencimiento: Date; cantidadActual: number }[] },
  >(producto: P) {
    const hoy = hoyEnLima();
    const stock = producto.lotes
      .filter((l) => l.fechaVencimiento >= hoy)
      .reduce((suma, l) => suma + l.cantidadActual, 0);
    return { ...producto, stock, stockBajo: stock < producto.stockMinimo };
  }

  private traducirError(e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return new ConflictException("Ya existe un producto con ese código de barras");
      }
      if (e.code === "P2025") {
        return new NotFoundException("Producto no encontrado");
      }
    }
    return e;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Roles } from "../auth/decoradores";
import { ActualizarProductoDto, CrearProductoDto } from "./dto/producto.dto";
import { ProductosService } from "./productos.service";

// Leer: cualquier usuario con sesión. Crear, editar y desactivar: solo DUENO.
@Controller("productos")
export class ProductosController {
  constructor(private readonly productos: ProductosService) {}

  @Get()
  listar(
    @Query("buscar") buscar?: string,
    @Query("incluirInactivos", new ParseBoolPipe({ optional: true })) incluirInactivos?: boolean,
  ) {
    return this.productos.listar(buscar, incluirInactivos);
  }

  @Get("codigo/:codigoBarras")
  obtenerPorCodigo(@Param("codigoBarras") codigoBarras: string) {
    return this.productos.obtenerPorCodigo(codigoBarras);
  }

  @Get(":id")
  obtener(@Param("id", ParseIntPipe) id: number) {
    return this.productos.obtener(id);
  }

  @Roles("DUENO")
  @Post()
  crear(@Body() dto: CrearProductoDto) {
    return this.productos.crear(dto);
  }

  @Roles("DUENO")
  @Patch(":id")
  actualizar(@Param("id", ParseIntPipe) id: number, @Body() dto: ActualizarProductoDto) {
    return this.productos.actualizar(id, dto);
  }

  @Roles("DUENO")
  @Delete(":id")
  desactivar(@Param("id", ParseIntPipe) id: number) {
    return this.productos.desactivar(id);
  }
}

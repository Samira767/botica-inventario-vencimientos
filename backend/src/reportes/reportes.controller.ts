import { Controller, Get, Query } from "@nestjs/common";
import { Roles, UsuarioActual } from "../auth/decoradores";
import type { UsuarioToken } from "../auth/decoradores";
import { InventarioQueryDto, VentasQueryDto } from "./dto/reportes.dto";
import { ReportesService } from "./reportes.service";

// Solo DUENO: los reportes muestran costos y ganancias del negocio
@Roles("DUENO")
@Controller("reportes")
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Get("inventario")
  inventario(@UsuarioActual() usuario: UsuarioToken, @Query() query: InventarioQueryDto) {
    return this.reportes.inventario(usuario.negocioId, query.venceEnDias);
  }

  @Get("ventas")
  ventas(@UsuarioActual() usuario: UsuarioToken, @Query() query: VentasQueryDto) {
    return this.reportes.ventas(usuario.negocioId, query.desde, query.hasta);
  }
}

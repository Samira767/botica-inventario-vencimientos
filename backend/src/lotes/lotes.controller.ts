import { Body, Controller, Get, ParseIntPipe, Post, Query } from "@nestjs/common";
import { UsuarioActual } from "../auth/decoradores";
import type { UsuarioToken } from "../auth/decoradores";
import { IngresarLoteDto } from "./dto/ingresar-lote.dto";
import { LotesService } from "./lotes.service";

// Sin @Roles: tanto DUENO como VENDEDOR registran ingresos de mercadería
@Controller("lotes")
export class LotesController {
  constructor(private readonly lotes: LotesService) {}

  @Get()
  listar(
    @UsuarioActual() usuario: UsuarioToken,
    @Query("productoId", new ParseIntPipe({ optional: true })) productoId?: number,
  ) {
    return this.lotes.listar(usuario.negocioId, productoId);
  }

  @Post()
  ingresar(@Body() dto: IngresarLoteDto, @UsuarioActual() usuario: UsuarioToken) {
    return this.lotes.ingresar(dto, usuario);
  }
}

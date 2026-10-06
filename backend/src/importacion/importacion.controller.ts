import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { Roles, UsuarioActual } from "../auth/decoradores";
import type { UsuarioToken } from "../auth/decoradores";
import { ImportarDto } from "./dto/importar.dto";
import { ImportacionService } from "./importacion.service";

// Solo DUENO: la importación crea productos y carga inventario en bloque
@Roles("DUENO")
@Controller("importacion")
export class ImportacionController {
  constructor(private readonly importacion: ImportacionService) {}

  @Post("vista-previa")
  @HttpCode(200)
  vistaPrevia(@UsuarioActual() usuario: UsuarioToken, @Body() dto: ImportarDto) {
    return this.importacion.vistaPrevia(usuario.negocioId, dto.filas);
  }

  @Post("confirmar")
  confirmar(@UsuarioActual() usuario: UsuarioToken, @Body() dto: ImportarDto) {
    return this.importacion.confirmar(usuario, dto.filas);
  }
}

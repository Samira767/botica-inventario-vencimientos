import { Controller, Get } from "@nestjs/common";
import { Roles, UsuarioActual } from "../auth/decoradores";
import type { UsuarioToken } from "../auth/decoradores";
import { PanelService } from "./panel.service";

// Solo DUENO: el panel muestra costos y dinero en riesgo del negocio
@Roles("DUENO")
@Controller("panel")
export class PanelController {
  constructor(private readonly panel: PanelService) {}

  @Get()
  obtener(@UsuarioActual() usuario: UsuarioToken) {
    return this.panel.obtener(usuario.negocioId);
  }
}

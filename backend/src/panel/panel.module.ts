import { Module } from "@nestjs/common";
import { ProductosModule } from "../productos/productos.module";
import { PanelController } from "./panel.controller";
import { PanelService } from "./panel.service";

@Module({
  imports: [ProductosModule],
  controllers: [PanelController],
  providers: [PanelService],
})
export class PanelModule {}

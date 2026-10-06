import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { LotesModule } from "./lotes/lotes.module";
import { PanelModule } from "./panel/panel.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductosModule } from "./productos/productos.module";
import { VentasModule } from "./ventas/ventas.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductosModule,
    LotesModule,
    VentasModule,
    PanelModule,
  ],
})
export class AppModule {}

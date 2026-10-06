import { Module } from "@nestjs/common";
import { ProductosController } from "./productos.controller";
import { ProductosService } from "./productos.service";

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  // El panel reutiliza el cálculo de stock
  exports: [ProductosService],
})
export class ProductosModule {}

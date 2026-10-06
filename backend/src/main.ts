import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  // El límite por defecto (100 kb) no alcanza para importar un inventario de 2000 filas
  app.useBodyParser("json", { limit: "2mb" });
  // whitelist: descarta campos que no están en el DTO; transform: convierte tipos (ej. ":id" a número)
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  const puerto = process.env.PORT ?? 3001;
  await app.listen(puerto);
  console.log(`API de la botica en http://localhost:${puerto}/api`);
}
bootstrap();

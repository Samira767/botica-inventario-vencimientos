import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  // whitelist: descarta campos que no están en el DTO; transform: convierte tipos (ej. ":id" a número)
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  const puerto = process.env.PORT ?? 3001;
  await app.listen(puerto);
  console.log(`API de la botica en http://localhost:${puerto}/api`);
}
bootstrap();

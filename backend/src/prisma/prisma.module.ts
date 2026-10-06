import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// Global: una sola instancia (un solo pool de conexiones) para toda la app
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

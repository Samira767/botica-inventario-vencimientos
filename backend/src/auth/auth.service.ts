import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(correo: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: correo.trim().toLowerCase() },
      include: { negocio: true },
    });
    // Mismo mensaje si falla el correo o la contraseña: no revela qué correos existen
    const valido =
      usuario &&
      usuario.activo &&
      usuario.negocio.activo &&
      (await bcrypt.compare(password, usuario.passwordHash));
    if (!valido) {
      throw new UnauthorizedException("Correo o contraseña incorrectos");
    }

    const accessToken = await this.jwt.signAsync({
      sub: usuario.id,
      negocioId: usuario.negocioId,
      nombre: usuario.nombre,
      rol: usuario.rol,
    });
    return {
      accessToken,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
      negocio: {
        id: usuario.negocio.id,
        nombre: usuario.negocio.nombre,
        tipo: usuario.negocio.tipo,
      },
    };
  }
}

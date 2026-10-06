import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { ES_PUBLICO, UsuarioToken } from "./decoradores";

// Guard global: toda ruta exige un token válido, salvo las marcadas con @Public()
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublico) return true;

    const request = context.switchToHttp().getRequest();
    const [tipo, token] = (request.headers.authorization ?? "").split(" ");
    if (tipo !== "Bearer" || !token) {
      throw new UnauthorizedException("Falta el token de acceso");
    }

    try {
      const payload = await this.jwt.verifyAsync<
        { sub: number } & Pick<UsuarioToken, "negocioId" | "nombre" | "rol">
      >(token);
      // El negocio sale del token firmado, nunca de un dato que envíe el cliente
      const usuario: UsuarioToken = {
        id: payload.sub,
        negocioId: payload.negocioId,
        nombre: payload.nombre,
        rol: payload.rol,
      };
      request.usuario = usuario;
    } catch {
      throw new UnauthorizedException("Token inválido o vencido");
    }
    return true;
  }
}

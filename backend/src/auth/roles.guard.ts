import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Rol } from "../generated/prisma/enums";
import { ROLES, UsuarioToken } from "./decoradores";

// Se ejecuta después de JwtAuthGuard: compara el rol del token con los de @Roles()
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const usuario: UsuarioToken | undefined = context.switchToHttp().getRequest().usuario;
    if (!usuario || !roles.includes(usuario.rol)) {
      throw new ForbiddenException("Tu rol no tiene permiso para esta acción");
    }
    return true;
  }
}

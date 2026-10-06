import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import type { Rol } from "../generated/prisma/enums";

// Lo que viaja dentro del token y queda disponible en cada petición
export interface UsuarioToken {
  id: number;
  // Negocio al que pertenece: todas las consultas se filtran por este valor
  negocioId: number;
  nombre: string;
  rol: Rol;
}

export const ES_PUBLICO = "esPublico";
// Marca una ruta que no necesita token (ej. el login)
export const Public = () => SetMetadata(ES_PUBLICO, true);

export const ROLES = "roles";
// Limita una ruta a ciertos roles. Sin @Roles, basta con haber iniciado sesión.
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES, roles);

// Entrega el usuario del token como parámetro del controlador
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken => ctx.switchToHttp().getRequest().usuario,
);

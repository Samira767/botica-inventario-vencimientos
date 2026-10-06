import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

function contexto(usuario?: { rol: string }): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ usuario }) }),
  } as unknown as ExecutionContext;
}

function guardCon(roles?: string[]) {
  const reflector = { getAllAndOverride: () => roles } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe("RolesGuard", () => {
  it("deja pasar si la ruta no pide roles", () => {
    expect(guardCon(undefined).canActivate(contexto({ rol: "VENDEDOR" }))).toBe(true);
  });

  it("deja pasar si el rol del usuario está permitido", () => {
    expect(guardCon(["DUENO"]).canActivate(contexto({ rol: "DUENO" }))).toBe(true);
  });

  it("rechaza con 403 si el rol no está permitido", () => {
    expect(() => guardCon(["DUENO"]).canActivate(contexto({ rol: "VENDEDOR" }))).toThrow(
      ForbiddenException,
    );
  });

  it("rechaza si no hay usuario en la petición", () => {
    expect(() => guardCon(["DUENO"]).canActivate(contexto())).toThrow(ForbiddenException);
  });
});

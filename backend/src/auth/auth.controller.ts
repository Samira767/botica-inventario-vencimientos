import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public, UsuarioActual } from "./decoradores";
import type { UsuarioToken } from "./decoradores";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.correo, dto.password);
  }

  @Get("me")
  me(@UsuarioActual() usuario: UsuarioToken) {
    return usuario;
  }
}

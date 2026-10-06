import { PartialType } from "@nestjs/mapped-types";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";

export class CrearProductoDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre es obligatorio" })
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  laboratorio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  presentacion?: string;

  @IsOptional()
  @Matches(/^\d{8,14}$/, { message: "El código de barras debe tener entre 8 y 14 dígitos" })
  codigoBarras?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: "El precio debe ser un número con máximo 2 decimales" })
  @Min(0.01, { message: "El precio debe ser mayor que cero" })
  precioVenta: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;
}

export class ActualizarProductoDto extends PartialType(CrearProductoDto) {
  // Permite reactivar un producto desactivado
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

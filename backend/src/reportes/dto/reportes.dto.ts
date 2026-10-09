import { Type } from "class-transformer";
import { IsInt, IsOptional, Matches, Max, Min } from "class-validator";

export class InventarioQueryDto {
  // Si se indica, el reporte trae solo los lotes vencidos o que vencen dentro de esos días
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3650)
  venceEnDias?: number;
}

export class VentasQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha inicial debe tener el formato AAAA-MM-DD" })
  desde: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha final debe tener el formato AAAA-MM-DD" })
  hasta: string;
}

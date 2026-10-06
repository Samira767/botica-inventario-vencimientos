import { IsInt, IsNotEmpty, IsNumber, IsString, Matches, MaxLength, Min } from "class-validator";

export class IngresarLoteDto {
  @IsInt()
  productoId: number;

  @IsString()
  @IsNotEmpty({ message: "El número de lote es obligatorio" })
  @MaxLength(50)
  numeroLote: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha de vencimiento debe tener el formato AAAA-MM-DD" })
  fechaVencimiento: string;

  @IsInt()
  @Min(1, { message: "La cantidad debe ser al menos 1" })
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: "El costo debe ser un número con máximo 2 decimales" })
  @Min(0)
  costoUnitario: number;
}

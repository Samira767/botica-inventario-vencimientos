import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsObject } from "class-validator";
import type { FilaCruda } from "../analisis";

export const MAXIMO_FILAS = 2000;

// Aquí solo se valida la forma general. El contenido de cada fila lo revisa analizarFilas,
// que en vez de rechazar todo el pedido devuelve los errores fila por fila.
export class ImportarDto {
  @IsArray()
  @ArrayNotEmpty({ message: "El archivo no tiene filas con datos" })
  @ArrayMaxSize(MAXIMO_FILAS, { message: `Se pueden importar hasta ${MAXIMO_FILAS} filas por archivo` })
  @IsObject({ each: true })
  filas: FilaCruda[];
}

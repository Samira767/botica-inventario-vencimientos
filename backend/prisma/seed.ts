// Datos de prueba para la demo: usuarios, ~50 productos y sus lotes.
// Las fechas de vencimiento se calculan desde HOY, así la demo siempre
// muestra productos vencidos, por vencer y en buen estado.
// Ejecutar con: npx prisma db seed

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// [nombre, laboratorio, presentación, precio de venta (S/), stock mínimo]
const productos: [string, string, string, number, number][] = [
  ["Paracetamol 500 mg", "Genfar", "Caja x 100 tabletas", 0.2, 200],
  ["Paracetamol 120 mg/5 ml jarabe", "Portugal", "Frasco 60 ml", 4.5, 10],
  ["Ibuprofeno 400 mg", "Genfar", "Caja x 100 tabletas", 0.3, 150],
  ["Ibuprofeno 100 mg/5 ml suspensión", "Medifarma", "Frasco 60 ml", 6.0, 10],
  ["Naproxeno 550 mg", "Farmindustria", "Caja x 100 tabletas", 0.5, 100],
  ["Diclofenaco 50 mg", "Portugal", "Caja x 100 tabletas", 0.2, 100],
  ["Diclofenaco gel 1%", "Medifarma", "Tubo 50 g", 8.5, 5],
  ["Metamizol 1 g/2 ml inyectable", "Farmindustria", "Ampolla", 2.0, 20],
  ["Amoxicilina 500 mg", "Genfar", "Caja x 100 cápsulas", 0.5, 100],
  ["Amoxicilina 250 mg/5 ml suspensión", "Portugal", "Frasco 60 ml", 7.0, 10],
  ["Azitromicina 500 mg", "Medifarma", "Caja x 3 tabletas", 9.0, 10],
  ["Ciprofloxacino 500 mg", "Genfar", "Caja x 100 tabletas", 0.6, 50],
  ["Cefalexina 500 mg", "AC Farma", "Caja x 100 cápsulas", 0.7, 50],
  ["Clotrimazol crema 1%", "Portugal", "Tubo 20 g", 4.0, 5],
  ["Loratadina 10 mg", "Genfar", "Caja x 100 tabletas", 0.3, 100],
  ["Cetirizina 10 mg", "Portugal", "Caja x 100 tabletas", 0.3, 100],
  ["Clorfenamina 4 mg", "Farmindustria", "Caja x 100 tabletas", 0.1, 100],
  ["Omeprazol 20 mg", "Genfar", "Caja x 100 cápsulas", 0.3, 150],
  ["Ranitidina 300 mg", "Portugal", "Caja x 100 tabletas", 0.4, 50],
  ["Hidróxido de aluminio y magnesio suspensión", "Medifarma", "Frasco 180 ml", 9.5, 5],
  ["Sales de rehidratación oral", "Medifarma", "Sobre 27.9 g", 1.5, 30],
  ["Loperamida 2 mg", "Genfar", "Caja x 100 tabletas", 0.4, 50],
  ["Metformina 850 mg", "Portugal", "Caja x 100 tabletas", 0.3, 150],
  ["Glibenclamida 5 mg", "Genfar", "Caja x 100 tabletas", 0.2, 50],
  ["Enalapril 10 mg", "Portugal", "Caja x 100 tabletas", 0.2, 150],
  ["Losartán 50 mg", "Genfar", "Caja x 100 tabletas", 0.3, 150],
  ["Amlodipino 5 mg", "Medifarma", "Caja x 100 tabletas", 0.3, 100],
  ["Atorvastatina 20 mg", "Portugal", "Caja x 100 tabletas", 0.6, 100],
  ["Ácido acetilsalicílico 100 mg", "Bayer", "Caja x 100 tabletas", 0.3, 100],
  ["Salbutamol inhalador 100 mcg", "Farmindustria", "Frasco 200 dosis", 12.0, 5],
  ["Prednisona 20 mg", "Genfar", "Caja x 100 tabletas", 0.4, 50],
  ["Dexametasona 4 mg/2 ml inyectable", "Farmindustria", "Ampolla", 2.5, 20],
  ["Complejo B inyectable", "Farmindustria", "Ampolla", 3.0, 20],
  ["Sulfato ferroso 300 mg", "Portugal", "Caja x 100 tabletas", 0.2, 100],
  ["Ácido fólico 0.5 mg", "Genfar", "Caja x 100 tabletas", 0.1, 100],
  ["Vitamina C 1 g efervescente", "Medifarma", "Tubo x 10 tabletas", 12.0, 10],
  ["Multivitamínico jarabe", "Hersil", "Frasco 240 ml", 18.0, 5],
  ["Albendazol 400 mg", "Genfar", "Caja x 1 tableta", 2.0, 30],
  ["Mebendazol 100 mg/5 ml suspensión", "Portugal", "Frasco 30 ml", 5.0, 10],
  ["Metronidazol 500 mg", "Genfar", "Caja x 100 tabletas", 0.3, 50],
  ["Fluconazol 150 mg", "Portugal", "Caja x 1 cápsula", 3.5, 20],
  ["Ambroxol 30 mg/5 ml jarabe", "Medifarma", "Frasco 120 ml", 7.5, 10],
  ["Dextrometorfano jarabe", "Portugal", "Frasco 120 ml", 8.0, 10],
  ["Gotas oftálmicas lubricantes", "Medifarma", "Frasco 15 ml", 15.0, 5],
  ["Alcohol medicinal 70°", "Alkofarma", "Frasco 250 ml", 5.0, 20],
  ["Agua oxigenada 10 vol", "Alkofarma", "Frasco 120 ml", 2.5, 20],
  ["Gasa estéril 10 x 10 cm", "Medical Plus", "Sobre x 1", 0.8, 50],
  ["Esparadrapo 2.5 cm x 5 m", "Medical Plus", "Rollo", 3.5, 10],
  ["Jeringa descartable 5 ml", "Medical Plus", "Unidad", 0.5, 100],
  ["Preservativos", "Durex", "Caja x 3", 8.0, 10],
];

// Días hasta el vencimiento para el primer lote de cada producto.
// Se reparten para que el panel tenga de todo:
// vencidos (<0), críticos (0-30), por vencer (31-90) y en buen estado.
const escenarios = [-20, -5, 10, 25, 45, 60, 80, 120, 200, 300, 400, 540];

// Código EAN-13 ficticio con prefijo 775 (Perú) y dígito verificador válido
function ean13(n: number): string {
  const base = "775" + String(100000000 + n).slice(-9);
  const suma = base
    .split("")
    .reduce((s, d, i) => s + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return base + ((10 - (suma % 10)) % 10);
}

function enDias(dias: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

async function main() {
  // Limpiar en orden (por las relaciones) para poder ejecutar el seed varias veces
  await prisma.movimiento.deleteMany();
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.lote.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.usuario.deleteMany();

  const dueno = await prisma.usuario.create({
    data: {
      nombre: "Dueña Demo",
      correo: "dueno@demo.pe",
      passwordHash: await bcrypt.hash("Demo1234", 10),
      rol: "DUENO",
    },
  });
  await prisma.usuario.create({
    data: {
      nombre: "Vendedor Demo",
      correo: "vendedor@demo.pe",
      passwordHash: await bcrypt.hash("Demo1234", 10),
      rol: "VENDEDOR",
    },
  });

  let totalLotes = 0;
  for (const [i, [nombre, laboratorio, presentacion, precio, stockMinimo]] of productos.entries()) {
    const producto = await prisma.producto.create({
      data: {
        nombre,
        laboratorio,
        presentacion,
        codigoBarras: ean13(i + 1),
        precioVenta: precio,
        stockMinimo,
      },
    });

    // 2 lotes por producto (3 en uno de cada cinco), con vencimientos distintos
    const numLotes = i % 5 === 0 ? 3 : 2;
    for (let l = 0; l < numLotes; l++) {
      const dias = escenarios[(i + l * 5) % escenarios.length];
      // Algunos productos quedan con poco stock a propósito (por debajo del mínimo)
      const cantidad = i % 7 === 0 ? Math.ceil(stockMinimo / 4) : stockMinimo + 20 * (l + 1);
      const lote = await prisma.lote.create({
        data: {
          productoId: producto.id,
          numeroLote: `L${String(i + 1).padStart(3, "0")}-${l + 1}`,
          fechaVencimiento: enDias(dias),
          cantidadInicial: cantidad,
          cantidadActual: cantidad,
          costoUnitario: Math.round(precio * 0.6 * 100) / 100,
        },
      });
      await prisma.movimiento.create({
        data: {
          tipo: "INGRESO",
          productoId: producto.id,
          loteId: lote.id,
          cantidad,
          usuarioId: dueno.id,
          motivo: "Carga inicial (datos de prueba)",
        },
      });
      totalLotes++;
    }
  }

  console.log(`Listo: 2 usuarios, ${productos.length} productos, ${totalLotes} lotes.`);
  console.log("Usuarios demo: dueno@demo.pe / vendedor@demo.pe (contraseña Demo1234)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

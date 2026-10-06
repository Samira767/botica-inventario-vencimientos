// Pruebas de extremo a extremo: levantan la app completa contra la base local con el seed cargado.
// Solo leen datos o provocan rechazos, así que no ensucian la base.
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Autenticación y roles (e2e)", () => {
  let app: INestApplication;
  let tokenDueno: string;
  let tokenVendedor: string;

  async function tokenDe(correo: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ correo, password: "Demo1234" });
    return res.body.accessToken;
  }

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    tokenDueno = await tokenDe("dueno@demo.pe");
    tokenVendedor = await tokenDe("vendedor@demo.pe");
  });

  afterAll(async () => {
    await app.close();
  });

  it("login correcto devuelve token y rol", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ correo: "dueno@demo.pe", password: "Demo1234" })
      .expect(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.usuario.rol).toBe("DUENO");
    expect(res.body.usuario.passwordHash).toBeUndefined();
  });

  it("login con contraseña incorrecta responde 401", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ correo: "dueno@demo.pe", password: "incorrecta" })
      .expect(401);
  });

  it("sin token no se puede ver productos (401)", async () => {
    await request(app.getHttpServer()).get("/productos").expect(401);
  });

  it("el vendedor puede ver productos con su stock", async () => {
    const res = await request(app.getHttpServer())
      .get("/productos")
      .set("Authorization", `Bearer ${tokenVendedor}`)
      .expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toEqual(expect.objectContaining({ stock: expect.any(Number) }));
  });

  it("el vendedor no puede crear productos (403)", async () => {
    await request(app.getHttpServer())
      .post("/productos")
      .set("Authorization", `Bearer ${tokenVendedor}`)
      .send({ nombre: "Producto de prueba", precioVenta: 1 })
      .expect(403);
  });

  it("el dueño recibe 400 si manda datos inválidos", async () => {
    await request(app.getHttpServer())
      .post("/productos")
      .set("Authorization", `Bearer ${tokenDueno}`)
      .send({ nombre: "", precioVenta: -5 })
      .expect(400);
  });
});

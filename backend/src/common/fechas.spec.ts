import { hoyEnLima } from "./fechas";

describe("hoyEnLima", () => {
  it("usa el calendario de Perú aunque en UTC ya sea el día siguiente", () => {
    // 02:00 UTC del 7 de octubre = 21:00 del 6 de octubre en Lima (UTC-5)
    expect(hoyEnLima(new Date("2026-10-07T02:00:00Z")).toISOString()).toBe("2026-10-06T00:00:00.000Z");
  });

  it("coincide con UTC durante el día", () => {
    expect(hoyEnLima(new Date("2026-10-06T15:00:00Z")).toISOString()).toBe("2026-10-06T00:00:00.000Z");
  });
});

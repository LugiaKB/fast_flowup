import { colaboradoresFixture, workshopsFixture } from "./fixtures";

describe("contract fixtures", () => {
  it("uses fixed identifiers and timestamps", () => {
    expect(colaboradoresFixture.map(({ id }) => id)).toEqual([1, 2]);
    expect(workshopsFixture[0]?.dataRealizacao).toBe("2026-07-16T16:00:00-03:00");
  });

  it("keeps workshop participant totals consistent", () => {
    const workshop = workshopsFixture[0];

    expect(workshop?.participantCount).toBe(workshop?.participantes.length);
  });
});

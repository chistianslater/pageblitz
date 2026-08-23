import { describe, expect, test } from "vitest";
import {
  MAX_TEAM_MEMBERS,
  addMember,
  moveMember,
  removeMember,
  updateMember,
  validateTeam,
  type TeamMember,
} from "./teamLogic";

describe("addMember", () => {
  test("hängt ein leeres Mitglied ans Ende an", () => {
    const result = addMember([{ name: "Anna" }]);
    expect(result).toEqual([{ name: "Anna" }, { name: "" }]);
  });

  test("füllt bis MAX_TEAM_MEMBERS (12) auf", () => {
    const twelve: TeamMember[] = Array.from({ length: 12 }, (_, i) => ({
      name: `M${i}`,
    }));
    expect(twelve.length).toBe(MAX_TEAM_MEMBERS);
    const result = addMember(twelve.slice(0, 11));
    expect(result.length).toBe(12);
  });

  test("13. Mitglied wird abgelehnt (No-op ab 12)", () => {
    const twelve: TeamMember[] = Array.from({ length: 12 }, (_, i) => ({
      name: `M${i}`,
    }));
    const result = addMember(twelve);
    expect(result).toBe(twelve);
    expect(result.length).toBe(12);
  });

  test("mutiert die Ausgangsliste nicht", () => {
    const original: TeamMember[] = [{ name: "Anna" }];
    addMember(original);
    expect(original).toEqual([{ name: "Anna" }]);
  });
});

describe("removeMember", () => {
  test("entfernt das Mitglied am angegebenen Index", () => {
    const members: TeamMember[] = [
      { name: "Anna" },
      { name: "Bert" },
      { name: "Carla" },
    ];
    expect(removeMember(members, 1)).toEqual([
      { name: "Anna" },
      { name: "Carla" },
    ]);
  });

  test("mutiert die Ausgangsliste nicht", () => {
    const members: TeamMember[] = [{ name: "Anna" }, { name: "Bert" }];
    removeMember(members, 0);
    expect(members.length).toBe(2);
  });
});

describe("updateMember", () => {
  test("ersetzt nur die angegebenen Felder", () => {
    const members: TeamMember[] = [{ name: "Anna", role: "Chefin" }];
    const result = updateMember(members, 0, { role: "Meisterin" });
    expect(result).toEqual([{ name: "Anna", role: "Meisterin" }]);
  });
});

describe("moveMember", () => {
  const members: TeamMember[] = [
    { name: "Anna" },
    { name: "Bert" },
    { name: "Carla" },
  ];

  test("verschiebt ein mittleres Mitglied nach oben", () => {
    expect(moveMember(members, 1, "up")).toEqual([
      { name: "Bert" },
      { name: "Anna" },
      { name: "Carla" },
    ]);
  });

  test("verschiebt ein mittleres Mitglied nach unten", () => {
    expect(moveMember(members, 1, "down")).toEqual([
      { name: "Anna" },
      { name: "Carla" },
      { name: "Bert" },
    ]);
  });

  test("erstes Mitglied nach oben ist ein No-op (Rand)", () => {
    const result = moveMember(members, 0, "up");
    expect(result).toBe(members);
  });

  test("letztes Mitglied nach unten ist ein No-op (Rand)", () => {
    const result = moveMember(members, members.length - 1, "down");
    expect(result).toBe(members);
  });
});

describe("validateTeam", () => {
  test("leerer Name → Fehlermeldung mit Positionsangabe", () => {
    const members: TeamMember[] = [{ name: "Anna" }, { name: "  " }];
    expect(validateTeam(members)).toEqual(["Name fehlt bei Mitglied 2."]);
  });

  test("alle Namen gefüllt → keine Fehler", () => {
    const members: TeamMember[] = [{ name: "Anna" }, { name: "Bert" }];
    expect(validateTeam(members)).toEqual([]);
  });

  test("leere Liste → keine Fehler", () => {
    expect(validateTeam([])).toEqual([]);
  });
});

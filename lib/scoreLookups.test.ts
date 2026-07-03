import { describe, expect, it } from "vitest";
import {
  malePushUpScoreLookup,
  femalePushUpScoreLookup,
} from "./pushUpScoreLookup";
import {
  maleSitUpScoreLookup,
  femaleSitUpScoreLookup,
} from "./sitUpScoreLookup";
import {
  maleRun24ScoreLookup,
  femaleRun24ScoreLookup,
} from "./run24ScoreLookup";
import { getReward, rewards } from "./utils";

type Table = { [ageGroup: number]: { [key: number]: number } };

// The IPPT scoring standard: 14 age bands, 21 through 60 in steps of 3.
const EXPECTED_AGE_BANDS = [21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60];

// Per-station point caps as encoded in the tables (verified against the source data):
// push-ups and sit-ups award 0-25 points; the 2.4km run awards 0-50 points.
const REP_STATION_CAP = 25;
const RUN_STATION_CAP = 50;

const sortedKeys = (row: { [key: number]: number }) =>
  Object.keys(row).map(Number).sort((a, b) => a - b);

// Spec for a "rep" station (push-ups / sit-ups): score is non-decreasing as
// reps increase, keys are contiguous integers (step 1).
interface RepSpec {
  name: string;
  table: Table;
  min: number;
  max: number;
}

// Spec for the run station: score is non-increasing as time (seconds) increases,
// keys step by 10 seconds.
interface RunSpec {
  name: string;
  table: Table;
  fastest: number; // lowest seconds -> highest score
  slowest: number; // highest seconds -> lowest score
}

const REP_TABLES: RepSpec[] = [
  { name: "malePushUp", table: malePushUpScoreLookup, min: 1, max: 60 },
  { name: "femalePushUp", table: femalePushUpScoreLookup, min: 1, max: 50 },
  { name: "maleSitUp", table: maleSitUpScoreLookup, min: 1, max: 60 },
  { name: "femaleSitUp", table: femaleSitUpScoreLookup, min: 1, max: 52 },
];

const RUN_TABLES: RunSpec[] = [
  { name: "maleRun24", table: maleRun24ScoreLookup, fastest: 510, slowest: 1100 },
  { name: "femaleRun24", table: femaleRun24ScoreLookup, fastest: 600, slowest: 1300 },
];

const ALL_TABLES: { name: string; table: Table }[] = [
  ...REP_TABLES.map((t) => ({ name: t.name, table: t.table })),
  ...RUN_TABLES.map((t) => ({ name: t.name, table: t.table })),
];

describe("age bands (invariant 1)", () => {
  it("every table exposes exactly the 14 standard age bands for male and female", () => {
    for (const { name, table } of ALL_TABLES) {
      const ages = Object.keys(table).map(Number).sort((a, b) => a - b);
      expect(ages, `${name} age bands`).toEqual(EXPECTED_AGE_BANDS);
    }
  });
});

describe("monotonicity (invariant 2)", () => {
  it("rep stations are monotonically non-decreasing as reps increase", () => {
    for (const { name, table } of REP_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        const keys = sortedKeys(table[age]);
        for (let i = 1; i < keys.length; i++) {
          expect(
            table[age][keys[i]],
            `${name} age ${age}: reps ${keys[i]} < reps ${keys[i - 1]}`
          ).toBeGreaterThanOrEqual(table[age][keys[i - 1]]);
        }
      }
    }
  });

  it("run station is monotonically non-increasing as time increases", () => {
    for (const { name, table } of RUN_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        const keys = sortedKeys(table[age]);
        for (let i = 1; i < keys.length; i++) {
          expect(
            table[age][keys[i]],
            `${name} age ${age}: ${keys[i]}s > ${keys[i - 1]}s`
          ).toBeLessThanOrEqual(table[age][keys[i - 1]]);
        }
      }
    }
  });
});

describe("point ranges (invariant 3)", () => {
  it("rep-station points stay within 0..25", () => {
    for (const { name, table } of REP_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        for (const key of sortedKeys(table[age])) {
          const v = table[age][key];
          expect(Number.isInteger(v), `${name} ${age}/${key} integer`).toBe(true);
          expect(v, `${name} ${age}/${key} lower bound`).toBeGreaterThanOrEqual(0);
          expect(v, `${name} ${age}/${key} upper bound`).toBeLessThanOrEqual(REP_STATION_CAP);
        }
      }
    }
  });

  it("run-station points stay within 0..50", () => {
    for (const { name, table } of RUN_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        for (const key of sortedKeys(table[age])) {
          const v = table[age][key];
          expect(Number.isInteger(v), `${name} ${age}/${key} integer`).toBe(true);
          expect(v, `${name} ${age}/${key} lower bound`).toBeGreaterThanOrEqual(0);
          expect(v, `${name} ${age}/${key} upper bound`).toBeLessThanOrEqual(RUN_STATION_CAP);
        }
      }
    }
  });

  it("each station actually reaches its cap somewhere", () => {
    for (const { name, table } of REP_TABLES) {
      const maxSeen = Math.max(
        ...EXPECTED_AGE_BANDS.flatMap((age) => Object.values(table[age]))
      );
      expect(maxSeen, `${name} reaches cap`).toBe(REP_STATION_CAP);
    }
    for (const { name, table } of RUN_TABLES) {
      const maxSeen = Math.max(
        ...EXPECTED_AGE_BANDS.flatMap((age) => Object.values(table[age]))
      );
      expect(maxSeen, `${name} reaches cap`).toBe(RUN_STATION_CAP);
    }
  });
});

describe("no gaps in the ranges the UI produces (invariant 4)", () => {
  // The UI iterates every rep value from min..max (step 1) and every run time
  // from fastest..slowest (step 10, WorkoutDrawer rounds down to a multiple of
  // 10). A missing key would surface a scoreless input, so assert full coverage.
  it("rep stations cover every integer rep from min to max", () => {
    for (const { name, table, min, max } of REP_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        const keys = sortedKeys(table[age]);
        expect(keys[0], `${name} age ${age} min`).toBe(min);
        expect(keys[keys.length - 1], `${name} age ${age} max`).toBe(max);
        expect(keys.length, `${name} age ${age} count`).toBe(max - min + 1);
        for (let expected = min; expected <= max; expected++) {
          expect(table[age][expected], `${name} age ${age} rep ${expected}`).toBeTypeOf("number");
        }
      }
    }
  });

  it("run station covers every 10-second step from fastest to slowest", () => {
    for (const { name, table, fastest, slowest } of RUN_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        const keys = sortedKeys(table[age]);
        expect(keys[0], `${name} age ${age} fastest`).toBe(fastest);
        expect(keys[keys.length - 1], `${name} age ${age} slowest`).toBe(slowest);
        expect(keys.length, `${name} age ${age} count`).toBe((slowest - fastest) / 10 + 1);
        for (let expected = fastest; expected <= slowest; expected += 10) {
          expect(table[age][expected], `${name} age ${age} ${expected}s`).toBeTypeOf("number");
        }
      }
    }
  });
});

describe("anchor cells (invariant 5)", () => {
  it("max reps award the full 25 points in every age band", () => {
    for (const { name, table, max } of REP_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        expect(table[age][max], `${name} age ${age} max reps`).toBe(REP_STATION_CAP);
      }
    }
  });

  it("the fastest run time awards the full 50 points and the slowest awards the row minimum", () => {
    for (const { name, table, fastest, slowest } of RUN_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        expect(table[age][fastest], `${name} age ${age} fastest`).toBe(RUN_STATION_CAP);
        // The slowest time is the worst score in the band (0 for younger bands,
        // a small positive floor for the oldest bands per the published table).
        const rowMin = Math.min(...Object.values(table[age]));
        expect(table[age][slowest], `${name} age ${age} slowest`).toBe(rowMin);
      }
    }
  });

  it("known first-scoring rep cells match the published standard", () => {
    // Age 21: 15 reps is the first push-up / sit-up count worth a point.
    expect(malePushUpScoreLookup[21][15]).toBe(1);
    expect(malePushUpScoreLookup[21][14]).toBe(0);
    expect(femalePushUpScoreLookup[21][15]).toBe(1);
    expect(maleSitUpScoreLookup[21][15]).toBe(1);
    expect(femaleSitUpScoreLookup[21][15]).toBe(1);
  });

  it("known anchor cells match the published standard", () => {
    expect(malePushUpScoreLookup[21][60]).toBe(25);
    expect(femalePushUpScoreLookup[21][50]).toBe(25);
    expect(maleSitUpScoreLookup[21][60]).toBe(25);
    expect(femaleSitUpScoreLookup[21][52]).toBe(25);
    expect(maleRun24ScoreLookup[21][510]).toBe(50);
    expect(maleRun24ScoreLookup[21][1100]).toBe(0);
    expect(femaleRun24ScoreLookup[21][600]).toBe(50);
    expect(femaleRun24ScoreLookup[21][1300]).toBe(0);
  });

  it("every rep station has a well-defined first-scoring rep with a zero prefix", () => {
    for (const { name, table } of REP_TABLES) {
      for (const age of EXPECTED_AGE_BANDS) {
        const keys = sortedKeys(table[age]);
        const firstPos = keys.find((k) => table[age][k] > 0);
        expect(firstPos, `${name} age ${age} has a scoring rep`).toBeDefined();
        // Everything before the first scoring rep must be exactly 0.
        for (const k of keys) {
          if (k >= (firstPos as number)) break;
          expect(table[age][k], `${name} age ${age} rep ${k} prefix`).toBe(0);
        }
      }
    }
  });
});

describe("utils tally / threshold helpers", () => {
  it("rewards thresholds are contiguous and ordered", () => {
    for (let i = 1; i < rewards.length; i++) {
      // Each band starts exactly one point above the previous band's max.
      expect(rewards[i].min).toBe(rewards[i - 1].max + 1);
    }
    expect(rewards[0].min).toBe(0);
    expect(rewards[rewards.length - 1].max).toBe(Infinity);
  });

  it("getReward maps total points to the correct band label", () => {
    expect(getReward(0)).toBe("FAIL");
    expect(getReward(49)).toBe("FAIL");
    expect(getReward(50)).toBe("PASS");
    expect(getReward(60)).toBe("PASS");
    expect(getReward(61)).toBe("PASS ($200)");
    expect(getReward(74)).toBe("PASS ($200)");
    expect(getReward(75)).toBe("SILVER ($300)");
    expect(getReward(84)).toBe("SILVER ($300)");
    expect(getReward(85)).toBe("GOLD ($500)");
    expect(getReward(100)).toBe("GOLD ($500)");
  });

  it("getReward covers the full achievable IPPT range (0..100) with no gaps", () => {
    for (let points = 0; points <= 100; points++) {
      expect(getReward(points), `points ${points}`).not.toBe("Unknown");
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  computeIpptScore,
  getPushUpScore,
  getRunScore,
  getSitUpScore,
} from "./score";
import { getReward } from "./utils";

// The 14 standard IPPT age bands (21..60, step 3).
const AGE_BANDS = [21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60];

describe("station scoring at boundary reps/timings", () => {
  it("awards the full 25 points at each rep station's max reps", () => {
    expect(getPushUpScore("male", 21, 60)).toBe(25);
    expect(getSitUpScore("male", 21, 60)).toBe(25);
    expect(getPushUpScore("female", 21, 50)).toBe(25);
    expect(getSitUpScore("female", 21, 52)).toBe(25);
  });

  it("awards the first point exactly at the first-scoring rep (age 21)", () => {
    expect(getPushUpScore("male", 21, 14)).toBe(0);
    expect(getPushUpScore("male", 21, 15)).toBe(1);
    expect(getSitUpScore("male", 21, 14)).toBe(0);
    expect(getSitUpScore("male", 21, 15)).toBe(1);
    expect(getPushUpScore("female", 21, 14)).toBe(0);
    expect(getPushUpScore("female", 21, 15)).toBe(1);
  });

  it("awards the full 50 points at the fastest run time and 0 at the cutoff", () => {
    expect(getRunScore("male", 21, 510)).toBe(50); // 8:30
    expect(getRunScore("male", 21, 1100)).toBe(0); // 18:20 cutoff
    expect(getRunScore("female", 21, 600)).toBe(50); // 10:00
    expect(getRunScore("female", 21, 1300)).toBe(0); // cutoff
  });

  it("scores the run monotonically: one second slower never scores higher", () => {
    expect(getRunScore("male", 21, 520)).toBeLessThan(getRunScore("male", 21, 510));
    expect(getRunScore("male", 21, 750)).toBe(30);
    expect(getRunScore("male", 21, 810)).toBe(24);
  });
});

describe("age-band transitions", () => {
  it("holds a fixed rep count worth at least as many points in an older band", () => {
    // The older you are, the fewer reps needed for the same points, so a fixed
    // rep count is non-decreasing in points as the age band increases.
    for (const gender of ["male", "female"] as const) {
      for (let i = 1; i < AGE_BANDS.length; i++) {
        const younger = getPushUpScore(gender, AGE_BANDS[i - 1], 30);
        const older = getPushUpScore(gender, AGE_BANDS[i], 30);
        expect(older, `${gender} push-ups@30 ${AGE_BANDS[i]} vs ${AGE_BANDS[i - 1]}`)
          .toBeGreaterThanOrEqual(younger);
      }
    }
  });

  it("moves the push-up first-scoring rep earlier by band (male: 15,14,13,12...)", () => {
    expect(getPushUpScore("male", 21, 15)).toBe(1);
    expect(getPushUpScore("male", 24, 14)).toBe(1);
    expect(getPushUpScore("male", 27, 13)).toBe(1);
    expect(getPushUpScore("male", 30, 12)).toBe(1);
  });

  it("scores every age band independently and non-zero at max effort", () => {
    for (const age of AGE_BANDS) {
      const { total } = computeIpptScore("male", age, { pushUps: 60, sitUps: 60, run: 510 });
      expect(total, `male age ${age} max effort`).toBe(100);
    }
  });
});

describe("total composition and award tiers", () => {
  it("sums the three stations into the total", () => {
    const r = computeIpptScore("male", 21, { pushUps: 60, sitUps: 60, run: 750 });
    expect(r.pushUpScore).toBe(25);
    expect(r.sitUpScore).toBe(25);
    expect(r.runScore).toBe(30);
    expect(r.total).toBe(80);
  });

  it("classifies GOLD at a perfect 100", () => {
    const r = computeIpptScore("male", 21, { pushUps: 60, sitUps: 60, run: 510 });
    expect(r.total).toBe(100);
    expect(r.reward).toBe("GOLD ($500)");
  });

  it("classifies SILVER at 80", () => {
    const r = computeIpptScore("male", 21, { pushUps: 60, sitUps: 60, run: 750 });
    expect(r.total).toBe(80);
    expect(r.reward).toBe("SILVER ($300)");
  });

  it("classifies PASS ($200) at 74 (top of the incentive band)", () => {
    const r = computeIpptScore("male", 21, { pushUps: 60, sitUps: 60, run: 810 });
    expect(r.total).toBe(74);
    expect(r.reward).toBe("PASS ($200)");
  });

  it("classifies a bare PASS at 50 (run at the cutoff)", () => {
    const r = computeIpptScore("male", 21, { pushUps: 60, sitUps: 60, run: 1100 });
    expect(r.total).toBe(50);
    expect(r.reward).toBe("PASS");
  });

  it("classifies FAIL below 50", () => {
    const r = computeIpptScore("male", 21, { pushUps: 1, sitUps: 1, run: 1100 });
    expect(r.total).toBe(0);
    expect(r.reward).toBe("FAIL");
  });

  it("keeps the reported reward consistent with getReward(total)", () => {
    for (const run of [510, 600, 700, 800, 900, 1000, 1100]) {
      const r = computeIpptScore("male", 21, { pushUps: 40, sitUps: 40, run });
      expect(r.reward).toBe(getReward(r.total));
    }
  });
});

describe("edge cases and invalid input", () => {
  it("scores 0 for reps/timings outside the published table", () => {
    expect(getPushUpScore("male", 21, 0)).toBe(0);
    expect(getPushUpScore("male", 21, -5)).toBe(0);
    expect(getPushUpScore("male", 21, 999)).toBe(0);
    expect(getSitUpScore("male", 21, 999)).toBe(0);
    expect(getRunScore("male", 21, 0)).toBe(0); // faster than any table entry
    expect(getRunScore("male", 21, 99999)).toBe(0);
    expect(getRunScore("male", 21, 515)).toBe(0); // not a 10-second step
  });

  it("scores 0 for an unknown age band", () => {
    expect(getPushUpScore("male", 22, 60)).toBe(0); // 22 is not a band boundary
    expect(getSitUpScore("male", 999, 60)).toBe(0);
    expect(getRunScore("female", 0, 600)).toBe(0);
  });

  it("computes a FAIL total of 0 when every input is invalid", () => {
    const r = computeIpptScore("male", 22, { pushUps: 999, sitUps: -1, run: 12345 });
    expect(r.pushUpScore).toBe(0);
    expect(r.sitUpScore).toBe(0);
    expect(r.runScore).toBe(0);
    expect(r.total).toBe(0);
    expect(r.reward).toBe("FAIL");
  });

  it("scores female and male tables independently for the same inputs", () => {
    // Female max push-ups is 50; a male-style 60 is out of the female range.
    expect(getPushUpScore("female", 21, 50)).toBe(25);
    expect(getPushUpScore("female", 21, 60)).toBe(0);
    expect(getPushUpScore("male", 21, 60)).toBe(25);
  });
});

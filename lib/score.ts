import { femalePushUpScoreLookup, malePushUpScoreLookup } from "./pushUpScoreLookup";
import { femaleRun24ScoreLookup, maleRun24ScoreLookup } from "./run24ScoreLookup";
import { femaleSitUpScoreLookup, maleSitUpScoreLookup } from "./sitUpScoreLookup";
import { getReward } from "./utils";

export type Gender = "male" | "female";

export interface StationInput {
  pushUps: number;
  sitUps: number;
  run: number; // seconds for the 2.4km run
}

export interface IpptResult {
  pushUpScore: number;
  sitUpScore: number;
  runScore: number;
  total: number;
  reward: string;
}

// Each station scores 0 for any input the published table does not cover
// (out-of-range reps/timings or an unknown age band), matching the UI's
// `table[ageGroup]?.[value] ?? 0` behaviour.
export function getPushUpScore(gender: Gender, ageGroup: number, reps: number): number {
  const table = gender === "male" ? malePushUpScoreLookup : femalePushUpScoreLookup;
  return table[ageGroup]?.[reps] ?? 0;
}

export function getSitUpScore(gender: Gender, ageGroup: number, reps: number): number {
  const table = gender === "male" ? maleSitUpScoreLookup : femaleSitUpScoreLookup;
  return table[ageGroup]?.[reps] ?? 0;
}

export function getRunScore(gender: Gender, ageGroup: number, seconds: number): number {
  const table = gender === "male" ? maleRun24ScoreLookup : femaleRun24ScoreLookup;
  return table[ageGroup]?.[seconds] ?? 0;
}

// Total IPPT score across the three stations plus the resulting award tier.
export function computeIpptScore(
  gender: Gender,
  ageGroup: number,
  { pushUps, sitUps, run }: StationInput
): IpptResult {
  const pushUpScore = getPushUpScore(gender, ageGroup, pushUps);
  const sitUpScore = getSitUpScore(gender, ageGroup, sitUps);
  const runScore = getRunScore(gender, ageGroup, run);
  const total = pushUpScore + sitUpScore + runScore;
  return { pushUpScore, sitUpScore, runScore, total, reward: getReward(total) };
}

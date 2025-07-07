export const rewards = [
    { min: 0, max: 49, label: "FAIL" },
    { min: 50, max: 60, label: "PASS" },
    { min: 61, max: 74, label: "PASS ($200)" },
    { min: 75, max: 84, label: "SILVER ($300)" },
    { min: 85, max: Infinity, label: "GOLD ($500)" },
];

export function getReward(points: number): string {
    const reward = rewards.find(r => points >= r.min && points <= r.max);
    return reward ? reward.label : "Unknown";
}

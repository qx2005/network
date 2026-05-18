/**
 * Synthetic MEC rule hit counters for demo console (no live UPF telemetry).
 * 演示用 MEC 规则命中数：确定性生成，列表刷新后保持稳定。
 */

export function syntheticMecRuleHitCount(input: {
  name: string;
  priority: number;
}): number {
  let h = 0;
  const seed = `${input.name}:${input.priority}`;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const positive = Math.abs(h);
  return 1_200 + (positive % 86_000) + input.priority * 211;
}

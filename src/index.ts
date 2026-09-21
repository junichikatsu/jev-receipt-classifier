/**
 * 1 枚ずつ順番に分類して、レスポンスの中身をそのまま眺めるためのスクリプト。
 *   npm start
 */
import { classify } from "./classify.ts";
import { receipts } from "./receipts.ts";
import { CONFIDENCE_THRESHOLD } from "./questions.ts";

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

for (const receipt of receipts) {
  const r = await classify(receipt);

  const top3 = Object.entries(r.probabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([label, p]) => `${label} ${pct(p)}`)
    .join(", ");

  console.log(`\n${r.receipt.id}  ${r.receipt.store}  ¥${r.receipt.total.toLocaleString()}`);
  console.log(`  items      : ${r.receipt.items.join(" / ")}`);
  console.log(`  category   : ${r.categoryLabel} (confidence ${pct(r.confidence)})  [${top3}]`);
  console.log(`  necessity  : ${r.necessityLabel} (score ${r.necessity.toFixed(2)})`);
  console.log(`  fixed cost : ${pct(r.fixedCostProbability)}`);
  console.log(
    `  ${r.needsReview ? "⚠ 要確認" : "✓ 自動確定"}  ${r.latencyMs.toFixed(0)}ms  ${r.inputTokens} tokens  req=${r.requestId ?? "-"}`,
  );
}

console.log(`\n(confidence < ${CONFIDENCE_THRESHOLD} のものを「要確認」にしています)`);

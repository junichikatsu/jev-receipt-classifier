/**
 * 全レシートを並列で投げて、集計表・要確認リスト・コストとレイテンシを出すスクリプト。
 *   npm run batch
 */
import { classify } from "./classify.ts";
import { receipts } from "./receipts.ts";
import { CONFIDENCE_THRESHOLD } from "./questions.ts";

// Jev の料金: 入力 $0.042 / 1M tokens、出力は無料 (2026-09 時点)
const USD_PER_INPUT_TOKEN = 0.042 / 1_000_000;
const JPY_PER_USD = 150;

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

const wallStart = performance.now();
const results = await Promise.all(receipts.map(classify));
const wallMs = performance.now() - wallStart;

// --- 分類結果 ---------------------------------------------------------
console.log("\n## 分類結果\n");
console.log("| ID | 店名 | 金額 | カテゴリ | conf | 必需度 | 固定費 | 判定 |");
console.log("|---|---|---:|---|---:|---|---:|---|");
for (const r of results) {
  console.log(
    `| ${r.receipt.id} | ${r.receipt.store} | ¥${r.receipt.total.toLocaleString()} | ${r.categoryLabel} | ${pct(r.confidence)} | ${r.necessityLabel} | ${pct(r.fixedCostProbability)} | ${r.needsReview ? "⚠ 要確認" : "✓ 自動"} |`,
  );
}

// --- 要確認リスト -----------------------------------------------------
const review = results.filter((r) => r.needsReview);
console.log(`\n## 要確認 (confidence < ${CONFIDENCE_THRESHOLD}): ${review.length} / ${results.length} 件\n`);
for (const r of review) {
  const dist = Object.entries(r.probabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([label, p]) => `${label} ${pct(p)}`)
    .join(" / ");
  console.log(`- ${r.receipt.id} ${r.receipt.store}: ${dist}`);
}

// --- カテゴリ別集計（自動確定分のみ） -----------------------------------
const byCategory = new Map<string, number>();
for (const r of results.filter((r) => !r.needsReview)) {
  byCategory.set(r.categoryLabel, (byCategory.get(r.categoryLabel) ?? 0) + r.receipt.total);
}
console.log("\n## カテゴリ別合計（自動確定分）\n");
for (const [label, total] of [...byCategory].sort(([, a], [, b]) => b - a)) {
  console.log(`- ${label}: ¥${total.toLocaleString()}`);
}

// --- コストとレイテンシ -------------------------------------------------
const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
const percentile = (q: number) =>
  latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * q))] ?? 0;
const tokens = results.reduce((s, r) => s + r.inputTokens, 0);
const usd = tokens * USD_PER_INPUT_TOKEN;

console.log("\n## コスト・レイテンシ\n");
console.log(`- リクエスト数      : ${results.length}（各 3 質問、並列実行）`);
console.log(`- 合計 input tokens : ${tokens.toLocaleString()}（平均 ${(tokens / results.length).toFixed(0)} / 枚）`);
console.log(`- 概算コスト        : $${usd.toFixed(6)} ≒ ¥${(usd * JPY_PER_USD).toFixed(4)}`);
console.log(`- 1 枚あたり        : ¥${((usd * JPY_PER_USD) / results.length).toFixed(5)}`);
console.log(
  `- レイテンシ        : min ${(latencies[0] ?? 0).toFixed(0)}ms / p50 ${percentile(0.5).toFixed(0)}ms / max ${(latencies.at(-1) ?? 0).toFixed(0)}ms`,
);
console.log(`- 全体の実行時間    : ${wallMs.toFixed(0)}ms（${results.length} 枚並列）`);

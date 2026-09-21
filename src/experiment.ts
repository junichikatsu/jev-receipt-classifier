/**
 * 「questions の書き方」と「state に渡す情報」で結果がどう変わるかを見る実験。
 *   npm run experiment
 */
import { choice, type JsonValue } from "@typesafe-ai/sdk";
import { client } from "./classify.ts";
import { questions } from "./questions.ts";
import { receipts } from "./receipts.ts";

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

function show(title: string, answer: { choice: string; confidence: number; probabilities: Record<string, number> }) {
  const dist = Object.entries(answer.probabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([label, p]) => `${label} ${pct(p)}`)
    .join(" / ");
  console.log(`  ${title.padEnd(34)} → ${answer.choice} (conf ${pct(answer.confidence)})  [${dist}]`);
}

const toState = (r: (typeof receipts)[number]) => ({
  store: r.store,
  items: r.items,
  total_jpy: r.total,
  date: r.date,
});

// --- 実験 1: カテゴリを 1 つ足すと「その他」に逃げていた Amazon はどうなる？ ----------
console.log("\n## 実験 1: criteria に「書籍・学習」カテゴリを追加する\n");

const amazon = receipts.find((r) => r.id === "R006")!;

const withEducation = choice(questions.category.instructions ?? null, {
  ...questions.category.criteria,
  education: "書籍・学習。本、電子書籍、オンライン講座、資格試験",
});

const [before, after] = await Promise.all([
  client.systemOne({ state: toState(amazon), questions: { category: questions.category } }),
  client.systemOne({ state: toState(amazon), questions: { category: withEducation } }),
]);
show("元の 8 カテゴリ", before.answers.category);
show("+ education (9 カテゴリ)", after.answers.category);

// --- 実験 2: 明細のないレシートに情報を足していくと confidence はどう動く？ ------------
console.log("\n## 実験 2: state に渡す情報量と confidence\n");

const variants: { title: string; state: Record<string, JsonValue> }[] = [
  { title: "店名のみ", state: { store: "やまだ商店" } },
  { title: "店名 + 金額", state: { store: "やまだ商店", total_jpy: 2480 } },
  { title: "店名 + 金額 + 時刻 (夕方)", state: { store: "やまだ商店", total_jpy: 2480, time: "18:42" } },
  {
    title: "店名 + 業種メモ (八百屋)",
    state: { store: "やまだ商店", total_jpy: 2480, note: "近所の八百屋" },
  },
  {
    title: "店名 + 業種メモ (金物屋)",
    state: { store: "やまだ商店", total_jpy: 2480, note: "近所の金物屋" },
  },
];

const results = await Promise.all(
  variants.map((v) => client.systemOne({ state: v.state, questions: { category: questions.category } })),
);
variants.forEach((v, i) => show(v.title, results[i]!.answers.category));

// --- 実験 3: 1 質問と 3 質問でレイテンシは変わる？ -------------------------------------
console.log("\n## 実験 3: 質問数とレイテンシ（各 5 回の中央値）\n");

async function median(fn: () => Promise<unknown>, n = 5) {
  const t: number[] = [];
  for (let i = 0; i < n; i++) {
    const s = performance.now();
    await fn();
    t.push(performance.now() - s);
  }
  return t.sort((a, b) => a - b)[Math.floor(n / 2)]!;
}

const lifeState = toState(receipts[0]!);
const one = await median(() => client.systemOne({ state: lifeState, questions: { category: questions.category } }));
const three = await median(() => client.systemOne({ state: lifeState, questions }));
console.log(`  1 質問 (Choice のみ)         : ${one.toFixed(0)}ms`);
console.log(`  3 質問 (Choice+Score+Noul)   : ${three.toFixed(0)}ms`);

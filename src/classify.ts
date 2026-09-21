import { TypeSafeClient } from "@typesafe-ai/sdk";
import type { Receipt } from "./receipts.ts";
import {
  CONFIDENCE_THRESHOLD,
  categoryLabel,
  necessityLabel,
  questions,
} from "./questions.ts";

export interface Classified {
  receipt: Receipt;
  category: keyof typeof categoryLabel;
  categoryLabel: string;
  confidence: number;
  probabilities: Record<string, number>;
  necessity: number;
  necessityLabel: string;
  fixedCostProbability: number;
  needsReview: boolean;
  latencyMs: number;
  inputTokens: number;
  requestId: string | undefined;
}

// TYPESAFE_API_KEY は環境変数から自動で読まれる
export const client = new TypeSafeClient();

/** レシート 1 枚を Jev に投げて分類する */
export async function classify(receipt: Receipt): Promise<Classified> {
  const started = performance.now();

  // state は文字列でも JSON でも渡せる。構造化データはそのままオブジェクトで渡すのが楽
  const { data, requestId } = await client
    .systemOne({
      state: {
        store: receipt.store,
        items: receipt.items,
        total_jpy: receipt.total,
        date: receipt.date,
      },
      questions,
    })
    .withResponse();

  const latencyMs = performance.now() - started;
  const { category, necessity, fixed_cost } = data.answers;

  return {
    receipt,
    category: category.choice,
    categoryLabel: categoryLabel[category.choice],
    confidence: category.confidence,
    probabilities: category.probabilities,
    necessity: necessity.score,
    necessityLabel: necessityLabel[Math.round(necessity.score)] ?? "?",
    fixedCostProbability: fixed_cost.noul,
    needsReview: category.confidence < CONFIDENCE_THRESHOLD,
    latencyMs,
    inputTokens: data.usage.input_tokens,
    requestId,
  };
}

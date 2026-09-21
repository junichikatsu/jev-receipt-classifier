import { choice, noul, score } from "@typesafe-ai/sdk";

/**
 * レシート 1 枚に対して同時に聞く 3 つの質問。
 * Jev は複数の質問を 1 回の API 呼び出しで並列に評価するので、
 * 質問を増やしてもレスポンス時間はほとんど変わらない。
 */
export const questions = {
  // Choice: 家計簿のカテゴリを 1 つ選ぶ
  category: choice("このレシートの支出カテゴリとして最も適切なものは？", {
    food: "食費。スーパー・コンビニの食料品、外食、カフェ、飲み物",
    daily: "日用品。洗剤、トイレットペーパー、電池、文具などの消耗品",
    transport: "交通費。電車・バス・タクシー・IC カードチャージ・ガソリン",
    medical: "医療費。病院の診察、薬局で買った医薬品",
    utilities: "光熱費・通信費。電気・ガス・水道・スマホ・ネット・サブスク",
    clothing: "衣服・美容。服、靴、化粧品、美容院",
    leisure: "娯楽・レジャー。旅行、イベント、趣味、パーティー用品",
    other: "上記のどれにも当てはまらない",
  }),

  // Score: 必需度を 3 段階で評価する（0 = 必需 〜 2 = 贅沢）
  necessity: score("この支出の必需度は？", [
    "必需。生活に不可欠で、削ることが難しい支出",
    "準必需。あると便利・健康や生活の質に寄与するが、代替や節約は可能",
    "贅沢。嗜好品・娯楽・ご褒美など、なくても生活に支障がない支出",
  ]),

  // Noul: 毎月定期的に発生する固定費か？
  fixed_cost: noul("これは毎月ほぼ同じ金額で定期的に発生する固定費か？", {
    true: "電気・ガス・水道、家賃、サブスクリプション、月額プランなど",
    false: "その場で発生した単発の買い物や外食",
  }),
} as const;

/** カテゴリ判定の confidence がこれを下回ったら自動確定せず「要確認」に回す */
export const CONFIDENCE_THRESHOLD = 0.7;

export const categoryLabel: Record<keyof typeof questions.category.criteria, string> = {
  food: "食費",
  daily: "日用品",
  transport: "交通費",
  medical: "医療費",
  utilities: "光熱・通信",
  clothing: "衣服・美容",
  leisure: "娯楽",
  other: "その他",
};

export const necessityLabel = ["必需", "準必需", "贅沢"] as const;

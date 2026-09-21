# jev-sample

[Jev (TypeSafe AI)](https://typesafe.ai/) を使って、家計簿のレシートを自動分類するサンプルです。
テキストを生成しない「判断特化」モデル Jev に、レシート 1 枚につき 3 つの質問を 1 回の API 呼び出しで投げます。

| 質問 | タイプ | 返ってくるもの |
|---|---|---|
| 支出カテゴリは？ | Choice | 8 カテゴリのうち 1 つ + 各カテゴリの確率 + confidence |
| 必需度は？ | Score | 0 (必需) 〜 2 (贅沢) のスコア + confidence |
| 固定費か？ | Noul | 0〜1 の確率 |

カテゴリの confidence が 0.7 未満のものは自動確定せず「要確認」に振り分けます。

## 必要なもの

- Node.js 24 以上（TypeScript をそのまま実行しています）
- TypeSafe AI の API キー（https://typesafe.ai のダッシュボードで発行）

## セットアップ

```sh
npm install
cp .env.example .env   # TYPESAFE_API_KEY を書く
```

## 実行

```sh
npm start            # 1 枚ずつ順に分類し、レスポンスの中身を表示
npm run batch        # 全件を並列で分類し、集計表・要確認リスト・コスト・レイテンシを表示
npm run experiment   # criteria や state を変えると結果がどう動くかの実験
npm run typecheck
```

## ファイル

- `src/receipts.ts` — サンプルのレシートデータ
- `src/questions.ts` — Jev に投げる 3 つの質問と confidence のしきい値
- `src/classify.ts` — `systemOne` を呼んで結果を整形する
- `src/index.ts` / `src/batch.ts` / `src/experiment.ts` — 実行スクリプト

/** 家計簿に取り込みたいレシート 1 枚分。実際は OCR やカード明細 CSV から来る想定 */
export interface Receipt {
  id: string;
  date: string;
  store: string;
  items: string[];
  total: number;
}

/** わかりやすいものから、人間でも迷うものまで意図的に混ぜている */
export const receipts: Receipt[] = [
  {
    id: "R001",
    date: "2026-09-01",
    store: "ライフ 下北沢店",
    items: ["国産豚こま切れ 300g", "キャベツ 1/2", "牛乳 1L", "食パン 6枚切"],
    total: 1284,
  },
  {
    id: "R002",
    date: "2026-09-02",
    store: "JR東日本 モバイルSuica",
    items: ["チャージ 3,000円"],
    total: 3000,
  },
  {
    id: "R003",
    date: "2026-09-03",
    store: "マツモトキヨシ",
    items: ["アタック 洗濯洗剤 詰替", "トイレットペーパー 12ロール", "ロキソニンS 12錠"],
    total: 2156,
  },
  {
    id: "R004",
    date: "2026-09-05",
    store: "スターバックス 渋谷スクランブルスクエア店",
    items: ["キャラメルマキアート Tall", "ニューヨークチーズケーキ"],
    total: 1120,
  },
  {
    id: "R005",
    date: "2026-09-06",
    store: "セブン-イレブン",
    items: ["幕の内弁当", "お茶 600ml", "単3アルカリ乾電池 4本", "コピー 10枚"],
    total: 1436,
  },
  {
    id: "R006",
    date: "2026-09-08",
    store: "Amazon.co.jp",
    items: ["Anker USB-C ケーブル 2m", "Kindle 本: 『ゼロから作るDeep Learning』"],
    total: 4490,
  },
  {
    id: "R007",
    date: "2026-09-10",
    store: "東京電力エナジーパートナー",
    items: ["8月分 電気料金"],
    total: 8420,
  },
  {
    id: "R008",
    date: "2026-09-12",
    store: "ユニクロ 新宿店",
    items: ["エアリズム コットンT 2枚", "感動パンツ"],
    total: 5980,
  },
  {
    id: "R009",
    date: "2026-09-13",
    store: "ドン・キホーテ 渋谷店",
    items: ["ハロウィン コスプレ衣装", "お菓子詰め合わせ", "パーティー用紙皿 20枚"],
    total: 3980,
  },
  {
    id: "R010",
    date: "2026-09-15",
    store: "しもきた内科クリニック",
    items: ["再診料", "処方箋料"],
    total: 1130,
  },
  {
    id: "R011",
    date: "2026-09-18",
    store: "Netflix",
    items: ["スタンダードプラン 月額"],
    total: 1590,
  },
  {
    id: "R012",
    date: "2026-09-20",
    store: "楽天トラベル",
    items: ["箕面温泉スパーガーデン 1泊2食付 2名"],
    total: 32000,
  },
  // ここから先は人間でも迷う「意地悪」なレシート
  {
    id: "R013",
    date: "2026-09-20",
    store: "イオン 幕張新都心店",
    items: ["お刺身盛り合わせ", "子ども用スニーカー", "ラップ 30m", "ハンドソープ 詰替"],
    total: 6230,
  },
  {
    id: "R014",
    date: "2026-09-21",
    store: "やまだ商店",
    items: ["PayPay 決済（明細なし）"],
    total: 2480,
  },
];

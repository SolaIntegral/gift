# Plamo API統合計画

## 📋 概要

Preferred NetworksのPlamo APIを使用して、GIFTSアプリケーションのAI機能を強化します。Plamoは高性能な日本語特化LLMで、GENIAC開発のLLMとして審査での加点対象となります。

## 🔍 Plamo API仕様

### API エンドポイント
- **Base URL**: https://platform.preferredai.jp/api/completion
- **Chat Completions**: `/v1/chat/completions`
- **Text Generation**: `/v1/completions`

### 認証方式
- **API Key**: Bearer Token認証
- **Header**: `Authorization: Bearer {api_key}`

### 利用可能なモデル
- **plamo-2.0-prime**: 最新の高性能モデル（推奨）
- **plamo-2.0**: 汎用モデル
- **plamo-1.0**: 基本モデル

### リクエスト形式
```json
{
  "model": "plamo-2.0-prime",
  "messages": [
    {
      "role": "system",
      "content": "あなたは健康ギフトの専門アドバイザーです。"
    },
    {
      "role": "user",
      "content": "ユーザーのメッセージ"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7,
  "stream": false
}
```

## 🚀 実装計画

### Phase 1: Plamo APIクライアント実装 ✅
- [x] PlamoAPIClientクラスの作成
- [x] 認証・エラーハンドリングの実装
- [x] レスポンス処理の最適化

### Phase 2: 既存システムとの統合 ✅
- [x] LLMServiceの更新
- [x] プロンプトエンジニアリングの調整
- [x] 感情分析機能の強化

### Phase 3: テスト・最適化
- [ ] API接続テスト
- [ ] パフォーマンス最適化
- [ ] エラーハンドリングの改善

## 💰 コスト分析

### Plamo API料金
- **無料枠**: 月間1000リクエスト
- **有料プラン**: リクエスト数に応じた従量課金
- **予想コスト**: 月間$20-50（現在の使用量ベース）

### 現在のAmazon Bedrock使用量
- 月間リクエスト数: 約500-800
- 現在のコスト: 約$50-80/月

### 移行効果
- **コスト削減**: 約$30-60/月の節約
- **性能向上**: 日本語特化による高精度
- **審査加点**: 国産LLM活用による明確な加点

## 🔧 技術的実装

### 新しいPlamoAPIClient ✅
```typescript
export class PlamoAPIClient {
  private config: LLMConfig
  
  constructor(config: LLMConfig) {
    this.config = config
  }
  
  async generateResponse(prompt: string): Promise<LLMResponse> {
    // Plamo API呼び出し実装
  }
  
  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    // 感情分析実装
  }
}
```

### プロンプト最適化
```typescript
const plamoHealthGiftPrompt = `
あなたは健康ギフトの専門アドバイザーです。
ユーザーの感情と意図を理解し、最適な健康ギフトを推薦してください。

会話履歴: {conversation}

分析項目:
1. 相手への感情（愛情、感謝、心配、励ましなど）
2. 相手に望む変化（健康向上、ストレス軽減、活力向上など）
3. 関係性（家族、友人、恋人、同僚など）
4. 予算感（高級、中級、手頃など）

以下の形式で回答してください：
1. 感情理解の確認（共感的な応答）
2. 推薦ギフト（3つ、具体的な商品名と価格）
3. 各ギフトの推薦理由（感情に基づく）
4. 相手へのメッセージ提案

回答は親しみやすく、共感的な口調でお願いします。
`
```

## 📊 期待される効果

### 審査での加点
1. **国産LLM活用**: 明確な加点対象
2. **技術的革新性**: 高性能日本語特化AI
3. **コスト効率**: 適切な料金体系

### ユーザー体験向上
1. **日本語理解精度向上**: より自然な会話
2. **感情分析精度向上**: より適切なギフト推薦
3. **レスポンス速度向上**: 国内APIによる低遅延

### ビジネス効果
1. **コスト削減**: 月間$30-60の節約
2. **信頼性向上**: 国産技術による安心感
3. **競合優位性**: 独自の感情分析機能

## 🔧 次のステップ

### 1. 環境変数の設定
```bash
# .env.localファイルに以下を追加
VITE_PLAMO_API_KEY=your_actual_api_key
VITE_PLAMO_BASE_URL=https://platform.preferredai.jp/api/completion
VITE_PLAMO_MODEL=plamo-2.0-prime
```

### 2. API接続テスト
- 認証テスト
- レスポンス品質確認
- エラーハンドリングテスト

### 3. パフォーマンス最適化
- レスポンス時間の測定
- キャッシュ戦略の検討
- フォールバック機能の確認 
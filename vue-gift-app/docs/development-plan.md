# GIFTSアプリ 開発計画書（AWS無料サービス版）

## 📋 概要

### プロジェクト名
**GIFTS** - 健康ギフト提案・購入プラットフォーム

### 開発期間
**2週間** (14日間) - 短期一括移行

### 開発目標
- Supabase → AWS無料サービスへの完全移行
- TypeScript + Vue.js 3 + AWS サーバーレスアーキテクチャの実装
- 審査対応の高品質UI/UX
- AI機能（Amazon Bedrock）の実装
- LINE連携の実装

---

## 🎯 審査ポイント対応

### 重点確認項目

#### 1. プロダクトの完成度
- ✅ **実用的なUX/UI**: レスポンシブデザイン、アクセシビリティ対応
- ✅ **多様な世代への配慮**: フォントサイズ調整、カラーモード対応
- ✅ **デザインの統一感**: デザインシステム、コンポーネントライブラリ

#### 2. 技術的実装
- ✅ **クラウドサービス・AIの適切な活用**: AWS サーバーレス、Bedrock
- ✅ **GENIAC LLMの効果的な実装**: ギフト推薦、メッセージ生成
- ✅ **コードの品質と保守性**: TypeScript、ESLint、テスト
- ✅ **無料サービス活用**: RDS、Lambda、S3、CloudFront、Cognito

---

## 📅 2週間開発スケジュール（AWS移行）

### **Week 1: AWS基盤構築**

#### **Day 1-2: AWS環境構築**
```
Day 1 (8時間)
├── AWSアカウント設定・IAM設定
├── AWS CDKプロジェクト作成
├── RDS MySQL設定（無料枠）
├── Cognito設定（無料枠）

Day 2 (8時間)
├── S3 + CloudFront設定
├── Lambda関数基盤作成
├── API Gateway設定
└── 環境変数・セキュリティ設定

成果物:
├── AWS無料サービス基盤
├── データベース環境
├── 認証システム
└── ホスティング環境
```

#### **Day 3-4: データベース移行**
```
Day 3 (8時間)
├── Supabase → RDS MySQL移行
├── スキーマ移行スクリプト作成
├── データ移行実行
└── データ整合性確認

Day 4 (8時間)
├── Lambda関数実装（CRUD操作）
├── API Gateway統合
├── 認証フロー統合
└── データベース接続テスト

成果物:
├── MySQLデータベース
├── Lambda API関数群
├── 認証統合
└── データ移行完了
```

#### **Day 5-7: フロントエンド移行**
```
Day 5 (8時間)
├── Vercel → S3 + CloudFront移行
├── フロントエンドビルド設定
├── 環境変数更新
└── デプロイパイプライン設定

Day 6 (8時間)
├── Cognito認証統合
├── API呼び出し更新
├── エラーハンドリング改善
└── パフォーマンス最適化

Day 7 (8時間)
├── 統合テスト実行
├── セキュリティテスト
├── パフォーマンステスト
└── Week 1完了確認

成果物:
├── AWSホスティング環境
├── 認証統合完了
├── API統合完了
└── 基本機能動作確認
```

### **Week 2: 高度機能実装**

#### **Day 8-10: AI機能実装**
```
Day 8 (8時間)
├── Amazon Bedrock設定
├── GENIAC LLM統合
├── ギフト推薦AI実装
└── プロンプト設計

Day 9 (8時間)
├── チャットボット機能
├── メッセージ生成AI
├── AI機能統合
└── パフォーマンス最適化

Day 10 (8時間)
├── AI機能テスト
├── エラーハンドリング
├── レスポンス最適化
└── AI機能完成

成果物:
├── GENIAC LLM統合
├── AI推薦システム
├── チャットボット
└── メッセージ生成機能
```

#### **Day 11-12: LINE連携・統合**
```
Day 11 (8時間)
├── LINE公式アカウント設定
├── Webhook実装
├── LINE連携機能
└── リッチメニュー作成

Day 12 (8時間)
├── フロントエンド・バックエンド統合
├── エンドツーエンドテスト
├── バグ修正
└── 統合テスト完了

成果物:
├── LINE連携システム
├── 完全統合システム
├── エンドツーエンドテスト
└── 基本機能完成
```

#### **Day 13-14: 最終調整・デプロイ**
```
Day 13 (8時間)
├── ユニットテスト実装
├── E2Eテスト実装
├── パフォーマンス最適化
├── セキュリティチェック
├── アクセシビリティ対応
├── レスポンシブデザイン調整
└── 多世代対応機能

Day 14 (8時間)
├── CI/CD設定
├── 本番環境デプロイ
├── 環境設定確認
├── 最終テスト
├── ドキュメント整備
├── 最終調整
└── 審査準備完了

成果物:
├── テストスイート
├── 高品質UI/UX
├── アクセシビリティ対応
├── パフォーマンス最適化
├── 本番環境
├── CI/CDパイプライン
├── 完全なドキュメント
└── 審査準備完了
```

---

## 🛠️ 技術実装詳細（AWS無料サービス版）

### **AWS無料サービス活用**

#### **無料枠詳細**
- **RDS MySQL**: 月750時間（db.t2.micro）
- **Lambda**: 月100万リクエスト
- **S3**: 5GBストレージ
- **CloudFront**: 1TB転送
- **Cognito**: 月50,000ユーザー
- **API Gateway**: 月100万リクエスト

#### **コスト最適化戦略**
- 無料枠内での運用
- 自動スケーリング設定
- リソース使用量監視
- 不要リソースの削除

### **フロントエンド実装（S3 + CloudFront）**

#### Vue.js 3 + TypeScript
```typescript
// コンポーネント例
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGiftStore } from '@/stores/gift'
import type { Gift, ConsultationAnswers } from '@/types'

const giftStore = useGiftStore()
const loading = ref(false)
const error = ref<string | null>(null)

const startConsultation = async (answers: ConsultationAnswers) => {
  try {
    loading.value = true
    await giftStore.startConsultation(answers)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'エラーが発生しました'
  } finally {
    loading.value = false
  }
}
</script>
```

#### デザインシステム
```scss
// デザインシステム例
:root {
  --color-primary: #ff6b35;
  --color-secondary: #f7931e;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  
  --font-family: 'Noto Sans JP', sans-serif;
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  transition: all 0.3s ease;
  
  &--primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
    }
  }
}
```

### **バックエンド実装（AWS Lambda + API Gateway）**

#### Lambda関数（無料枠対応）
```typescript
// Lambda関数例
export const handler = async (event: any): Promise<ApiResponse<any>> => {
  try {
    const body = JSON.parse(event.body)
    const { answers, userId } = body
    
    // データベースからギフト取得
    const gifts = await getGiftsFromDatabase(answers)
    
    // AI推薦生成
    const aiExplanation = await generateAIRecommendations(answers)
    
    return {
      success: true,
      data: {
        recommendations: gifts.slice(0, 3),
        aiExplanation,
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      success: false,
      error: '処理に失敗しました',
      timestamp: new Date().toISOString(),
    }
  }
}
```

#### データベース設計（RDS MySQL）
```sql
-- MySQLテーブル作成例
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  line_user_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  partner_id UUID REFERENCES partners(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  image_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 🧪 テスト戦略

### **テストピラミッド**

#### 1. ユニットテスト (70%)
```typescript
// ユニットテスト例
import { describe, it, expect } from 'vitest'
import { useGiftStore } from '@/stores/gift'

describe('Gift Store', () => {
  it('should fetch gifts successfully', async () => {
    const store = useGiftStore()
    await store.fetchGifts()
    expect(store.gifts).toHaveLength(3)
    expect(store.loading).toBe(false)
  })
})
```

#### 2. 統合テスト (20%)
```typescript
// 統合テスト例
describe('Gift API Integration', () => {
  it('should create order successfully', async () => {
    const response = await giftApi.createOrder({
      giftId: 'test-gift-id',
      recipientName: 'Test User',
      recipientEmail: 'test@example.com',
    })
    expect(response.success).toBe(true)
    expect(response.data).toHaveProperty('id')
  })
})
```

#### 3. E2Eテスト (10%)
```typescript
// E2Eテスト例
describe('Gift Consultation Flow', () => {
  it('should complete consultation flow', async () => {
    await page.goto('/consultation')
    await page.fill('[data-testid="age"]', '30')
    await page.selectOption('[data-testid="gender"]', 'male')
    await page.click('[data-testid="submit"]')
    
    await expect(page.locator('[data-testid="recommendations"]')).toBeVisible()
  })
})
```

---

## 📊 品質指標

### **コード品質**
- **TypeScript**: 100%型カバレッジ
- **ESLint**: エラー0件
- **Prettier**: コードフォーマット統一
- **テストカバレッジ**: 80%以上

### **パフォーマンス**
- **Lighthouse Score**: 90点以上
- **First Contentful Paint**: 1.5秒以内
- **Largest Contentful Paint**: 2.5秒以内
- **Cumulative Layout Shift**: 0.1以下

### **アクセシビリティ**
- **WCAG 2.1 AA**: 準拠
- **キーボードナビゲーション**: 完全対応
- **スクリーンリーダー**: 対応
- **カラーモード**: 高コントラスト対応

---

## 🚀 デプロイ戦略

### **CI/CDパイプライン**

#### GitHub Actions
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to AWS
        run: npx cdk deploy --require-approval never
```

### **環境管理**
- **開発環境**: 開発用リソース
- **ステージング環境**: テスト用リソース
- **本番環境**: 本番用リソース

---

## 📋 リスク管理

### **技術リスク**
| リスク | 影響度 | 対策 |
|--------|--------|------|
| AWS設定ミス | 高 | 段階的デプロイ、ロールバック準備 |
| データベース接続問題 | 高 | 接続プール、リトライ機能 |
| AI機能の応答遅延 | 中 | キャッシュ、タイムアウト設定 |
| LINE連携エラー | 中 | フォールバック機能、エラーハンドリング |

### **スケジュールリスク**
| リスク | 影響度 | 対策 |
|--------|--------|------|
| 機能実装遅延 | 高 | 優先度付け、MVP先行 |
| AWS設定時間超過 | 中 | 事前準備、テンプレート活用 |
| テスト時間不足 | 中 | 自動化、継続的テスト |

---

## 📈 成功指標

### **技術指標**
- ✅ TypeScript導入完了
- ✅ AWS サーバーレス実装完了
- ✅ AI機能実装完了
- ✅ LINE連携実装完了
- ✅ テストカバレッジ80%以上
- ✅ パフォーマンス基準達成

### **審査指標**
- ✅ 実用的なUX/UI実装
- ✅ 多様な世代への配慮
- ✅ デザインの統一感
- ✅ クラウドサービス・AIの適切な活用
- ✅ GENIAC LLMの効果的な実装
- ✅ コードの品質と保守性

---

## 📚 参考資料

### **技術ドキュメント**
- [Vue.js 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)

### **デザインガイドライン**
- [Material Design](https://material.io/design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/)

---

## 🎯 最終目標

### **2週間後の成果物**
1. **完全なGIFTSアプリ（AWS無料サービス版）**
   - TypeScript + Vue.js 3フロントエンド
   - AWS サーバーレスバックエンド（無料枠活用）
   - AI機能付きギフト推薦システム（GENIAC LLM）
   - LINE連携機能
   - コスト効率的な設計

2. **審査対応品質**
   - 高品質UI/UX
   - アクセシビリティ対応
   - パフォーマンス最適化
   - 完全なテストスイート

3. **本番環境（無料枠活用）**
   - AWS本番環境（無料サービス）
   - CI/CDパイプライン
   - 監視・ログシステム
   - セキュリティ対策
   - コスト監視システム

### **審査での評価ポイント**
- ✅ **プロダクトの完成度**: 実用的で使いやすいUI/UX
- ✅ **技術的実装**: AWS無料サービスの適切な活用
- ✅ **AI機能**: GENIAC LLMの効果的な実装
- ✅ **コード品質**: 保守性の高いコードベース
- ✅ **コスト効率**: 無料枠を活用した持続可能な設計
- ✅ **地域貢献**: 健康増進への具体的な貢献

---

## 🎯 審査対応戦略

### **プレゼンテーションのポイント**
1. **課題解決のストーリー**
   - 地域の健康課題の明確化
   - GIFTSによる解決アプローチ
   - 具体的な効果測定

2. **技術的な特長**
   - AWS無料サービスの活用
   - サーバーレスアーキテクチャの利点
   - スケーラビリティとコスト効率

3. **デモの焦点**
   - ユーザー登録・ログイン
   - AI推薦システム
   - LINE連携機能
   - レスポンシブデザイン

4. **地域への貢献度**
   - 健康診断の促進
   - 予防医療の支援
   - 地域医療機関との連携

5. **質疑応答準備**
   - 技術選択の理由
   - コスト構造の説明
   - 将来拡張計画
   - セキュリティ対策 
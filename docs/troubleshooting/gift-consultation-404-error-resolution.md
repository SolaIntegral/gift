# ギフト相談機能 404エラー解決資料

## 📋 概要

**発生日時**: 2025年8月13日  
**エラー内容**: ギフト相談機能で404 Not Foundエラーが発生  
**影響範囲**: フロントエンドからのAPI呼び出し  
**解決状況**: ✅ 解決済み

## 🚨 エラーの詳細

### エラーメッセージ
```
POST https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/consultation 404 (Not Found)
```

### 発生状況
- フロントエンドからギフト相談フォームを送信
- 特定の選択肢の組み合わせで発生
- 直接APIを呼び出すと正常に動作

### 影響を受けた機能
- ギフト相談フォームの送信
- AIからのギフト提案
- おすすめギフトの表示

## 🔍 原因分析

### 1. 選択肢による違いの特定

**問題の選択肢**:
- 関係性: `family`（家族）
- 予算: `10000-20000`（10,000円～20,000円）
- 健康への関心事: `nutrition`（栄養・食事）
- 贈る機会: `anniversary`（記念日）

**正常に動作していた選択肢**:
- より低価格帯の選択肢（5,000円～10,000円など）

### 2. 根本原因の特定

**データベースのギフトデータ不足**:
- 最高価格のギフト: 8,500円（フィットネスウォッチ）
- 選択された予算範囲: 10,000円～20,000円
- **結果**: 条件に合うギフトが存在しない

**Lambda関数の動作**:
```typescript
// 予算に基づく価格範囲を設定
const budgetRanges: Record<string, { min: number; max: number }> = {
  '10000-20000': { min: 10000, max: 20000 },
}

// データベースクエリ
SELECT * FROM gifts 
WHERE status = 'active' 
AND price >= 10000 AND price <= 20000
```

**結果**: 0件のギフトが返される → 404エラー

## 🛠️ 解決策

### 1. 高価格ギフトの追加

**追加したギフト**:

| ギフト名 | 価格 | カテゴリ | 説明 |
|---------|------|----------|------|
| 高級フィットネスウォッチ | 15,000円 | ウェアラブル | GPS機能付きの高精度フィットネスウォッチ |
| パーソナルトレーニング体験 | 18,000円 | フィットネスサービス | プロトレーナーによる個別指導セッション |
| 高級サプリメントセット | 12,000円 | サプリメント | ビタミン・ミネラル・アミノ酸の総合サプリメント |
| ヨガ・ピラティス体験 | 16,000円 | フィットネスサービス | 専門インストラクターによるヨガ・ピラティスレッスン |
| 健康診断パック | 14,000円 | 健康診断 | 詳細な血液検査と健康相談セット |

### 2. データベース初期化スクリプトの更新

**ファイル**: `aws-infrastructure/lambda/database-init/index.ts`

```sql
-- 追加したギフトデータ
INSERT IGNORE INTO gifts (id, name, description, price, category, partner_id, image_url, stock_quantity) VALUES
(UUID(), '高級フィットネスウォッチ', 'GPS機能付きの高精度フィットネスウォッチ', 15000, 'ウェアラブル', (SELECT id FROM partners LIMIT 1), 'https://example.com/watch.jpg', 20),
(UUID(), 'パーソナルトレーニング体験', 'プロトレーナーによる個別指導セッション', 18000, 'フィットネスサービス', (SELECT id FROM partners LIMIT 1), 'https://example.com/training.jpg', 15),
(UUID(), '高級サプリメントセット', 'ビタミン・ミネラル・アミノ酸の総合サプリメント', 12000, 'サプリメント', (SELECT id FROM partners LIMIT 1), 'https://example.com/supplement-set.jpg', 25),
(UUID(), 'ヨガ・ピラティス体験', '専門インストラクターによるヨガ・ピラティスレッスン', 16000, 'フィットネスサービス', (SELECT id FROM partners LIMIT 1), 'https://example.com/yoga-pilates.jpg', 18),
(UUID(), '健康診断パック', '詳細な血液検査と健康相談セット', 14000, '健康診断', (SELECT id FROM partners LIMIT 1), 'https://example.com/health-check.jpg', 12);
```

### 3. デプロイ手順

```bash
# 1. Lambda関数のビルド
cd aws-infrastructure/lambda/database-init
npm run build

# 2. Lambda関数の更新
aws lambda update-function-code \
  --function-name AwsInfrastructureStack-DatabaseInitFunction432692B-3vRNaMZeITLz \
  --zip-file fileb://aws-infrastructure/lambda/database-init/dist.zip

# 3. データベース初期化の実行
curl -X POST "https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/database-init"
```

## 📊 解決後の確認

### 正常動作の確認
- ✅ フロントエンドからのAPI呼び出しが成功
- ✅ AIからのギフト提案が正常に表示
- ✅ おすすめギフトの選択が可能
- ✅ 404エラーが発生しない

### テストケース
- **予算**: 10,000円～20,000円
- **関係性**: 家族
- **健康への関心事**: 栄養・食事
- **贈る機会**: 記念日

## 🎯 今後の対策

### 1. データ品質の向上
- 各価格帯に十分なギフトデータを確保
- カテゴリ別のバランスを考慮
- 在庫数の適切な管理

### 2. エラーハンドリングの改善
- ギフトが見つからない場合のフォールバック機能
- より詳細なエラーメッセージの提供
- ユーザーへの適切なガイダンス

### 3. 監視体制の強化
- API Gatewayのログ監視
- Lambda関数のエラーログ監視
- データベースのクエリパフォーマンス監視

## 📝 学んだ教訓

1. **選択肢による違いの重要性**: ユーザーの選択肢によってシステムの動作が変わる可能性がある
2. **データの完全性**: 全ての選択肢の組み合わせに対応するデータが必要
3. **エラーの根本原因**: 表面的なエラー（404）の背後に、データ不足という根本原因が隠れている
4. **テストの重要性**: 様々な選択肢の組み合わせでのテストが必要

## 🔗 関連ファイル

- `aws-infrastructure/lambda/database-init/index.ts` - データベース初期化スクリプト
- `aws-infrastructure/lambda/gift-recommendation/index.ts` - ギフト推薦Lambda関数
- `vue-gift-app/src/components/GiftConsultation.vue` - フロントエンド相談フォーム

---

**作成日**: 2025年8月13日  
**作成者**: AI Assistant  
**更新日**: 2025年8月13日  
**バージョン**: 1.0 
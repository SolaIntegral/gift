import mysql from 'mysql2/promise'

// MySQL接続設定
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
}

// データベーススキーマ
const schemaSQL = `
-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    line_user_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- パートナーテーブル
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ギフトテーブル
CREATE TABLE IF NOT EXISTS gifts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    partner_id VARCHAR(36),
    status ENUM('active', 'inactive') DEFAULT 'active',
    image_url VARCHAR(255),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- 注文テーブル
CREATE TABLE IF NOT EXISTS gift_orders (
    id VARCHAR(36) PRIMARY KEY,
    gifter_id VARCHAR(36) NOT NULL,
    gift_id VARCHAR(36) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    message TEXT,
    gift_url VARCHAR(255),
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gifter_id) REFERENCES users(id),
    FOREIGN KEY (gift_id) REFERENCES gifts(id)
);

-- 相談テーブル（既存のテーブルを削除して再作成）
DROP TABLE IF EXISTS consultations;
CREATE TABLE consultations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    answers JSON,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 支払いテーブル
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'JPY',
    payment_method VARCHAR(50),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES gift_orders(id)
);

-- 初期データ挿入
INSERT IGNORE INTO partners (id, name, description, logo_url, website_url) VALUES
(UUID(), '健康食品専門店', '高品質な健康食品を提供する専門店', 'https://example.com/logo1.png', 'https://example.com'),
(UUID(), 'フィットネス用品店', 'トレーニング用品とウェアの専門店', 'https://example.com/logo2.png', 'https://example.com'),
(UUID(), 'サプリメントショップ', '天然成分にこだわったサプリメント', 'https://example.com/logo3.png', 'https://example.com');

-- ギフトデータ挿入
INSERT IGNORE INTO gifts (id, name, description, price, category, partner_id, image_url, stock_quantity) VALUES
(UUID(), 'オーガニックプロテイン', '植物性プロテインで健康的な筋肉づくりをサポート', 3500, 'サプリメント', (SELECT id FROM partners LIMIT 1), 'https://example.com/protein.jpg', 50),
(UUID(), 'フィットネストラッカー', '心拍数と歩数を24時間モニタリング', 8500, 'ウェアラブル', (SELECT id FROM partners LIMIT 1), 'https://example.com/tracker.jpg', 30),
(UUID(), 'ヨガマット', '滑り止め加工付きの高品質ヨガマット', 2800, 'フィットネス用品', (SELECT id FROM partners LIMIT 1), 'https://example.com/yoga.jpg', 40),
(UUID(), 'ビタミンCサプリ', '免疫力アップに効果的なビタミンC', 1200, 'サプリメント', (SELECT id FROM partners LIMIT 1), 'https://example.com/vitamin.jpg', 100),
(UUID(), 'ウォーターボトル', '保温保冷機能付きのステンレスボトル', 1800, 'フィットネス用品', (SELECT id FROM partners LIMIT 1), 'https://example.com/bottle.jpg', 60),
(UUID(), 'オメガ3サプリ', 'DHA・EPA配合の健康サプリメント', 2500, 'サプリメント', (SELECT id FROM partners LIMIT 1), 'https://example.com/omega.jpg', 45),
(UUID(), 'レジスタンスバンド', '筋力トレーニング用のゴムバンドセット', 1500, 'フィットネス用品', (SELECT id FROM partners LIMIT 1), 'https://example.com/band.jpg', 80),
(UUID(), 'グリーンスムージー', '有機野菜とフルーツを使用したスムージー', 3200, '健康食品', (SELECT id FROM partners LIMIT 1), 'https://example.com/smoothie.jpg', 25),
(UUID(), '睡眠サポートサプリ', '良質な睡眠をサポートする天然成分', 4200, 'サプリメント', (SELECT id FROM partners LIMIT 1), 'https://example.com/sleep.jpg', 35),
(UUID(), 'ストレッチボール', '全身のストレッチに使えるマッサージボール', 2200, 'フィットネス用品', (SELECT id FROM partners LIMIT 1), 'https://example.com/ball.jpg', 55),
(UUID(), '高級フィットネスウォッチ', 'GPS機能付きの高精度フィットネスウォッチ', 15000, 'ウェアラブル', (SELECT id FROM partners LIMIT 1), 'https://example.com/watch.jpg', 20),
(UUID(), 'パーソナルトレーニング体験', 'プロトレーナーによる個別指導セッション', 18000, 'フィットネスサービス', (SELECT id FROM partners LIMIT 1), 'https://example.com/training.jpg', 15),
(UUID(), '高級サプリメントセット', 'ビタミン・ミネラル・アミノ酸の総合サプリメント', 12000, 'サプリメント', (SELECT id FROM partners LIMIT 1), 'https://example.com/supplement-set.jpg', 25),
(UUID(), 'ヨガ・ピラティス体験', '専門インストラクターによるヨガ・ピラティスレッスン', 16000, 'フィットネスサービス', (SELECT id FROM partners LIMIT 1), 'https://example.com/yoga-pilates.jpg', 18),
(UUID(), '健康診断パック', '詳細な血液検査と健康相談セット', 14000, '健康診断', (SELECT id FROM partners LIMIT 1), 'https://example.com/health-check.jpg', 12);

-- テスト用ユーザーを作成
INSERT IGNORE INTO users (id, email, name, created_at) VALUES
('test-user', 'test@example.com', 'テストユーザー', NOW());
`

export const handler = async (event: any) => {
  let connection: mysql.Connection | null = null
  
  try {
    console.log('データベース初期化を開始します...')
    
    // データベース接続
    connection = await mysql.createConnection(dbConfig)
    console.log('データベースに接続しました')
    
    // スキーマを実行
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement)
          console.log('SQL実行成功:', statement.substring(0, 50) + '...')
        } catch (error) {
          console.log('SQL実行エラー（無視）:', error)
          // テーブルが既に存在する場合などは無視
        }
      }
    }
    
    console.log('データベース初期化が完了しました')
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'データベース初期化が完了しました',
        success: true
      })
    }
    
  } catch (error) {
    console.error('データベース初期化エラー:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'データベース初期化に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      })
    }
    
  } finally {
    if (connection) {
      await connection.end()
    }
  }
} 
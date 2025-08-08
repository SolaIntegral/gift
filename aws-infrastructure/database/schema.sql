-- GIFTSアプリ データベーススキーマ
-- MySQL用

-- データベース作成
CREATE DATABASE IF NOT EXISTS giftapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE giftapp;

-- ユーザーテーブル
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    line_user_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 提携先テーブル
CREATE TABLE partners (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    api_key VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 医療機関テーブル
CREATE TABLE facilities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    category VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ギフトテーブル
CREATE TABLE gifts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    partner_id VARCHAR(36),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- ギフト注文テーブル
CREATE TABLE gift_orders (
    id VARCHAR(36) PRIMARY KEY,
    gifter_id VARCHAR(36) NOT NULL,
    gift_id VARCHAR(36) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    message TEXT,
    gift_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gifter_id) REFERENCES users(id),
    FOREIGN KEY (gift_id) REFERENCES gifts(id)
);

-- ギフト利用テーブル
CREATE TABLE gift_usage (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    used_at TIMESTAMP NULL,
    facility_id VARCHAR(36),
    status VARCHAR(20) NOT NULL DEFAULT 'unused',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES gift_orders(id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- 相談履歴テーブル
CREATE TABLE consultations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    answers JSON NOT NULL,
    recommendations JSON,
    ai_explanation TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- インデックス作成
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_line_user_id ON users(line_user_id);
CREATE INDEX idx_gifts_category ON gifts(category);
CREATE INDEX idx_gifts_status ON gifts(status);
CREATE INDEX idx_gift_orders_gifter_id ON gift_orders(gifter_id);
CREATE INDEX idx_gift_orders_status ON gift_orders(status);
CREATE INDEX idx_gift_orders_payment_status ON gift_orders(payment_status);
CREATE INDEX idx_gift_usage_order_id ON gift_usage(order_id);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);

-- 初期データ投入

-- 提携先データ
INSERT INTO partners (id, name, category, status) VALUES
(UUID(), '健康診断センターA', 'health_checkup', 'active'),
(UUID(), '歯科クリニックB', 'dental_care', 'active'),
(UUID(), '美容クリニックC', 'beauty_treatment', 'active'),
(UUID(), 'フィットネスクラブD', 'fitness', 'active'),
(UUID(), '栄養相談所E', 'nutrition', 'active'),
(UUID(), 'メンタルヘルスクリニックF', 'mental_health', 'active');

-- 医療機関データ
INSERT INTO facilities (id, name, address, phone, category, latitude, longitude) VALUES
(UUID(), '健康診断センターA 新宿店', '東京都新宿区西新宿1-1-1', '03-1234-5678', 'health_checkup', 35.6895, 139.6917),
(UUID(), '歯科クリニックB 渋谷店', '東京都渋谷区渋谷1-1-1', '03-2345-6789', 'dental_care', 35.6580, 139.7016),
(UUID(), '美容クリニックC 銀座店', '東京都中央区銀座1-1-1', '03-3456-7890', 'beauty_treatment', 35.6719, 139.7639),
(UUID(), 'フィットネスクラブD 池袋店', '東京都豊島区池袋1-1-1', '03-4567-8901', 'fitness', 35.7295, 139.7109),
(UUID(), '栄養相談所E 六本木店', '東京都港区六本木1-1-1', '03-5678-9012', 'nutrition', 35.6626, 139.7314),
(UUID(), 'メンタルヘルスクリニックF 青山店', '東京都港区青山1-1-1', '03-6789-0123', 'mental_health', 35.6654, 139.7128);

-- ギフトデータ
INSERT INTO gifts (id, name, description, price, category, partner_id, image_url) VALUES
(UUID(), '総合健康診断パック', '詳細な血液検査から画像診断まで、総合的な健康状態をチェックできます。', 15400, 'health_checkup', (SELECT id FROM partners WHERE name = '健康診断センターA' LIMIT 1), '/images/health-checkup.jpg'),
(UUID(), 'パーソナルフィットネス体験', 'プロのトレーナーによる個別指導で、効率的な運動習慣を身につけます。', 12100, 'fitness', (SELECT id FROM partners WHERE name = 'フィットネスクラブD' LIMIT 1), '/images/fitness-training.jpg'),
(UUID(), 'ウェルネス相談セッション', '専門家による健康相談で、あなたに最適な健康管理プランを作成します。', 6600, 'wellness', (SELECT id FROM partners WHERE name = '栄養相談所E' LIMIT 1), '/images/wellness-consultation.jpg'),
(UUID(), 'ヨガ・ピラティス体験', '心身のバランスを整えるヨガ・ピラティスを体験できます。', 8800, 'fitness', (SELECT id FROM partners WHERE name = 'フィットネスクラブD' LIMIT 1), '/images/yoga-pilates.jpg'),
(UUID(), '栄養カウンセリング', '管理栄養士による個別栄養相談で、健康的な食生活をサポートします。', 5500, 'nutrition', (SELECT id FROM partners WHERE name = '栄養相談所E' LIMIT 1), '/images/nutrition-counseling.jpg'),
(UUID(), '歯科検診・クリーニング', '虫歯チェックと歯石除去、歯のクリーニング', 8000, 'dental_care', (SELECT id FROM partners WHERE name = '歯科クリニックB' LIMIT 1), '/images/dental-checkup.jpg'),
(UUID(), '美容皮膚科診察', '肌の状態チェックと美容アドバイス', 12000, 'beauty_treatment', (SELECT id FROM partners WHERE name = '美容クリニックC' LIMIT 1), '/images/beauty-consultation.jpg'),
(UUID(), 'メンタルヘルス相談', 'ストレスチェックとメンタルヘルスアドバイス', 15000, 'mental_health', (SELECT id FROM partners WHERE name = 'メンタルヘルスクリニックF' LIMIT 1), '/images/mental-health-consultation.jpg'),
(UUID(), 'プレミアム健康診断', '詳細な血液検査と画像診断を含む総合健康診断', 30000, 'health_checkup', (SELECT id FROM partners WHERE name = '健康診断センターA' LIMIT 1), '/images/health-checkup-premium.jpg'),
(UUID(), 'パーソナルトレーニング', '個人専用トレーニングプログラム3ヶ月', 50000, 'fitness', (SELECT id FROM partners WHERE name = 'フィットネスクラブD' LIMIT 1), '/images/personal-training.jpg');

-- 権限設定
GRANT ALL PRIVILEGES ON giftapp.* TO 'admin'@'%';
FLUSH PRIVILEGES; 
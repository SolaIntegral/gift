-- GIFTSアプリ データベーススキーマ
-- Aurora PostgreSQL用

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    line_user_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 提携先テーブル
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    api_key VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 医療機関テーブル
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    category VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ギフトテーブル
CREATE TABLE gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    partner_id UUID REFERENCES partners(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ギフト注文テーブル
CREATE TABLE gift_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gifter_id UUID NOT NULL REFERENCES users(id),
    gift_id UUID NOT NULL REFERENCES gifts(id),
    recipient_name VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    message TEXT,
    gift_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ギフト利用テーブル
CREATE TABLE gift_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES gift_orders(id),
    used_at TIMESTAMP,
    facility_id UUID REFERENCES facilities(id),
    status VARCHAR(20) NOT NULL DEFAULT 'unused',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 相談履歴テーブル
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    answers JSONB NOT NULL,
    recommendations JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
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

-- トリガー関数（updated_at自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gifts_updated_at BEFORE UPDATE ON gifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_orders_updated_at BEFORE UPDATE ON gift_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_usage_updated_at BEFORE UPDATE ON gift_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データ投入

-- 提携先データ
INSERT INTO partners (name, category, status) VALUES
('健康診断センターA', 'health_checkup', 'active'),
('歯科クリニックB', 'dental_care', 'active'),
('美容クリニックC', 'beauty_treatment', 'active'),
('フィットネスクラブD', 'fitness', 'active'),
('栄養相談所E', 'nutrition', 'active'),
('メンタルヘルスクリニックF', 'mental_health', 'active');

-- 医療機関データ
INSERT INTO facilities (name, address, phone, category, latitude, longitude) VALUES
('健康診断センターA 新宿店', '東京都新宿区西新宿1-1-1', '03-1234-5678', 'health_checkup', 35.6895, 139.6917),
('歯科クリニックB 渋谷店', '東京都渋谷区渋谷1-1-1', '03-2345-6789', 'dental_care', 35.6580, 139.7016),
('美容クリニックC 銀座店', '東京都中央区銀座1-1-1', '03-3456-7890', 'beauty_treatment', 35.6719, 139.7639),
('フィットネスクラブD 池袋店', '東京都豊島区池袋1-1-1', '03-4567-8901', 'fitness', 35.7295, 139.7109),
('栄養相談所E 六本木店', '東京都港区六本木1-1-1', '03-5678-9012', 'nutrition', 35.6626, 139.7314),
('メンタルヘルスクリニックF 青山店', '東京都港区青山1-1-1', '03-6789-0123', 'mental_health', 35.6654, 139.7128);

-- ギフトデータ
INSERT INTO gifts (name, description, price, category, partner_id, image_url) VALUES
('基本健康診断パック', '血圧、血糖値、コレステロールなどの基本検査を含む健康診断', 15000, 'health_checkup', (SELECT id FROM partners WHERE name = '健康診断センターA'), 'https://example.com/images/health-checkup-basic.jpg'),
('歯科検診・クリーニング', '虫歯チェックと歯石除去、歯のクリーニング', 8000, 'dental_care', (SELECT id FROM partners WHERE name = '歯科クリニックB'), 'https://example.com/images/dental-checkup.jpg'),
('美容皮膚科診察', '肌の状態チェックと美容アドバイス', 12000, 'beauty_treatment', (SELECT id FROM partners WHERE name = '美容クリニックC'), 'https://example.com/images/beauty-consultation.jpg'),
('フィットネス体験1ヶ月', 'ジム施設利用とトレーナー指導付き1ヶ月体験', 20000, 'fitness', (SELECT id FROM partners WHERE name = 'フィットネスクラブD'), 'https://example.com/images/fitness-trial.jpg'),
('栄養相談セッション', '個人に合わせた栄養指導と食事プラン作成', 10000, 'nutrition', (SELECT id FROM partners WHERE name = '栄養相談所E'), 'https://example.com/images/nutrition-consultation.jpg'),
('メンタルヘルス相談', 'ストレスチェックとメンタルヘルスアドバイス', 15000, 'mental_health', (SELECT id FROM partners WHERE name = 'メンタルヘルスクリニックF'), 'https://example.com/images/mental-health-consultation.jpg'),
('プレミアム健康診断', '詳細な血液検査と画像診断を含む総合健康診断', 30000, 'health_checkup', (SELECT id FROM partners WHERE name = '健康診断センターA'), 'https://example.com/images/health-checkup-premium.jpg'),
('ホワイトニングケア', '歯のホワイトニングとオーラルケア指導', 15000, 'dental_care', (SELECT id FROM partners WHERE name = '歯科クリニックB'), 'https://example.com/images/whitening-care.jpg'),
('アンチエイジングケア', '肌年齢測定とアンチエイジングケアプラン', 25000, 'beauty_treatment', (SELECT id FROM partners WHERE name = '美容クリニックC'), 'https://example.com/images/anti-aging-care.jpg'),
('パーソナルトレーニング', '個人専用トレーニングプログラム3ヶ月', 50000, 'fitness', (SELECT id FROM partners WHERE name = 'フィットネスクラブD'), 'https://example.com/images/personal-training.jpg');

-- 権限設定
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres; 
-- Supabase データベーススキーマ
-- GIFTSアプリ用のテーブル定義

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  line_user_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ギフトテーブル
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  partner_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ギフト注文テーブル
CREATE TABLE gift_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gifter_id UUID NOT NULL REFERENCES users(id),
  gift_id UUID NOT NULL REFERENCES gifts(id),
  recipient_name VARCHAR(100) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  message TEXT,
  gift_url VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ギフト利用テーブル
CREATE TABLE gift_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES gift_orders(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  facility_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'used'
);

-- 医療機関テーブル
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  category VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);

-- 提携先テーブル
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  api_key VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);

-- 相談履歴テーブル
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  answers JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_gifts_category ON gifts(category);
CREATE INDEX idx_gifts_status ON gifts(status);
CREATE INDEX idx_gift_orders_gifter_id ON gift_orders(gifter_id);
CREATE INDEX idx_gift_orders_status ON gift_orders(status);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_users_line_user_id ON users(line_user_id);

-- RLS (Row Level Security) ポリシー設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのポリシー
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ギフトテーブルのポリシー（全ユーザーが閲覧可能）
CREATE POLICY "Anyone can view active gifts" ON gifts
  FOR SELECT USING (status = 'active');

-- ギフト注文テーブルのポリシー
CREATE POLICY "Users can view own orders" ON gift_orders
  FOR SELECT USING (auth.uid() = gifter_id);

CREATE POLICY "Users can create own orders" ON gift_orders
  FOR INSERT WITH CHECK (auth.uid() = gifter_id);

CREATE POLICY "Users can update own orders" ON gift_orders
  FOR UPDATE USING (auth.uid() = gifter_id);

-- 相談履歴テーブルのポリシー
CREATE POLICY "Users can view own consultations" ON consultations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consultations" ON consultations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 医療機関テーブルのポリシー（全ユーザーが閲覧可能）
CREATE POLICY "Anyone can view active facilities" ON facilities
  FOR SELECT USING (status = 'active');

-- 提携先テーブルのポリシー（全ユーザーが閲覧可能）
CREATE POLICY "Anyone can view active partners" ON partners
  FOR SELECT USING (status = 'active');

-- サンプルデータ挿入
INSERT INTO gifts (name, description, price, category, status) VALUES
('健康管理アプリ', '日々の健康状態を記録・管理できるアプリ', 3000, 'health', 'active'),
('フィットネストラッカー', '歩数、心拍数、睡眠を記録するスマートウォッチ', 15000, 'fitness', 'active'),
('栄養サプリメントセット', 'ビタミン・ミネラルがバランス良く配合されたサプリ', 5000, 'nutrition', 'active'),
('ヨガマット', '滑り止め加工された高品質なヨガマット', 8000, 'fitness', 'active'),
('有機緑茶セット', '抗酸化作用のある有機栽培の緑茶', 4000, 'nutrition', 'active'),
('歯科検診券', '歯の健康をチェックする検診券', 12000, 'dental_care', 'active'),
('美容ケアセット', '肌の状態チェックと美容アドバイス', 18000, 'beauty_treatment', 'active'),
('メンタルヘルス相談', 'ストレスチェックとメンタルヘルスサポート', 10000, 'mental_health', 'active');

INSERT INTO facilities (name, address, phone, category, latitude, longitude, status) VALUES
('健康診断センター', '東京都渋谷区渋谷1-1-1', '03-1234-5678', 'health_checkup', 35.658034, 139.701636, 'active'),
('フィットネスクラブ', '東京都新宿区新宿2-2-2', '03-2345-6789', 'fitness', 35.690921, 139.700258, 'active'),
('栄養相談所', '東京都港区港3-3-3', '03-3456-7890', 'nutrition', 35.658034, 139.745433, 'active');

INSERT INTO partners (name, category, status) VALUES
('健康管理株式会社', 'health', 'active'),
('フィットネスジムチェーン', 'fitness', 'active'),
('栄養サプリメントメーカー', 'nutrition', 'active'),
('歯科医院グループ', 'dental_care', 'active'),
('美容クリニック', 'beauty_treatment', 'active'),
('メンタルヘルスクリニック', 'mental_health', 'active'); 
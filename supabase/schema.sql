-- ============================================================
-- GASKARA COFFEE — SUPABASE POSTGRESQL SCHEMA & TRIGGER
-- ============================================================

-- 1. Buat Tipe Enum
DO $$ BEGIN
    CREATE TYPE order_type_enum AS ENUM ('dine_in', 'takeaway');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_source_enum AS ENUM ('pos', 'web');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cash', 'qris');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('received', 'preparing', 'ready', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE category_type_enum AS ENUM ('coffee', 'non_coffee', 'snack');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabel Kategori Menu
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    type category_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Menu Produk
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL CHECK (price >= 0),
    image_url TEXT, -- Hanya digunakan pada Customer Web
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_queue_number INT NOT NULL,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    order_type order_type_enum NOT NULL DEFAULT 'dine_in',
    order_source order_source_enum NOT NULL DEFAULT 'pos',
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    order_status order_status_enum NOT NULL DEFAULT 'received',
    total_amount INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Item Pesanan (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES menus(id),
    category_type category_type_enum NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price INT NOT NULL,
    subtotal INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexing untuk Performa Query & Filter
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_category_type ON order_items(category_type);

-- 7. Sequence & Function Reset Nomor Antrian Harian (Aman untuk Client Generator)
DROP TRIGGER IF EXISTS trg_set_daily_queue ON orders;
DROP FUNCTION IF EXISTS generate_daily_queue();

-- 8. Enable Supabase Realtime untuk tabel orders
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 9. Akses Penuh & Nonaktifkan RLS (Mencegah Error 42710 & 42501 pada Operasional Kasir & Guest)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 10. Seed Data Awal (Valid Hex UUID)
INSERT INTO categories (id, name, type) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Coffee', 'coffee'),
    ('c2222222-2222-2222-2222-222222222222', 'Non-Coffee', 'non_coffee'),
    ('c3333333-3333-3333-3333-333333333333', 'Snack', 'snack')
ON CONFLICT (id) DO NOTHING;

INSERT INTO menus (id, category_id, name, description, price, image_url, is_available) VALUES
    ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Kopi Susu Gaskara', 'Espresso blend khas Gaskara dengan susu creamy dan gula aren organik.', 22000, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop', true),
    ('b2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Americano', 'Double shot espresso dengan air mineral dingin/panas, body tebal dan clean.', 18000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop', true),
    ('b3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Vanilla Latte', 'Espresso lembut berpadu susu segar dan sirup vanilla Madagaskar.', 25000, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=600&auto=format&fit=crop', true),
    ('b4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Matcha Latte', 'Pure Uji matcha Jepang dengan steamed milk gurih dan seimbang.', 26000, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop', true),
    ('b5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Earl Grey Milk Tea', 'Seduhan black tea beraroma bergamot dengan susu segar manis ringan.', 23000, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop', true),
    ('b6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'Butter Croissant', 'Flaky pastry Prancis berlapis butter premium, renyah di luar lembut di dalam.', 20000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop', true),
    ('b7777777-7777-7777-7777-777777777777', 'c3333333-3333-3333-3333-333333333333', 'Truffle French Fries', 'Kentang goreng renyah dengan taburan garam laut dan minyak truffle aromatik.', 24000, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop', true)
ON CONFLICT (id) DO NOTHING;

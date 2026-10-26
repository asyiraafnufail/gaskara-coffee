# Product Requirement Document (PRD) — Gaskara Coffee Web System

## 1. System Overview & Objective
Sistem web monorepo full-stack untuk **Gaskara Coffee** yang mengintegrasikan:
1. **POS Kasir:** Antarmuka kasir cepat berbasis teks (tanpa gambar produk) untuk mencatat pesanan langsung dan memverifikasi pesanan masuk dari web.
2. **Web Pemesanan Customer:** Web mobile-first dengan katalog bergambar untuk pemesanan mandiri oleh pelanggan via QR code meja/counter.
3. **Live Queue Display:** Layar monitor/TV antrian publik real-time berbasis WebSockets.
4. **Admin Panel Ketersediaan Menu:** Sakelar cepat status menu (Tersedia / Habis) tanpa manajemen stok.
5. **Admin Panel Laporan Keuangan:** Rekap omzet kotor harian dan bulanan dengan rincian kategori kopi dan camilan/snack.

---

## 2. Strict Boundary Rules (Agent Instructions)
1. **No Table Number:** DILARANG menambahkan field, form input, atau kolom database `table_number`. Coffee shop beroperasi penuh dengan sistem *Self-Pickup* berbasis `daily_queue_number` dan `customer_name`.
2. **Order Type Only 2 Values:** Hanya ada `'dine_in'` (disajikan di cangkir/gelas) dan `'takeaway'` (disajikan di cup takeaway).
3. **No Stock Management:** DILARANG membuat pengurangan stok per transaksi, batas kuantitas stok, atau stok opname. Ketersediaan menu hanya berupa nilai boolean `is_available` (Tersedia / Habis).
4. **No Third-Party Payment Gateway:** DILARANG mengintegrasikan API/SDK pihak ketiga (Midtrans, Xendit, dsb). Pembayaran murni dummy/manual verification:
   - Pelanggan memilih metode: `'cash'` atau `'qris'`.
   - Pesanan dari web otomatis berstatus `payment_status: 'pending'`.
   - Status berubah ke `'paid'` hanya saat kasir menekan tombol konfirmasi pembayaran di POS setelah menerima uang tunai atau memeriksa mutasi QRIS statis.
5. **No Images on POS Interface:** Antarmuka POS Kasir DILARANG menampilkan elemen visual gambar produk demi kecepatan transaksi. Gambar produk (`image_url`) hanya ditampilkan pada modul Customer Web Menu.

---

## 3. Tech Stack Architecture
- **Framework:** Next.js (App Router, TypeScript).
- **Styling:** Tailwind CSS.
- **Database & Realtime Engine:** Supabase (PostgreSQL + Realtime Channel).
- **Client State Management:** Zustand.
- **Icon Set:** Lucide React.

---

## 4. Module Specifications & Routing Architecture

### Rute Navigasi Utama:
- **`/` & `/order`:** Landing Page Utama Web Pemesanan Customer (Mobile-First Self-Order).
- **`/queue`:** Live Queue Display (TV Monitor Counter & Smartphone).
- **`/login`:** Gerbang Autentikasi Kasir & Staff Pengelola.
- **`/admin`:** Home Admin Dashboard Pusat Kendali (Grid Pilihan Modul Terpadu).
- **`/admin/pos`:** POS Kasir Cepat Berbasis Teks (Operasional Staff).
- **`/admin/menu`:** Kelola Ketersediaan Menu & Tambah/Hapus Produk.
- **`/admin/reports`:** Laporan Keuangan & Rekap Omzet Penjualan.

---

### Module 0: Home Admin Dashboard (`/admin`)
- **Tampilan Grid Simetris:** Kartu modular terpadu dengan status live notifikasi pesanan web pending, jumlah menu aktif, dan omzet hari berjalan.
- **Navigasi Terintegrasi:** Akses 1-klik menuju POS Kasir, Kelola Menu & Stok, Laporan Penjualan, Layar Antrian TV, dan Web Customer.
- **Pengamanan Sesi:** Terproteksi via `sessionStorage` guard di `/admin/layout.tsx`. Pengunjung unauthenticated diarahkan login via `/login`.

### Module 1: POS Kasir (`/admin/pos` & `/pos`)
- **Tampilan Katalog:**
  - Tab Kategori: `Semua`, `Coffee`, `Non-Coffee`, `Snack`.
  - Tombol menu berbasis teks, harga, dan indikator status jika habis. Tanpa elemen `<img>`.
  - Fitur pencarian cepat berdasarkan nama menu.
- **Tampilan Keranjang (Cart):**
  - List item pesanan, pengatur kuantitas, catatan khusus item (opsional).
  - Input teks wajib: `customer_name`.
  - Pilihan radio button: `Dine-in` vs `Takeaway`.
  - Pilihan metode bayar: `Cash` (dengan kalkulator kembalian dan tombol nominal cepat) atau `QRIS`.
  - Submit pesanan langsung dari POS: Langsung berstatus `payment_status = 'paid'` dan `order_status = 'preparing'`.
- **Feed Pesanan Masuk (Incoming Web Orders):**
  - Tab terpisah untuk pesanan yang masuk dari web customer (`payment_status = 'pending'`).
  - Aksi Kasir:
    - Tombol `[Konfirmasi Bayar]`: Mengubah `payment_status` menjadi `'paid'` dan `order_status` menjadi `'preparing'`.
    - Tombol `[Batalkan]`: Mengubah `order_status` menjadi `'cancelled'`.
- **Manajemen Status Antrian:**
  - Kasir dapat memperbarui alur status pesanan aktif: `'preparing'` → `'ready'` → `'completed'`.

### Module 2: Web Pemesanan Customer (`/` & `/order`)
- **Desain:** Responsif Mobile-First (lihat `DESIGN.md`).
- **Katalog Menu:**
  - Fitur pencarian cepat nama menu & deskripsi secara realtime.
  - Foto menu persegi rasio 1:1 (`w-24 h-24 aspect-square` / 96x96px), `rounded-xl`.
  - Tata letak kartu simetris terkunci (`h-24 flex flex-col justify-between`): batas bawah harga dan tombol aksi presisi rata horizontal dengan batas bawah foto produk, bahkan dengan 2 baris deskripsi.
  - Menu dengan `is_available = false` diberi label visual "Habis" dan tombol dinonaktifkan.
- **Form Checkout:**
  - Input teks wajib: `customer_name`.
  - Pilihan: `Dine-in` atau `Takeaway`.
  - Pilihan Metode Pembayaran: `Cash` atau `QRIS`.
    - Jika `QRIS`: Menampilkan banner/gambar QRIS statis kafe dengan instruksi pembayaran.
    - Jika `Cash`: Menampilkan instruksi untuk membayar di kasir dengan menyebut nomor antrian.
- **Halaman Status Antrian (`/order/status/[order_code]`):**
  - Menampilkan kode pesanan, nomor antrian besar (contoh: `#015`), nama pelanggan, ringkasan pesanan, dan status pesanan saat ini (menunggu pembayaran / sedang dibuat / siap diambil).

### Module 3: Live Queue Display (`/queue`)
- **Desain:** Fullscreen responsif viewport locked (`fixed inset-0`) untuk layar TV/monitor landscape (1080p) dan browser smartphone tanpa scroll.
- **Mekanisme Real-time:** Berlangganan (subscribe) langsung ke event perubahan data pada tabel `orders` di Supabase Realtime.
- **Kolom 1: Sedang Dibuat (Preparing):**
  - Menampilkan daftar nomor antrian dan nama pelanggan dengan status `'preparing'` / `'received'`.
- **Kolom 2: Siap Diambil (Ready for Pickup):**
  - Menampilkan daftar nomor antrian dan nama pelanggan dengan status `order_status = 'ready'`.
  - Tampilan visual kontras tinggi merah tebal agar langsung terlihat dari kejauhan.
- Pesanan dengan status `'completed'` atau `'cancelled'` otomatis hilang dari layar tampilan.

### Module 4: Admin Panel - Ketersediaan & Kelola Menu (`/admin/menu`)
- **Katalog Manajemen:** Daftar seluruh menu dikelompokkan rapi berdasarkan kategori (`Coffee`, `Non-Coffee`, `Snack`).
- **Sakelar Toggle Status:** Sakelar instan **Tersedia (In Stock)** vs **Habis (Sold Out)** tanpa manajemen stok opname (Rule 3).
- **Fitur + Tambah Menu Baru:** Modal dialog untuk mendaftarkan nama menu, kategori, harga (Rp), deskripsi singkat, dan URL foto.
- **Fitur Edit Menu (Terkunci):** Tombol aksi ikon pensil pada setiap item untuk mengubah nama menu, kategori, harga, deskripsi, dan URL foto. Data langsung ter-update di Supabase / LocalStorage dan memicu event sinkronisasi realtime `gaskara_menu_updated`.
- **Fitur Hapus Menu:** Konfirmasi dan penghapusan produk dari database.
- **Sinkronisasi Otomatis:** Perubahan status ketersediaan atau detail produk langsung aktif di sisi POS Kasir maupun Web Pemesanan Customer tanpa jeda.

### Module 5: Admin Panel - Laporan Penjualan (`/admin/reports`)
- **Kartu Metrik Utama:**
  - Total Omzet Kotor Hari Ini (`Gross Sales Today` dalam IDR).
  - Total Omzet Kotor Bulan Berjalan (`Gross Sales This Month` dalam IDR).
  - Total Volume Transaksi Sukses (Jumlah pesanan dengan status bayar valid).
- **Rincian Omzet per Kategori Produk:**
  - Kategori Kopi (Total Rupiah & Total Cup Terjual).
  - Kategori Snack/Makanan (Total Rupiah & Total Porsi Terjual).
  - Kategori Non-Kopi (Total Rupiah & Total Cup Terjual).
- **Ketentuan Perhitungan:** Hanya menghitung pesanan dengan `payment_status = 'paid'` dan `order_status != 'cancelled'`.

---

## 5. PostgreSQL Schema & Database Function

```sql
-- 1. Buat Tipe Enum
CREATE TYPE order_type_enum AS ENUM ('dine_in', 'takeaway');
CREATE TYPE order_source_enum AS ENUM ('pos', 'web');
CREATE TYPE payment_method_enum AS ENUM ('cash', 'qris');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'cancelled');
CREATE TYPE order_status_enum AS ENUM ('received', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE category_type_enum AS ENUM ('coffee', 'non_coffee', 'snack');

-- 2. Tabel Kategori Menu
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    type category_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Menu Produk
CREATE TABLE menus (
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
CREATE TABLE orders (
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
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES menus(id),
    category_type category_type_enum NOT NULL, -- Mempermudah agregasi laporan
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price INT NOT NULL,
    subtotal INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexing untuk Performa Query & Filter
CREATE INDEX idx_orders_status ON orders(order_status, payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_category_type ON order_items(category_type);

-- 7. Sequence & Function Reset Nomor Antrian Harian (Zona Waktu WIB / Asia/Jakarta)
CREATE SEQUENCE IF NOT EXISTS daily_queue_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_daily_queue()
RETURNS TRIGGER AS $$
DECLARE
    today_date VARCHAR(8);
    current_val INT;
    last_order_date VARCHAR(8);
BEGIN
    SELECT TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') INTO today_date;
    
    SELECT TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') 
    INTO last_order_date 
    FROM orders 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- Reset nomor urut ke 1 jika berganti hari
    IF last_order_date IS NULL OR last_order_date <> today_date THEN
        ALTER SEQUENCE daily_queue_seq RESTART WITH 1;
    END IF;

    current_val := NEXTVAL('daily_queue_seq');
    NEW.daily_queue_number := current_val;
    NEW.order_code := 'GSK-' || today_date || '-' || LPAD(current_val::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_daily_queue
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_daily_queue();
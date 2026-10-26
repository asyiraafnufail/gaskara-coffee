# Gaskara Coffee — Design System & Guidelines (DESIGN.md)

Panduan sistem desain antarmuka resmi Gaskara Coffee. Menetapkan aturan simetri, skala radius, palet warna, tipografi, dan anti-slop untuk seluruh modul aplikasi.

---

## 1. Filosofi Desain

1. **Flat Light Mode (Bebas AI-Slop):**
   - Menghindari gradien ungu/pink, glow berlebihan, drop shadow tebal multi-layer, dan dekorasi hampa tanpa fungsi operasional.
   - Fokus pada kontras tinggi, keterbacaan instan di layar kasir, smartphone pelanggan, maupun layar TV monitor antrian.
2. **Kecepatan & Kejelasan Operasional:**
   - Barista dan kasir tidak boleh terdistraksi elemen dekoratif.
   - Pelanggan di HP dapat memesan dan checkout dalam 3 langkah tanpa kebingungan.
3. **Simetri & Keselarasan Visual:**
   - Jarak padding, margin, dan tata letak teks berimbang (*balanced alignment*).
   - Ukuran gambar produk konsisten rasio 1:1 (persegi sempurna) dengan sudut membulat proporsional.

---

## 2. Palet Warna (Color Palette Tokens)

| Peran | Hex / Tailwind | Penggunaan |
|---|---|---|
| **Primary Brand / Alert** | `#dc2626` (`red-600`) | Logo badge, tombol utama CTA (Checkout/Pesan), status Siap Diambil, tab aktif |
| **Primary Hover** | `#b91c1c` (`red-700`) | Status hover tombol CTA merah |
| **Accent Neon Cyan** | `#0891b2` / `#06b6d4` (`cyan-600` / `cyan-500`) | Aksen modern, indikator antrian aktif, border item terpilih di keranjang |
| **Subtle Cyan Tint** | `#ecfeff` (`cyan-50`) | Latar badge antrian, banner pesanan aktif, highlight rekap |
| **Page Background** | `#f8fafc` (`slate-50`) | Latar dasar seluruh halaman |
| **Card / Surface** | `#ffffff` (`white`) | Permukaan kartu, dialog modal, dropdown, header |
| **Border Neutrals** | `#e2e8f0` (`slate-200`) | Garis pembatas simetris, outline kartu & input |
| **Text Primary** | `#0f172a` (`slate-900`) | Judul, nama menu, angka harga, nomor antrian |
| **Text Secondary** | `#475569` (`slate-600`) | Label formulir, deskripsi menu sekunder |
| **Text Muted** | `#94a3b8` (`slate-400`) | Keterangan pendukung, kode order, jam transaksi |

---

## 3. Sistem Radius Sudut (Symmetrical Corner Radii)

Untuk menjaga estetika yang proporsional dan tidak berlebihan (*natural rounded*):

- **`rounded-2xl` (16px):**
  - Kartu modul utama (*Dashboard Tiles* di `/admin`).
  - Kartu daftar item menu di Web Customer.
  - Box container metrik dan panel ringkasan.
  - Dialog pop-up modal (`Tambah Menu`) dan drawer bottom sheet (`Checkout`).
- **`rounded-xl` (12px):**
  - Thumbnail foto menu produk (`w-20 h-20 aspect-square`).
  - Input form (nama, catatan, pencarian, nominal tunai).
  - Box nomor antrian di layar TV antrian (`/queue`).
  - Tombol aksi sekunder dan pecahan cepat kasir (20k, 50k, 100k, Pas).
- **`rounded-lg` (8px):**
  - Tombol aksi ikon kecil (hapus, refresh, minimize/fullscreen).
- **`rounded-full` (Pill):**
  - Chip kategori (*Semua, Coffee, Non-Coffee, Snack*).
  - Badge status antrian (*Tersedia, Habis, Siap Diambil*).
  - Stepper tombol kuantitas keranjang (`+` / `-`).

---

## 4. Tipografi & Tata Letak Teks

- **Font Family Utama:** **Montserrat** (`--font-montserrat`), sans-serif bersih dengan geometric balance.
- **Font Angka Operasional:** **Monospace** (`font-mono`) untuk:
  - Nomor antrian (`#001`, `#002`).
  - Jam realtime digital di layar antrian.
  - Nominal harga Rupiah pada total tagihan dan kembalian tunai kasir.
- **Hierarki Teks:**
  - `h1`: 20px–24px (`text-xl` sampai `text-2xl`), `font-bold`, tracking tight.
  - `h2` / Card Titles: 14px–16px (`text-sm` sampai `text-base`), `font-bold`.
  - Body Text: 12px (`text-xs`), `leading-relaxed`.
  - Meta/Caption: 10px–11px (`text-[10px]` atau `text-[11px]`).

---

## 5. Standar Spesifikasi Komponen

### A. Home Admin Dashboard (`/admin`)
- Tata letak grid simetris: 1 kolom di mobile, 2 kolom di tablet, 3 kolom di desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`).
- Setiap kartu memiliki struktur simetris:
  1. Bagian atas: Ikon berlatar warna + badge kategori di kanan.
  2. Bagian tengah: Judul modul tebal + deskripsi fungsional singkat.
  3. Bagian bawah (footer): Metadata status / notifikasi di kiri + tombol aksi panah di kanan.

### B. Web Pemesanan Customer (`/` & `/order`)
- Tampilan difokuskan untuk smartphone (`max-w-md mx-auto`).
- Foto produk berukuran presisi **80x80px** (`w-20 h-20`), `rounded-xl`, `object-cover`.
- Teks info sejajar vertikal dengan foto: Judul di atas, deskripsi di tengah (`line-clamp-2`), harga dan tombol tambah di bagian bawah kartu.
- Tombol Checkout floating di bawah layar dengan tinggi ringkas tanpa menutupi daftar menu.

### C. POS Kasir (`/admin/pos`)
- **Strictly Text-Only:** Tidak ada gambar produk pada katalog kasir agar pencarian dan rendering instan (PRD Rule 5).
- Kalkulator pecahan cepat (Uang Pas, 20.000, 50.000, 100.000) dan hitung otomatis kembalian.
- Pemisahan 3 tab kerja kasir: *Kasir Input*, *Order Masuk Web*, dan *Status Antrian*.

### D. Layar Antrian TV (`/queue`)
- Kunci viewport penuh tanpa scroll: `fixed inset-0 overflow-hidden`.
- Pembagian 50:50 simetris antara **Sedang Dibuat** (kiri) dan **Siap Diambil** (kanan).
- Kartu Siap Diambil menggunakan kontras merah tebal (`bg-red-600 text-white`) dengan animasi pulsing agar terbaca dari jarak jauh counter.

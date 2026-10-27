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
  - Dialog pop-up modal (`Tambah Menu` & `Edit Menu`) dan drawer bottom sheet (`Checkout`).
- **`rounded-xl` (12px):**
  - Thumbnail foto menu produk (`w-24 h-24 aspect-square` / 96x96px).
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

- **Font Family Utama:** **Montserrat** (`--font-montserrat`), sans-serif bersih dengan geometric balance. Digunakan untuk seluruh teks antarmuka, judul, dan **seluruh nominal harga Rupiah** di semua modul (Customer Web, POS Kasir, Laporan Penjualan, dan Admin Dashboard) agar konsisten seragam.
- **Font Angka Operasional:** **Monospace** (`font-mono`) KHUSUS untuk:
  - Nomor antrian (`#001`, `#002`).
  - Jam realtime digital di layar antrian.
  - Kode pesanan unik (`GSK-YYYYMMDD-001`).
  - *(DILARANG menggunakan `font-mono` pada angka harga Rupiah di modul mana pun).*
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
- Foto produk berukuran presisi **96x96px** (`w-24 h-24 aspect-square`), `rounded-xl`, `object-cover`.
- Teks info sejajar vertikal dengan foto (`h-24 flex flex-col justify-between`): Judul di atas (`truncate`), deskripsi di tengah (`line-clamp-2 leading-snug`), harga dan tombol aksi presisi segaris horizontal dengan batas bawah foto.
- Tombol Checkout floating di bawah layar dengan tinggi ringkas tanpa menutupi daftar menu.

### C. POS Kasir (`/admin/pos`)
- **Strictly Text-Only:** Tidak ada gambar produk pada katalog kasir agar pencarian dan rendering instan (PRD Rule 5).
- Kalkulator pecahan cepat (Uang Pas, 20.000, 50.000, 100.000) dan hitung otomatis kembalian.
- Pemisahan 3 tab kerja kasir: *Kasir Input*, *Order Masuk Web*, dan *Status Antrian*.

### D. Layar Antrian TV & Mobile (`/queue`)
- Kunci viewport penuh tanpa scroll window: `fixed inset-0 overflow-hidden`.
- Pembagian 50:50 simetris antara **Sedang Dibuat** (kiri) dan **Siap Diambil** (kanan) pada layar TV/desktop.
- List kartu antrian di dalam kolom menggunakan `overflow-y-auto` agar dapat discroll saat antrian banyak.
- Kartu Siap Diambil menggunakan kontras merah tebal solid (`bg-red-600 text-white`) tanpa animasi breathing/pulse agar tidak mendistraksi mata pengunjung.
- Mode Mobile Responsif (`sm:hidden`): Selector tab sederhana menggunakan label tepat: `Semua`, `Siap`, dan `Dibuat`.

---

## 6. Aturan Kunci Desain Anti-Regresi (Strict Invariants)

Aturan permanen yang DILARANG diubah pada iterasi berikutnya:

1. **Kunci Alignment Kartu Menu Customer:**
   - Foto: Wajib `w-24 h-24 aspect-square` (96x96px), `rounded-xl`, `object-cover`.
   - Kontainer teks: Wajib `flex-1 min-w-0 h-24 flex flex-col justify-between py-0` dengan parent `flex gap-3 items-start`.
   - Judul: Wajib `truncate` (1 baris) dengan `leading-snug` rapat ke atas (y=0 sejajar atas foto).
   - Deskripsi: Wajib `line-clamp-2 leading-relaxed mt-0.5` (maksimal 2 baris).
   - Baris aksi bawah: Wajib dikunci tinggi `h-7` (28px) untuk Harga, Tombol Tambah (`h-7`), dan Stepper (`h-7`). Menempel presisi di dasar kontainer `h-24` sehingga berada pada satu garis horizontal yang sama persis dengan batas bawah foto produk (y=96px).

2. **Kunci Footer & Zero Blank Gap:**
   - Dilarang memberi padding bawah statis raksasa (seperti `pb-28` atau `pb-36`).
   - Gunakan dynamic padding: `cart.length > 0 ? 'pb-24' : 'pb-4'`.
   - Bagian bawah kontainer selalu ditutup oleh footer ringkas simetris (`Gaskara Coffee • Self-pickup counter`).

3. **Kunci Zero-Scroll Window Layar Antrian & Responsif Mobile:**
   - Root layout `/queue` wajib `fixed inset-0 overflow-hidden` agar tidak memicu scrollbar browser saat mode inspect mobile maupun layar TV display.
   - Kolom antrian di dalam container wajib memiliki `overflow-y-auto` sehingga scrollable jika jumlah antrian banyak.
   - Kartu "Siap Diambil" dilarang menggunakan animasi blinking/breathing (`animate-pulse`). Gunakan warna solid merah berdaya kontras tinggi.
   - Tampilan mobile wajib menyediakan tab selector sederhana dengan label: `Semua`, `Siap`, dan `Dibuat` (dilarang teks verbose seperti 'split 50:50').

4. **Kunci POS Bebas Gambar:**
   - Katalog POS Kasir (`/admin/pos`) wajib strictly text-only tanpa elemen `<img>` produk.

5. **Kunci Font Harga Seragam (Montserrat Standard Sans-Serif):**
   - SELURUH angka nominal harga Rupiah di SEMUA modul dan halaman (Web Menu Customer, Drawer Keranjang, Status Antrian Pelanggan, POS Kasir Katalog, POS Item Keranjang & Total Tagihan, Laporan Penjualan Harian/Bulanan/Tabel Transaksi, dan Ringkasan Omzet Dashboard Admin) WAJIB seragam menggunakan font standar Montserrat (`font-bold text-slate-900` / sans-serif).
   - DILARANG KERAS menggunakan `font-mono` pada angka harga Rupiah di modul atau halaman mana pun.
   - `font-mono` dikhususkan HANYA untuk: nomor antrian (`#001`, `#002`), jam digital realtime antrian, dan kode pesanan (`GSK-YYYYMMDD-001`).

6. **Kunci Anti-Layout-Shift & Ukuran Box Konsisten (Zero-Jitter Invariant):**
   - **Border State Konsisten:** Semua button selector tab dan filter kategori wajib mempertahankan border 1px baik saat aktif maupun inaktif (misal: `border-slate-900` saat aktif vs `border-slate-200` saat inaktif, `border-red-600` vs `border-slate-200`). DILARANG menghilangkan border saat state aktif karena memicu pergeseran dimensi 2px.
   - **Katalog POS Kasir:** Kartu menu kasir wajib dikunci tinggi simetris `h-[92px]` dengan `line-clamp-2` pada nama menu agar ukuran box antar kategori (Coffee, Non-Coffee, Snack) tidak berubah atau meregang.
   - **Gutter Scrollbar Stabil:** Kontainer katalog dan list antrian wajib menggunakan `[scrollbar-gutter:stable]` agar layout tidak melebar/menyempit saat kategori dengan sedikit item (seperti Snack) dipilih.
   - **Header Display Antrian:** Badge huruf G (`w-8 h-8 rounded-xl`) wajib sejajar presisi dengan kontainer teks di sampingnya (`h-8 flex flex-col justify-between py-0.5`).
   - **Lebar Modul Admin Konsisten:** Seluruh halaman admin (/admin, /admin/pos, /admin/menu, /admin/reports) dan header navbar wajib konsisten pada skala `max-w-6xl mx-auto px-4 sm:px-6`.



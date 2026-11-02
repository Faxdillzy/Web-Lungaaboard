# Lungaabroad.id

Situs statis untuk kursus bahasa Prancis dan persiapan ke Canada. Dua halaman, tanpa database, tanpa build tool: cukup HTML + CSS + JavaScript. Semua "data perusahaan" (email, WhatsApp, sosial media) ada di satu file, `js/config.js`.

---

## 1. Jalankan dulu (1 menit)

Jangan buka `index.html` dengan double-click. Jalankan server lokal supaya path gambar dan anchor bekerja seperti saat online:

```bash
cd lungaabroad
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000`.

Tidak ada `npm install`, tidak ada compile. Edit file → refresh browser.

---

## 2. Peta file

| File | Isi | Kapan diedit |
|---|---|---|
| `index.html` | Beranda: hero, jalur, tahapan, program, tips, webinar, FAQ, kontak | Mengubah teks/urutan section beranda |
| `program.html` | Halaman program: jenjang A1–B2, kalkulator durasi, tabel ujian | Mengubah level, durasi paket, info ujian |
| `css/style.css` | Seluruh desain (warna, tipografi, layout, responsive) | Mengubah tampilan |
| `js/config.js` | **Data perusahaan**: email, WhatsApp, pesan awal, sosial media | **Paling sering diedit** |
| `js/main.js` | Semua interaksi + data kota tujuan (`D`) + data level (`L`) + paket kalkulator (`K`) | Menambah kota/level/paket, mengubah perilaku |
| `assets/img/` | Logo, favicon, OG image, 4 foto webinar | Mengganti gambar |

`main.js` dipakai bersama oleh kedua halaman. Blok kode di dalamnya hanya jalan kalau elemennya ada di halaman itu (contoh: blok beranda dibungkus `if (tabs)`, blok program dibungkus `if (lv)`). Jadi aman memuat file yang sama di dua halaman.

---

## 3. Alur besar: dari klik pertama sampai WhatsApp

```
                    ┌──────────────── index.html ────────────────┐
  Pengunjung ──────►│ hero → jalur → tahapan → program → tips    │
  (iklan/IG/WA)     │ → webinar → FAQ → form kontak              │
                    └───────────────────┬────────────────────────┘
                                        │ klik "Program"
                                        ▼
                                 program.html
                          level → kalkulator → tabel ujian
                                        │
                                        │ CTA "Konsultasi awal"
                                        ▼
                             index.html#kontak (form)
                                        │
                                        │ submit
                                        ▼
                        WhatsApp dengan pesan sudah terisi
```

Inti bisnisnya: **semua jalan bermuara ke WhatsApp**. Tidak ada backend, tidak ada penyimpanan data. Form kontak hanya menyusun teks lalu membuka `wa.me`.

---

## 4. Alur halaman beranda (`index.html`), urut dari atas

| # | Section / ID | Isi | Interaksi | Sumber data |
|---|---|---|---|---|
| 1 | `header.top` + `#nav` | Logo, menu, tombol Konsultasi | Menu mobile (`#menu`) buka/tutup nav | Statis |
| 2 | `.hero` | Judul utama, CTA, **boarding pass** | Pilih kota → detail berubah | Array `D` di `main.js` |
| 3 | `.tick` | Teks berjalan: Bonjour, Canada, Montréal… | Marquee otomatis | Dibuat `main.js` |
| 4 | `.num` | 4 angka: 10+ provinsi, A1→B2, 2 program, 4 tahap | — | Hardcoded di HTML |
| 5 | `#tentang` | Penjelasan perusahaan, 2 kolom | Muncul saat scroll | Statis |
| 6 | `#jalur` | 2 program: Francophone Mobility, Express Entry – Pathway PR | Akordeon (`<details name="jalur">`, hanya satu terbuka) | Statis |
| 7 | Tahapan `#steps` | 4 langkah dari konsultasi ke keberangkatan | Garis progres mengikuti scroll | Statis |
| 8 | `.gelap` | Tabel "Otodidak vs Bersama Lungaabroad" | — | Statis |
| 9 | `#program` | 3 kartu program | Link ke `program.html#level` / `#ujian` | Statis |
| 10 | `#tips` | 7 judul artikel + filter kategori | Tombol chip menyaring daftar | Atribut `data-c` di HTML |
| 11 | Kegiatan `#wsl` | Carousel 4 foto webinar | Panah, thumbnail, swipe, autoplay 5 detik | HTML + `main.js` |
| 12 | `#faq` | 9 pertanyaan + kolom cari | Ketik → daftar tersaring | `<details class="q">` |
| 13 | `#kontak` | Sosial media + form 4 kolom | Submit → buka WhatsApp | `config.js` + `main.js` |
| 14 | `footer.ft` + `.wa` | Footer, tombol WhatsApp mengambang | — | `config.js` |

### 4a. Boarding pass (hero)

Ini widget utama di beranda. Tombol provinsi/kota (`YUL` … `YYG`) **tidak ditulis di HTML** — dibuat oleh JavaScript dari array `D` di `js/main.js`:

```js
{ k: 'YUL', kota: 'Montréal', neg: 'Québec', jalur: 'Francophone Mobility',
  ujian: 'TCF Canada / TEF Canada', cat: '...' }
```

Saat tombol diklik, `pick(i)` mengisi `#kodetujuan`, `#d-kota`, `#d-neg`, `#d-jalur`, `#d-ujian`, `#d-cat`. Bisa juga dinavigasi dengan tombol panah kiri/kanan.

**Menambah kota:** tambahkan satu objek ke array `D`. Tombol dan detailnya otomatis muncul.

### 4b. Filter tips

Setiap artikel punya kategori di atribut `data-c`:

```html
<li data-c="bahasa"><small>Bahasa</small><a href="#">Judul…</a><span></span></li>
```

Tombol filter memakai `data-f`. Nilai yang cocok: `bahasa`, `jalur`, `dokumen`, `hidup`, dan `semua`. Filter hanya menyembunyikan/menampilkan (`li.hidden`), tidak memuat ulang halaman.

### 4c. Carousel webinar

Tiga tempat yang harus sinkron saat mengganti foto:

1. `.ws` (slide besar) — gambar + `alt` + `data-sub` (keterangan di bawah).
2. `.wt` (thumbnail) — gambar yang sama.
3. `aria-label="1 dari 4"` pada tiap slide — angka total ditulis manual.

Nomor `01 / 04` dihitung otomatis dari jumlah slide, tapi label "1 dari 4" tidak.

### 4d. Pencarian FAQ

Input `#cari` mencocokkan teks di semua `<details>`. Kalau tidak ada hasil, `#nol` ("Tidak ada yang cocok…") ditampilkan. Menambah FAQ cukup menyalin satu blok `<details class="q">`; pencarian langsung ikut.

### 4e. Form → WhatsApp

Form tidak mengirim email dan tidak menyimpan data. Saat submit:

1. `main.js` membaca `#f-nama`, `#f-tuj`, `#f-jal`, `#f-lv`.
2. Menyusun pesan: nama, tujuan, jalur, level Prancis.
3. Membuka `https://wa.me/<nomor>?text=<pesan>` di tab baru.

Jadi kalau nomor WhatsApp salah, **seluruh konversi situs ikut mati**.

---

## 5. Alur halaman program (`program.html`)

| # | Section / ID | Isi | Interaksi | Sumber data |
|---|---|---|---|---|
| 1 | `.ph` | Judul halaman | — | Statis |
| 2 | `#level` | Tab A1, A2, B1, B2 + penjelasan + total jam | Klik tab → teks berubah | Array `L` di `main.js` |
| 3 | `#kal` | Kalkulator: jenis kelas + paket | Hitung otomatis saat diubah | Array `K` |
| 4 | `#ujian` | Tabel TEF Canada & TCF Canada | — | Statis |
| 5 | CTA | "Belum yakin mulai dari mana?" | Balik ke `index.html#kontak` | — |

### 5a. Data level

```js
['B1', 'Menengah', 'Deskripsi…', 380]
```

Angka terakhir = **jam belajar kumulatif** (bukan tambahan). Nilai saat ini: A1 80, A2 190, B1 380, B2 600.

### 5b. Kalkulator

Kalkulator memakai **durasi paket**, bukan jam per minggu.

| Jenis kelas | Paket | Durasi |
|---|---|---|
| Reguler | A1 – A2 | 3 bulan |
| Reguler | A2 – B2 (30%) | 3 bulan |
| Private 1 on 1 | A1 – A2 | 2 bulan |
| Private 1 on 1 | B1 – B2 | 2 bulan |
| Private 1 on 1 | Persiapan B1 – TCF/TEF | 1 bulan 2 minggu |
| Private Group (min. 3 orang) | A1 – A2 | 2 bulan |
| Private Group (min. 3 orang) | B1 – B2 | 2 bulan |
| Private Group (min. 3 orang) | Persiapan B1 – TCF/TEF | 1 bulan 2 minggu |

Data ada di array `K` dalam `main.js`. Setiap paket punya `label` dan `bulan`; angka `1.5` ditampilkan sebagai “1,5 bulan” dengan catatan “1 bulan 2 minggu”.

**Mengubah durasi:** ubah `bulan` atau `label` pada array `K`. Pilihan paket menyesuaikan jenis kelas yang dipilih.

---

## 6. Bagaimana data mengalir

```
js/config.js  ──►  js/main.js  ──►  elemen HTML
   (CONFIG)         (IIFE)           (data-* dan id)
```

`main.js` mencari elemen berdasarkan atribut khusus, lalu mengisinya:

| Atribut / ID | Yang terjadi |
|---|---|
| `[data-wa]` | `href` diisi `https://wa.me/<nomor>?text=<pesanAwal>` |
| `[data-mail]` | `href` jadi `mailto:` dan teksnya jadi alamat email |
| `[data-year]` | Diisi tahun berjalan otomatis |
| `[data-sos]` | Diisi daftar link Instagram/TikTok/Facebook dari `CONFIG.sosial` |
| `#menu` + `#nav` | Toggle menu mobile |
| `#form` | Submit → WhatsApp |
| `#cari` | Filter FAQ |
| `.chip` | Filter tips |
| `#tabs` | Boarding pass (beranda) |
| `#lv`, `#c-kelas`, `#c-paket` | Level + kalkulator (program) |
| `#wsl` | Carousel webinar |

Konsekuensinya:

- Menambah halaman baru **tidak** otomatis dapat header/footer. Salin blok `<header>` dan `<footer>` dari halaman yang ada, lalu sertakan `config.js` + `main.js`.
- Kalau sebuah ID dihapus dari HTML, blok JS terkait tidak jalan (karena dijaga `if`), bukan error.
- `config.js` harus dimuat **sebelum** `main.js` (urutan script di akhir `<body>` sudah benar).

---

## 7. Resep edit yang sering dipakai

**Ganti nomor WhatsApp / email / sosial media**
Edit `js/config.js`. Nomor harus format internasional tanpa `+`, spasi, atau `0` di depan (contoh: `6285842540779`).

**Ganti pesan pembuka WhatsApp**
Ubah `pesanAwal` di `js/config.js`.

**Tambah kota tujuan**
Tambah objek baru di array `D` (`js/main.js`).

**Tambah FAQ**
Salin satu `<details class="q">…</details>` di `index.html`, ubah pertanyaan dan jawaban. Pencarian otomatis ikut.

**Tambah judul artikel tips**
Salin satu `<li data-c="…">` di `#tipslist`. Link masih `#` karena artikelnya belum ada.

**Ganti foto webinar**
Ganti file di `assets/img/`, lalu perbarui `src` di slide `.ws` **dan** thumbnail `.wt`, plus `data-sub` dan `aria-label`.

**Ubah warna**
Semua warna ada di `:root` paling atas `css/style.css`: `--kertas` (latar navy), `--teks` (teks utama), `--tinta` (teks di kartu terang), `--bleu`/`--biru` (aksen biru), `--rouge` (aksen hangat), dan `--orange` (logo, kata penekanan `h1 em`/`h2 em`, latar section `.oranye`/`.kt`, kartu program `.pc`, tab jenjang `.lv`, dan ticker). Section Kenapa Kami, Program, dan Kontak memakai teks putih; CTA di halaman Program juga memakai judul putih.

**Ubah teks section**
Langsung di `index.html` / `program.html`. Tidak ada file konten terpisah.

---

## 8. Panduan langkah demi langkah sebelum online

Kerjakan berurutan. Setiap langkah punya cara cek sendiri, jadi kalau ada yang salah ketahuan saat itu juga — bukan setelah situs tayang. Perkiraan total waktu: 30–45 menit, di luar verifikasi kebijakan.

### Langkah 1 — Betulkan nomor WhatsApp

**File:** `js/config.js`

Ini langkah paling penting. Kalau nomornya salah format, semua tombol WhatsApp, form kontak, dan tombol mengambang gagal membuka chat — dan tidak ada pesan error yang muncul.

Sekarang isinya:

```js
whatsapp: "+6285842540779",   // GANTI: format 62812... tanpa + atau 0
```

Ubah menjadi:

```js
whatsapp: "6285842540779",
```

Aturannya:

| Salah | Benar | Alasan |
|---|---|---|
| `+6285842540779` | `6285842540779` | `wa.me` tidak menerima `+` |
| `085842540779` | `6285842540779` | `0` di depan harus jadi `62` |
| `62 858 4254 0779` | `6285842540779` | Tanpa spasi/tanda hubung |

**Cara cek:** jalankan server lokal, klik tombol WhatsApp di kanan bawah. WhatsApp harus terbuka dengan pesan "Halo Lungaabroad.id, saya ingin konsultasi." Kalau yang muncul halaman error atau nomor tidak dikenal, formatnya masih salah.

### Langkah 2 — Ganti email dan sosial media

**File:** `js/config.js`

```js
email: "lungaabroad@gmail.com",
sosial: [
  { nama: "Instagram", url: "https://www.instagram.com/..." },
  { nama: "TikTok",    url: "https://www.tiktok.com/@..." },
  { nama: "Facebook",  url: "https://www.facebook.com/..." },
],
```

- `email` muncul otomatis di footer (teks dan link `mailto:`).
- `sosial` mengisi dua tempat sekaligus: daftar "Ikuti" di footer dan daftar kontak di section `#kontak`.
- Nama di `nama` dipakai sebagai teks link. Kalau menambah jaringan baru, tambahkan satu objek; tidak perlu menyentuh HTML.

**Cara cek:** buka setiap URL di jendela incognito (supaya tidak tertipu sesi login sendiri). Pastikan akunnya benar dan bukan akun lain dengan nama mirip. Perhatikan juga URL Instagram/TikTok yang masih membawa parameter pelacakan (`?stkn=`, `?_r=`) — boleh dibiarkan, tapi lebih rapi dibersihkan.

### Langkah 3 — Putuskan nasib 7 tautan artikel

**File:** `index.html`, section `#tips`

Ketujuh judul artikel masih memakai `href="#"`. Artinya: diklik, halaman hanya melompat ke atas. Ada dua pilihan.

**Pilihan A — belum ada artikelnya:** hapus section `#tips` beserta menu "Sharing & Tips" di header dan footer. Menu yang selalu mengarah ke tempat kosong lebih merusak kepercayaan daripada tidak ada menu.

**Pilihan B — artikel sudah siap:** buat file baru (misalnya `tips/tef-atau-tcf.html`), lalu ganti `href="#"` menjadi `href="tips/tef-atau-tcf.html"`. Ulangi untuk ketujuh baris. Jangan lupa tambahkan `target` hanya jika memang ingin membuka tab baru — untuk artikel internal, biarkan tab yang sama.

**Cara cek:** klik setiap judul. Tidak boleh ada yang tetap di halaman yang sama tanpa perubahan apa pun.

### Langkah 4 — Tetapkan kebijakan di FAQ

**File:** `index.html`, section `#faq`

Dua jawaban masih ambigu dan berpotensi menimbulkan salah paham:

1. **"Apakah konsultasi awal berbayar?"** — sekarang dijawab "Konsultasi gratis". Pastikan ini benar untuk semua kanal, bukan hanya chat pertama.
2. **"Online atau offline?"** — sekarang dijawab "Untuk saat ini kelas tersedia secara Online". Sebutkan apakah ada kelas tatap muka, di kota mana, dan apakah jadwalnya tetap atau menyesuaikan.

Sekalian perbaiki markup rusak di jawaban itu: penutupnya `<p><details>` padahal seharusnya `</p></details>`.

**Cara cek:** baca ulang jawaban seolah kamu calon murid yang baru pertama kali tahu Lungaabroad. Kalau masih ada "tergantung" tanpa penjelasan, tulis ulang.

### Langkah 5 — Verifikasi klaim resmi

**File:** `index.html` (FAQ, `#jalur`, `#tahapan`) dan `program.html` (`#ujian`)

Klaim yang menyangkut izin tinggal dan ujian harus dicek ke sumber primer, bukan blog atau unggahan sosial media:

| Klaim di situs | Sumber yang harus dibuka |
|---|---|
| Francophone Mobility, syarat tawaran kerja, pengecualian LMIA | Halaman resmi IRCC |
| NCLC 5 / NCLC 7 dan padanannya ke level CEFR | IRCC atau pusat ujian resmi |
| TEF Canada dan TCF Canada diterima untuk imigrasi | IRCC + penyelenggara ujian (CCI Paris / France Éducation International) |
| Masa berlaku hasil ujian | Penyelenggara ujian |

Yang perlu diwaspadai: tabel di `program.html` berjudul "2 ujian, 4 fungsi". Dua ujian (TEF Canada dan TCF Canada) diuji lewat empat kemampuan: menyimak, membaca, menulis, dan berbicara. Pastikan judul dan isi tabel tetap sinkron jika data ujian berubah.

**Cara cek:** setiap angka atau nama program di situs harus bisa kamu tunjuk sumber resminya. Kalau tidak bisa, hapus atau lunakkan kalimatnya ("umumnya", "cek ketentuan terbaru").

### Langkah 6 — Siapkan domain dan metadata

**File:** `index.html`, bagian `<head>`

Saat situs masih di komputer, path relatif tidak masalah. Setelah punya domain, tiga hal ini perlu diubah:

```html
<meta property="og:image" content="assets/img/og.jpg">
```

menjadi URL lengkap:

```html
<meta property="og:image" content="https://lungaabroad.id/assets/img/og.jpg">
<meta property="og:url" content="https://lungaabroad.id/">
<link rel="canonical" href="https://lungaabroad.id/">
```

Alasannya: WhatsApp, Facebook, dan LinkedIn tidak selalu bisa membaca path relatif. Tanpa URL absolut, pratinjau link bisa muncul tanpa gambar.

Tambahkan juga `og:image:width` dan `og:image:height` bila tahu ukuran `og.jpg` (idealnya 1200×630). `program.html` belum punya tag OG sama sekali — tambahkan dengan judul dan deskripsi sendiri.

**Cara cek:** setelah online, tempel URL ke [opengraph.xyz](https://www.opengraph.xyz/) atau kirim ke diri sendiri lewat WhatsApp. Gambar dan judul harus muncul.

### Langkah 7 — Uji akhir

Jalankan checklist di [bagian 10](#10-checklist-uji-sebelum-publish). Minimal lakukan ini sebelum menekan publish:

- Buka di ponsel (lebar 375px), bukan hanya di layar laptop.
- Submit form kontak satu kali dengan data asli.
- Klik satu link `program.html#level` dan satu `program.html#ujian`.
- Cari FAQ dengan kata yang pasti tidak ada.

Kalau keempatnya lolos, situs siap tayang.

---

## 9. Temuan yang perlu dibetulkan (bukan bagian alur, tapi memengaruhi hasil)

1. **`config.js` — nomor WhatsApp diawali `+`.** Komentar di file itu sendiri bilang "tanpa + atau 0". Akibatnya tombol WhatsApp bisa gagal membuka chat.
2. **FAQ `#nol`** menulis "Tanyakan langsung lewat WhatsApp" tetapi bukan link yang bisa diklik.
3. **CSS sisa redesign:** `.route`, `.pp`, `.card`, `.card.foto`, dan variabel chatbot n8n (`.has-chat`) tidak dipakai lagi oleh HTML saat ini.
4. **Tab level di `program.html`** belum bisa dinavigasi dengan tombol panah seperti tab boarding pass.
5. **`og:image` masih relatif** dan belum ada `og:url`/canonical.

---

## 10. Checklist uji sebelum publish

- [ ] Buka di lebar 375px: menu mobile, boarding pass, tabel, carousel, form tetap nyaman.
- [ ] Tab melalui halaman dengan keyboard: skip link, menu, tab kota, filter, FAQ, form.
- [ ] Submit form → WhatsApp terbuka dengan nama, tujuan, jalur, dan level yang benar.
- [ ] Klik tombol WhatsApp mengambang dan link di footer.
- [ ] Cari FAQ dengan kata yang tidak ada → pesan "Tidak ada yang cocok" muncul.
- [ ] Kalkulator: ganti jenis kelas → pilihan paket dan durasi ikut berubah.
- [ ] Semua link `program.html#level` dan `#ujian` mendarat di section yang tepat.
- [ ] Matikan JavaScript: teks utama tetap terbaca (efek muncul-saat-scroll tidak aktif).

REVISI

- warna background website turunan warna biru
- ⁠logo tulisan abroad warna orange, font jgn berubah
- ⁠Bahasa Prancis adalah peluang karirmu ke Canada 
- ⁠kami antar ganti (Kami Bimbing Sampai Gerbang Keberangkatan)
- ⁠kelas bahasa dan persiapan ujian
- ⁠peta jalur belajar di hapus 
- ⁠5 ganti 10+ province
- ⁠A1 sampai B2 
- ⁠jalur studi, (Ganti Pathway  Career - Pathway PR)
- ⁠5 tahap ganti 4 tahapan menuju canada
- ⁠di ubah hanya (lungaabroad.id adalah platform edukasi dan bimbingan persiapan)
- ⁠tiga cara berangkat ganti (2 Program Lungaabroad cabangnya francophone mobility dan express entry - pathway PR)

- tahap 5 ganti (Job Offer dan Keberangkatan)
- ⁠Belajar sendiri bisa, bersama Lunga lebih terarah
- ⁠2 Ujian, 4 Fungsi
- ⁠tiga program, satu tujuan cabangnya (Program Reguler A.1 - A.2 Program Extension B.1 - B.2 Program Preparation Min B.1 - TCF/TEF)

- ⁠tambah nama (PT LUNGA CAKRAWALA GLOBALINDO* di paling Bawah khusus bahasa prancis dan persiapan canada)

- Untuk tulisan kami bimbing sampai gerbang keberangkatan ganti warna menjadi orange
- Dibagian Tentang tulisan canada ubah warna menjadi orange
- Dibagian Jalur tulisan lungaabroad ubah warna menjadi orange
- Dibagian Tahapan tulisan canada ubah warna menjadi orange
- Dibagian kenapa kami warna halamannya ubah menjadi orange dan untuk tulisan menjadi warna biru gelap
- Dibagian program tulisan satu tujuan ubah warna menjadi orange dan 3 grid program reguler, program extension, program preparation ubah warna menjadi orange yang sebelumnya warna biru dan putih
- Dibagian sharing & tips tulisan terbuka ubah warna menjadi orange
- Dibagian kegiatan tulisan webinar kami ubah warna menjadi orange
- Dibagian FAQ tulisan umum ubah warna menjadi orange
- Dibagian halaman kontak ubah menjadi warna orange dan untuk tulisan ubah ke biru gelap
- Tulisan abroad.id di halaman atas dan halaman bawah gantu warna menjadi orange
- Dibagian Program tulisan bonjour ubah warna menjadi orange
- Dibagian Jenjang tulisan B2 ubah warna ke orange
- Dibagian Kalkulator tulisan sampai target ubah ke warna orange
- Dibagian Ujian tulisan 4 fungsi ubah ke warna orange
- Dihalaman belum yakin mulai dari mana? Ngobrol dulu warna halamannya ubah ke warna orange dan tulisan Ngobrol dulu ganti ke warna biru gelap

Revisi lanjutan

- Ticker tulisan bergerak: latar orange, tulisan biru gelap
- Angka 10+, A1→B2, 2, dan 4 dijadikan orange
- Tulisan di section Kenapa Kami, Program, dan Kontak dijadikan putih
- Kotak pilihan jenjang level di halaman Program dijadikan orange
- Tulisan CTA "Belum yakin mulai dari mana? Ngobrol dulu" dijadikan putih
- PT LUNGA CAKRAWALA GLOBALINDO dipindah ke bawah teks "Bahasa Prancis & persiapan ke Canada." di footer
- Kalkulator diubah dari hitungan jam per minggu menjadi durasi paket: Reguler, Private 1 on 1, dan Private Group (min. 3 orang)

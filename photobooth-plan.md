# 📸 Project Blueprint: Hybrid Retro Photobooth Web App

## .Knowledge (Project Context & Constraints)
**Project Overview:** 
Membangun aplikasi web Photobooth interaktif yang berjalan 100% di browser (Client-Side). Proyek ini merupakan gabungan (Hybrid) dari dua konsep:
1. **Visual/UI Style:** Menggunakan gaya "Neo-Brutalism / Arcade Game" (Warna kontras, border hitam tebal, solid black shadow, font retro/chunky).
2. **User Experience (UX) Flow:** Menggunakan sistem "Automated Wizard / Stepper" (Setup -> Auto-Shoot -> Customize -> Export).

**Hard Constraints (BATASAN MUTLAK):**
- **NO Backend / NO Database:** Semua pemrosesan (penggabungan foto, filter, rendering) harus dilakukan secara lokal menggunakan Vanilla JavaScript dan HTML5 Canvas API.
- **NO Cloud Storage:** Foto tidak boleh diunggah ke server manapun.
- **NO User Auth (Login/Register):** Keamanan hanya menggunakan sistem PIN Statis (Client-side Passcode) sebelum masuk ke aplikasi utama.

---

## .Tools (Tech Stack)
- **Framework Utama:** Astro (Fokus pada kecepatan dan performa statis).
- **Styling:** Tailwind CSS (Wajib digunakan untuk membangun sistem desain Neo-Brutalism via `tailwind.config.mjs`). Bootstrap (Hanya boleh digunakan via CDN jika membutuhkan komponen mendesak, namun Tailwind adalah prioritas utama).
- **Interactivity:** Vanilla JavaScript (DOM Manipulation, tidak menggunakan React/Vue untuk state management, gunakan Global Object atau `sessionStorage`).
- **Core Browser APIs:** 
  - `navigator.mediaDevices.getUserMedia` (Akses Kamera)
  - `CanvasRenderingContext2D` (Manipulasi dan Penggabungan Gambar)
- **Deployment Target:** Vercel / Netlify (Static Export).

---

## .Rules / Workflows (Application Logic & Flow)

Aplikasi akan dibagi menjadi dua fase utama: **Security Phase** dan **App Phase (SPA Flow)**.

### Workflow 1: Security Phase (`index.astro`)
1. Tampilkan UI input Passcode bergaya retro.
2. Jika input user == "PIN_RAHASIA", set variabel di `sessionStorage` (misal: `isAuthorized: true`) dan arahkan ke `/booth`.
3. Jika gagal, tampilkan error modal (Custom Neo-Brutalist UI, jangan gunakan default browser alert).

### Workflow 2: Main App Phase (`booth.astro`)
Halaman ini bertindak seperti Single Page Application (SPA). Gunakan JavaScript untuk melakukan *toggle display* (`display: block/none`) antar "Steps" tanpa memuat ulang (refresh) halaman.

- **Step 1: SETUP**
  - User memilih Layout (misal: 3-Strip, 2x2 Grid).
  - User memilih Frame Overlay (Desain bingkai PNG transparan).
  - User memilih Durasi Timer antar jepretan (misal: 3s atau 5s).
  - *Rule:* Simpan konfigurasi ini di objek JS lokal `sessionConfig`.

- **Step 2: CAMERA (Auto-Shoot Engine)**
  - Minta akses webcam. Tampilkan video feed.
  - Saat tombol "Start" ditekan, jalankan fungsi hitung mundur rekursif.
  - Alur: Hitung mundur (3,2,1) -> Layar Flash Putih -> Ambil frame `<video>` ke `<canvas>` tersembunyi -> Simpan DataURL ke array -> Ulangi hingga jumlah foto terpenuhi (berdasarkan layout yang dipilih di Step 1).
  - Otomatis lanjut ke Step 3 setelah selesai.

- **Step 3: CUSTOMIZE & RENDER**
  - Buat `<canvas>` master yang ukurannya sesuai dengan Frame (resolusi tinggi, min width 1080px).
  - Gambar background (jika ada).
  - *Looping* array foto hasil jepretan, gambar/tempel ke dalam master canvas pada koordinat (X, Y) yang spesifik untuk setiap layout.
  - Render frame overlay `.png` transparan di lapisan teratas (Z-index tertinggi).
  - **Text Feature:** Sediakan input teks. Jika diisi, gunakan `ctx.fillText` untuk menuliskan *Caption* di bagian bawah photo strip.
  - Tampilkan hasil render canvas ke UI layar user.

- **Step 4: EXPORT**
  - Sediakan 2 tombol Download menggunakan `canvas.toDataURL("image/png")`.
  - Tombol 1: Download Original Strip (Canvas asli).
  - Tombol 2: Download for Social (Buat canvas baru berukuran rasio IG Story 1080x1920, letakkan photo strip di tengah, beri background warna solid, lalu download).

---

## .skill (Required Agent Capabilities)
1. **Neo-Brutalism Tailwind Config:** Mampu membuat custom box-shadow (`4px 4px 0px #000`) dan custom colors di `tailwind.config.mjs`.
2. **Vanilla JS State Management:** Mampu mengatur logika "Stepper" kompleks di dalam Astro page script tanpa bentrok.
3. **Advanced Canvas Manipulation:** Mampu memanipulasi titik koordinat `(x, y, width, height)` saat menempelkan beberapa foto ke dalam satu canvas. Mampu mempertahankan aspect ratio (agar wajah tidak "gepeng").
4. **WebRTC Handling:** Menangani izin kamera, menangani orientasi kamera (desktop vs mobile viewport), dan melakukan flip horizontal (`scaleX(-1)`) agar kamera terasa seperti cermin.

---

## .Reasoning model (Agent Thinking Guidelines)
- **Problem: State Loss on Refresh.** 
  - *Reasoning:* Karena tidak ada backend, jika user me-refresh halaman di Step 3, foto akan hilang. 
  - *Action:* Simpan hasil sementara ke `sessionStorage` berupa base64 string jika memungkinkan, atau minimal pastikan *error handling* mengarahkan user kembali ke Step 1 dengan halus jika array foto kosong.
- **Problem: High Memory Usage on Mobile.** 
  - *Reasoning:* Menyimpan banyak base64 string resolusi tinggi bisa membuat browser mobile crash. 
  - *Action:* Gunakan ukuran canvas yang wajar saat proses jepret (misal 800x600 per foto), dan baru lakukan scaling up saat proses penggabungan di akhir. Hapus memori canvas sementara jika sudah di-render ke master canvas.
- **Problem: Aspect Ratio Distortion.**
  - *Reasoning:* Bentuk video feed (16:9) mungkin berbeda dengan bentuk "lubang" pada frame (misal 1:1 atau 3:4). 
  - *Action:* Saat menggunakan `ctx.drawImage()`, agent harus menghitung metode *Crop / Object-fit: Cover* menggunakan parameter sumber dan tujuan agar foto terpotong proporsional, bukan memanjang (stretched).

---

## .Artifacts (Expected File Structure)

```text
📁 src/
 ├── 📁 components/
 │    ├── PasscodeUi.astro    (UI Input PIN)
 │    ├── Step1Setup.astro    (UI Pilihan Layout & Timer)
 │    ├── Step2Camera.astro   (UI Kamera & Hitung Mundur)
 │    ├── Step3Customize.astro(UI Hasil & Input Teks)
 │    ├── Step4Export.astro   (UI Download)
 │    └── NeoButton.astro     (Reusable button component dgn gaya Brutalist)
 ├── 📁 layouts/
 │    └── Layout.astro        (HTML Wrapper, Font Import, Tailwind Config)
 └── 📁 pages/
      ├── index.astro         (Halaman Proteksi/Security)
      └── booth.astro         (Main SPA, mengimpor semua Step Components)

📁 public/
 ├── 📁 frames/               (Folder berisi PNG transparan untuk frame)
 ├── 📁 sounds/               (Efek suara shutter kamera)
 └── config.json              (Opsional: Menyimpan data koordinat layout X/Y)
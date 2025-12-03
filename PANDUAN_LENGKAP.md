# 📖 PANDUAN LENGKAP INSTALASI & PENGGUNAAN

## 🎯 Langkah 1: Persiapan di Laptop

### A. Install Node.js (jika belum)
1. Download dari https://nodejs.org (pilih versi LTS)
2. Install dengan klik Next-Next-Finish
3. Buka CMD, cek instalasi:
   ```
   node -v
   npm -v
   ```

### B. Install Ngrok
1. Daftar di https://ngrok.com (gratis)
2. Login ke dashboard
3. Copy authtoken kamu
4. Download ngrok untuk Windows
5. Extract file `ngrok.exe`

## 🎯 Langkah 2: Setup di Laptop

1. **Copy semua file project ke folder `D:\Gateway WA`**

2. **Buka CMD di folder tersebut:**
   - Klik kanan di folder > "Open in Terminal" atau
   - Buka CMD, ketik: `cd /d "D:\Gateway WA"`

3. **Edit file `ngrok.bat`:**
   - Buka dengan Notepad
   - Ganti authtoken dengan punya kamu
   - Ganti domain dengan domain statis kamu (jika punya)
   - Save

4. **Install dependencies:**
   ```
   npm install
   ```

5. **Install PM2:**
   ```
   npm install -g pm2
   ```

## 🎯 Langkah 3: Jalankan Server

### Cara Termudah:
**Double-click file `start.bat`**

Server akan otomatis:
- Install dependencies (jika belum)
- Install PM2 (jika belum)
- Start server WhatsApp
- Start Ngrok tunnel
- Berjalan di background

### Cara Manual:
```bash
pm2 start server.js --name wa-gateway
pm2 start ngrok.bat --name wa-ngrok
pm2 save
```

## 🎯 Langkah 4: Akses Dashboard

1. Buka browser (Chrome/Firefox)
2. Akses: http://localhost:3000
3. Atau akses public: https://weariful-kandi-honourless.ngrok-free.dev

## 🎯 Langkah 5: Tambah Nomor WhatsApp

1. Di dashboard, isi form "Tambah Sesi Baru":
   - **Session ID:** `toko1` (huruf kecil, tanpa spasi)
   - **Nama Sesi:** `Toko Saya` (bebas, untuk identifikasi)

2. Klik tombol **"Buat Sesi"**

3. Tunggu 10-30 detik

4. Refresh halaman, akan muncul card sesi dengan status "Scan QR"

5. Klik tombol **"Lihat QR"**

6. **Scan QR Code dengan HP:**
   - Buka WhatsApp di HP
   - Tap titik tiga > Perangkat Tertaut
   - Tap "Tautkan Perangkat"
   - Scan QR Code di layar

7. Tunggu beberapa detik, status akan berubah jadi **"Terhubung"**

8. Selesai! Nomor sudah siap digunakan

## 🎯 Langkah 6: Test Kirim Pesan

### Dari Dashboard:
1. Di bagian "Kirim Pesan"
2. Pilih sesi yang sudah terhubung
3. Masukkan nomor tujuan (contoh: 628123456789)
4. Ketik pesan
5. Klik "Kirim"

### Dari API (Postman/cURL):
```bash
curl -X POST https://weariful-kandi-honourless.ngrok-free.dev/api/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: Centro212" \
  -d '{
    "sessionId": "toko1",
    "number": "628123456789",
    "message": "Test pesan dari WA Gateway"
  }'
```

## 🎯 Langkah 7: Pindah ke PC Server

1. **Copy seluruh folder `D:\Gateway WA` ke PC Server**

2. **Di PC Server, pastikan sudah install:**
   - Node.js
   - Chrome browser

3. **Buka CMD di folder project**

4. **Jalankan `start.bat`**

5. **PENTING:** Jangan logout WhatsApp dari HP!

6. Sesi akan otomatis tersimpan di folder `.wwebjs_auth`

7. Server akan langsung terhubung tanpa scan QR lagi

## 🛠️ Perintah Penting

### Menjalankan Server
```
start.bat
```
Atau double-click file `start.bat`

### Menghentikan Server
```
stop.bat
```
Atau double-click file `stop.bat`

### Melihat Status
```
status.bat
```
Atau manual: `pm2 status`

### Melihat Log
```
logs.bat
```
Atau manual: `pm2 logs wa-gateway`

### Restart Server
```
restart.bat
```
Atau manual: `pm2 restart all`

### Menghapus Semua Proses
```
pm2 delete all
```

## 🔧 Troubleshooting

### ❌ Error: "pm2 not found"
**Solusi:**
```
npm install -g pm2
```

### ❌ Error: "Cannot find module"
**Solusi:**
```
npm install
```

### ❌ QR Code tidak muncul
**Solusi:**
1. Tunggu 30 detik
2. Refresh halaman
3. Cek log: `pm2 logs wa-gateway`
4. Restart: `pm2 restart wa-gateway`

### ❌ Ngrok tidak connect
**Solusi:**
1. Cek authtoken di `ngrok.bat`
2. Cek log: `pm2 logs wa-ngrok`
3. Test manual: `ngrok http 3000`

### ❌ Pesan tidak terkirim
**Solusi:**
1. Pastikan sesi status "Terhubung"
2. Cek format nomor (628xxx, tanpa +)
3. Pastikan nomor terdaftar di WA
4. Cek log error

### ❌ Server mati setelah restart PC
**Solusi:**
PM2 sudah auto-save, tapi jika mati:
```
pm2 resurrect
```

Atau jalankan ulang `start.bat`

## 💡 Tips & Trik

### 1. Tambah Banyak Nomor
Ulangi proses "Tambah Sesi Baru" dengan Session ID berbeda:
- `toko1`, `toko2`, `toko3`, dst.
- `aqsha`, `frost`, `bisnis1`, dst.

### 2. Backup Sesi Login
Copy folder `.wwebjs_auth` ke tempat aman.
Jika install ulang, paste kembali folder ini.

### 3. Ganti API Key
Edit file `server.js`, cari baris:
```javascript
const API_KEY = "Centro212";
```
Ganti dengan password kamu.

### 4. Akses dari Luar (Internet)
Gunakan URL Ngrok:
```
https://weariful-kandi-honourless.ngrok-free.dev
```

### 5. Auto Start saat PC Nyala
Buat shortcut `start.bat` di folder Startup Windows:
- Tekan `Win + R`
- Ketik: `shell:startup`
- Copy shortcut `start.bat` ke sana

## 📱 Integrasi dengan Aplikasi Lain

### PHP
```php
<?php
$url = 'https://weariful-kandi-honourless.ngrok-free.dev/api/send';
$data = [
    'sessionId' => 'toko1',
    'number' => '628123456789',
    'message' => 'Halo dari PHP'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: Centro212'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
```

### Python
```python
import requests

url = 'https://weariful-kandi-honourless.ngrok-free.dev/api/send'
headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'Centro212'
}
data = {
    'sessionId': 'toko1',
    'number': '628123456789',
    'message': 'Halo dari Python'
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

### JavaScript (Node.js)
```javascript
const axios = require('axios');

axios.post('https://weariful-kandi-honourless.ngrok-free.dev/api/send', {
  sessionId: 'toko1',
  number: '628123456789',
  message: 'Halo dari Node.js'
}, {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'Centro212'
  }
})
.then(res => console.log(res.data))
.catch(err => console.error(err));
```

## 🎓 FAQ

**Q: Apakah gratis?**
A: Ya, semuanya gratis. Ngrok gratis punya limit bandwidth.

**Q: Bisa untuk berapa nomor?**
A: Unlimited, tergantung resource PC kamu.

**Q: Apakah aman?**
A: Ya, selama API Key tidak dibagikan ke orang lain.

**Q: Bisa kirim gambar/file?**
A: Versi ini baru support text. Bisa dikembangkan untuk media.

**Q: Kenapa harus pakai Ngrok?**
A: Agar bisa diakses dari internet. Alternatif: port forwarding router.

**Q: Bisa jalan 24/7?**
A: Ya, dengan PM2 server jalan di background terus.

**Q: Kalau PC restart?**
A: PM2 auto-restart. Atau tambahkan `start.bat` ke Startup.

---

**Selamat mencoba! 🚀**

Jika ada masalah, cek log dengan `pm2 logs wa-gateway`

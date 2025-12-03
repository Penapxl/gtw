# WhatsApp Gateway Multi-Device API

Server WhatsApp Gateway dengan dukungan multi-device, dashboard web, dan API REST yang mudah digunakan.

## 🚀 Fitur

- ✅ Multi-device support (bisa pakai banyak nomor WA)
- ✅ Dashboard web interaktif
- ✅ REST API untuk kirim pesan
- ✅ Real-time status update dengan Socket.IO
- ✅ QR Code scan langsung dari browser
- ✅ Log pesan otomatis
- ✅ Berjalan di background (PM2)
- ✅ Akses publik dengan Ngrok (gratis)

## 📋 Persyaratan

- Node.js (versi 14 atau lebih baru)
- NPM
- Ngrok account (gratis)
- Google Chrome (untuk WhatsApp Web)

## 🔧 Instalasi

1. **Download atau clone repository ini**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install PM2 (jika belum ada)**
   ```bash
   npm install -g pm2
   ```

4. **Setup Ngrok**
   - Daftar di https://ngrok.com (gratis)
   - Dapatkan authtoken dari dashboard
   - Edit file `ngrok.bat` dan masukkan authtoken kamu

## 🎯 Cara Menggunakan

### Menjalankan Server

**Cara Mudah (Recommended):**
- Double-click file `start.bat`
- Server akan otomatis berjalan di background

**Cara Manual:**
```bash
npm install
pm2 start server.js --name wa-gateway
pm2 start ngrok.bat --name wa-ngrok
pm2 save
```

### Menghentikan Server

- Double-click file `stop.bat`

Atau manual:
```bash
pm2 stop all
```

### Melihat Status

- Double-click file `status.bat`

### Melihat Log

- Double-click file `logs.bat`

## 🌐 Akses Dashboard

- **Local:** http://localhost:3000
- **Public:** https://weariful-kandi-honourless.ngrok-free.dev

## 📱 Cara Menambah Nomor WhatsApp

1. Buka dashboard di browser
2. Isi form "Tambah Sesi Baru":
   - Session ID: `toko1` (nama unik untuk identifikasi)
   - Nama Sesi: `Toko Saya` (nama yang mudah diingat)
3. Klik "Buat Sesi"
4. Tunggu beberapa detik, lalu klik "Lihat QR"
5. Scan QR Code dengan WhatsApp di HP kamu
6. Selesai! Nomor sudah terhubung

## 🔌 API Documentation

### Base URL
```
https://weariful-kandi-honourless.ngrok-free.dev
```

### Authentication
Semua request harus menyertakan API Key di header:
```
x-api-key: Centro212
```

### Endpoints

#### 1. Kirim Pesan
```http
POST /api/send
Content-Type: application/json
x-api-key: Centro212

{
  "sessionId": "toko1",
  "number": "628123456789",
  "message": "Halo, ini pesan dari WA Gateway!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "data": {
    "sessionId": "toko1",
    "number": "628123456789@c.us"
  }
}
```

#### 2. Lihat Semua Sesi
```http
GET /api/sessions
x-api-key: Centro212
```

#### 3. Ambil QR Code
```http
GET /api/qr/:sessionId
x-api-key: Centro212
```

#### 4. Buat Sesi Baru
```http
POST /api/session/create
Content-Type: application/json
x-api-key: Centro212

{
  "sessionId": "toko2",
  "sessionName": "Toko Cabang 2"
}
```

#### 5. Hapus Sesi
```http
DELETE /api/session/:sessionId
x-api-key: Centro212
```

#### 6. Lihat Log Pesan
```http
GET /api/logs?limit=50
x-api-key: Centro212
```

## 💡 Contoh Penggunaan

### Dengan cURL
```bash
curl -X POST https://weariful-kandi-honourless.ngrok-free.dev/api/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: Centro212" \
  -d '{
    "sessionId": "toko1",
    "number": "628123456789",
    "message": "Halo dari WA Gateway!"
  }'
```

### Dengan JavaScript (Fetch)
```javascript
fetch('https://weariful-kandi-honourless.ngrok-free.dev/api/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'Centro212'
  },
  body: JSON.stringify({
    sessionId: 'toko1',
    number: '628123456789',
    message: 'Halo dari WA Gateway!'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Dengan Python
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
    'message': 'Halo dari WA Gateway!'
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

## 🛠️ Troubleshooting

### Server tidak bisa diakses
- Pastikan PM2 berjalan: `pm2 status`
- Cek log error: `pm2 logs wa-gateway`

### QR Code tidak muncul
- Tunggu 10-30 detik setelah membuat sesi
- Refresh halaman dashboard
- Cek log: `pm2 logs wa-gateway`

### Ngrok tidak connect
- Pastikan authtoken sudah benar di `ngrok.bat`
- Cek status: `pm2 logs wa-ngrok`

### Pesan tidak terkirim
- Pastikan sesi dalam status "Terhubung"
- Cek nomor tujuan sudah benar (format: 628xxx)
- Pastikan nomor terdaftar di WhatsApp

## 📝 Catatan Penting

- Server harus tetap berjalan agar WhatsApp tetap terhubung
- Jangan logout WhatsApp dari HP saat server aktif
- Backup folder `.wwebjs_auth` untuk menyimpan sesi login
- Ngrok gratis memiliki limit bandwidth, upgrade jika perlu

## 🔒 Keamanan

- Ganti API Key di file `server.js` (variabel `API_KEY`)
- Jangan share API Key ke orang lain
- Gunakan HTTPS untuk production

## 📄 License

MIT License - Bebas digunakan untuk komersial

## 💰 Jual Layanan

Dashboard ini bisa kamu jual sebagai layanan WA Gateway! Fitur lengkap dan mudah digunakan.

---

**Dibuat dengan ❤️ untuk kemudahan bisnis digital**

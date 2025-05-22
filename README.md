# 📘 Assignment Tracker - Sistem Pengelolaan Tugas Akademik

Aplikasi web untuk memudahkan pengelolaan tugas antara pengajar (admin) dan mahasiswa. Admin bisa membuat dan menilai tugas, sedangkan mahasiswa bisa melihat, mengerjakan, dan mengumpulkan tugas secara langsung.

## 🚀 Fitur Utama

### 👩‍🏫 Untuk Pengajar (Admin)
- Membuat & menugaskan tugas
- Melihat statistik pengumpulan
- Menilai tugas & memberi feedback
- Kelola daftar mahasiswa

### 👨‍🎓 Untuk Mahasiswa
- Lihat daftar & deadline tugas
- Upload tugas (teks / file)
- Lihat nilai & feedback
- Pantau deadline

## 🛠️ Teknologi

### Backend
- Node.js + Express.js
- MongoDB (Atlas) + Mongoose
- JWT Auth
- Cloudinary (file storage)

### Frontend
- React.js + React Router
- Context API (state management)
- Tailwind CSS + Framer Motion
- Chart.js (visualisasi data)

### Infrastruktur
- Docker + docker-compose
- Vercel (opsional)

## ⚙️ Arsitektur

- **RESTful API** backend (Express + MongoDB)
- **SPA** frontend (React)
- **Dockerized** (Frontend: NGINX, Backend: Node.js)

## 🧪 Cara Menjalankan

1. Clone repo ini
2. Jalankan:
   ```bash
   docker-compose up
   ```
3. Akses via browser di: http://localhost

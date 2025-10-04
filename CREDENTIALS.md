# Kredensial Login untuk Testing

## 🔑 Akun Demo FunTeacher Private

Gunakan kredensial berikut untuk testing semua fitur aplikasi:

---

### 👨‍💼 Admin
**Email:** `admin@funteacher.com`  
**Password:** `Admin123!`  
**Role:** Admin

**Akses:**
- Dashboard admin dengan semua statistik
- Manajemen semua user (guru, siswa, orang tua)
- Verifikasi guru
- Monitoring transaksi dan pembayaran
- Laporan keuangan

---

### 👨‍🏫 Guru / Teacher
**Email:** `guru@funteacher.com`  
**Password:** `Guru123!`  
**Role:** Teacher

**Akses:**
- Dashboard guru
- Manajemen profil mengajar
- Jadwal dan ketersediaan
- Daftar siswa dan kelas
- Riwayat mengajar
- Penarikan saldo

---

### 🎓 Siswa / Student
**Email:** `siswa@funteacher.com`  
**Password:** `Siswa123!`  
**Role:** Student

**Akses:**
- Dashboard siswa
- Cari dan booking guru
- Jadwal les
- Materi pembelajaran
- Riwayat belajar
- Review dan rating guru

---

### 👨‍👩‍👧 Orang Tua / Parent
**Email:** `orangtua@funteacher.com`  
**Password:** `Parent123!`  
**Role:** Parent

**Akses:**
- Dashboard orang tua
- Manajemen profil anak
- Booking guru untuk anak
- Monitor progress belajar
- Riwayat pembayaran
- Komunikasi dengan guru

---

## 📝 Cara Membuat Akun Test

### Opsi 1: Signup Melalui Aplikasi (Recommended)
1. Buka halaman `/auth`
2. Klik tab "Daftar" atau "Sign Up"
3. Isi form dengan data:
   - Email: gunakan salah satu email di atas
   - Password: gunakan password yang sesuai
   - Nama Lengkap: terserah
   - Role: pilih role yang sesuai (admin/teacher/student/parent)
4. Klik "Daftar"
5. **PENTING**: Disable "Confirm Email" di Supabase untuk testing cepat

### Opsi 2: Manual via Supabase Dashboard
1. Buka [Supabase Dashboard - Users](https://supabase.com/dashboard/project/ehndglybcayryosyipet/auth/users)
2. Klik "Add User" → "Create new user"
3. Isi:
   - Email: `admin@funteacher.com`
   - Password: `Admin123!`
   - Auto Confirm User: ✅ AKTIFKAN
4. Setelah user dibuat, buka SQL Editor dan jalankan:

```sql
-- Untuk Admin
SELECT create_test_profile(
  'USER_ID_DARI_AUTH', 
  'Admin FunTeacher', 
  'admin'::user_role
);

-- Untuk Teacher
SELECT create_test_profile(
  'USER_ID_DARI_AUTH', 
  'Guru Matematika', 
  'teacher'::user_role
);

-- Untuk Student
SELECT create_test_profile(
  'USER_ID_DARI_AUTH', 
  'Siswa Belajar', 
  'student'::user_role
);

-- Untuk Parent
SELECT create_test_profile(
  'USER_ID_DARI_AUTH', 
  'Orang Tua Siswa', 
  'parent'::user_role
);
```

---

## 🚀 Cara Login

1. Buka aplikasi di halaman `/auth`
2. Pilih tab "Masuk" atau "Login"
3. Masukkan email dan password sesuai role yang ingin di-test
4. Klik tombol "Masuk"
5. Anda akan otomatis diarahkan ke dashboard sesuai role:
   - Admin → `/dashboard/admin`
   - Teacher → `/dashboard/guru`
   - Student → `/dashboard/siswa`
   - Parent → `/dashboard/orang-tua`

---

## ⚙️ Setting Supabase untuk Testing Cepat

Untuk mempercepat proses testing (tanpa perlu konfirmasi email):

1. Buka [Supabase Dashboard - Authentication](https://supabase.com/dashboard/project/ehndglybcayryosyipet/auth/providers)
2. Scroll ke bawah ke bagian "Auth Providers"
3. Klik "Email"
4. **Matikan** opsi "Confirm email"
5. Klik "Save"

---

## 🔐 Keamanan

⚠️ **PENTING**: Kredensial ini HANYA untuk testing/development!

Untuk production:
- Ganti semua password dengan password yang kuat
- Aktifkan email confirmation
- Implement 2FA jika memungkinkan
- Gunakan password manager
- Jangan share kredensial production

---

## 🐛 Troubleshooting

### Error: "Email not confirmed"
**Solusi:** Disable "Confirm email" di Supabase Authentication settings

### Error: "Invalid login credentials"
**Solusi:** 
1. Pastikan user sudah dibuat di Supabase Auth
2. Pastikan password benar (case-sensitive)
3. Cek di Supabase Dashboard apakah user ada

### User berhasil login tapi tidak ada profile/role
**Solusi:**
1. Cek tabel `profiles` di database
2. Jalankan function `create_test_profile` dengan user_id yang benar
3. Pastikan trigger `handle_new_user` aktif

### Tidak bisa akses fitur tertentu
**Solusi:**
1. Pastikan role sudah benar di tabel `profiles`
2. Cek RLS policies di Supabase
3. Logout dan login ulang

---

## 📚 Resources

- [Supabase Dashboard](https://supabase.com/dashboard/project/ehndglybcayryosyipet)
- [Supabase Auth Users](https://supabase.com/dashboard/project/ehndglybcayryosyipet/auth/users)
- [Supabase SQL Editor](https://supabase.com/dashboard/project/ehndglybcayryosyipet/sql/new)
- [Application Auth Page](https://preview--les-pintar-hub.lovable.app/auth)

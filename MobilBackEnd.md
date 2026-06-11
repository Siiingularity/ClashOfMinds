# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

Bu dokümanda, **ClashMobile** mobil uygulamasının **Clash of Minds REST API** ile haberleşmesini sağlayan backend entegrasyon görevleri listelenmektedir. Her üye, kendisine ait mobil backend bağlantılarını, API isteklerini, token yönetimini, hata kontrolünü ve kanıt videosunu kendi görev dosyasında göstermelidir.

**REST API Adresi:** `https://clashofminds-production.up.railway.app/api`

---

## Grup Üyelerinin Mobil Backend Görevleri

1. [Abdelrahman Zidan'ın Mobil Backend Görevleri](Abdelrahman%20Zidan/Abdelrahman-Zidan-Mobil-Backend-Gorevleri.md)

---

## Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması
- **Base URL:** `https://clashofminds-production.up.railway.app/api`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` gerekli endpointlerde kullanılır.
- Tüm API istekleri mobil uygulamada tek servis dosyası üzerinden yönetilir.

### 2. Authentication Yönetimi
- Kullanıcı girişi JWT token ile yapılır.
- Login başarılı olduğunda token mobil cihazda saklanır.
- Yetki gerektiren endpointlerde token `Authorization` header içinde gönderilir.
- Logout işleminde token temizlenir ve kullanıcı giriş ekranına yönlendirilir.

### 3. OTP ile Kayıt Yönetimi
- Kullanıcı kayıt işlemi telefon OTP doğrulaması ile tamamlanır.
- Kayıt başlatma, OTP doğrulama ve OTP yeniden gönderme işlemleri mobil uygulamadan REST API'ye bağlanır.
- Kanıt videosunda OTP sürecinin mobil uygulamadan başlatıldığı ve backend cevabının ekrana yansıdığı gösterilmelidir.

### 4. Veri Çekme ve Listeleme
- Kategoriler, bölümler, sorular, kullanıcı bilgileri, oyun istatistikleri ve mağaza ürünleri REST API üzerinden alınır.
- Mobil uygulamada backend'den gelen verilerin ekranda listelendiği açık şekilde gösterilmelidir.

### 5. Oyun İşlemleri
- Oyun oturumu oluşturma, skor güncelleme, soru kaydetme ve oyun bitirme işlemleri mobil uygulamadan backend'e gönderilir.
- Kanıt videosunda mobil uygulamadan yapılan işlemin backend loglarında veya API cevabında başarılı olduğu gösterilmelidir.

### 6. Error Handling
- Hatalı login, eksik bilgi, yetkisiz istek veya bağlantı hatalarında kullanıcıya anlaşılır hata mesajı gösterilir.
- Backend'den dönen `success`, `message`, `data` ve `errors` yapıları mobil uygulamada uygun şekilde işlenir.

### 7. Loading States
- API isteği başlatıldığında kullanıcıya loading durumu gösterilir.
- Başarılı ve başarısız işlemlerden sonra mobil ekranda uygun mesajlar gösterilir.

### 8. Kanıt Videosu Kuralları
- Video gerçek cihazda veya simülatörde çekilmelidir.
- Videoda önce gereksinim adı söylenmelidir.
- Mobil uygulamadan REST API'ye isteğin gittiği ve işlemin gerçekleştiği net görünmelidir.
- Login, kategori listeleme, oyun oluşturma, skor güncelleme ve profil/dashboard verilerinden en az biri gösterilmelidir.


# Video Sunum

Bu bölümde **abdelrahman ahmad radwan zidan** tarafından yapılan mobil uygulama, REST API bağlantıları, bireysel teknoloji kanıt videoları ve final proje sunum videosu yer alır.

> Kanıt videolarında kendi sesim duyulacaktır. Her videoda önce gereksinim adı söylenecek, sonra uygulama üzerinde kanıt gösterilecektir.
>
> Projenin çalışır son hali `main/master` branch üzerinde yer alacaktır.

---

## Öğrenci Bilgisi

- **Ad Soyad:** abdelrahman ahmad radwan zidan
- **Proje Adı:** Clash of Minds
- **Mobil Uygulama:** ClashMobile
- **Web Proje:** clashofminds.net
- **Backend API:** Railway üzerinde çalışan REST API
- **Repo:** `Siiingularity/ClashOfMinds`
- **Mobil klasör:** `ClashMobile/`

---

## Mobil Front-End Kanıt Videosu

- **Gereksinim:** Mobile Front-End
- **Durum:** Yapıldı.
- **Kanıt Videosu:** [Link buraya eklenecek](https://example.com)

### Mobil Front-End Kapsamı

Mobil uygulama React Native + Expo ile hazırlanmıştır. Web sitesindeki temel oyun akışı mobil ekrana taşınmıştır.

#### Uygulamada Bulunan Ekranlar ve Özellikler

1. **Landing / Ana Sayfa**
   - Uygulama giriş ekranı.
   - Kullanıcıyı karşılayan ana sayfa.
   - Oyuna başlama, kategoriler, mağaza, nasıl oynanır ve hesap bölümlerine geçiş.

2. **Auth / Giriş ve Kayıt Ekranı**
   - Kullanıcı girişi.
   - Yeni kullanıcı kaydı.
   - Telefon doğrulama / OTP mantığı.
   - JWT token saklama.
   - Giriş yapan kullanıcının oturum bilgisinin korunması.

3. **Category Selection / Kategori Seçimi**
   - Oyun için kategori seçme ekranı.
   - Kategori kartları ve kategori görselleri.
   - En fazla 6 kategori seçme kuralı.
   - Bölümlere göre kategori listeleme.

4. **Game Setup / Oyun Kurulum Ekranı**
   - Takım 1 ve Takım 2 isimlerini belirleme.
   - Cevap süresi seçme: 30, 45, 60, 90, 120 saniye.
   - Her takım için power-up seçimi.
   - Her takımın en fazla 3 power-up seçmesi.

5. **Game Screen / Oyun Ekranı**
   - Seçilen kategorilerden oluşan oyun tahtası.
   - 200, 400 ve 600 puanlık soru kartları.
   - Soru açma modalı.
   - Soru görseli ve cevap görseli gösterimi.
   - Geri sayım sayacı.
   - Cevabı gösterme.
   - Doğru cevapta skor güncelleme.
   - Takım sırası değiştirme.
   - Sorulan soruların tekrar seçilememesi.

6. **Power-Up Sistemi**
   - Double Points / Çift Puan.
   - Block Team / Rakibi Engelle.
   - Call a Friend / Arkadaşını Ara, 30 saniyelik sayaç.
   - No Word / Kelime Yok, 60 saniyelik anlatım süresi.
   - Extra Time / Ek Süre, +30 saniye.
   - Steal Points / Puan Çalma.

7. **Result Screen / Sonuç Ekranı**
   - Oyun bitiş ekranı.
   - Takım skor karşılaştırması.
   - Kazanan takımın gösterilmesi.

8. **Account / Hesap Ekranı**
   - Kullanıcı profil bilgileri.
   - Oyun istatistikleri.
   - Hesap bilgilerinin gösterilmesi.

9. **How to Play / Nasıl Oynanır Ekranı**
   - Oyun kurallarının mobilde gösterilmesi.
   - Kategori seçimi, takım kurulumu, soru seçimi ve power-up açıklamaları.

10. **Categories / Kategoriler Ekranı**
    - Tüm kategorileri görüntüleme.
    - Kategori isimleri, görselleri ve soru sayıları.

11. **Store / Mağaza Ekranı**
    - Oyun paketleri / ürünlerin gösterilmesi.
    - Mağaza tasarımının mobil arayüze taşınması.

12. **Dashboard / Admin Panel Ekranı**
    - Admin / editor rolüne özel panel.
    - İstatistik ve yönetim bilgilerinin mobilde gösterilmesi.

13. **Drawing / Çizim Oyunu Ekranı**
    - QR mantığı ile çizim oyununa geçiş.
    - Çizim oyununa özel mobil ekran.

14. **Dil Desteği**
    - Arapça ve İngilizce içerik desteği.
    - Dil durumunun hook ile yönetilmesi.

15. **Mobil Tasarım ve Kullanılabilirlik**
    - React Navigation ile ekran geçişleri.
    - Mobil uyumlu kart yapıları.
    - Görsel destekli kategori ve soru ekranları.
    - Loading, hata ve boş veri durumları.

---

## Mobil Back-End / REST API Kanıt Videosu

- **Gereksinim:** Mobile Back-End / REST API Bağlantısı
- **Durum:** Yapıldı.
- **Kanıt Videosu:** [Link buraya eklenecek](https://example.com)

### REST API Bağlantısı Kapsamı

Mobil uygulama, mevcut Clash of Minds backend API ile bağlantılı çalışacak şekilde hazırlanmıştır.

#### Kullanılan API Alanları

1. **Auth API**
   - Kullanıcı girişi.
   - Kullanıcı kaydı.
   - OTP / telefon doğrulama.
   - Profil bilgisi alma.
   - JWT token ile oturum yönetimi.

2. **Categories API**
   - Tüm kategorileri listeleme.
   - Kategorileri bölümlere göre alma.
   - Kategori görsellerini mobilde gösterme.

3. **Questions API**
   - Kategoriye göre soruları alma.
   - 200, 400 ve 600 puanlık soruları oyun tahtasına yerleştirme.
   - Soru metni, cevap metni, soru görseli ve cevap görselini alma.

4. **Games API**
   - Oyun oturumu oluşturma.
   - Takım isimleriyle yeni oyun başlatma.
   - Skor güncelleme.
   - Cevaplanan soruları kaydetme.
   - Oyunu bitirme.

5. **Users API**
   - Kullanıcı istatistikleri.
   - Liderlik tablosu / leaderboard.
   - Hesap bilgileri.

6. **Store API**
   - Mağaza ürünlerini listeleme.
   - Oyun paketleri veya satın alma öğelerini mobilde gösterme.

7. **Storage / Token Yönetimi**
   - AsyncStorage ile kullanıcı token bilgisini saklama.
   - Oturum açıldıktan sonra kullanıcının giriş bilgisini koruma.
   - Çıkış yapıldığında token bilgisini temizleme.

### Back-End Kanıt Videosunda Gösterilecekler

Videoda aşağıdaki akış gösterilecektir:

1. Mobil uygulama açılır.
2. Kullanıcı giriş veya kayıt işlemi yapılır.
3. Mobil uygulamadan REST API’ye istek gittiği gösterilir.
4. Backend terminalinde veya network log kısmında isteğin geldiği gösterilir.
5. API cevabı başarılı şekilde mobil uygulamaya döner.
6. Kategoriler veya oyun verileri mobil uygulamada görünür.

---

## Bireysel Teknoloji Videoları

### abdelrahman ahmad radwan zidan

- **RabbitMQ / Kafka:** RabbitMQ / STOMP WebSocket bağlantısı oyun içi gerçek zamanlı event akışı için kullanılır. Mobil uygulamada skor güncelleme, soru cevaplama, sıra değişimi, power-up kullanımı ve oyun bitiş eventleri desteklenir. [Link buraya eklenecek](https://example.com)

- **Redis / Memcached:** Redis cache backend tarafında kategori listesi, kategoriye göre sorular, leaderboard ve bazı oturum işlemleri için kullanılır. Kategori ve soru okuma işlemlerinde cache HIT / SET mantığı gösterilecektir. [Link buraya eklenecek](https://example.com)

- **Docker + CI/CD:** Dockerfile ve docker-compose ile backend, MySQL, Redis ve RabbitMQ servisleri çalıştırılabilir. GitHub Actions ile CI/CD süreci ve EAS Build üzerinden mobil APK üretimi desteklenir. [Link buraya eklenecek](https://example.com)

---

## RabbitMQ / Kafka Özelliği

- Mobil uygulama `gameSocket` servisi ile gerçek zamanlı oyun eventlerini dinlemek için hazırlanmıştır.
- RabbitMQ WebSocket / STOMP bağlantısı oyun oturumuna göre açılır.
- Oyun sırasında aşağıdaki eventler desteklenir:
  - `SCORE_UPDATE`
  - `QUESTION_ANSWERED`
  - `TURN_CHANGE`
  - `POWERUP_ACTIVATED`
  - `GAME_ENDED`

### Kanıt Videosunda Gösterilecekler

1. RabbitMQ servisi çalıştırılır.
2. Mobil uygulamada oyun başlatılır.
3. Skor veya oyun eventlerinden biri tetiklenir.
4. RabbitMQ / WebSocket üzerinden event akışı gösterilir.

---

## Redis / Memcached Özelliği

- Redis backend tarafında performans için cache sistemi olarak kullanılır.
- Kategoriler, sorular ve leaderboard verileri cache üzerinden hızlı şekilde sunulur.
- Yazma / güncelleme işlemlerinden sonra ilgili cache temizlenebilir.

### Cache Kullanılan Örnek Endpointler

- `GET /api/categories`
- `GET /api/questions/category/:id`
- `GET /api/users/leaderboard`
- Logout / token blacklist işlemleri

### Kanıt Videosunda Gösterilecekler

1. Redis servisi çalıştırılır.
2. Aynı API isteği iki kez gönderilir.
3. İlk istekte veri API / database tarafından alınır.
4. İkinci istekte Redis cache üzerinden hızlı cevap geldiği gösterilir.

---

## Docker + CI/CD Özelliği

- Projede Dockerfile bulunmaktadır.
- `docker-compose.yml` ile çoklu servis yapısı hazırlanmıştır.
- Docker yapısı backend, MySQL, Redis ve RabbitMQ servislerini kapsar.
- GitHub Actions workflow ile otomatik kontrol / build süreci desteklenir.
- EAS Build ile Android APK üretimi yapılabilir.

### Docker Servisleri

| Servis | Amaç |
|---|---|
| Backend | Node.js / Express REST API |
| MySQL | Veritabanı |
| Redis | Cache sistemi |
| RabbitMQ | Gerçek zamanlı mesajlaşma / event sistemi |

### CI/CD Kanıt Videosunda Gösterilecekler

1. `docker compose up` komutu çalıştırılır.
2. Servislerin ayağa kalktığı gösterilir.
3. Backend API health veya örnek endpoint test edilir.
4. GitHub Actions workflow dosyası gösterilir.
5. EAS Build / Android APK süreci gösterilir.

---

## Final Proje Sunum Videosu

- **Tam Demo:** [Link buraya eklenecek](https://example.com)

### Final Sunum İçeriği

Final sunum videosunda aşağıdaki bölümler gösterilecektir:

1. Projenin kısa tanıtımı.
2. Clash of Minds oyun mantığı.
3. Web uygulamasındaki özelliklerin mobil uygulamaya taşınması.
4. Mobil front-end ekranları.
5. Mobil back-end / REST API bağlantıları.
6. Giriş, kayıt ve OTP akışı.
7. Kategori seçimi.
8. Takım kurulumu.
9. Power-up seçimi.
10. Oyun ekranı ve soru akışı.
11. Skor güncelleme ve oyun sonucu.
12. Store / mağaza ekranı.
13. Account / kullanıcı hesabı ekranı.
14. Dashboard / admin ekranı.
15. Drawing / çizim oyunu ekranı.
16. RabbitMQ / WebSocket event yapısı.
17. Redis cache yapısı.
18. Docker + CI/CD yapısı.
19. GitHub repo ve `main/master` branch üzerindeki son çalışan sürüm.
20. Gerçek cihaz veya simülatör üzerinde uygulamanın çalışması.

---

## Kanıt Videosu Konuşma Metni Örneği

### Mobile Front-End

> Requirement Name: Mobile Front-End.  
> Ben abdelrahman ahmad radwan zidan. Bu videoda Clash of Minds mobil uygulamasında hazırladığım front-end ekranlarını gerçek cihaz üzerinde gösteriyorum. Ana sayfa, giriş-kayıt ekranı, kategori seçimi, oyun kurulumu, oyun ekranı, sonuç ekranı, mağaza, hesap, dashboard ve çizim ekranı çalışmaktadır.

### Mobile Back-End

> Requirement Name: Mobile Back-End / REST API.  
> Ben abdelrahman ahmad radwan zidan. Bu videoda mobil uygulamadan REST API’ye istek gönderildiğini ve işlemin başarılı şekilde gerçekleştiğini gösteriyorum. Mobil uygulama üzerinden giriş, kategori listeleme, soru çekme ve oyun oluşturma işlemlerini göstereceğim.

### RabbitMQ / Kafka

> Requirement Name: RabbitMQ / Kafka.  
> Ben abdelrahman ahmad radwan zidan. Bu videoda oyun içi eventlerin RabbitMQ / WebSocket mantığıyla iletilmesini gösteriyorum.

### Redis / Memcached

> Requirement Name: Redis / Memcached.  
> Ben abdelrahman ahmad radwan zidan. Bu videoda kategori, soru ve leaderboard verilerinin Redis cache ile sunulduğunu gösteriyorum.

### Docker + CI/CD

> Requirement Name: Docker + CI/CD.  
> Ben abdelrahman ahmad radwan zidan. Bu videoda Docker Compose ile servisleri çalıştırmayı ve GitHub Actions / EAS Build sürecini gösteriyorum.

---

## Teslim Kontrol Listesi

- [ ] Mobil uygulama `ClashMobile/` klasöründe repoya yüklendi.
- [ ] Son çalışan sürüm `main/master` branch üzerinde.
- [ ] Mobile Front-End kanıt videosu eklendi.
- [ ] Mobile Back-End / REST API kanıt videosu eklendi.
- [ ] RabbitMQ / Kafka kanıt videosu eklendi veya kullanılmadıysa belirtildi.
- [ ] Redis / Memcached kanıt videosu eklendi veya kullanılmadıysa belirtildi.
- [ ] Docker + CI/CD kanıt videosu eklendi veya kullanılmadıysa belirtildi.
- [ ] Final proje sunum videosu eklendi.
- [ ] Videolarda kendi sesim var.
- [ ] Her videoda önce gereksinim adı söyleniyor.
- [ ] Mobil uygulamadan REST API’ye istek gittiği net şekilde gösteriliyor.

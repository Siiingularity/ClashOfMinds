# Clash of Minds Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [https://clashofminds.net/](https://clashofminds.net/)

**Front-end Test Videosu:** [https://www.youtube.com/watch?v=_yuPRO0GsEk](https://www.youtube.com/watch?v=_yuPRO0GsEk)


Bu dokümanda, Clash of Minds web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir.


---

## Genel Web Frontend Prensipleri

### 1. Responsive Tasarım
- **Mobile-First Approach:** Tasarımlar mobil cihazlardan başlanarak tablet ve masaüstü ekranlara uyumlu şekilde geliştirilmelidir.
- **Breakpoints:**
  - Mobile: `< 640px`
  - Tablet: `640px – 1024px`
  - Desktop: `> 1024px`
- **Flexible Layouts:** Sayfa yapılarında Flexbox ve Grid sistemleri kullanılmalıdır. Oyun kartları, kategori alanları, skor panelleri ve modal yapıları tüm ekran boyutlarına uyum sağlamalıdır.
- **Touch-Friendly:** Mobil kullanım için butonlar, kartlar ve tıklanabilir alanlar yeterince büyük ve rahat kullanılabilir olmalıdır.
- **Game Board Layout:** Oyun tahtasında kategoriler 3 üstte ve 3 altta olacak şekilde düzenlenmelidir.
- **Category Card Ratio:** Kategori görselleri dikey kart formatına uygun şekilde yaklaşık `9:16` oranında gösterilmelidir.

### 2. Tasarım Sistemi
- **CSS Framework:** Tutarlı ve hızlı stil geliştirme için Tailwind CSS kullanılmalıdır.
- **Renk Sistemi:** Zorluk seviyeleri ve oyun durumları görsel olarak net şekilde ayrılmalıdır:
  - Yeşil: `200 puan` sorular
  - Mavi: `400 puan` sorular
  - Kahverengi: `600 puan` sorular
  - Kırmızı: Hata, yanlış cevap, uyarı işlemleri
  - Gri: Pasif veya tamamlanmış alanlar
- **Tipografi:** Başlıklar, kategori isimleri, soru metinleri ve skor alanlarında okunabilir ve tutarlı bir yazı sistemi kullanılmalıdır.
- **Spacing:** Tüm sayfalarda tutarlı padding, margin ve gap değerleri kullanılmalıdır.
- **Component Library:** Tekrar kullanılabilir ortak UI bileşenleri oluşturulmalıdır:
  - `Navbar`
  - `Footer`
  - `CategoryCard`
  - `GameBoard`
  - `QuestionModal`
  - `PowerUpPanel`
  - `ScoreBoard`
  - `Timer`
  - `LoadingSpinner`
  - `ErrorMessage`
  - `ProtectedRoute`

### 3. Performans Optimizasyonu
- **Build Tool:** Hızlı geliştirme ve optimize edilmiş üretim çıktısı için Vite kullanılmalıdır.
- **Minification:** CSS ve JavaScript dosyaları production build aşamasında otomatik olarak küçültülmelidir.
- **Tree Shaking:** Kullanılmayan kodlar build aşamasında temizlenmelidir.
- **Code Splitting:** Sayfalar ve büyük bileşenler gerektiğinde lazy loading ile yüklenmelidir.
- **Image Optimization:** Kategori görselleri, logo ve diğer medya dosyaları optimize edilmelidir.

### 4. Erişilebilirlik (Accessibility)
- **Semantic HTML:** `<main>`, `<nav>`, `<section>`, `<button>`, `<form>`, `<label>` gibi semantik etiketler doğru şekilde kullanılmalıdır.
- **Focus States:** Tüm butonlar ve etkileşimli alanlar görünür focus durumuna sahip olmalıdır.
- **Color Contrast:** Yazılar ile arka plan arasında yeterli kontrast sağlanmalıdır.
- **Feedback States:** Kullanıcı doğru cevap, yanlış cevap, sıra değişimi ve işlem sonuçlarını net şekilde görebilmelidir.
- **Modal Accessibility:** Soru modalları klavye ile kullanılabilir ve kapatılabilir olmalıdır.

### 5. State Management
- **Global State:** Oyunla ilgili ortak veriler merkezi olarak yönetilmelidir:
  - Aktif oyun bilgisi
  - Takım isimleri
  - Skorlar
  - Sıra bilgisi
  - Seçilen kategoriler
  - Kullanılan power-up durumları
- **Local State:** Sayfa veya bileşen bazlı durumlar lokal olarak tutulmalıdır:
  - Modal açma/kapatma
  - Seçilen soru
  - Geri sayım sayacı
  - Uyarı mesajları
- **Side Effects:** API çağrıları ve veri yükleme işlemleri uygun lifecycle yapıları ile yönetilmelidir.
- **Token Storage:** Kullanıcı giriş sistemi varsa token bilgileri güvenli şekilde saklanmalı ve yönetilmelidir.

### 6. Routing ve Navigasyon
- **Client-Side Routing:** Sayfalar arası geçişler React Router ile sağlanmalıdır.
- **Temel Sayfalar:**
  - `/` → Ana sayfa
  - `/create-game` → Oyun oluşturma
  - `/category-selection` → Kategori seçimi
  - `/game-setup` → Takım ve power-up ayarları
  - `/game/:id` → Oyun ekranı
  - `/how-to-play` → Nasıl oynanır sayfası
  - `/login` → Kullanıcı girişi
  - `/admin` → Admin paneli
- **Protected Routes:** Giriş gerektiren alanlar korumalı route yapısı ile korunmalıdır.
- **404 Handling:** Tanımsız sayfalar için özel yönlendirme veya hata sayfası olmalıdır.

### 7. API Entegrasyonu
- **HTTP Client:** Backend ile iletişim için merkezi bir HTTP istemcisi kullanılmalıdır.
- **Base URL:** API adresi ortam değişkenleri ile yönetilmelidir.
- **Request Interceptors:** Gerekli durumlarda token otomatik olarak request header içine eklenmelidir.
- **Response Interceptors:** Hatalı oturum veya yetkisiz erişim durumlarında kullanıcı uygun şekilde yönlendirilmelidir.
- **Modüler API Katmanı:** API işlemleri modüllere ayrılmalıdır:
  - `authApi.js`
  - `gameApi.js`
  - `categoryApi.js`
  - `questionApi.js`
  - `powerUpApi.js`
  - `adminApi.js`
- **Error Handling:** API hataları kullanıcıya anlaşılır biçimde gösterilmelidir.

### 8. Oyun Arayüzü Kuralları
- **Create Game Flow:** Kullanıcı oyun oluştururken önce kategorileri seçmeli, ardından game setup ekranına geçmelidir.
- **Random Category Option:** Kategori seçim ekranında rastgele kategori seçme özelliği bulunmalıdır.
- **Team Visibility:** Her takımın kendi power-up alanı ayrı ve net biçimde görünmelidir.
- **Question Screen Visibility:** Power-up’lar soru ekranında da görünmelidir.
- **Call a Friend Rule:** Bu yardım sadece soru açıldığında görünmelidir, ana oyun tahtasında görünmemelidir.
- **Score Display:** Takım skorları oyun boyunca görünür olmalıdır.
- **Turn Logic UI:** Hangi takımın sırası olduğu arayüzde açıkça belirtilmelidir.

### 9. Oyun Yapısı ve Bileşen Davranışları
- **Kategori Sistemi:** Her takım oyun başlamadan önce 3 kategori seçmelidir.
- **Soru Dağılımı:** Her kategoride toplam 6 soru bulunmalıdır:
  - 2 adet 200 puan
  - 2 adet 400 puan
  - 2 adet 600 puan
- **Question Modal:** Soru açıldığında soru metni, varsa görsel, süre ve yardım araçları görünmelidir.
- **Answer Result States:** Sorudan sonra doğru veya yanlış cevap sonucu net olarak yansıtılmalıdır.
- **Power-Ups:**
  - `Block`: Rakip takımın o tur cevap vermesini engeller
  - `Double`: Sorunun puanını iki katına çıkarır
  - `Steal`: Rakip yanlış cevap verirse soruyu çalma hakkı verir

### 10. Özel Oyun Özellikleri
- **Draw Category:** Çizim kategorisi için QR kod ile mobil cihazda ayrı çizim ekranı açılmalıdır.
- **Drawing Flow:** Oyuncu mobil cihazda çizim yapmalı, çizim ana oyun ekranına aktarılmalı ve diğer takım tahmin yapmalıdır.
- **Image Support:** Sorular ve cevaplar gerektiğinde görseller ile desteklenebilmelidir.

### 11. Browser Compatibility
- **Modern Browsers:** Chrome, Firefox, Safari ve Edge’in güncel sürümleri desteklenmelidir.
- **Responsive Testing:** Mobil, tablet ve masaüstü tarayıcılarda görünüm test edilmelidir.
- **Cross-Browser Styling:** Stil farklılıkları en aza indirilmelidir.

### 12. Build ve Deployment
- **Build Tool:** Vite kullanılmalıdır.
- **Module System:** ES Modules yapısı tercih edilmelidir.
- **Environment Variables:** API adresi ve benzeri ayarlar `.env` dosyaları üzerinden yönetilmelidir.
- **CI/CD:** GitHub push işlemlerinden sonra otomatik deployment yapılmalıdır.
- **Hosting:** Frontend uygulaması Vercel üzerinde barındırılmalıdır.
- **Preview Deployments:** Branch bazlı preview deployment desteği sağlanmalıdır.

### 13. Admin Panel Frontend Gereksinimleri
- **Admin Dashboard:** Admin paneli üzerinden aşağıdaki alanlar yönetilebilmelidir:
  - Kategoriler
  - Sorular
  - Soru puanları
  - Görseller
  - Mağaza ürünleri
  - Site logo ve diğer medya içerikleri
- **Editable Content:** Admin, frontend üzerinde görünen içeriklerin büyük kısmını panel üzerinden değiştirebilmelidir.
- **Question Management UI:** Sorular ekleme, düzenleme, silme işlemleri kolay ve düzenli bir arayüzle yapılmalıdır.

### 14. Görsel ve İçerik Düzenlemeleri
- **Logo Size:** Ana sayfadaki logo yaklaşık `%30` küçültülmelidir.
- **How to Play Page:** Bu sayfadaki logo ve içerik düzeni oyun temasına daha uygun hale getirilmelidir.
- **Category Selection UI:** Kategori seçme ekranı daha akıcı ve görsel olarak net olmalıdır.
- **Game Setup UI:** Kategori seçimi tamamlandıktan sonra gelen setup ekranı sade ve anlaşılır olmalıdır.

---

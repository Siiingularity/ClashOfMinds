# Clash of Minds Web Frontend Görevleri
**Front-end Test Videosu:** [(https://www.youtube.com/watch?v=_yuPRO0GsEk)](https://www.youtube.com/watch?v=_yuPRO0GsEk)

**Front-end link adresi:** [(https://www.clashofminds.net/)](https://www.clashofminds.net/)


## 1. Ana Sayfa
- **Görev:** Kullanıcının siteye giriş yaptığı ilk ekranın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Responsive ana sayfa yapısı
  - Navbar
  - Logo alanı
  - "Create Game" butonu
  - "How to Play" butonu veya yönlendirme alanı
  - Oyun tanıtım bölümü
  - Kategori veya özellik tanıtım kartları
  - Footer
- **Kullanıcı Deneyimi:**
  - Temiz ve anlaşılır giriş ekranı
  - Kullanıcının hızlı şekilde oyun oluşturma akışına geçebilmesi
  - Mobil ve desktop uyumlu görünüm
- **Teknik Detaylar:**
  - Responsive layout
  - Reusable component yapısı
  - Gerekirse route yönlendirmeleri

## 2. Kullanıcı Kayıt Sayfası
- **API Endpoint:** `POST /api/auth/register`
- **Görev:** Yeni kullanıcı kayıt ekranının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Ad input alanı
  - Kullanıcı adı input alanı
  - Email input alanı
  - Şifre input alanı
  - "Kayıt Ol" butonu
  - "Zaten hesabın var mı? Giriş Yap" linki
  - Loading spinner
  - Hata mesaj alanı
- **Form Validasyonu:**
  - Zorunlu alan kontrolü
  - Email format kontrolü
  - Şifre minimum karakter kontrolü
  - Geçersiz form durumunda buton disabled
- **Kullanıcı Deneyimi:**
  - Başarılı kayıt sonrası login veya dashboard sayfasına yönlendirme
  - Hataların kullanıcı dostu biçimde gösterilmesi
- **Teknik Detaylar:**
  - API bağlantısı
  - Token veya user state yönetimi
  - Form state kontrolü

## 3. Kullanıcı Giriş Sayfası
- **API Endpoint:** `POST /api/auth/login`
- **Görev:** Kullanıcının giriş yapabildiği sayfanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Email veya kullanıcı adı input alanı
  - Şifre input alanı
  - "Giriş Yap" butonu
  - "Hesabın yok mu? Kayıt Ol" linki
  - Şifre göster/gizle butonu
  - Loading spinner
- **Form Validasyonu:**
  - Boş alan kontrolü
  - Geçerli input olmadan submit engeli
- **Kullanıcı Deneyimi:**
  - Başarılı giriş sonrası uygun sayfaya yönlendirme
  - Yanlış girişte net hata mesajı
- **Teknik Detaylar:**
  - JWT veya session yönetimi
  - LocalStorage veya cookie kullanımı
  - Auth guard yapısı

## 4. Kategori Seçim Sayfası
- **API Endpoint:** `GET /api/categories`
- **Görev:** Kullanıcının oyun için kategori seçtiği sayfanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Kategori kartları
  - Kategori görselleri
  - Seçim göstergesi
  - "Random Category Selection" butonu
  - "Devam Et" butonu
- **Kullanıcı Deneyimi:**
  - Kullanıcının kategori seçimini kolay yapabilmesi
  - Seçili kategori sayısının görünmesi
  - Rastgele kategori seçim desteği
- **Teknik Detaylar:**
  - API’den kategori verilerinin çekilmesi
  - Selected category state yönetimi
  - Maksimum kategori seçim kuralı kontrolü

## 5. Oyun Kurulum Sayfası
- **API Endpoint:** `POST /api/game/create`
- **Görev:** Takım isimleri, seçili kategoriler ve power-up seçimlerinin yapıldığı sayfanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Takım 1 isim input alanı
  - Takım 2 isim input alanı
  - Seçilen kategorilerin listesi
  - Power-up seçim alanı
  - "Start Game" butonu
- **Form Validasyonu:**
  - Takım isimleri boş olamaz
  - Gerekli seçimler tamamlanmadan oyun başlatılamaz
- **Kullanıcı Deneyimi:**
  - Adım adım anlaşılır setup akışı
  - Eksik alanlarda kullanıcıya yönlendirici hata mesajları
- **Teknik Detaylar:**
  - Setup state yönetimi
  - Game creation request
  - Başarılı oluşturma sonrası oyun ekranına yönlendirme

## 6. Oyun Tahtası Sayfası
- **API Endpoint:** `GET /api/game/{id}`, `GET /api/questions`
- **Görev:** Aktif oyunun ana ekranının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Kategori başlıkları
  - 200 / 400 / 600 puanlık soru kutuları
  - Takım skor panelleri
  - Aktif takım göstergesi
  - Power-up alanları
  - Oyun üst bilgi alanı
- **Kullanıcı Deneyimi:**
  - Hangi takımın sırası olduğu net görülmeli
  - Açılmış sorular pasif hale gelmeli
  - Skor değişiklikleri anlık güncellenmeli
- **Teknik Detaylar:**
  - Oyun state senkronizasyonu
  - Soru seçimi ve soru durum güncellemesi
  - Re-render optimizasyonu

## 7. Soru Modalı / Soru Ekranı
- **API Endpoint:** `GET /api/questions/{id}`
- **Görev:** Seçilen sorunun kullanıcıya gösterildiği ekranın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Soru metni
  - Soru görseli varsa görsel alanı
  - Geri sayım sayacı
  - Cevap kontrol butonları
  - Doğru / yanlış sonuç alanı
  - Soru içi power-up alanı
  - Call a Friend alanı
- **Kullanıcı Deneyimi:**
  - Soru okunabilir ve odaklı biçimde gösterilmeli
  - Timer net görünmeli
  - Power-up’lar soru ekranında da erişilebilir olmalı
- **Teknik Detaylar:**
  - Modal state yönetimi
  - Timer logic
  - Soru sonucu sonrası oyun state güncellemesi

## 8. Power-Up Kullanım Arayüzü
- **API Endpoint:** `POST /api/game/use-powerup`
- **Görev:** Takımların sahip olduğu power-up’ları kullanabildiği frontend akışının implementasyonu
- **UI Bileşenleri:**
  - Block butonu
  - Double butonu
  - Steal butonu
  - Kullanılmış / kullanılabilir durum göstergesi
- **Kullanıcı Deneyimi:**
  - Her takımın power-up’ları ayrı görünmeli
  - Kullanılmış power-up pasif görünmeli
  - Etki sonucu kullanıcıya açık biçimde gösterilmeli
- **Teknik Detaylar:**
  - Power-up usage state
  - Takım bazlı görünüm kontrolü
  - Backend ile senkron kullanım güncellemesi

## 9. Call a Friend Özelliği
- **Görev:** Yardım özelliğinin sadece soru ekranında görünmesini sağlamak
- **UI Bileşenleri:**
  - Call a Friend butonu
  - Açıklama veya popup alanı
- **Kullanıcı Deneyimi:**
  - Ana oyun tahtasında görünmemeli
  - Sadece soru açıldığında erişilebilir olmalı
- **Teknik Detaylar:**
  - Conditional rendering
  - Aktif soru kontrolü

## 10. Çizim Kategorisi Ekranı
- **API Endpoint:** `GET /api/draw/{id}`, `POST /api/draw/submit`
- **Görev:** QR ile açılan çizim ekranı ve buna bağlı frontend akışının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - QR yönlendirme ekranı
  - Çizim alanı
  - "Bitti" butonu
  - Ana ekranda çizimi gösterme alanı
- **Kullanıcı Deneyimi:**
  - Mobil cihazdan kolay çizim yapılabilmeli
  - Çizim tamamlandığında oyun ekranına aktarılmalı
- **Teknik Detaylar:**
  - Mobil uyumlu çizim ekranı
  - Çizim verisinin gönderimi
  - Ana ekrana veri yansıtılması

## 11. Nasıl Oynanır Sayfası
- **Görev:** Oyunun kurallarını ve akışını açıklayan sayfanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Oyun açıklama metinleri
  - Power-up açıklamaları
  - Görseller veya örnek kartlar
  - Logo alanı
- **Kullanıcı Deneyimi:**
  - Yeni kullanıcılar oyunu kolay anlayabilmeli
  - Sayfa düzeni sade ve açıklayıcı olmalı
- **Teknik Detaylar:**
  - Statik içerik yapısı
  - Responsive metin ve görsel yerleşimi

## 12. Admin Giriş Sayfası
- **API Endpoint:** `POST /api/admin/login`
- **Görev:** Admin kullanıcısının giriş yapabildiği ekranın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Email input alanı
  - Şifre input alanı
  - "Giriş Yap" butonu
  - Hata mesaj alanı
- **Kullanıcı Deneyimi:**
  - Yanlış girişlerde açıklayıcı hata mesajı
  - Başarılı giriş sonrası admin paneline yönlendirme
- **Teknik Detaylar:**
  - Admin auth yönetimi
  - Protected route yapısı

## 13. Admin Dashboard
- **API Endpoint:** `GET /api/admin/dashboard`
- **Görev:** Admin panel ana sayfasının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Sidebar
  - Dashboard kartları
  - Kategori yönetimi alanı
  - Soru yönetimi alanı
  - Görsel yönetimi alanı
  - Store yönetimi alanı
- **Kullanıcı Deneyimi:**
  - Yönetim işlemleri kolay erişilebilir olmalı
  - Menü yapısı düzenli olmalı
- **Teknik Detaylar:**
  - Admin state yönetimi
  - Panel route yapısı
  - Çoklu veri listeleme

## 14. Soru Yönetim Sayfası
- **API Endpoint:** `GET /api/admin/questions`, `POST /api/admin/questions`, `PUT /api/admin/questions/{id}`, `DELETE /api/admin/questions/{id}`
- **Görev:** Soruların eklenmesi, düzenlenmesi ve silinmesi için admin arayüzünün tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Soru listesi
  - Filtreleme alanı
  - Yeni soru ekleme formu
  - Düzenleme modalı
  - Silme onay popup’ı
- **Kullanıcı Deneyimi:**
  - Sorular kategori ve puan bazında filtrelenebilmeli
  - Düzenleme işlemleri hızlı yapılabilmeli
- **Teknik Detaylar:**
  - CRUD işlemleri
  - Form state yönetimi
  - Görsel yükleme desteği

## 15. Kategori Yönetim Sayfası
- **API Endpoint:** `GET /api/admin/categories`, `POST /api/admin/categories`, `PUT /api/admin/categories/{id}`, `DELETE /api/admin/categories/{id}`
- **Görev:** Kategorilerin yönetildiği admin sayfasının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Kategori listesi
  - Yeni kategori ekleme formu
  - Düzenleme ve silme işlemleri
- **Kullanıcı Deneyimi:**
  - Kategoriler kolay düzenlenebilir olmalı
  - Görsel destekli listeleme yapılabilmeli
- **Teknik Detaylar:**
  - CRUD işlemleri
  - Validasyon
  - Liste güncelleme akışı

## 16. Store Yönetim Sayfası
- **API Endpoint:** `GET /api/admin/store`, `POST /api/admin/store`, `PUT /api/admin/store/{id}`, `DELETE /api/admin/store/{id}`
- **Görev:** Ürünlerin, fiyatların ve görsellerin yönetildiği admin frontend ekranının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Ürün kartları veya tablo görünümü
  - Ürün ekleme formu
  - Düzenleme modalı
  - Görsel yükleme alanı
- **Kullanıcı Deneyimi:**
  - Ürün yönetimi sade ve anlaşılır olmalı
  - Admin ürün bilgilerini kolayca güncelleyebilmeli
- **Teknik Detaylar:**
  - CRUD işlemleri
  - Görsel input yönetimi
  - Liste yenileme akışı

---

## Genel Teknik Gereksinimler

### Responsive Design
- **Mobile:** Küçük ekranlar için optimize edilmiş arayüz
- **Tablet:** Orta boy ekran uyumluluğu
- **Desktop:** Geniş ekran düzeni

### State Management
- `currentUser`: Giriş yapmış kullanıcı bilgisi
- `gameState`: Aktif oyun bilgisi
- `teams`: Takım bilgileri
- `scores`: Skorlar
- `selectedCategories`: Seçili kategoriler
- `powerUps`: Yardım araçları durumu
- `adminState`: Admin panel verileri

### API Integration
- Tüm API çağrıları merkezi bir API modülü üzerinden yapılacak
- Error handling
- Loading states
- Token-based authentication

### Styling
- Oyun temalı modern tasarım
- Tutarlı renk sistemi
- Okunabilir tipografi
- Görsel ağırlıklı kategori kartları

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus states
- Color contrast

### Performance
- Lazy loading
- Optimize görsel kullanımı
- Minimum gereksiz render
- Etkin state güncellemeleri

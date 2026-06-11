# Abdelrahman Zidan'ın Mobil Frontend Görevleri

**Mobil Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

> Tüm ekranlar tek birleşik uygulamada: `ClashMobile/` (React Native + Expo). Sorumluluk: Clash of Minds mobil uygulamasının ana sayfa, kimlik doğrulama, kategori seçimi, oyun akışı, skor, profil, mağaza, dashboard ve yardımcı ekran arayüzlerinin hazırlanması.

## 1. Ana Sayfa (Landing)
- **Ekran:** `ClashMobile/src/screens/LandingScreen.tsx`
- **Bileşenler:** Logo alanı, dil değiştirme butonu, kullanıcı durumu, ana menü kartları, devam eden oyun bildirimi.
- **İşlev:** Kullanıcı uygulamayı açtığında ana giriş ekranını görür. Giriş yapılmışsa kullanıcı adı ve çıkış butonu gösterilir; giriş yapılmamışsa login ekranına yönlendirme yapılır.
- **Navigasyon:** `Play`, `Categories`, `HowToPlay`, `Store`, `Account`, `Dashboard` ekranlarına geçiş sağlar.

## 2. Giriş Ekranı (Login)
- **Ekran:** `ClashMobile/src/screens/AuthScreen.tsx`
- **Hook:** `ClashMobile/src/hooks/useAuth.tsx`
- **Bileşenler:** Username / Email input, password input, şifre göster/gizle butonu, loading indicator, hata mesajı kutusu.
- **İşlev:** Kullanıcı email/username ve şifre ile giriş yapar. Başarılı girişten sonra token saklanır ve kullanıcı uygulama içinde yetkili ekranlara erişebilir.

## 3. Kayıt ve Telefon OTP Doğrulama Ekranı
- **Ekran:** `ClashMobile/src/screens/AuthScreen.tsx`
- **Hook:** `ClashMobile/src/hooks/useAuth.tsx`
- **Bileşenler:** Username, email, telefon, şifre alanları, OTP kod alanı, resend OTP butonu.
- **İşlev:** Kullanıcı kayıt bilgilerini girer, telefon doğrulaması için OTP süreci başlatılır. OTP girildikten sonra hesap oluşturma tamamlanır ve kullanıcı login ekranına yönlendirilir.

## 4. Kategori Listeleme Ekranı
- **Ekran:** `ClashMobile/src/screens/OtherScreens.tsx` → `CategoriesScreen`
- **Servis:** `ClashMobile/src/services/api.ts` → `categoriesAPI.getAll()`
- **Bileşenler:** Kategori kartları, kategori görselleri, kategori isimleri, loading indicator.
- **İşlev:** Backend'den gelen Clash of Minds kategori verileri mobil ekranda listelenir. Her kategori kendi görseli ve adıyla gösterilir.

## 5. Kategori Seçim Ekranı
- **Ekran:** `ClashMobile/src/screens/CategorySelectionScreen.tsx`
- **Bileşenler:** Section bazlı kategori grupları, seçim işareti, seçilen kategori sayacı, ileri butonu.
- **İşlev:** Oyuna başlamadan önce kullanıcı 6 kategori seçer. Seçilen kategori sayısı ekranda gösterilir ve yeterli seçim yapıldığında oyun kurulum ekranına geçilir.

## 6. Oyun Kurulum Ekranı
- **Ekran:** `ClashMobile/src/screens/GameSetupScreen.tsx`
- **Bileşenler:** Takım adı inputları, takım kartları, süre seçimi, power-up seçimi, seçilen kategori çipleri.
- **İşlev:** Kullanıcı iki takımın isimlerini, cevap sürelerini ve her takımın kullanacağı power-up seçeneklerini belirler. Kurulum tamamlandıktan sonra oyun ekranı açılır.

## 7. Oyun Tahtası ve Soru Ekranı
- **Ekran:** `ClashMobile/src/screens/GameScreen.tsx`
- **Bileşenler:** Skor tablosu, sıra göstergesi, kategori sütunları, puan hücreleri, soru modalı, cevap modalı, timer.
- **İşlev:** Seçilen kategoriler ve puanlara göre oyun tahtası oluşturulur. Kullanıcı bir soru seçtiğinde soru ekranı açılır, süre başlar ve cevap doğru/yanlış durumuna göre skor güncellenir.

## 8. Power-Up Kullanım Arayüzü
- **Ekran:** `ClashMobile/src/screens/GameScreen.tsx`
- **Bileşenler:** Power-up butonları, Call a Friend sayacı, Double Points etiketi, Block Opponent, Two Answers, Steal Question mesajları.
- **İşlev:** Takımlar oyun sırasında sahip oldukları power-up haklarını kullanabilir. Kullanılan yardımcı özellikler ekranda mesaj ve durum etiketi olarak gösterilir.

## 9. Sonuç Ekranı
- **Ekran:** `ClashMobile/src/screens/ResultScreen.tsx`
- **Bileşenler:** Kazanan takım alanı, skor kartları, kupa/beraberlik göstergesi, yeni oyun ve ana sayfa butonları.
- **İşlev:** Oyun bittiğinde kazanan takım, final skorları ve beraberlik durumu gösterilir. Kullanıcı yeni oyun başlatabilir veya ana sayfaya dönebilir.

## 10. Hesap ve Profil Ekranı
- **Ekran:** `ClashMobile/src/screens/AccountScreen.tsx`
- **Hook:** `ClashMobile/src/hooks/useAuth.tsx`
- **Bileşenler:** Avatar, kullanıcı adı, rol rozeti, istatistik kartları, profil düzenleme formu, şifre değiştirme sekmesi.
- **İşlev:** Kullanıcı profil bilgilerini görür, email/username güncelleyebilir ve şifresini değiştirebilir. Logout işlemi de bu ekrandan yapılır.

## 11. Mağaza Ekranı
- **Ekran:** `ClashMobile/src/screens/OtherScreens.tsx` → `StoreScreen`
- **Servis:** `ClashMobile/src/services/api.ts` → `storeAPI.getItems()`
- **Bileşenler:** Ürün kartları, fiyat bilgisi, indirim/eski fiyat alanı, featured badge, satın alma butonu, kullanılabilir oyun sayısı.
- **İşlev:** Kullanıcı mağaza ürünlerini ve oyun paketlerini görür. Giriş yapılmamışsa satın alma işlemi için login ekranına yönlendirilir.

## 12. Dashboard Ekranı
- **Ekran:** `ClashMobile/src/screens/OtherScreens.tsx` → `DashboardScreen`
- **Servis:** `ClashMobile/src/services/api.ts` → `gamesAPI.getDashboardStats()`
- **Bileşenler:** İstatistik kartları, toplam oyun, aktif kullanıcı, kategori/soru sayıları, web dashboard linki.
- **İşlev:** Admin veya yetkili kullanıcılar sistem istatistiklerini mobil uygulama üzerinden görebilir. Detaylı yönetim için web dashboard bağlantısı sunulur.

## 13. Nasıl Oynanır Ekranı
- **Ekran:** `ClashMobile/src/screens/OtherScreens.tsx` → `HowToPlayScreen`
- **Bileşenler:** Adım kartları, power-up açıklamaları, puan zorluk tablosu.
- **İşlev:** Kullanıcıya oyunun akışı, kategori seçimi, soru cevaplama, power-up kullanımı ve puan mantığı anlatılır.

## 14. Çizim Oyunu Ekranı
- **Ekran:** `ClashMobile/src/screens/OtherScreens.tsx` → `DrawingScreen`
- **Bileşenler:** Çizim oyunu bilgilendirme alanı, ikon, açıklama metni.
- **İşlev:** Clash of Minds içindeki çizim oyunu özelliği için mobil tarafta bilgilendirme ve yönlendirme ekranı hazırlanır.

## 15. Dil, Tema ve Navigasyon Yapısı
- **Dosyalar:**
  - `ClashMobile/src/hooks/useLanguage.tsx`
  - `ClashMobile/src/navigation/AppNavigator.tsx`
  - `ClashMobile/src/utils/theme.ts`
- **İşlev:** Uygulamada Arapça/İngilizce dil desteği, ortak renk/tema yapısı ve tüm ekranlar arası Stack Navigation yönetimi sağlanır.

---

## Mobil Frontend Kanıt Videosunda Gösterilecek Minimum Akış

1. Uygulama gerçek cihazda veya simülatörde açılır.
2. `Mobile Front-End` gereksinim adı sesli olarak söylenir.
3. Ana sayfa, dil değiştirme ve menü kartları gösterilir.
4. Login / Register / OTP arayüzü gösterilir.
5. Kategori listesi ve kategori seçim ekranı gösterilir.
6. Takım ayarları ve power-up seçim ekranı gösterilir.
7. Oyun tahtası, soru ekranı, timer ve skor güncelleme gösterilir.
8. Sonuç ekranı, profil, mağaza, dashboard ve nasıl oynanır ekranları gösterilir.

---

## Not

Bu görev dokümanı, `ClashMobile` uygulamasındaki mobil arayüzlerin ve kullanıcı akışlarının kanıt videosunda gösterilmesi için hazırlanmıştır. Video içinde önce gereksinim adı söylenmeli, sonra ilgili ekranlar gerçek cihaz veya simülatör üzerinde çalışır halde gösterilmelidir.

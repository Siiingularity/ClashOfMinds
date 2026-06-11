# abdelrahman ahmad radwan zidan'ın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

> Birleşik backend: `https://clashofminds-production.up.railway.app/api` (REST API + JWT + OTP doğrulama).  
> Mobil istemci: `ClashMobile/src/services/api.ts`, `ClashMobile/src/hooks/useAuth.tsx`, `ClashMobile/src/utils/storage.ts`.  
> Kanıt videosunda mobil uygulamadan REST API'ye giden isteğin ve dönen sonucun ekrana yansıdığı net görünmelidir. Video içinde önce gereksinim adı söylenmeli, sonra kanıt gösterilmelidir.

---

## 1. Kullanıcı Girişi (JWT) Servisi
- **Endpoint:** `POST /api/auth/login`
- **İstemci:** `authAPI.login(identifier, password)` → `src/services/api.ts`
- **Ekran / Hook:** `AuthScreen.tsx` + `useAuth.login()` → `src/hooks/useAuth.tsx`
- **İşlem:** Kullanıcı email/username ve şifre ile giriş yapar. Backend başarılı cevap dönerse JWT token mobilde saklanır.
- **Token Yönetimi:** `storage.setItem('token', token)` → `src/utils/storage.ts`
- **Kanıt Videosu:** Mobil uygulamada login yapılır, backend loglarında `POST /api/auth/login` isteği ve başarılı cevap gösterilir.

## 2. Telefon OTP ile Kayıt Başlatma Servisi
- **Endpoint:** `POST /api/auth/start-register`
- **İstemci:** `authAPI.startRegister({ username, email, phone, password })` → `src/services/api.ts`
- **Ekran / Hook:** `AuthScreen.tsx` + `useAuth.startRegister()`
- **İşlem:** Kullanıcı bilgileri backend'e gönderilir ve telefon doğrulaması için OTP süreci başlatılır.
- **Kanıt Videosu:** Mobil uygulamadan kayıt formu doldurulur, request'in backend'e gittiği ve OTP sürecinin başladığı gösterilir.

## 3. Telefon OTP Doğrulama Servisi
- **Endpoint:** `POST /api/auth/verify-register`
- **İstemci:** `authAPI.verifyRegister({ phone, otp })` → `src/services/api.ts`
- **Ekran / Hook:** `AuthScreen.tsx` + `useAuth.verifyRegister()`
- **İşlem:** Kullanıcının girdiği OTP kodu backend tarafından doğrulanır ve hesap oluşturma işlemi tamamlanır.
- **Kanıt Videosu:** Mobil uygulamada OTP girilir, backend cevabında doğrulama başarısı gösterilir.

## 4. OTP Yeniden Gönderme Servisi
- **Endpoint:** `POST /api/auth/resend-register-otp`
- **İstemci:** `authAPI.resendRegisterOtp(phone)` → `src/services/api.ts`
- **Ekran / Hook:** `AuthScreen.tsx` + `useAuth.resendRegisterOtp()`
- **İşlem:** Kullanıcı OTP alamazsa yeni doğrulama kodu talep eder.
- **Kanıt Videosu:** Mobilde resend OTP butonu/işlemi gösterilir ve backend'e yeni OTP isteği gönderildiği kanıtlanır.

## 5. Kullanıcı Profilini Getirme Servisi
- **Endpoint:** `GET /api/auth/profile`
- **İstemci:** `authAPI.getProfile()` → `src/services/api.ts`
- **Ekran / Hook:** `AccountScreen.tsx`, `useAuth.fetchProfile()`
- **Header:** `Authorization: Bearer {token}`
- **İşlem:** Giriş yapan kullanıcının profil bilgileri, rolü, telefon bilgisi, oyun sayısı ve skor bilgileri alınır.
- **Kanıt Videosu:** Login sonrası Account/Profile ekranında backend'den gelen kullanıcı bilgileri gösterilir.

## 6. Profil Bilgilerini Güncelleme Servisi
- **Endpoint:** `PUT /api/auth/profile`
- **İstemci:** `authAPI.updateProfile(updates)` → `src/services/api.ts`
- **Ekran:** `AccountScreen.tsx`
- **Header:** `Authorization: Bearer {token}`
- **İşlem:** Kullanıcı adı, email veya telefon bilgisi güncellenir.
- **Kanıt Videosu:** Mobil uygulamada profil bilgisi değiştirilir, backend cevabı ve ekrana yansıyan güncel bilgi gösterilir.

## 7. Şifre Değiştirme Servisi
- **Endpoint:** `PUT /api/auth/change-password`
- **İstemci:** `authAPI.changePassword(currentPassword, newPassword)` → `src/services/api.ts`
- **Ekran:** `AccountScreen.tsx`
- **Header:** `Authorization: Bearer {token}`
- **İşlem:** Kullanıcı mevcut şifresini doğrulayarak yeni şifre belirler.
- **Kanıt Videosu:** Şifre değiştirme isteğinin mobil uygulamadan backend'e gittiği ve başarılı/başarısız durum mesajının gösterildiği kanıtlanır.

## 8. Kategori Listeleme Servisi
- **Endpoint:** `GET /api/categories`
- **Opsiyonel Parametreler:** `section`, `search`, `includeInactive`
- **İstemci:** `categoriesAPI.getAll(params)` → `src/services/api.ts`
- **Ekran:** `CategoriesScreen.tsx`, `CategorySelectionScreen.tsx`
- **İşlem:** Oyun kategorileri backend'den alınır ve mobil ekranda listelenir.
- **Kanıt Videosu:** Mobilde kategoriler ekranı açılır, backend'den gelen kategori verilerinin listelendiği gösterilir.

## 9. Kategorileri Bölüme Göre Getirme Servisi
- **Endpoint:** `GET /api/categories/by-section`
- **İstemci:** `categoriesAPI.getBySection()` → `src/services/api.ts`
- **Ekran:** `CategoriesScreen.tsx`
- **İşlem:** Kategoriler bölüm/section bazlı gruplanarak alınır.
- **Kanıt Videosu:** Mobil kategoriler sayfasında bölümlere ayrılmış kategori verileri gösterilir.

## 10. Tek Kategori Detayı Servisi
- **Endpoint:** `GET /api/categories/:id`
- **İstemci:** `categoriesAPI.getById(id)` → `src/services/api.ts`
- **Ekran:** `CategorySelectionScreen.tsx`, `GameSetupScreen.tsx`
- **İşlem:** Seçilen kategorinin detay bilgileri backend'den alınır.
- **Kanıt Videosu:** Bir kategori seçilir ve seçilen kategorinin bilgileri oyuna aktarılır.

## 11. Bölüm / Section Listeleme Servisi
- **Endpoint:** `GET /api/sections`
- **Opsiyonel Parametre:** `includeInactive=true`
- **İstemci:** `sectionsAPI.getAll(params)` → `src/services/api.ts`
- **Ekran:** `CategoriesScreen.tsx`
- **İşlem:** Mobil uygulamada kategori bölümleri backend'den alınır.
- **Kanıt Videosu:** Section verilerinin mobilde kategori yapısına etki ettiği gösterilir.

## 12. Soru Listeleme Servisi
- **Endpoint:** `GET /api/questions`
- **Opsiyonel Parametreler:** `page`, `limit`, `category_id`, `points`, `difficulty`
- **İstemci:** `questionsAPI.getAll(params)` → `src/services/api.ts`
- **Ekran:** `GameScreen.tsx`, `CategorySelectionScreen.tsx`
- **İşlem:** Sorular pagination yapısı ile backend'den alınır.
- **Kanıt Videosu:** Mobilde oyun soruları açılır ve backend'den gelen soru bilgileri gösterilir.

## 13. Kategoriye Göre Soru Getirme Servisi
- **Endpoint:** `GET /api/questions/category/:categoryId`
- **İstemci:** `questionsAPI.getByCategory(categoryId)` → `src/services/api.ts`
- **Ekran:** `GameScreen.tsx`
- **İşlem:** Seçilen kategoriye ait sorular mobil uygulamaya getirilir.
- **Kanıt Videosu:** Seçilen kategoriye ait soruların mobilde açıldığı gösterilir.

## 14. Tek Soru Detayı Servisi
- **Endpoint:** `GET /api/questions/:id`
- **İstemci:** `questionsAPI.getById(id)` → `src/services/api.ts`
- **Ekran:** `GameScreen.tsx`
- **İşlem:** Belirli bir sorunun soru metni, cevap bilgisi, puanı, görseli ve cevap görseli alınır.
- **Kanıt Videosu:** Bir soru açılır, soru ve cevap görsellerinin backend verisiyle geldiği gösterilir.

## 15. Rastgele Soru Getirme Servisi
- **Endpoint:** `POST /api/questions/random`
- **İstemci:** `questionsAPI.getRandom(categoryIds, questionsPerCategory)` → `src/services/api.ts`
- **Ekran:** `CategorySelectionScreen.tsx`, `GameSetupScreen.tsx`, `GameScreen.tsx`
- **İşlem:** Seçilen kategorilerden rastgele soru seti oluşturulur.
- **Kanıt Videosu:** Mobilde kategori seçimi yapılır, oyuna başlanır ve rastgele soruların geldiği gösterilir.

## 16. Oyun Oturumu Oluşturma Servisi
- **Endpoint:** `POST /api/games`
- **İstemci:** `gamesAPI.create({ sessionName, team1Name, team2Name })` → `src/services/api.ts`
- **Ekran:** `GameSetupScreen.tsx`
- **İşlem:** Takım isimleri ve oyun bilgisi ile yeni game session oluşturulur.
- **Kanıt Videosu:** Mobil uygulamada takım bilgileri girilir ve backend'de yeni oyun oturumu oluşturulduğu gösterilir.

## 17. Kullanıcının Oyunlarını Listeleme Servisi
- **Endpoint:** `GET /api/games/my-games`
- **Opsiyonel Parametreler:** `page`, `limit`
- **İstemci:** `gamesAPI.getMyGames(params)` → `src/services/api.ts`
- **Ekran:** `DashboardScreen.tsx`, `AccountScreen.tsx`
- **Header:** `Authorization: Bearer {token}`
- **İşlem:** Kullanıcının geçmiş veya aktif oyun oturumları listelenir.
- **Kanıt Videosu:** Mobil dashboard/account ekranında kullanıcının oyun geçmişi gösterilir.

## 18. Oyun Skorlarını Güncelleme Servisi
- **Endpoint:** `PUT /api/games/:id/scores`
- **İstemci:** `gamesAPI.updateScores(id, { team1Score, team2Score })` → `src/services/api.ts`
- **Ekran:** `GameScreen.tsx`
- **İşlem:** Takımların skorları backend'e gönderilir ve güncellenir.
- **Kanıt Videosu:** Bir soru cevaplanır, skor değişir ve backend logunda skor update isteği gösterilir.

## 19. Oyun Bitirme Servisi
- **Endpoint:** `POST /api/games/:id/end`
- **İstemci:** `gamesAPI.end(id, winner)` → `src/services/api.ts`
- **Ekran:** `ResultScreen.tsx`
- **İşlem:** Oyun tamamlanır, kazanan takım backend'e kaydedilir.
- **Kanıt Videosu:** Oyun bitiş ekranı ve kazanan bilgisinin backend'e kaydedildiği gösterilir.

## 20. Sorulan Soruyu Kaydetme Servisi
- **Endpoint:** `POST /api/games/:id/record-question`
- **İstemci:** `gamesAPI.recordQuestion(id, data)` → `src/services/api.ts`
- **Ekran:** `GameScreen.tsx`
- **İşlem:** Sorulan soru, hangi takım tarafından sorulduğu, doğru/yanlış durumu ve kazanılan puan backend'e kaydedilir.
- **Kanıt Videosu:** Soru cevaplandıktan sonra record-question isteği gösterilir.

## 21. Dashboard İstatistikleri Servisi
- **Endpoint:** `GET /api/games/dashboard/stats`
- **İstemci:** `gamesAPI.getDashboardStats()` → `src/services/api.ts`
- **Ekran:** `DashboardScreen.tsx`
- **İşlem:** Toplam oyun, skor, kazanma bilgileri ve genel istatistikler mobil dashboard ekranında gösterilir.
- **Kanıt Videosu:** Dashboard ekranı açılır ve backend'den gelen istatistikler gösterilir.

## 22. Oyun Liderlik Tablosu Servisi
- **Endpoint:** `GET /api/games/leaderboard`
- **Opsiyonel Parametre:** `limit`
- **İstemci:** `gamesAPI.getLeaderboard(limit)` → `src/services/api.ts`
- **Ekran:** `DashboardScreen.tsx`
- **İşlem:** En yüksek skor veya en başarılı oyun kayıtları listelenir.
- **Kanıt Videosu:** Leaderboard bilgisinin mobil uygulamada listelendiği gösterilir.

## 23. Kullanıcı Listeleme ve Yönetim Servisleri
- **Endpointler:**
  - `GET /api/users`
  - `GET /api/users/:id`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`
- **İstemci:** `usersAPI.getAll()`, `usersAPI.getById()`, `usersAPI.update()`, `usersAPI.delete()` → `src/services/api.ts`
- **Ekran:** `DashboardScreen.tsx`, admin/yönetim ekranları
- **İşlem:** Kullanıcı bilgileri listelenir, düzenlenir veya silinir.
- **Kanıt Videosu:** Admin yetkisiyle kullanıcı verilerinin REST API üzerinden yönetildiği gösterilir.

## 24. Kullanıcı Liderlik ve İstatistik Servisleri
- **Endpointler:**
  - `GET /api/users/leaderboard`
  - `GET /api/users/stats`
- **İstemci:** `usersAPI.getLeaderboard(limit)`, `usersAPI.getStats()` → `src/services/api.ts`
- **Ekran:** `DashboardScreen.tsx`, `AccountScreen.tsx`
- **İşlem:** Kullanıcı başarı sıralaması ve genel kullanıcı istatistikleri alınır.
- **Kanıt Videosu:** Kullanıcı skor/istatistik verilerinin mobil ekrana geldiği gösterilir.

## 25. Mağaza Ürünlerini Listeleme Servisi
- **Endpoint:** `GET /api/store/items`
- **İstemci:** `storeAPI.getItems()` → `src/services/api.ts`
- **Ekran:** `StoreScreen.tsx`
- **İşlem:** Mağaza ürünleri, fiyatlar, paketler veya ekstra oyun hakları backend'den alınır.
- **Kanıt Videosu:** Store ekranında ürünlerin REST API'den geldiği gösterilir.

## 26. Mağaza Satın Alma Servisi
- **Endpoint:** `POST /api/store/purchase`
- **İstemci:** `storeAPI.purchase(itemId)` → `src/services/api.ts`
- **Ekran:** `StoreScreen.tsx`
- **Header:** `Authorization: Bearer {token}`
- **İşlem:** Kullanıcı seçilen ürünü veya oyun paketini satın alma isteği gönderir.
- **Kanıt Videosu:** Mobil uygulamada satın alma butonuna basılır ve backend cevabı gösterilir.

## 27. Soru / Oyun Hata Bildirme Servisi
- **Endpoint:** `POST /api/reports`
- **İstemci:** `reportAPI.send({ questionId, gameId, description })` → `src/services/api.ts`
- **Ekran:** `GameScreen.tsx`, destek/rapor alanı
- **İşlem:** Kullanıcı bir soru veya oyunla ilgili hata bildirimi gönderir.
- **Kanıt Videosu:** Mobil uygulamadan rapor gönderilir ve backend'in başarılı cevap döndüğü gösterilir.

## 28. Site Ayarları Getirme Servisi
- **Endpoint:** `GET /api/site-settings`
- **İstemci:** `siteSettingsAPI.getAll()` → `src/services/api.ts`
- **Ekran:** `LandingScreen.tsx`, `CategoriesScreen.tsx`, `StoreScreen.tsx`
- **İşlem:** Logo, site görselleri, genel ayarlar veya dinamik içerikler backend'den alınır.
- **Kanıt Videosu:** Mobil uygulamada dinamik ayar/görsel bilgilerinin backend'den geldiği gösterilir.

## 29. RabbitMQ WebSocket Gerçek Zamanlı Oyun Bağlantısı
- **Endpoint / WS:** `wss://rabbitmq.clashofminds.net/ws`
- **İstemci:** `gameSocket.connect(gameId)` → `src/services/gameSocket.ts`
- **Kullanılan Protokol:** STOMP over WebSocket
- **Event Türleri:**
  - `SCORE_UPDATE`
  - `TURN_CHANGE`
  - `QUESTION_ANSWERED`
  - `POWERUP_ACTIVATED`
  - `GAME_ENDED`
  - `PLAYER_JOINED`
- **İşlem:** Oyun sırasında skor, sıra değişimi, power-up kullanımı ve oyun bitişi gibi olaylar gerçek zamanlı olarak dinlenir/yayınlanır.
- **Kanıt Videosu:** Oyun sırasında bir skor veya sıra değişimi yapılır, mobil uygulamada gerçek zamanlı event'in yansıdığı gösterilir.

## 30. Mobil API Header ve Hata Yönetimi
- **Dosya:** `src/services/api.ts`
- **Base URL:** `https://clashofminds-production.up.railway.app/api`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}`
- **Response Format:** `success`, `message`, `data`, `errors`
- **İşlem:** Tüm REST istekleri tek `request()` fonksiyonu üzerinden yönetilir. Başarısız HTTP cevaplarında kullanıcıya hata mesajı gösterilir.
- **Kanıt Videosu:** Hatalı login veya başarısız işlem denenir, mobil uygulamanın backend hata mesajını gösterdiği kanıtlanır.

## 31. Mobil Local Storage / Token Saklama
- **Dosya:** `src/utils/storage.ts`
- **Kullanılan Paket:** `@react-native-async-storage/async-storage`
- **Saklanan Veriler:**
  - `token`
  - `currentGameId`
  - `savedGame`
- **İşlem:** Kullanıcı oturumu ve oyun durumu mobil cihazda saklanır.
- **Kanıt Videosu:** Uygulama kapatılıp açıldığında token/profile kontrolünün çalıştığı gösterilir.

---

## Kanıt Videosunda Gösterilecek Minimum Akış

1. Uygulama gerçek cihazda veya simülatörde açılır.
2. `Mobile Back-End` gereksinim adı sesli olarak söylenir.
3. Login veya register işlemi yapılır.
4. Backend loglarında mobil uygulamadan gelen REST API isteği gösterilir.
5. Kategori veya soru listesi backend'den çekilir.
6. Oyun oluşturulur, skor güncellenir ve oyun bitirilir.
7. Store, dashboard veya profile ekranında backend verisinin mobil ekrana yansıdığı gösterilir.
8. Varsa RabbitMQ WebSocket ile gerçek zamanlı oyun eventi gösterilir.

---

## Not

Bu görev dokümanı, `ClashMobile` uygulamasındaki mobil REST API bağlantılarını ve gerçek zamanlı oyun bağlantısını göstermek için hazırlanmıştır. Teslim videosunda her servis için en az bir başarılı mobil → backend → mobil cevap akışı net şekilde gösterilmelidir.

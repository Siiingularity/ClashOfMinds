# Clash of Minds – Singularity REST API Metotları

**API Test Videosu:** [https://www.youtube.com/watch?v=tAgTa79ntaM](https://www.youtube.com/watch?v=tAgTa79ntaM)

**API Adresi:** [https://api.clashofminds.net/](https://api.clashofminds.net/)

# Clash of Minds – Singularity REST API Metotları


---

## 1. Kullanıcı Kaydı (Register)
Yeni bir kullanıcının sisteme kayıt olmasını sağlar.

- **Endpoint:** POST /api/auth/register  
- **Authentication:** Gerekli değil  

### Request Body:
```json
{
  "username": "zeidan",
  "email": "zeidan@example.com",
  "password": "StrongPass123"
}
```

### Açıklama:
- username: Kullanıcının sistemde gözükecek adı
- email: Benzersiz e-posta adresi
- password: Güçlü şifre

### Response:
- 201 Created → Kullanıcı başarıyla oluşturuldu  
- Kullanıcıya ait token döndürülebilir  

---

## 2. Kullanıcı Girişi (Login)
Kullanıcının sisteme giriş yapmasını sağlar.

- **Endpoint:** POST /api/auth/login  
- **Authentication:** Gerekli değil  

### Request Body:
```json
{
  "emailOrUsername": "zeidan",
  "password": "StrongPass123"
}
```

### Açıklama:
- emailOrUsername: Kullanıcı adı veya email ile giriş yapılabilir
- password: Kullanıcının şifresi

### Response:
- 200 OK → Giriş başarılı  
- JWT Token döndürülür  

---

## 3. Profil Bilgisi Getirme
Giriş yapan kullanıcının bilgilerini getirir.

- **Endpoint:** GET /api/auth/profile  
- **Authentication:** Bearer Token gerekli  

### Headers:
```
Authorization: Bearer <token>
```

### Response:
- 200 OK → Kullanıcı bilgileri döndürülür  

---

## 4. Profil Güncelleme
Kullanıcı kendi profilini güncelleyebilir.

- **Endpoint:** PUT /api/auth/profile  
- **Authentication:** Bearer Token gerekli  

### Request Body:
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### Response:
- 200 OK → Güncelleme başarılı  

---

## 5. Şifre Değiştirme
Kullanıcının şifresini değiştirmesini sağlar.

- **Endpoint:** PUT /api/auth/change-password  
- **Authentication:** Bearer Token gerekli  

### Request Body:
```json
{
  "currentPassword": "123",
  "newPassword": "456"
}
```

### Response:
- 200 OK → Şifre değiştirildi  

---

## 6. Leaderboard (Genel Sıralama)
En iyi oyuncuları listeler.

- **Endpoint:** GET /api/users/leaderboard  
- **Authentication:** Gerekli değil  

### Query Params (opsiyonel):
- limit → kaç kişi gösterilecek

### Response:
- 200 OK → Kullanıcılar puanlarına göre sıralanır  

---

## 7. Kullanıcı Listeleme (Admin)
Sistemdeki tüm kullanıcıları listeler.

- **Endpoint:** GET /api/users  
- **Authentication:** Bearer Token gerekli  
- **Authorization:** Admin  

### Query Params:
- page
- limit
- search

### Response:
- 200 OK  

---

## 8. Kullanıcı İstatistikleri (Admin)
Toplam kullanıcı, aktif kullanıcı vb. bilgileri verir.

- **Endpoint:** GET /api/users/stats  
- **Authentication:** Bearer Token gerekli  

### Response:
- 200 OK  

---

## 9. Tek Kullanıcı Getirme
Belirli bir kullanıcıyı getirir.

- **Endpoint:** GET /api/users/{id}  

### Path Param:
- id → kullanıcı ID

### Response:
- 200 OK  

---

## 10. Kullanıcı Güncelleme
Admin kullanıcı bilgilerini günceller.

- **Endpoint:** PUT /api/users/{id}  
- **Authentication:** Bearer Token gerekli  

### Request Body:
```json
{
  "username": "updated",
  "email": "updated@mail.com",
  "isActive": true
}
```

### Response:
- 200 OK  

---

## 11. Kullanıcı Silme
Bir kullanıcıyı siler.

- **Endpoint:** DELETE /api/users/{id}  
- **Authentication:** Bearer Token gerekli  

### Response:
- 200 OK  

---

## 12. Kategorileri Listeleme
Sistemdeki tüm kategorileri getirir.

- **Endpoint:** GET /api/categories  

### Query Params:
- section
- search

### Response:
- 200 OK  

---

## 13. Section’a Göre Kategoriler
Kategorileri gruplu şekilde getirir.

- **Endpoint:** GET /api/categories/by-section  

### Response:
- 200 OK  

---

## 14. Rastgele Kategoriler
Oyunda kullanılmak üzere random kategori verir.

- **Endpoint:** GET /api/categories/random  

### Query Params:
- count

### Response:
- 200 OK  

---

## 15. Kategori Stats (Admin)
Kategori istatistiklerini getirir.

- **Endpoint:** GET /api/categories/stats  
- **Authentication:** Bearer Token  

---

## 16. Tek Kategori Getirme
- **Endpoint:** GET /api/categories/{id}  

---

## 17. Kategori Oluşturma
- **Endpoint:** POST /api/categories  
- **Authentication:** Bearer Token  

### Request Body:
```json
{
  "nameAr": "تاريخ",
  "nameEn": "History",
  "section": "General",
  "imageUrl": "link"
}
```

---

## 18. Kategori Güncelleme
- **Endpoint:** PUT /api/categories/{id}  

---

## 19. Kategori Silme
- **Endpoint:** DELETE /api/categories/{id}  

---

## 20. Kategori Toggle
- **Endpoint:** PATCH /api/categories/{id}/toggle  

---

## 21. Soruları Listeleme
- **Endpoint:** GET /api/questions  

### Query:
- categoryId
- difficulty
- points

---

## 22. Kategoriye Göre Sorular
- **Endpoint:** GET /api/questions/category/{categoryId}  

---

## 23. Tek Soru
- **Endpoint:** GET /api/questions/{id}  

---

## 24. Random Game Soruları
- **Endpoint:** POST /api/questions/random  

### Request Body:
```json
{
  "categoryIds": [1,2,3],
  "questionsPerCategory": 6
}
```

---

## 25. Question Stats
- **Endpoint:** GET /api/questions/stats  

---

## 26. Soru Ekle
- **Endpoint:** POST /api/questions  

### Request Body:
```json
{
  "categoryId": 1,
  "questionAr": "سؤال",
  "answerAr": "جواب",
  "points": 200
}
```

---

## 27. Bulk Soru Ekle
- **Endpoint:** POST /api/questions/bulk  

---

## 28. Soru Güncelle
- **Endpoint:** PUT /api/questions/{id}  

---

## 29. Soru Sil
- **Endpoint:** DELETE /api/questions/{id}  

---

## 30. Soru Toggle
- **Endpoint:** PATCH /api/questions/{id}/toggle  

---

## 31. Game Leaderboard
- **Endpoint:** GET /api/games/leaderboard  

---

## 32. Game Oluştur
- **Endpoint:** POST /api/games  

### Request Body:
```json
{
  "team1Name": "A",
  "team2Name": "B"
}
```

---

## 33. My Games
- **Endpoint:** GET /api/games/my-games  

---

## 34. Game Getir
- **Endpoint:** GET /api/games/{id}  

---

## 35. Skor Güncelle
- **Endpoint:** PUT /api/games/{id}/scores  

---

## 36. Soru Kaydet
- **Endpoint:** POST /api/games/{id}/record-question  

---

## 37. Game Bitir
- **Endpoint:** POST /api/games/{id}/end  

---

## 38. Game Abandon
- **Endpoint:** POST /api/games/{id}/abandon  

---

## 39. Tüm Games (Admin)
- **Endpoint:** GET /api/games  

---

## 40. Dashboard Stats
- **Endpoint:** GET /api/games/dashboard/stats  

---

## 41. Game Sil
- **Endpoint:** DELETE /api/games/{id}  

---

## 42. Health Check
- **Endpoint:** GET /health  

---

## 43. Root
- **Endpoint:** GET /  

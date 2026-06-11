Clash of Minds – Singularity
Gereksinimler
1.	Kullanıcı Kaydı (POST): Yeni bir kullanıcının kullanıcı adı ve şifre bilgileriyle sisteme hesap oluşturmasını sağlar.
2.	Kullanıcı Girişi (POST): Kullanıcının kullanıcı adı ve şifresi ile doğrulanarak sisteme giriş yapmasını sağlar.
3.	Kullanıcı Çıkışı (POST): Aktif oturumu sonlandırarak kullanıcının sistemden çıkış yapmasını sağlar.
4.	Oyun Oturumu Oluşturma (POST): Kullanıcının yeni bir oyun oturumu oluşturmasını, oyun adı ve oyuncu sayısını belirlemesini sağlar.
5.	Takım Ayarlama (POST): Oyun başlamadan önce takım isimlerinin belirlenmesini sağlar.
6.	Yardımcı Güç Seçimi (POST): Her takımın oyun başlamadan önce iki adet yardımcı güç (block, double, steal) seçmesini sağlar.
7.	Kategori Listeleme (GET): Sistemde mevcut olan tüm soru kategorilerinin listelenmesini sağlar.
8.	Kategori Seçimi (POST): Kullanıcının oyun için 6 kategori seçmesini sağlar.
9.	Oyun Tahtasını Görüntüleme (GET): Seçilen kategorilere göre oyun tahtasının oluşturulmasını ve soruların görüntülenmesini sağlar.
10.	Soru Görüntüleme (GET): Seçilen kategori ve puan değerine göre ilgili sorunun ekranda gösterilmesini sağlar.
11.	Süre Başlatma (POST): Soru açıldığında 60 saniyelik geri sayım süresinin başlatılmasını sağlar.
12.	Cevap Gösterme (GET): Süre bitiminde veya kullanıcı isteğiyle doğru cevabın görüntülenmesini sağlar.
13.	Puan Güncelleme (PUT): Sorunun doğru veya yanlış cevaplanmasına göre ilgili takımın puanının güncellenmesini sağlar.
14.	Yardımcı Güç Kullanma (PUT): Takımın seçtiği yardımcı gücü kullanarak oyun durumunu güncellemesini sağlar.
15.	Soru Devre Dışı Bırakma (PUT): Cevaplanan sorunun tekrar seçilememesi için pasif hale getirilmesini sağlar.
16.	Oyun Sırası Değiştirme (PUT): Her sorudan sonra aktif takımın değiştirilmesini sağlar.
17.	Oyunu Bitirme (POST): Tüm sorular cevaplandığında veya kullanıcı isteğiyle oyunun sonlandırılmasını sağlar.
18.	Sonuçları Görüntüleme (GET): Takımların final puanlarını ve kazanan takımın görüntülenmesini sağlar.

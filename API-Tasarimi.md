## API Tasarımı

YAML Dosyası Linki:
[clash_of_minds_openapi.yaml](clash_of_minds_openapi.yaml)

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış örnek bir API tasarımını içermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Clash of Minds – Singularity API
  version: 1.0.0
  description: >
    Bu API, Clash of Minds – Singularity bilgi yarışması oyununun kullanıcı yönetimi,
    oyun oturumu oluşturma, takım ayarlama, yardımcı güç seçimi, kategori seçimi,
    soru yönetimi, puan güncelleme ve sonuç görüntüleme işlemleri için tasarlanmış
    RESTful bir servistir.
  contact:
    name: singularity Team

servers:
  - url: https://api.clashofminds.com
    description: Üretim sunucusu (Production)
  - url: https://staging-api.clashofminds.com
    description: Test sunucusu (Staging)
  - url: http://localhost:3000
    description: Yerel geliştirme sunucusu (Development)

tags:
  - name: Kimlik Doğrulama
    description: Kullanıcı kayıt, giriş ve çıkış işlemleri
  - name: Oyun Oturumu
    description: Oyun oluşturma, takım ayarlama ve oyun akışı işlemleri
  - name: Kategoriler
    description: Kategori listeleme ve seçim işlemleri
  - name: Sorular
    description: Soru görüntüleme, cevap gösterme ve soru durum yönetimi
  - name: Puan ve Sonuçlar
    description: Puan güncelleme, sıra değiştirme ve sonuç görüntüleme işlemleri
  - name: Yardımcı Güçler
    description: Yardımcı güç seçme ve kullanma işlemleri

security:
  - BearerAuth: []

paths:
  /api/auth/register:
    post:
      tags:
        - Kimlik Doğrulama
      summary: Kullanıcı Kaydı
      operationId: registerUser
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        "201":
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "409":
          description: Kullanıcı adı zaten kullanımda
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/auth/login:
    post:
      tags:
        - Kimlik Doğrulama
      summary: Kullanıcı Girişi
      operationId: loginUser
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        "200":
          description: Giriş başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kullanıcı adı veya şifre hatalı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/auth/logout:
    post:
      tags:
        - Kimlik Doğrulama
      summary: Kullanıcı Çıkışı
      operationId: logoutUser
      responses:
        "200":
          description: Kullanıcı başarıyla çıkış yaptı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions:
    post:
      tags:
        - Oyun Oturumu
      summary: Oyun Oturumu Oluşturma
      operationId: createGameSession
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateGameSessionRequest'
      responses:
        "201":
          description: Oyun oturumu başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GameSession'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/teams:
    parameters:
      - name: sessionId
        in: path
        required: true
        description: Oyun oturumunun benzersiz kimlik numarası
        schema:
          type: string
        example: "sess_001"
    post:
      tags:
        - Oyun Oturumu
      summary: Takım Ayarlama
      operationId: setupTeams
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SetupTeamsRequest'
      responses:
        "200":
          description: Takımlar başarıyla ayarlandı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TeamListResponse'
        "400":
          description: Geçersiz takım bilgileri
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Oyun oturumu bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/power-ups/select:
    parameters:
      - name: sessionId
        in: path
        required: true
        description: Oyun oturumunun benzersiz kimlik numarası
        schema:
          type: string
        example: "sess_001"
    post:
      tags:
        - Yardımcı Güçler
      summary: Yardımcı Güç Seçimi
      operationId: selectPowerUps
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SelectPowerUpsRequest'
      responses:
        "200":
          description: Yardımcı güçler başarıyla seçildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PowerUpSelectionResponse'
        "400":
          description: Geçersiz yardımcı güç seçimi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Oyun oturumu veya takım bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/categories:
    get:
      tags:
        - Kategoriler
      summary: Kategori Listeleme
      operationId: listCategories
      responses:
        "200":
          description: Kategoriler başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Category'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/categories:
    parameters:
      - name: sessionId
        in: path
        required: true
        description: Oyun oturumunun benzersiz kimlik numarası
        schema:
          type: string
        example: "sess_001"
    post:
      tags:
        - Kategoriler
      summary: Kategori Seçimi
      operationId: selectCategories
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SelectCategoriesRequest'
      responses:
        "200":
          description: Kategoriler başarıyla seçildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CategorySelectionResponse'
        "400":
          description: Geçersiz kategori seçimi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Oyun oturumu bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/board:
    parameters:
      - name: sessionId
        in: path
        required: true
        description: Oyun oturumunun benzersiz kimlik numarası
        schema:
          type: string
        example: "sess_001"
    get:
      tags:
        - Oyun Oturumu
      summary: Oyun Tahtasını Görüntüleme
      operationId: getGameBoard
      responses:
        "200":
          description: Oyun tahtası başarıyla getirildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GameBoard'
        "404":
          description: Oyun tahtası veya oturum bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/questions/{questionId}:
    parameters:
      - name: sessionId
        in: path
        required: true
        description: Oyun oturumunun benzersiz kimlik numarası
        schema:
          type: string
        example: "sess_001"
      - name: questionId
        in: path
        required: true
        description: Sorunun benzersiz kimlik numarası
        schema:
          type: string
        example: "q_100"
    get:
      tags:
        - Sorular
      summary: Soru Görüntüleme
      operationId: getQuestion
      responses:
        "200":
          description: Soru başarıyla getirildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Question'
        "404":
          description: Soru veya oyun oturumu bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/questions/{questionId}/timer/start:
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: "sess_001"
      - name: questionId
        in: path
        required: true
        schema:
          type: string
        example: "q_100"
    post:
      tags:
        - Sorular
      summary: Süre Başlatma
      operationId: startQuestionTimer
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/StartTimerRequest'
      responses:
        "200":
          description: Sayaç başarıyla başlatıldı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TimerResponse'
        "404":
          description: Soru veya oyun oturumu bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/questions/{questionId}/answer:
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: "sess_001"
      - name: questionId
        in: path
        required: true
        schema:
          type: string
        example: "q_100"
    get:
      tags:
        - Sorular
      summary: Cevap Gösterme
      operationId: showAnswer
      responses:
        "200":
          description: Doğru cevap başarıyla görüntülendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnswerResponse'
        "404":
          description: Soru veya cevap bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/scores:
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: "sess_001"
    put:
      tags:
        - Puan ve Sonuçlar
      summary: Puan Güncelleme
      operationId: updateScore
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateScoreRequest'
      responses:
        "200":
          description: Puan başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ScoreUpdateResponse'
        "400":
          description: Geçersiz puan güncelleme isteği
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Oyun oturumu veya takım bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/power-ups/use:
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: "sess_001"
    put:
      tags:
        - Yardımcı Güçler
      summary: Yardımcı Güç Kullanma
      operationId: usePowerUp
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UsePowerUpRequest'
      responses:
        "200":
          description: Yardımcı güç başarıyla kullanıldı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PowerUpUsageResponse'
        "400":
          description: Geçersiz yardımcı güç kullanımı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Oyun oturumu veya takım bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/questions/{questionId}/disable:
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: "sess_001"
      - name: questionId
        in: path
        required: true
        schema:
          type: string
        example: "q_100"
    put:
      tags:
        - Sorular
      summary: Soru Devre Dışı Bırakma
      operationId: disableQuestion
      responses:
        "200":
          description: Soru başarıyla devre dışı bırakıldı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuestionStatusResponse'
        "404":
          description: Soru veya oyun oturumu bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/turn:
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: "sess_001"
    put:
      tags:
        - Puan ve Sonuçlar
      summary: Oyun Sırası Değiştirme
      operationId: changeTurn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChangeTurnRequest'
      responses:
        "200":
          description: Aktif takım başarıyla değiştirildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TurnResponse'
        "404":
          description: Oyun oturumu bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/finish:
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: "sess_001"
    post:
      tags:
        - Puan ve Sonuçlar
      summary: Oyunu Bitirme
      operationId: finishGame
      responses:
        "200":
          description: Oyun başarıyla sonlandırıldı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GameResult'
        "404":
          description: Oyun oturumu bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/game-sessions/{sessionId}/results:
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: "sess_001"
    get:
      tags:
        - Puan ve Sonuçlar
      summary: Sonuçları Görüntüleme
      operationId: getResults
      responses:
        "200":
          description: Final sonuçları başarıyla getirildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GameResult'
        "404":
          description: Oyun oturumu bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  securitySchemes:
    BearerAuth:
      type: apiKey
      in: header
      name: Authorization
      description: >
        JWT tabanlı kimlik doğrulama. İstek başlığına
        "Authorization: Bearer <token>" eklenmelidir.

  schemas:
    User:
      type: object
      description: Kullanıcı bilgilerini temsil eden model
      properties:
        id:
          type: string
          example: "usr_001"
        username:
          type: string
          example: "zeidan"
      required:
        - id
        - username
    RegisterRequest:
      type: object
      description: Kullanıcı kayıt isteği için gönderilecek veri
      properties:
        username:
          type: string
          minLength: 3
          maxLength: 30
          example: "zeidan"
        password:
          type: string
          minLength: 6
          maxLength: 64
          example: "StrongPass123"
      required:
        - username
        - password

    LoginRequest:
      type: object
      description: Kullanıcı giriş isteği için gönderilecek veri
      properties:
        username:
          type: string
          example: "zeidan"
        password:
          type: string
          example: "StrongPass123"
      required:
        - username
        - password

    AuthResponse:
      type: object
      description: Başarılı kimlik doğrulama sonrası dönen yanıt
      properties:
        message:
          type: string
          example: "Authentication successful"
        token:
          type: string
          example: "jwt-token-example"
        user:
          $ref: '#/components/schemas/User'
      required:
        - message
        - token
        - user

    MessageResponse:
      type: object
      description: Basit bilgilendirme mesajı içeren standart yanıt
      properties:
        message:
          type: string
          example: "Operation completed successfully"
      required:
        - message

    CreateGameSessionRequest:
      type: object
      description: Yeni oyun oturumu oluşturma isteği için gönderilecek veri
      properties:
        gameName:
          type: string
          minLength: 2
          maxLength: 100
          example: "Friday Trivia Night"
        playerCount:
          type: integer
          minimum: 2
          maximum: 12
          example: 4
      required:
        - gameName
        - playerCount

    Team:
      type: object
      description: Takım bilgilerini temsil eden model
      properties:
        id:
          type: string
          example: "team_1"
        name:
          type: string
          example: "Thunder Minds"
        score:
          type: integer
          example: 0
        selectedPowerUps:
          type: array
          items:
            type: string
            enum: [block, double, steal]
          minItems: 0
          maxItems: 2
          example: [double, steal]
        usedPowerUps:
          type: array
          items:
            type: string
            enum: [block, double, steal]
          example: []
      required:
        - id
        - name
        - score

    GameSession:
      type: object
      description: Oyun oturumu bilgilerini temsil eden model
      properties:
        id:
          type: string
          example: "sess_001"
        gameName:
          type: string
          example: "Friday Trivia Night"
        playerCount:
          type: integer
          example: 4
        status:
          type: string
          enum: [created, in_progress, finished]
          example: "created"
        activeTeamId:
          type: string
          nullable: true
          example: "team_1"
      required:
        - id
        - gameName
        - playerCount
        - status

    SetupTeamsRequest:
      type: object
      description: Oyun başlamadan önce takım isimlerini belirlemek için gönderilecek veri
      properties:
        teams:
          type: array
          minItems: 2
          items:
            type: object
            properties:
              name:
                type: string
                minLength: 2
                maxLength: 50
                example: "Thunder Minds"
            required:
              - name
      required:
        - teams

    TeamListResponse:
      type: object
      properties:
        sessionId:
          type: string
          example: "sess_001"
        teams:
          type: array
          items:
            $ref: '#/components/schemas/Team'
      required:
        - sessionId
        - teams

    SelectPowerUpsRequest:
      type: object
      description: Her takım için iki yardımcı güç seçme isteği
      properties:
        selections:
          type: array
          items:
            type: object
            properties:
              teamId:
                type: string
                example: "team_1"
              powerUps:
                type: array
                minItems: 2
                maxItems: 2
                items:
                  type: string
                  enum: [block, double, steal]
                example: [block, double]
            required:
              - teamId
              - powerUps
      required:
        - selections

    PowerUpSelectionResponse:
      type: object
      properties:
        sessionId:
          type: string
          example: "sess_001"
        teams:
          type: array
          items:
            $ref: '#/components/schemas/Team'
      required:
        - sessionId
        - teams

    Category:
      type: object
      description: Soru kategorisini temsil eden model
      properties:
        id:
          type: string
          example: "cat_history"
        name:
          type: string
          example: "History"
        questionCount:
          type: integer
          example: 5
      required:
        - id
        - name
        - questionCount

    SelectCategoriesRequest:
      type: object
      description: Oyun için 6 kategori seçme isteği
      properties:
        categoryIds:
          type: array
          minItems: 6
          maxItems: 6
          items:
            type: string
          example:
            - "cat_history"
            - "cat_science"
            - "cat_geography"
            - "cat_sports"
            - "cat_art"
            - "cat_technology"
      required:
        - categoryIds

    CategorySelectionResponse:
      type: object
      properties:
        sessionId:
          type: string
          example: "sess_001"
        selectedCategories:
          type: array
          items:
            $ref: '#/components/schemas/Category'
      required:
        - sessionId
        - selectedCategories

    Question:
      type: object
      description: Soru modelini temsil eder
      properties:
        id:
          type: string
          example: "q_100"
        categoryId:
          type: string
          example: "cat_history"
        categoryName:
          type: string
          example: "History"
        pointValue:
          type: integer
          example: 200
        text:
          type: string
          example: "Who conquered Constantinople in 1453?"
        correctAnswer:
          type: string
          example: "Mehmed II"
        isDisabled:
          type: boolean
          example: false
      required:
        - id
        - categoryId
        - categoryName
        - pointValue
        - text
        - correctAnswer
        - isDisabled

    BoardCell:
      type: object
      properties:
        questionId:
          type: string
          example: "q_100"
        pointValue:
          type: integer
          example: 200
        isDisabled:
          type: boolean
          example: false
      required:
        - questionId
        - pointValue
        - isDisabled

    BoardColumn:
      type: object
      properties:
        category:
          $ref: '#/components/schemas/Category'
        questions:
          type: array
          items:
            $ref: '#/components/schemas/BoardCell'
      required:
        - category
        - questions

    GameBoard:
      type: object
      description: Seçilen kategorilere göre oluşturulan oyun tahtası
      properties:
        sessionId:
          type: string
          example: "sess_001"
        columns:
          type: array
          items:
            $ref: '#/components/schemas/BoardColumn'
      required:
        - sessionId
        - columns

    StartTimerRequest:
      type: object
      description: Süre başlatma isteği için isteğe bağlı veri
      properties:
        durationSeconds:
          type: integer
          minimum: 1
          default: 60
          example: 60

    TimerResponse:
      type: object
      properties:
        sessionId:
          type: string
          example: "sess_001"
        questionId:
          type: string
          example: "q_100"
        durationSeconds:
          type: integer
          example: 60
        status:
          type: string
          enum: [started, expired]
          example: "started"
      required:
        - sessionId
        - questionId
        - durationSeconds
        - status

    AnswerResponse:
      type: object
      properties:
        questionId:
          type: string
          example: "q_100"
        correctAnswer:
          type: string
          example: "Mehmed II"
      required:
        - questionId
        - correctAnswer

    UpdateScoreRequest:
      type: object
      description: Doğru veya yanlış cevaba göre puan güncelleme isteği
      properties:
        teamId:
          type: string
          example: "team_1"
        questionId:
          type: string
          example: "q_100"
        isCorrect:
          type: boolean
          example: true
        points:
          type: integer
          example: 200
      required:
        - teamId
        - questionId
        - isCorrect
        - points

    ScoreUpdateResponse:
      type: object
      properties:
        teamId:
          type: string
          example: "team_1"
        newScore:
          type: integer
          example: 400
        pointsApplied:
          type: integer
          example: 200
      required:
        - teamId
        - newScore
        - pointsApplied

    UsePowerUpRequest:
      type: object
      description: Takımın seçtiği yardımcı gücü kullanma isteği
      properties:
        teamId:
          type: string
          example: "team_1"
        powerUp:
          type: string
          enum: [block, double, steal]
          example: "double"
        targetTeamId:
          type: string
          nullable: true
          example: "team_2"
      required:
        - teamId
        - powerUp

    PowerUpUsageResponse:
      type: object
      properties:
        message:
          type: string
          example: "Power-up applied successfully"
        teamId:
          type: string
          example: "team_1"
        powerUp:
          type: string
          enum: [block, double, steal]
          example: "double"
      required:
        - message
        - teamId
        - powerUp

    QuestionStatusResponse:
      type: object
      properties:
        questionId:
          type: string
          example: "q_100"
        isDisabled:
          type: boolean
          example: true
      required:
        - questionId
        - isDisabled

    ChangeTurnRequest:
      type: object
      description: Aktif takım değişikliği için gönderilecek veri
      properties:
        nextTeamId:
          type: string
          example: "team_2"
      required:
        - nextTeamId

    TurnResponse:
      type: object
      properties:
        sessionId:
          type: string
          example: "sess_001"
        activeTeamId:
          type: string
          example: "team_2"
      required:
        - sessionId
        - activeTeamId

    GameResult:
      type: object
      description: Oyun sonu sonuçlarını temsil eden model
      properties:
        sessionId:
          type: string
          example: "sess_001"
        teams:
          type: array
          items:
            $ref: '#/components/schemas/Team'
        winnerTeamId:
          type: string
          example: "team_1"
        winnerTeamName:
          type: string
          example: "Thunder Minds"
      required:
        - sessionId
        - teams
        - winnerTeamId
        - winnerTeamName

    Error:
      type: object
      description: Hata durumlarında döndürülen standart hata yanıtı
      properties:
        message:
          type: string
          example: "Oyun oturumu bulunamadı"
      required:
        - message


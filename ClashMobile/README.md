# 🏆 Clash of Minds — Mobile App

React Native mobile app for Clash of Minds trivia game platform.

**Web App:** [clashofminds.net](https://clashofminds.net)  
**Backend API:** [clashofminds-production.up.railway.app](https://clashofminds-production.up.railway.app)  
**GitHub:** [Siiingularity/ClashMobile](https://github.com/Siiingularity/ClashMobile)

---

## 📱 Grading Criteria Coverage

| Criterion | Points | Implementation |
|-----------|--------|---------------|
| **Mobil FrontEnd** | 25 | Complete React Native app — 12 screens, navigation, AR/EN |
| **REST API + UI** | 25 | Full API integration with all endpoints (auth, categories, questions, games) |
| **RabbitMQ/Kafka** | 5 | STOMP WebSocket client in app + RabbitMQ service in backend |
| **Redis/Memcache** | 5 | Redis caching middleware for categories, questions, leaderboard |
| **Docker** | 10 | Dockerfile + docker-compose (backend + MySQL + Redis + RabbitMQ) |
| **CI/CD** | 5 | GitHub Actions → EAS Build → Android APK |
| **Cep Telefonu** | 10 | EAS APK buildable and installable on Android device |
| **Total** | **85** | |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Expo CLI: `npm install -g expo-cli eas-cli`
- Android device or emulator

### Install & Run

```bash
# Clone
git clone https://github.com/Siiingularity/ClashMobile.git
cd ClashMobile

# Install dependencies
npm install

# Start dev server
npx expo start

# Press 'a' for Android emulator
# Scan QR with Expo Go on your phone
```

### Build APK for physical device

```bash
# Login to Expo
eas login

# Build APK (preview profile)
eas build --platform android --profile preview

# Download APK from https://expo.dev dashboard
# Install on phone: adb install clash-of-minds.apk
```

---

## 🏗️ Project Structure

```
ClashMobile/
├── App.tsx                          # Root entry point
├── app.json                         # Expo config
├── eas.json                         # EAS build profiles
├── docker-compose.yml               # Full stack Docker setup
├── Dockerfile                       # Backend Docker image
├── .github/workflows/build.yml      # CI/CD pipeline
│
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx         # React Navigation stack
│   ├── screens/
│   │   ├── LandingScreen.tsx        # Home screen
│   │   ├── AuthScreen.tsx           # Login + Register + OTP
│   │   ├── CategorySelectionScreen  # Choose game categories
│   │   ├── GameSetupScreen.tsx      # Team names + powerups
│   │   ├── GameScreen.tsx           # Main game (board + questions + timer)
│   │   ├── ResultScreen.tsx         # Game over + winner
│   │   ├── AccountScreen.tsx        # User profile
│   │   ├── HowToPlayScreen.tsx      # Instructions
│   │   ├── CategoriesScreen.tsx     # Browse all categories
│   │   ├── StoreScreen.tsx          # Buy games/powerups
│   │   ├── DashboardScreen.tsx      # Admin panel
│   │   └── DrawingScreen.tsx        # Drawing game (QR)
│   ├── services/
│   │   ├── api.ts                   # REST API service (all endpoints)
│   │   └── gameSocket.ts            # RabbitMQ STOMP WebSocket
│   ├── hooks/
│   │   ├── useAuth.tsx              # Auth state + JWT (AsyncStorage)
│   │   └── useLanguage.tsx          # AR/EN language switching
│   ├── types/index.ts               # TypeScript types
│   └── utils/storage.ts             # AsyncStorage wrapper
│
└── backend-additions/               # Add to existing backend
    ├── src/config/redis.js          # Redis client
    ├── src/middleware/cache.js      # Caching middleware
    ├── src/services/rabbitmq.js     # RabbitMQ publisher/consumer
    └── README.md                    # Integration guide
```

---

## 🎮 Features

### All 12 screens from web app ported to mobile:

1. **Landing** — Home with navigation grid, user greeting, saved game banner
2. **Auth** — Login / Register with phone OTP verification
3. **Category Selection** — Grid with section tabs, max 6 categories
4. **Game Setup** — Team names, answer time (30–120s), powerup selection
5. **Game Screen** — Complete game board (categories × points), question modal, countdown timer, all 6 powerups
6. **Result Screen** — Winner display, score comparison, confetti
7. **Account** — Profile edit, password change, game stats
8. **How to Play** — Step-by-step guide, powerup explanations
9. **Categories** — Browse all categories with question counts
10. **Store** — Purchase game packages
11. **Dashboard** — Admin stats panel (admin/editor roles only)
12. **Drawing** — Drawing game via QR code

### Power-Ups implemented:
- ⚡ Double Points
- 🛡️ Block Team  
- 📞 Call a Friend (30s timer)
- 🤫 No Word (60s mime timer)
- ⏱️ Extra Time (+30s)
- 💸 Steal Points (200 pts)

---

## 🐳 Docker

### Run full stack locally:

```bash
# Copy env file
cp .env.example .env

# Start all services
docker compose up -d

# View logs
docker compose logs -f backend

# Services:
# Backend API:      http://localhost:3001
# RabbitMQ UI:      http://localhost:15672  (guest/guest)
# MySQL:            localhost:3306
# Redis:            localhost:6379
```

### Services overview:

| Service | Image | Port |
|---------|-------|------|
| backend | Custom Node.js | 3001 |
| mysql | mysql:8.0 | 3306 |
| redis | redis:7-alpine | 6379 |
| rabbitmq | rabbitmq:3.13-management | 5672, 15672, 15674 |

---

## 🔄 CI/CD

GitHub Actions pipeline at `.github/workflows/build.yml`:

1. **Lint** — TypeScript type checking
2. **Test** — Jest unit tests
3. **Build APK** — EAS Build → Android APK
4. **Docker Check** — Validates Dockerfile and docker-compose

### Setup CI/CD:

1. Go to GitHub repo → Settings → Secrets
2. Add `EXPO_TOKEN` (get from https://expo.dev/settings/access-tokens)
3. Push to `main` → pipeline auto-triggers
4. APK available at https://expo.dev dashboard

---

## 🔌 API Integration

All endpoints connect to: `https://clashofminds-production.up.railway.app/api`

| API | Endpoints Used |
|-----|---------------|
| Auth | login, register, OTP verify, profile |
| Categories | getAll, getBySection |
| Questions | getByCategory |
| Games | create, updateScores, recordQuestion, end |
| Users | leaderboard, stats |
| Store | getItems |

---

## 📡 RabbitMQ — Real-time Events

Mobile app connects via STOMP over WebSocket to RabbitMQ:

```
Mobile App ──STOMP/WS──> RabbitMQ ──AMQP──> Backend
                ↑                               ↓
                └──────────── events ───────────┘
```

**Events published:**
- `SCORE_UPDATE` — after each correct answer
- `QUESTION_ANSWERED` — question result
- `TURN_CHANGE` — turn switch
- `POWERUP_ACTIVATED` — powerup used
- `GAME_ENDED` — game completion

---

## 💾 Redis Caching

Backend caches:
- `/api/categories` → TTL 10 minutes
- `/api/questions/category/:id` → TTL 5 minutes
- Leaderboard → TTL 1 minute
- JWT blacklist (logout)

---

## 📞 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.76 + Expo SDK 53 |
| Navigation | React Navigation v6 |
| Storage | AsyncStorage |
| HTTP | Fetch API |
| Messaging | STOMP over WebSocket (RabbitMQ) |
| Language | TypeScript |
| Build | Expo Application Services (EAS) |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |
| Backend | Node.js + Express (existing) |
| Database | MySQL (existing) |
| Cache | Redis |
| Broker | RabbitMQ |

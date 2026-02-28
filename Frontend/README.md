<img width="1917" height="851" alt="image" src="https://github.com/user-attachments/assets/5c83deb4-55b9-4394-b2b6-f15540016493" />
<img width="1825" height="859" alt="image" src="https://github.com/user-attachments/assets/e71fc422-cd17-4af4-96be-d1193db0141d" />
<img width="911" height="376" alt="image" src="https://github.com/user-attachments/assets/c2967b94-ecf8-4922-96e2-0ec5524ff89f" />

# Gunaso Portal — Civic Grievance Management System

A full-stack civic grievance management platform built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend). Citizens can submit, track, and manage grievances while administrators review, prioritize, and resolve them.

---

## 🔬 Algorithms Implemented

### Algorithm 1: Priority Auto-Scoring (Weighted Multi-Factor)

**File:** `Backend/algorithms/priorityScoring.js`

Computes a dynamic priority score (0–100) for each grievance using a weighted combination of four factors:

```
Score = (K × 0.30) + (C × 0.20) + (A × 0.30) + (P × 0.20)
```

| Factor | Weight | Description |
|--------|--------|-------------|
| **K** — Keyword Urgency | 30% | Scans subject + description for urgency keywords (e.g., "emergency"=100, "damaged"=50, "request"=15). Returns the highest matching keyword score. |
| **C** — Category Weight | 20% | Maps category to importance (Healthcare=90, Infrastructure=75, Environment=70, Education=60, Other=40). |
| **A** — Age Score | 30% | Logarithmic scaling based on days pending: `score = 22 × ln(days + 1)`, capped at 100. Older unresolved grievances get higher scores. |
| **P** — Citizen Priority | 20% | Maps citizen-set priority: Urgent=100, High=70, Normal=30. |

- **Time Complexity:** O(n × m) where n = grievances, m = avg words per description
- **Space Complexity:** O(n)
- **Integration:** Admin dashboard shows top-10 priority-ranked grievances. Admin grievance list supports `?scored=true` query param.

---

### Algorithm 2: Duplicate Detection (TF-IDF Cosine Similarity)

**File:** `Backend/algorithms/duplicateDetection.js`

Detects similar/duplicate grievances when a citizen submits a new one using **Term Frequency–Inverse Document Frequency (TF-IDF)** vectorization and **Cosine Similarity** comparison.

**How it works:**

1. **Tokenize & Normalize** — Lowercase, remove punctuation, filter 100+ English stop words
2. **Compute TF** — Term Frequency per document: `TF(t, d) = count(t in d) / |d|`
3. **Compute IDF** — Inverse Document Frequency across corpus: `IDF(t) = ln(N / (1 + df(t)))`
4. **Build TF-IDF vectors** — Multiply TF × IDF for each term in each document
5. **Cosine Similarity** — Compare new submission against all existing grievances:

```
                Σ (A_i × B_i)
cos(θ) = ─────────────────────────
            ‖A‖ × ‖B‖
```

6. **Threshold** — Matches with similarity ≥ 40% are flagged as potential duplicates (returns top 5)

- **Time Complexity:** O(n × m) where n = existing documents, m = unique terms
- **Space Complexity:** O(n × m) for TF-IDF matrix
- **Integration:** After submission, similar grievances are shown to the citizen with match percentages. A pre-check endpoint (`POST /api/grievances/check-similar`) is also available.

---

### Algorithm 3: Trending Issues Detection (Sliding Window + Z-Score)

**File:** `Backend/algorithms/trendingDetection.js`

Detects categories and locations experiencing unusual spikes in grievance submissions using a **sliding time-window** frequency analysis with **statistical z-scores**.

**How it works:**

1. **Define windows** — Recent: last 7 days | Historical baseline: last 90 days
2. **Count frequencies** — Grievances per category/location in each window
3. **Compute daily statistics** — Historical daily mean (μ) and standard deviation (σ) per category/location
4. **Calculate z-score:**

```
        (recent_daily_avg − μ)
z  =  ────────────────────────
               σ
```

5. **Classify intensity based on z-score:**

| Z-Score | Intensity |
|---------|-----------|
| ≥ 3.5   | Critical  |
| ≥ 2.5   | High      |
| ≥ 1.5   | Moderate  |
| < 1.5   | Normal (not shown) |

- **Time Complexity:** O(n) where n = total grievances
- **Space Complexity:** O(k) where k = unique categories + locations
- **Integration:** Admin dashboard shows trending categories and locations with spike intensity badges.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, React Router DOM |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT (7-day expiry), bcrypt password hashing |

## Project Structure

```
gunaso-portal/
├── Backend/
│   ├── algorithms/
│   │   ├── priorityScoring.js      # Algorithm 1: Weighted priority scoring
│   │   ├── duplicateDetection.js   # Algorithm 2: TF-IDF cosine similarity
│   │   └── trendingDetection.js    # Algorithm 3: Sliding window z-score
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   └── role.js                 # Role-based access control
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Counter.js
│   │   ├── Grievance.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js                 # Register, login, forgot password
│   │   ├── citizens.js             # Citizen CRUD
│   │   ├── grievances.js           # Grievance CRUD + algorithms
│   │   ├── settings.js             # Admin settings
│   │   └── stats.js                # Dashboard stats + trending
│   ├── seed.js                     # Seed admin account
│   ├── server.js                   # Express entry point
│   └── .env                        # Configuration
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CitizenModal.jsx
│   │   │   ├── AdminModal.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── Pagination.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CitizenDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── panels/
│   │   │   ├── citizen/
│   │   │   │   ├── CDHome.jsx
│   │   │   │   ├── CDSubmit.jsx       # Shows duplicate detection results
│   │   │   │   ├── CDTickets.jsx      # Edit grievance + pagination
│   │   │   │   ├── CDGallery.jsx
│   │   │   │   ├── CDProfile.jsx
│   │   │   │   └── CDNotifications.jsx
│   │   │   └── admin/
│   │   │       ├── ADHome.jsx         # Trending + priority-ranked
│   │   │       ├── ADGrievances.jsx   # Pagination + scored mode
│   │   │       ├── ADCitizens.jsx
│   │   │       ├── ADGrievanceGallery.jsx
│   │   │       ├── ADReports.jsx
│   │   │       └── ADSettings.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── storage.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
```

## Getting Started

### Backend

```bash
cd Backend
npm install
cp .env.example .env        # Configure MongoDB URI and JWT secret
npm run seed                 # Seed admin account (admin@gunaso.gov.np / admin123)
npm run dev                  # Start dev server on port 5000
```

### Frontend

```bash
cd Frontend
npm install
npm run dev                  # Start Vite dev server (proxies /api → :5000)
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/citizen/register` | — | Register citizen |
| POST | `/api/auth/citizen/login` | — | Citizen login |
| POST | `/api/auth/admin/login` | — | Admin login |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/grievances` | Citizen | Submit grievance (returns similar matches) |
| GET | `/api/grievances/my` | Citizen | List my grievances (paginated) |
| PUT | `/api/grievances/:ticketNo` | Citizen | Edit pending grievance |
| POST | `/api/grievances/check-similar` | Citizen | Check for similar grievances |
| GET | `/api/grievances` | Admin | List all grievances (paginated, scored) |
| GET | `/api/grievances/ranked` | Admin | Get priority-ranked grievances |
| PUT | `/api/grievances/:ticketNo/status` | Admin | Update grievance status |
| GET | `/api/grievances/track/:ticketNo` | — | Public ticket tracking |
| GET | `/api/citizens` | Admin | List citizens (paginated) |
| GET | `/api/stats` | Admin | Dashboard stats + trending analysis |
| GET | `/api/stats/reports` | Admin | Reports data |


<img width="1870" height="741" alt="image" src="https://github.com/user-attachments/assets/71379cdf-25f7-47c9-8945-e0d540a4c8a4" />


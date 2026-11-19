# 🏨 Local Worker Booking Platform — WorkerBook

A full-stack web application connecting hotels, restaurants, and catering businesses with nearby local workers for temporary and part-time staffing.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Bootstrap 5, Bootstrap Icons, Axios |
| Backend | Node.js, Express.js, REST API |
| Database | MySQL 8.0 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.IO |
| File Upload | Multer |

---

## 📁 Project Structure

```
hotel-booking-platform/
├── backend/
│   ├── src/
│   │   ├── server.js              ← Main entry point
│   │   ├── config/
│   │   │   └── database.js        ← MySQL pool connection
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  ← JWT auth + role guard
│   │   │   ├── error.middleware.js ← Global error handler
│   │   │   └── upload.middleware.js← Multer file uploads
│   │   └── routes/
│   │       ├── auth.routes.js     ← Register / Login
│   │       ├── user.routes.js     ← Profile management
│   │       ├── hotel.routes.js    ← Hotel CRUD
│   │       ├── worker.routes.js   ← Worker profiles & search
│   │       ├── booking.routes.js  ← Booking system
│   │       ├── payment.routes.js  ← Payment records
│   │       ├── review.routes.js   ← Worker reviews
│   │       ├── notification.routes.js
│   │       ├── category.routes.js ← Job categories
│   │       └── admin.routes.js    ← Admin dashboard APIs
│   ├── uploads/                   ← Profile photos & documents
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js                 ← Router + Protected Routes
│   │   ├── index.js
│   │   ├── index.css              ← Global styles
│   │   ├── context/
│   │   │   └── AuthContext.js     ← Auth state + login/logout
│   │   ├── utils/
│   │   │   └── api.js             ← Axios instance + all API calls
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── Footer.js
│   │   └── pages/
│   │       ├── HomePage.js
│   │       ├── LoginPage.js
│   │       ├── WorkerRegisterPage.js
│   │       ├── HotelRegisterPage.js
│   │       ├── WorkerDashboard.js
│   │       ├── HotelDashboard.js
│   │       ├── AdminDashboard.js
│   │       ├── FindWorkersPage.js
│   │       ├── WorkerProfilePage.js
│   │       ├── BookingPage.js
│   │       ├── BookingHistoryPage.js
│   │       ├── PaymentPage.js
│   │       ├── AboutPage.js
│   │       └── ContactPage.js
│   └── package.json
│
└── database/
    ├── schema.sql                 ← Full DB schema + seed data
    └── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js v16+
- MySQL 8.0+
- npm or yarn

---

### Step 1 — Database Setup

```bash
# Open MySQL CLI
mysql -u root -p

# Run the schema file (creates DB, tables, and seed data)
source /full/path/to/database/schema.sql
```

**OR** in MySQL Workbench: File → Open SQL Script → `database/schema.sql` → Execute.

---

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# (Windows: copy, Linux/Mac: cp)

# Edit .env — set your MySQL password and JWT secret
notepad .env
```

**`.env` contents:**
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=hotel_booking_platform
JWT_SECRET=change_this_to_a_long_random_secret_string_at_least_32_chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

```bash
# Start backend in development mode
npm run dev

# OR start in production mode
npm start
```

✅ Backend runs at: **http://localhost:5000**  
✅ API health check: **http://localhost:5000/api/health**

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

✅ Frontend runs at: **http://localhost:3000**

---

## 🔐 Default Login Credentials

> These are created from the seed data in `database/schema.sql`.
> **Register as new user to get working bcrypt-hashed passwords.**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hotelplatform.com | Admin@123 |
| Hotel Owner | owner1@example.com | Owner@123 |
| Worker | worker1@example.com | Worker@123 |

> **Note:** The seed file uses placeholder hashes. Register fresh accounts for real login.

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (JWT) |

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workers` | List workers (with filters) |
| GET | `/api/workers/:id` | Worker details |
| GET | `/api/workers/my/profile` | Own profile (worker) |
| PUT | `/api/workers/profile` | Update profile + upload files |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get bookings (by role) |
| PATCH | `/api/bookings/:id/status` | Update status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id/toggle` | Block/Activate user |
| PATCH | `/api/admin/workers/:id/verify` | Verify worker |
| GET | `/api/admin/bookings` | All bookings |

---

## 👥 User Roles & Features

### Admin
- View platform analytics & statistics
- Manage all users (activate/block)
- Verify worker profiles
- Monitor all bookings

### Hotel Owner
- Create & manage hotel profile
- Search workers by skill, city, rate
- Book workers for 2–8 hours or custom shifts
- View booking history
- Cancel bookings

### Worker
- Create professional profile
- Upload profile photo & ID documents
- Set availability & hourly rate
- Accept or reject booking requests
- Track earnings

---

## 🏷️ Job Categories

1. Waiter / Waitress
2. Chef / Assistant Chef
3. Kitchen Helper
4. Room Cleaning Staff
5. Housekeeping Staff
6. Receptionist
7. Dishwasher
8. Security Guard
9. Delivery Staff
10. Event / Catering Staff
11. Bartender
12. Hotel Maintenance Worker

---

## 🔒 Security Features

- ✅ bcrypt password hashing (10 salt rounds)
- ✅ JWT authentication with expiry
- ✅ Role-based access control (admin / hotel_owner / worker)
- ✅ SQL injection prevention (parameterized queries via mysql2)
- ✅ Input validation (express-validator)
- ✅ Secrets in `.env` (never committed)
- ✅ Double-booking prevention logic
- ✅ File upload validation (type & size limits)

---

## 🎨 UI Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Blue, White & Orange color scheme
- ✅ Professional dashboard with stat cards
- ✅ Worker profile cards with photo & rating
- ✅ Booking status badges (color-coded)
- ✅ Smooth hover animations
- ✅ Toast notifications for actions
- ✅ Real-time Socket.IO notifications

---

## 📋 Booking Statuses

| Status | Description |
|--------|-------------|
| `pending` | Sent, awaiting worker response |
| `accepted` | Worker accepted |
| `rejected` | Worker declined |
| `confirmed` | Hotel confirmed |
| `in_progress` | Work is happening |
| `completed` | Job finished, payment due |
| `cancelled` | Cancelled by either party |

---

## 🛠️ Common Issues

| Issue | Solution |
|-------|----------|
| DB connection fails | Check MySQL service is running and `.env` credentials are correct |
| CORS error | Ensure `CORS_ORIGIN=http://localhost:3000` in backend `.env` |
| Port 5000 in use | Change `PORT=5001` in `.env` and update frontend `api.js` |
| npm install fails | Use `npm install --legacy-peer-deps` |
| File upload fails | Create `backend/uploads/profiles` and `backend/uploads/documents` folders |

---

## 📄 License

MIT License — Free to use and modify for educational and commercial purposes.

---

**Made with ❤️ for the hospitality industry | WorkerBook © 2024**

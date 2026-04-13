# Tuk-Tuk Tracker API

**Student ID:** [COBSCCOMP242P-031]  
**Module:** NB6007CEM — Web API Development  
**Batch:** 24.2P  

A RESTful API for real-time three-wheeler (tuk-tuk) tracking and movement logging for Sri Lanka Law Enforcement.

---

## Live API

- **Base URL:** `https://your-deployed-app.onrender.com`
- **Swagger Docs:** `https://your-deployed-app.onrender.com/api-docs`
- **Health Check:** `https://your-deployed-app.onrender.com/health`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES6+ modules) |
| Framework | Express.js v5 |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | express-validator |
| Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Security | helmet, cors |
| Deployment | Render.com |

---

## Project Structure

```
tuktuk-tracker-api/
├── src/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Business logic for each resource
│   ├── middleware/      # auth.js, errorHandler.js, validate.js
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   └── swagger/        # OpenAPI spec config
├── seed/               # Data seed script (provinces, districts, vehicles, pings)
├── server.js           # Entry point
├── .env.example        # Environment variable template
└── package.json
```

---

## Getting Started (Local)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/tuktuk-tracker-api.git
cd tuktuk-tracker-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- All 9 provinces and 25 districts
- 25 police stations
- 200 tuk-tuk vehicles
- ~7 days of location history
- Admin user: `admin` / `Admin@1234`
- Sample officer: `officer_colombo` / `Officer@1234`

### 4. Start the server

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Open `http://localhost:5000/api-docs` for interactive Swagger docs.

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Get JWT token |
| GET | `/api/auth/me` | Any | Current user profile |
| POST | `/api/auth/register` | ADMIN | Create a user |
| GET | `/api/provinces` | Any | List all 9 provinces |
| GET | `/api/districts?province=:id` | Any | Filtered districts |
| GET | `/api/stations?district=:id` | Any | Filtered stations |
| GET | `/api/stations/:id/vehicles` | Any | Vehicles at station |
| GET | `/api/vehicles?province=&district=&status=` | Any | Filtered + paginated vehicles |
| GET | `/api/vehicles/:id/location` | Any | Last known location |
| GET | `/api/vehicles/:id/history?from=&to=` | Any | Time-window history |
| POST | `/api/vehicles/:id/ping` | ADMIN/DEVICE | Submit location ping |
| GET | `/api/users` | ADMIN | List all users |

---

## Roles

| Role | Permissions |
|------|------------|
| `ADMIN` | Full CRUD on all resources |
| `STATION_OFFICER` | Read-only access to vehicles and locations |
| `DEVICE` | Can only POST pings for their assigned vehicle |

---

## Deployment (Render + MongoDB Atlas)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist `0.0.0.0/0` under Network Access
3. Create a database user and copy the connection string to `MONGO_URI`
4. Push code to GitHub
5. Go to [render.com](https://render.com) → New Web Service → connect repo
6. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`
7. Build command: (leave empty)  Start command: `node server.js`
8. Run seed from local machine pointing at Atlas URI after deployment

---

## Simulating Pings (Postman / curl)

```bash
# 1. Login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234"}'

# 2. Post a ping (use token from step 1)
curl -X POST https://your-app.onrender.com/api/vehicles/VEHICLE_ID/ping \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":6.9271,"longitude":79.8612,"speed":34.5,"heading":180}'
```

---

## License

ISC — for academic use only.

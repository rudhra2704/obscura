# Photography Session Booking Platform — Backend

Simple Node.js / Express / MongoDB API for booking photography sessions. Photographers manage their calendars, clients book available dates, and only a studio admin can add photographers.

## Setup

1. Install [Node.js](https://nodejs.org/) (v18 or later).
2. Clone this repo and open the `backend` folder.
3. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and copy the connection string.
4. Copy the example env file and fill in your values:

```bash
cd backend
cp .env.example .env
```

5. Install dependencies:

```bash
npm install
```

## Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | Server port (example: `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `CLIENT_URL` | Frontend origin allowed by CORS (example: `http://localhost:5173`) |

Never commit the real `.env` file.

## Run commands

```bash
# development (auto-restart)
npm run dev

# production
npm start
```

Health check: `GET http://localhost:5000/api/health`

On macOS, **port 5000 is often already used** by AirPlay Receiver. If `npm start` fails with `EADDRINUSE`, set `PORT=5001` in `.env` and use `http://localhost:5001`.

## Seeding the admin

Creates `admin@studio.com` / `admin123` if that user does not already exist:

```bash
npm run seed
```

Log in as this admin to create photographers.

## API endpoints

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Confirms the API is running |
| POST | `/api/auth/register` | Public | Registers a new **client** (role cannot be set in the body) |
| POST | `/api/auth/login` | Public | Returns `{ token, user }` (JWT expires in 1 day) |
| POST | `/api/photographers` | JWT + admin | Creates a photographer user and profile |
| GET | `/api/photographers` | JWT | Lists photographers; optional `?search=` on name or specialty |
| GET | `/api/photographers/:id/availability` | JWT | Future dates that are available and not confirmed-booked |
| POST | `/api/photographers/availability` | JWT + photographer | Adds dates to the logged-in photographer's calendar |
| PUT | `/api/photographers/availability` | JWT + photographer | Replaces the logged-in photographer's calendar |
| DELETE | `/api/photographers/availability/:date` | JWT + photographer | Removes one date from own availability |
| POST | `/api/bookings` | JWT + client | Books a photographer on a date (blocks double-booking) |
| GET | `/api/bookings/my` | JWT | Client: own bookings. Photographer: bookings on their calendar |
| PUT | `/api/bookings/:id/cancel` | JWT | Client cancels their own booking (date can be booked again) |

Import `postman_collection.json` into Postman. Set `baseUrl` (for example `http://localhost:5000`) and `token` after login.

## Business rules (short)

- Dates are stored and compared as the start of the day in UTC.
- A booking is allowed only if the date is on the photographer's `availableDates` and there is no confirmed booking that day.
- A partial unique index on confirmed bookings also prevents double-booking in the database.
- Passwords are hashed with bcrypt and are never returned in responses.

## Deployment

- Deploy the `backend` folder on **Render** or **Railway**.
- Create a MongoDB Atlas cluster and allow the host's IP (or `0.0.0.0/0` for a public API).
- Set these environment variables in the hosting dashboard (do **not** commit `.env`):
  - `PORT`
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLIENT_URL` (your live frontend URL, or `*` only if you change CORS yourself)
- **Start command:** `npm start`
- After the first deploy, run the seed once (Render shell / Railway one-off): `npm run seed`

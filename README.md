<div align="center">

# Obscura

### *The Art of Being Seen*

A private photography studio booking experience — find a photographer, pick a date, and book your session in a few clicks.

`React` · `Node.js` · `MongoDB`

</div>

---

## About

Obscura makes booking a photographer feel as considered as the session itself. Clients browse a curated roster, see exactly when each photographer is free, and reserve a date. Photographers keep their own calendars up to date. A studio admin decides who joins the roster.

The look is dark, editorial and cinematic — warm cream type on deep ink, with burgundy, sage and amber accents.

## What you can do

**As a client**
- Browse photographers and search by name or specialty
- See which dates are genuinely open
- Book a session, and cancel it if plans change

**As a photographer**
- Set and update the dates you're available
- Keep your profile fresh
- See the sessions booked with you

**As the studio admin**
- Add, edit and remove photographers
- Keep an eye on how the studio is doing

## Good to know

- **No double bookings.** Once a date is taken, nobody else can book it.
- **Cancel and it's free again.** A cancelled date opens back up for others.
- **Only real, future dates** can be booked.
- **Private by design.** Passwords are securely protected, and each role only sees what it needs to.

## Try it yourself

You'll need [Node.js](https://nodejs.org/) and a free [MongoDB Atlas](https://www.mongodb.com/atlas) database.

**1. Start the backend**

```bash
cd backend
cp .env.example .env     # add your database link and a secret
npm install
npm run seed             # creates the studio admin
npm run dev
```

**2. Start the app**

```bash
cd _frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

**Studio admin login:** `admin@studio.com` / `admin123`
*(Please change this password before sharing your project publicly.)*

## What's inside

| Folder | What it holds |
| --- | --- |
| `_frontend` | The website people see and use |
| `backend` | The behind-the-scenes system that handles accounts, availability and bookings |

## Built with

- **React + Vite** for the website
- **Framer Motion** for smooth, cinematic transitions
- **Node.js + Express** for the server
- **MongoDB** for storing everything

## Design

Typography pairs **Cormorant Garamond** for headlines with **DM Sans** for everything else.

| Ink | Cream | Burgundy | Sage | Navy | Amber | Slate |
| --- | --- | --- | --- | --- | --- | --- |
| `#121212` | `#e6e0d6` | `#4b1e23` | `#6b6f4e` | `#1c2430` | `#8a5a2b` | `#617891` |

## Want the technical details?

Developers can find the full API guide and setup notes in [`backend/README.md`](backend/README.md).

---

<div align="center">

*Light as language. Booked in a click.*

</div>

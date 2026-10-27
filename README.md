# MedPulse OS

MedPulse OS is a full-stack hospital management ERP demo. It provides separate patient, doctor, and hospital administrator portals for common clinical and operational workflows.

> **Demo software only:** This project is not intended for real patient data or production healthcare operations. Before any real-world use, conduct a security, privacy, and regulatory review and implement appropriate safeguards.

## Features

- **Patient portal:** View appointments, health records, prescriptions, and bills; book consultations and record bill payments.
- **Doctor console:** Review the outpatient (OPD) queue and patient records, update vitals, and issue prescriptions.
- **Hospital administration:** View hospital analytics, manage bed occupancy, monitor pharmacy stock alerts, and review billing.
- **Authentication:** Register and sign in with role-based portals backed by JSON Web Tokens (JWT).
- **Interface:** Responsive React UI with light and dark themes.
- **Demo data:** Populate sample users and hospital records to try the portals.

## Tech stack

- **Frontend:** React 18, Vite, Axios, Lucide
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB

## Prerequisites

- Node.js and npm
- MongoDB running locally, or a MongoDB connection URI

## Run locally

The frontend and backend are separate npm projects; run each in its own terminal.

### 1. Configure the backend

```powershell
cd backend
npm install
```

Create `backend/.env` and set your local configuration:

```dotenv
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/medpulseDB
JWT_SECRET=replace-this-with-a-long-random-secret
```

Start the API:

```powershell
npm run dev
```

The API listens on `http://localhost:5001` by default. Its root endpoint (`/`) returns service status and the available clinical modules.

### 2. Configure and run the frontend

In a second terminal:

```powershell
cd frontend
npm install
```

The frontend defaults to the API at `http://localhost:5001`. To use another API URL, create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5001
```

Start Vite:

```powershell
npm run dev
```

Open the URL printed by Vite (by default, `http://localhost:5174`).

## Try the demo

With MongoDB, the backend, and the frontend running:

1. Select the sparkle (**Seed Demo Data**) button in the application.
2. Sign in using one of the local demo accounts:

   | Role | Email | Password |
   | --- | --- | --- |
   | Patient | `patient@hospital.com` | `patient123` |
   | Doctor | `doctor@hospital.com` | `doctor123` |
   | Administrator | `admin@hospital.com` | `admin123` |

These are public demo credentials. Use them only with a disposable local database; do not deploy them or use them with real data.

**Seeding replaces sample records.** The seed endpoint deletes and recreates doctors, patients, appointments, beds, medicines, prescriptions, and bills. Back up any data you need before using it; it is intended for a demo database.

## Environment variables

| Variable | Project | Default | Description |
| --- | --- | --- | --- |
| `PORT` | `backend` | `5001` | Port used by the Express API |
| `MONGODB_URI` | `backend` | `mongodb://127.0.0.1:27017/medpulseDB` | MongoDB connection string |
| `JWT_SECRET` | `backend` | Development fallback in source | Secret used to sign and verify session tokens |
| `VITE_API_URL` | `frontend` | `http://localhost:5001` | Base URL for API requests |

Set a unique, long, randomly generated `JWT_SECRET` in `backend/.env` and keep environment files and secrets out of source control. The backend contains a development fallback secret; it is not suitable for deployment.

## Build the frontend

From `frontend/`:

```powershell
npm run build
```

This creates the production frontend bundle in `frontend/dist/`. The backend can be started with `npm start` from `backend/`.

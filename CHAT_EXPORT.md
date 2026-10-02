# ParkSG - Development & Chat History Export

**Date**: 2026-10-01  
**Project**: Singapore Carpark Availability Tracker (`ParkSG`)  
**Repository**: [https://github.com/KeziahVickraman/carpark-availability.git](https://github.com/KeziahVickraman/carpark-availability.git)

---

## 1. Initial Prompt: Frontend Carpark Availability App

### User Request
> "build a singapore based carpark availability application that tracks available lots near me. build just the front end for now, I will include API keys later."

### Actions Taken & Architecture
1. **Interactive Singapore Map**:
   - Integrated Leaflet with OpenStreetMap / CartoDB Positron neutral road layer (clean, responsive, no external API key required to view).
   - Rendered real-time lot count pins on the map:
     - 🟢 **Emerald**: Plenty of lots (>30 or >25% vacant)
     - 🟡 **Amber**: Filling fast (10–30 lots)
     - 🔴 **Crimson**: Limited (<10 lots)
     - 🔘 **Slate**: Full (0 lots)
   - Dynamic user location pin with pulse ring and search radius indicator.

2. **"Near Me" Real-Time Location Tracking**:
   - Browser GPS detection (`navigator.geolocation`) with Singapore boundary check.
   - Quick Singapore anchor presets:
     - Central / CBD (Raffles Place)
     - Orchard Road (ION Orchard)
     - Bugis / Bras Basah
     - Jurong East Central (Westgate / JEM)
     - Tampines Regional Centre (Our Tampines Hub)
     - Bishan Town Centre (Junction 8)
     - Punggol Central (Waterway Point)
     - HarbourFront / VivoCity
   - Haversine distance calculations providing real-time drive and walk ETA estimates.

3. **Authentic Singapore Carpark Dataset**:
   - Real HDB, URA, and shopping centre carparks.
   - Detailed lot metrics across Cars (`C`), Motorcycles (`Y`), and Heavy Vehicles (`H`).
   - Detailed rate structures: daytime peak, evening, Sunday/PH free parking schemes, grace periods (10–15 mins free drop-off), and overnight parking caps.
   - Physical specs: vehicle height clearance (e.g. 1.90m–2.15m), EV charging points, and wheelchair-accessible lots.
   - Direct navigation links into Google Maps, Apple Maps, and Waze.

4. **API Key & Settings Panel**:
   - Client-side modal to manage API keys for future use (Data.gov.sg, LTA DataMall, and Google Maps).
   - Stored in browser `localStorage`.

---

## 2. Git Setup & Initial Push

### User Request
> "git push https:// ghp_...38wa@https://github.com/KeziahVickraman/carpark-availability.git"

### Actions Taken
- Initialized local Git repository (`git init`).
- Configured user credentials and default branch `main`.
- Staged all source files and committed:
  `Initial commit: Singapore Carpark Availability tracker (ParkSG)`
- Pushed branch `main` to `https://github.com/KeziahVickraman/carpark-availability.git`.
- Sanitized credentials from `.git/config`.

---

## 3. Serverless LTA DataMall Integration

### User Request
> "add a serverless connection that pulls data from LTA datamall using the following endpoints:
> - store this in /api folder (project root level) not the /src
> - include /health.ts and /carparkavailabilty.ts within the subfolder
> - do NOT hardcode any key, I will include them manually
>
> # Live carpark lots (HDB + LTA + URA):
> https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
>
> # All requests need the header:  AccountKey: <LTA_ACCOUNT_KEY>"

### Actions Taken
1. **Created `/api/health.ts`**:
   - `GET /api/health`
   - Returns service status, uptime, and boolean flag showing whether `LTA_ACCOUNT_KEY` is loaded in the environment.

2. **Created `/api/carparkavailabilty.ts` (and `/api/carparkavailability.ts`)**:
   - `GET /api/carparkavailabilty`
   - Connects to `https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2`.
   - Injects the `AccountKey` header from `process.env.LTA_ACCOUNT_KEY` or request header.
   - Parses coordinates (`lat`, `lng`), lot types (`C`, `H`, `Y`), available lots, and agency names.
   - No hardcoded keys: returns `503` with informative message when the key is not set.

3. **Full-Stack Express Integration (`server.ts`)**:
   - Created `server.ts` mounting `/api/*` routes and Vite middlewares for full-stack operation on port 3000.
   - Updated `package.json` scripts: `"dev": "tsx server.ts"`, `"start": "tsx server.ts"`.
   - Updated `.env.example` with `LTA_ACCOUNT_KEY="MY_LTA_ACCOUNT_KEY"`.
   - Tested endpoints locally using `curl`.

---

## 4. Git Push for Serverless Endpoints

### User Request
> "git push https:// ghp_...38wa@https://github.com/KeziahVickraman/carpark-availability.git"

### Actions Taken
- Committed serverless endpoints: `Add serverless LTA DataMall endpoints in /api (/api/health and /api/carparkavailabilty)`
- Pushed commit `ccc83db` to `origin/main`.
- Verified working tree is clean.

---

## 5. Export Request

### User Request
> "export this chat as .md file"

### Actions Taken
- Exported complete chat transcript and documentation to `/CHAT_EXPORT.md`.

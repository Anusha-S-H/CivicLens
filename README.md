# CivicLens

CivicLens is a full-stack civic data analysis platform built using a Python Flask backend and a React + TypeScript frontend.  
The project focuses on analyzing government welfare schemes, identifying district-level gaps and vulnerabilities, and classifying civic issues using data-driven methods.

The repository contains both backend APIs and a frontend interface that work together using local datasets.

---

## Project Overview

CivicLens helps answer questions such as:
- Which districts are lagging in welfare scheme coverage?
- Are there anomalies in employment or scholarship schemes?
- How vulnerable is a district based on multiple indicators?
- What type of civic issues are being reported?

The backend processes CSV and JSON data files and exposes REST APIs.  
The frontend consumes these APIs and displays the results in a simple, interactive UI.

----

## Backend Details

The backend is written in Python using Flask.  
It loads local datasets, performs analysis, and exposes the results through REST APIs.

### Backend Features
- Welfare gap index calculation
- District vulnerability profiling
- MGNREGA participation anomaly detection
- Scholarship participation analysis
- Scheme eligibility checking
- Civic issue text classification
- Civic alert generation

---

## Frontend Details

The frontend is built using:
- React
- TypeScript
- Vite

It provides:
- District-wise data exploration
- API-driven dashboards
- Interfaces for issue classification and alerts
- Simple and readable UI components

---

## Running the Project

### Backend Setup

```bash
cd be
pip install -r requirements.txt
python api_server.py
Backend runs on:

http://localhost:5000
Frontend Setup
cd fe
npm install
npm run dev
Frontend runs on:

http://localhost:5173
Environment Configuration
Backend
Uses .env.example for reference

Default port: 5000

Frontend
Create a .env file inside fe/:

VITE_API_URL=http://localhost:5000/api
API Endpoints
GET  /api/health
GET  /api/mgnrega-analysis
GET  /api/scholarship-analysis
GET  /api/welfare-gap
GET  /api/vulnerability
GET  /api/schemes
POST /api/classify-issue
POST /api/civic-alert
Detailed backend documentation is available in be/README.md.

Data Sources
All analysis is performed using local datasets stored in the data/ directory, including:

District population data

Scheme participation records

MGNREGA and scholarship datasets

Vulnerability indicators

Central and state welfare scheme metadata

No external database is required.

Testing
Backend Health Check
curl http://localhost:5000/api/health
Frontend Testing
Open:

http://localhost:5173
Use the UI to explore district data, test issue classification, and generate civic alerts.

Development Notes
Analysis logic is separated into individual Python modules

APIs act as wrappers around analysis functions

Data files can be replaced or extended easily

Frontend communicates with backend using a centralized API client

Future Improvements
Add authentication and user roles

Replace CSV files with a database

Improve ML models and evaluation

Add richer charts and visualizations

Extend support to more states and schemes


Summary
CivicLens is a practical civic-tech project combining:

Data analysis

Machine learning

REST APIs

Modern frontend development

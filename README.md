CivicLens

CivicLens is a full-stack civic data analysis project that combines a Flask-based backend with a React + TypeScript frontend.
The project focuses on analyzing government welfare schemes, district-level vulnerabilities, and civic issues using structured datasets and basic machine learning techniques.

This repository contains working analysis scripts, APIs, and a frontend UI built around real CSV and JSON data.

What This Project Does

CivicLens helps analyze:

Welfare scheme coverage across districts

Employment and scholarship participation anomalies

District vulnerability indicators

Civic issues reported through text and news data

The backend exposes APIs for these analyses, and the frontend consumes them to display results interactively.

Repository Structure
CivicLens-main/
├── be/                         # Backend (Flask + ML logic)
│   ├── api_server.py           # Main Flask API server
│   ├── db.py                   # Database / data handling logic
│   ├── analysis.py             # Common analysis utilities
│   ├── welfare_gap_index.py    # Welfare gap computation
│   ├── district_vulnerability_profile.py
│   ├── analysis_mgnrega.py     # MGNREGA analysis
│   ├── analysis_scholarship.py # Scholarship analysis
│   ├── scheme_eligibility.py   # Eligibility checks
│   ├── scheme_explainer.py     # Scheme explanation logic
│   ├── civic_issue_classifier.py
│   ├── civic_alert_with_image.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── data/                       # Datasets used by backend
│   ├── central_schemes.json
│   ├── civic_reports.json
│   ├── district_population.csv
│   ├── district_scheme_data.csv
│   ├── district_vulnerability_data.csv
│   ├── karnataka_district_population_clean.csv
│   ├── karnataka_mgnrega_district.csv
│   ├── pm_kisan_district.csv
│   └── tn_scholarship_district.csv
│
├── fe/                         # Frontend (React + TypeScript)
│   └── (Vite + React app)
│
├── .gitignore
└── README.md

Backend Overview

The backend is written in Python using Flask and is responsible for:

Loading district-level CSV/JSON datasets

Performing welfare gap calculations

Generating vulnerability profiles

Running scheme participation analysis

Classifying civic issues using ML models

Exposing all functionality via REST APIs

Key Backend Features

Welfare Gap Index calculation

District vulnerability profiling

MGNREGA employment anomaly detection

Scholarship participation analysis

Scheme eligibility checking

Civic issue text classification

Civic alert generation using news data

Frontend Overview

The frontend is built using:

React

TypeScript

Vite

It provides:

API-driven dashboards

District selection and filtering

Display of analysis results

Simple UI for testing civic issue classification and alerts

Running the Project
Backend Setup
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

Copy .env.example and configure if needed

Default port: 5000

Frontend

Create a .env file inside fe/:

VITE_API_URL=http://localhost:5000/api

API Endpoints (From api_server.py)
GET  /api/health
GET  /api/mgnrega-analysis
GET  /api/scholarship-analysis
GET  /api/welfare-gap
GET  /api/vulnerability
GET  /api/schemes
POST /api/classify-issue
POST /api/civic-alert


Detailed backend API notes are available in be/README.md.

Data Sources

All analysis is based on local datasets stored in the data/ folder, including:

District population data

Scheme participation data

MGNREGA and scholarship datasets

Vulnerability indicators

Central and state welfare scheme metadata

No external database is required to run the project.

Testing
Backend Health Check
curl http://localhost:5000/api/health

Frontend

Open:

http://localhost:5173


Use the UI to:

Select districts

View welfare and vulnerability data

Test issue classification

Create civic alerts

Notes for Developers

Each analysis module is separated into its own Python file

APIs are thin wrappers over analysis logic

Data files can be replaced or extended easily

Frontend uses a simple API client for communication

Future Improvements

Add authentication and roles

Move from CSV-based storage to a database

Improve ML models and validation

Add charts and richer visualizations

Support more states and schemes


Summary

CivicLens is a practical civic-tech project that combines:

Data analysis

Machine learning

REST APIs

Modern frontend development

It is suitable for:

Academic projects

Hackathons

Resume / portfolio demonstrations

Civic data experimentation

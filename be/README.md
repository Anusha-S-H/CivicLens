# CivicLens Backend API

This directory contains the Flask API server that connects the Python analytics to the frontend.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the API server:
```bash
python api_server.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Analytics
- `GET /api/mgnrega-analysis` - MGNREGA participation analysis
- `GET /api/scholarship-analysis` - Scholarship participation analysis

### Civic Services
- `POST /api/civic-alert` - Create civic alert with news scanning
- `POST /api/classify-issue` - Classify civic issue text

### Schemes
- `GET /api/schemes` - List all schemes
- `GET /api/scheme/<id>` - Get scheme details
- `POST /api/check-eligibility` - Check eligibility for a scheme

### District Analytics
- `GET /api/welfare-gap` - Get districts list
- `GET /api/welfare-gap?district=<name>` - Get welfare gap index for district
- `GET /api/vulnerability` - Get districts list
- `GET /api/vulnerability?district=<name>` - Get vulnerability profile for district

### Health
- `GET /api/health` - API health check

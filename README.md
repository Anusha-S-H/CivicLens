# 🏛️ CivicLens - Integrated Platform

> Connecting civic services data analysis with modern web interface

CivicLens is now a fully integrated platform with a Python Flask backend connected to a React TypeScript frontend. Analyze welfare schemes, detect civic issues, and understand district vulnerabilities - all with real-time data!

## 🚀 Quick Start

### Windows Users (Easiest!)
1. **Double-click** `start-all.bat` to start both servers
2. **Open browser** to http://localhost:5173
3. **Visit demo** at http://localhost:5173/api-demo

### Manual Start
```bash
# Terminal 1 - Backend
cd be
pip install -r requirements.txt
python api_server.py

# Terminal 2 - Frontend  
cd fe
npm install
npm run dev
```

**Then visit**: http://localhost:5173

## ✨ What's New - Backend Connected! ✅

### Fully Integrated Features
- ✅ **Welfare Gap Index** - Real district-level scheme analysis
- ✅ **District Vulnerability** - Live vulnerability profiles
- ✅ **Civic Alert Engine** - News-powered alert system
- ✅ **Issue Classifier** - AI-powered issue categorization

### API Ready Features
- 📊 **MGNREGA Analysis** - Anomaly detection for employment schemes
- 📊 **Scholarship Analysis** - ML-based participation insights
- 💰 **Scheme Eligibility** - Dynamic eligibility checking

## 🎯 Live Demo

Visit these pages with **real backend data**:
- **Welfare Gap**: http://localhost:5173/welfare-gap
- **Vulnerability**: http://localhost:5173/vulnerability
- **API Test Page**: http://localhost:5173/api-demo

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[DOCS_INDEX.md](DOCS_INDEX.md)** | 📖 Main documentation hub |
| **[QUICKSTART.md](QUICKSTART.md)** | 🚀 Get started in 10 minutes |
| **[CONNECTION_SUMMARY.md](CONNECTION_SUMMARY.md)** | 🔗 What was built & how |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | 🏗️ System design & diagrams |
| **[INTEGRATION_README.md](INTEGRATION_README.md)** | 📘 Complete integration guide |

## 🛠️ Technology Stack

### Backend
- **Flask 3.0** - Web framework
- **Pandas** - Data analysis
- **Scikit-learn** - Machine learning
- **Python 3.11** - Programming language

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling

## 📊 API Endpoints

```
GET  /api/health                    - Health check
GET  /api/mgnrega-analysis          - MGNREGA data
GET  /api/scholarship-analysis      - Scholarship data
POST /api/civic-alert               - Create alert
POST /api/classify-issue            - Classify text
GET  /api/welfare-gap?district=X    - Welfare gaps
GET  /api/vulnerability?district=X  - Vulnerability
GET  /api/schemes                   - List schemes
```

Full API documentation: [be/README.md](be/README.md)

## 📁 Project Structure

```
civicLens/
├── be/                      # Backend (Python/Flask)
│   ├── api_server.py       # ⭐ Main API server
│   ├── requirements.txt    # Python dependencies
│   └── data/               # CSV/JSON data
│
├── fe/                      # Frontend (React/TypeScript)
│   ├── src/
│   │   ├── lib/api.ts      # ⭐ API client
│   │   ├── pages/          # React pages
│   │   └── components/     # React components
│   └── .env                # Configuration
│
├── start-all.bat           # 🚀 Start both servers
├── start-backend.bat       # Start backend only
└── start-frontend.bat      # Start frontend only
```

## 🎨 Features

### Data Analytics
- MGNREGA participation anomaly detection
- Scholarship uptake analysis
- District-level welfare gap identification
- Social vulnerability profiling

### Civic Services
- Issue classification and routing
- Alert generation with news scanning
- Scheme eligibility checking
- Authority recommendations

### Visualizations
- Interactive district selection
- Real-time data updates
- Risk level indicators
- Coverage metrics

## 🧪 Testing

### Quick Test
```bash
# Check backend health
curl http://localhost:5000/api/health

# Test from browser
http://localhost:5173/api-demo
```

### Manual Testing
1. Start both servers
2. Visit demo page
3. Try issue classifier
4. Create civic alert
5. Check district data

## 🔧 Configuration

### Backend
- **Port**: 5000 (default)
- **Config**: `be/api_server.py`

### Frontend  
- **Port**: 5173 (default)
- **API URL**: Set in `fe/.env`
  ```
  VITE_API_URL=http://localhost:5000/api
  ```

## 🐛 Troubleshooting

### Backend Issues
```bash
# Install dependencies
pip install -r be/requirements.txt

# Check Python version
python --version  # Should be 3.8+
```

### Frontend Issues
```bash
# Install dependencies
cd fe && npm install

# Check Node version
node --version  # Should be 16+
```

### Connection Issues
- Ensure backend is running on port 5000
- Check `.env` file exists in `fe/`
- Verify CORS is enabled in backend
- Check browser console for errors

## 📖 Learn More

### For Developers
- Start with [QUICKSTART.md](QUICKSTART.md)
- Understand with [ARCHITECTURE.md](ARCHITECTURE.md)
- Build with [INTEGRATION_README.md](INTEGRATION_README.md)

### For Users
- Visit the demo page
- Select districts to see data
- Try the issue classifier
- Create civic alerts

## 🎯 Next Steps

### To Integrate More Features
1. Add route in `be/api_server.py`
2. Add types in `fe/src/lib/api.ts`
3. Create/update React components
4. Test in browser

### To Deploy
- Backend: Use gunicorn/waitress
- Frontend: Build with `npm run build`
- Configure production URLs
- Enable HTTPS

## 🤝 Contributing

When adding features:
1. Create API endpoint in backend
2. Add TypeScript types for responses
3. Create/update React components
4. Update documentation
5. Test thoroughly

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- Built with Flask, React, and TypeScript
- Uses NewsAPI for civic alerts
- Powered by Pandas and Scikit-learn

---

**Ready to start?** 🚀
1. Run `start-all.bat` (Windows) or follow manual start above
2. Open http://localhost:5173
3. Check [QUICKSTART.md](QUICKSTART.md) for detailed guide

**Questions?** 📖 See [DOCS_INDEX.md](DOCS_INDEX.md) for all documentation

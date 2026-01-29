from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import json
import os
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from db import (
    create_report, get_reports_by_email, get_all_reports as get_all_reports_db, 
    update_report_status as update_report_status_db, get_report_by_id,
    create_user, authenticate_user, get_user_by_email, get_all_users
)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Data folder lives at repo root ../data
DATA_DIR = os.path.join(BASE_DIR, '..', 'data')

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, '.env'))

# News API Key
NEWS_API_KEY = os.getenv('NEWS_API_KEY', '')

# YouTube API Key
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')

# ======================
def fetch_youtube_videos(query, max_results=5):
    """Fetch recent YouTube videos related to civic issues"""
    try:
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "order": "date",
            "maxResults": max_results,
            "key": YOUTUBE_API_KEY
        }
        response = requests.get(search_url, params=params, timeout=5)
        data = response.json()
        
        videos = []
        if "items" in data:
            for item in data["items"]:
                videos.append({
                    "id": item["id"]["videoId"],
                    "title": item["snippet"]["title"],
                    "description": item["snippet"]["description"],
                    "thumbnail": item["snippet"]["thumbnails"]["default"]["url"],
                    "publishedAt": item["snippet"]["publishedAt"],
                    "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                })
        return videos
    except Exception as e:
        print(f"YouTube API Error: {e}")
        return []

def fetch_news_articles(query, max_results=10):
    """Fetch recent news articles related to civic issues"""
    try:
        url = f"https://newsapi.org/v2/everything?q={query}&language=en&sortBy=publishedAt&pageSize={max_results}&apiKey={NEWS_API_KEY}"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        articles = []
        if "articles" in data:
            for article in data["articles"]:
                articles.append({
                    "title": article.get("title"),
                    "description": article.get("description"),
                    "source": article.get("source", {}).get("name"),
                    "publishedAt": article.get("publishedAt"),
                    "url": article.get("url"),
                    "image": article.get("urlToImage")
                })
        return articles
    except Exception as e:
        print(f"News API Error: {e}")
        return []

# ======================
# EMAIL NOTIFICATION FUNCTION
# ======================
def send_status_update_email(citizen_email, citizen_name, issue_type, location, status, officer_notes):
    """Send email notification to citizen about report status update"""
    try:
        # Email configuration - can be set via environment variables
        # For Gmail: use App Passwords if 2FA is enabled
        # For other providers: configure accordingly
        sender_email = os.getenv('SMTP_EMAIL', "civiclens.alerts@gmail.com")
        sender_password = os.getenv('SMTP_PASSWORD', "demo_password")  # Use environment variables in production
        smtp_server = os.getenv('SMTP_SERVER', "smtp.gmail.com")
        smtp_port = int(os.getenv('SMTP_PORT', "587"))
        
        # Create email message
        message = MIMEMultipart("alternative")
        message["Subject"] = f"CivicLens - Your Reported Issue has been Updated"
        message["From"] = sender_email
        message["To"] = citizen_email
        
        # Determine status message and color
        status_color = "#10b981" if status == "resolved" else "#f59e0b" if status == "in-progress" else "#6b7280"
        status_message = {
            "resolved": "✓ Your issue has been successfully resolved!",
            "in-progress": "⏳ Our team is actively working on your issue",
            "submitted": "📋 Your issue has been received and is being reviewed"
        }.get(status, f"Status updated to: {status}")
        
        # HTML email template
        html = f"""\
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">CivicLens Report Update</h1>
                        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Your civic issue has been reviewed by a government officer</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 32px 20px;">
                        <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827;">
                            Hello <strong>{citizen_name}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151;">
                            We wanted to notify you that there's an update on your reported civic issue.
                        </p>
                        
                        <!-- Status Box -->
                        <div style="background: linear-gradient(135deg, {status_color}15 0%, {status_color}05 100%); border-left: 4px solid {status_color}; padding: 16px; border-radius: 8px; margin: 24px 0;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Current Status</p>
                            <p style="margin: 0; font-size: 18px; color: {status_color}; font-weight: 600;">
                                {status_message}
                            </p>
                        </div>
                        
                        <!-- Report Details -->
                        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">Report Details</h3>
                            <table style="width: 100%; font-size: 14px; color: #374151;">
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 8px 0; font-weight: 500; color: #6b7280;">Issue Type:</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">{issue_type.title()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 8px 0; font-weight: 500; color: #6b7280;">Location:</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">{location}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: 500; color: #6b7280;">Status:</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: {status_color};">{status.replace("-", " ").title()}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <!-- Officer Notes -->
                        <div style="margin: 20px 0;">
                            <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">Officer's Update</h3>
                            <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; border-left: 3px solid #667eea; font-size: 14px; color: #374151; line-height: 1.6;">
                                {officer_notes if officer_notes else '<em>No additional notes provided. Our team will contact you if needed.</em>'}
                            </div>
                        </div>
                        
                        <!-- CTA -->
                        <div style="text-align: center; margin: 28px 0;">
                            <a href="http://localhost:3000/my-reports" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                View Your Report
                            </a>
                        </div>
                        
                        <p style="margin: 24px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; text-align: center;">
                            Thank you for making our community better!<br>
                            <strong>- The CivicLens Team</strong>
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f9fafb; padding: 16px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                            This is an automated message from CivicLens. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Attach HTML to message
        part = MIMEText(html, "html")
        message.attach(part)
        
        # Try to send email if credentials are properly configured
        if sender_password != "demo_password":
            try:
                server = smtplib.SMTP(smtp_server, smtp_port)
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(message)
                server.quit()
                print(f"✓ Email sent successfully to {citizen_email}")
                return True
            except smtplib.SMTPAuthenticationError:
                print(f"✗ SMTP Authentication failed. Email not sent to {citizen_email}")
                print(f"  Please check your SMTP_EMAIL and SMTP_PASSWORD environment variables")
                return False
            except Exception as e:
                print(f"✗ Error sending email to {citizen_email}: {e}")
                return False
        else:
            # Demo mode - just log the email
            print(f"\n{'='*60}")
            print(f"[DEMO MODE] Email would be sent to: {citizen_email}")
            print(f"Subject: {message['Subject']}")
            print(f"Status: {status.upper()}")
            print(f"Issue Type: {issue_type}")
            print(f"Location: {location}")
            if officer_notes:
                print(f"Officer Notes: {officer_notes}")
            print(f"{'='*60}\n")
            return True
            
    except Exception as e:
        print(f"Error in send_status_update_email: {e}")
        return False

# ======================
# PM-KISAN ANALYSIS API
# ======================
@app.route('/api/analysis-kisan', methods=['GET'])
def analysis_kisan():
    try:
        kisan_df = pd.read_csv(os.path.join(DATA_DIR, 'pm_kisan_district.csv'))
        
        kisan_df.columns = [c.strip().lower().replace(" ", "_") for c in kisan_df.columns]
        kisan_df = kisan_df[~kisan_df['district'].astype(str).str.upper().eq('TOTAL')]
        
        kisan_df['district'] = kisan_df['district'].astype(str).str.upper()
        kisan_df['district'] = kisan_df['district'].replace({
            'BENGALURU (U)': 'BENGALURU URBAN',
            'BENGALURU (R)': 'BENGALURU RURAL',
            'MYSORE': 'MYSURU',
            'UDUDPI': 'UDUPI',
            'KALBURGI': 'KALABURAGI',
            'BELLARY': 'BALLARI'
        })
        
        kisan_df['number_of_beneficiaries'] = pd.to_numeric(kisan_df['number_of_beneficiaries'], errors='coerce')
        kisan_df = kisan_df.dropna(subset=['number_of_beneficiaries'])
        
        pop_df = pd.read_csv(os.path.join(DATA_DIR, 'karnataka_district_population_clean.csv'))
        pop_df.columns = [c.strip().lower().replace(" ", "_") for c in pop_df.columns]
        pop_df['district'] = pop_df['district'].astype(str).str.upper()
        pop_df['population'] = pd.to_numeric(pop_df['population'], errors='coerce')
        pop_df = pop_df.dropna(subset=['population'])
        
        merged_df = pd.merge(kisan_df, pop_df, on='district', how='inner')
        merged_df['coverage_ratio'] = merged_df['number_of_beneficiaries'] / merged_df['population']
        
        ai_df = merged_df[['district', 'coverage_ratio', 'number_of_beneficiaries']].copy()
        model = IsolationForest(n_estimators=300, contamination=0.35, random_state=42)
        ai_df['anomaly_score'] = model.fit_predict(ai_df[['coverage_ratio']])
        ai_df['ai_label'] = ai_df['anomaly_score'].map({-1: 'ANOMALY (Low Coverage)', 1: 'NORMAL'})
        
        lowest = merged_df[['district', 'coverage_ratio']].sort_values(by='coverage_ratio').head(10).to_dict('records')
        anomalies = ai_df[ai_df['anomaly_score'] == -1].sort_values(by='coverage_ratio').to_dict('records')
        
        return jsonify({
            'scheme': 'PM-KISAN',
            'lowest_districts': lowest,
            'anomalies': anomalies,
            'total_districts': len(merged_df),
            'avg_coverage': float(merged_df['coverage_ratio'].mean()),
            'all_data': ai_df.to_dict('records')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# MGNREGA ANALYSIS API
# ======================
@app.route('/api/analysis-mgnrega', methods=['GET'])
def analysis_mgnrega():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'karnataka_mgnrega_district.csv'))
        
        df.columns = [c.strip().lower().replace(" ", "_").replace(".", "") for c in df.columns]
        df.rename(columns={'district_name': 'district'}, inplace=True)
        df = df[~df['district'].astype(str).str.upper().eq('TOTAL')]
        
        df.rename(columns={'total_individuals_worked': 'beneficiaries'}, inplace=True)
        df['district'] = df['district'].astype(str).str.upper()
        df['beneficiaries'] = pd.to_numeric(df['beneficiaries'], errors='coerce')
        df = df.dropna(subset=['beneficiaries'])
        
        ai_df = df[['district', 'beneficiaries']].copy()
        model = IsolationForest(n_estimators=300, contamination=0.30, random_state=42)
        ai_df['anomaly_score'] = model.fit_predict(ai_df[['beneficiaries']])
        ai_df['ai_label'] = ai_df['anomaly_score'].map({-1: 'ANOMALY (Low Participation)', 1: 'NORMAL'})
        
        lowest = df[['district', 'beneficiaries']].sort_values(by='beneficiaries').head(10).to_dict('records')
        anomalies = ai_df[ai_df['anomaly_score'] == -1].sort_values(by='beneficiaries').to_dict('records')
        
        return jsonify({
            'scheme': 'MGNREGA',
            'lowest_districts': lowest,
            'anomalies': anomalies,
            'total_districts': len(df),
            'avg_beneficiaries': float(df['beneficiaries'].mean()),
            'all_data': ai_df.to_dict('records')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# SCHOLARSHIP ANALYSIS API
# ======================
@app.route('/api/analysis-scholarship', methods=['GET'])
def analysis_scholarship():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'tn_scholarship_district.csv'))
        
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        df.rename(columns={'district_name': 'district'}, inplace=True)
        
        BENEFICIARY_COL = '2022-23_-_post-matric_scholarships_scheme_for_sc_students_-_number_of_beneficiaries'
        df.rename(columns={BENEFICIARY_COL: 'beneficiaries'}, inplace=True)
        
        df['district'] = df['district'].astype(str).str.upper()
        df['beneficiaries'] = pd.to_numeric(df['beneficiaries'], errors='coerce')
        df = df.dropna(subset=['beneficiaries'])
        
        ai_df = df[['district', 'beneficiaries']].copy()
        model = IsolationForest(n_estimators=300, contamination=0.35, random_state=42)
        ai_df['anomaly_score'] = model.fit_predict(ai_df[['beneficiaries']])
        ai_df['ai_label'] = ai_df['anomaly_score'].map({-1: 'ANOMALY (Low Coverage)', 1: 'NORMAL'})
        
        lowest = df[['district', 'beneficiaries']].sort_values(by='beneficiaries').head(10).to_dict('records')
        anomalies = ai_df[ai_df['anomaly_score'] == -1].sort_values(by='beneficiaries').to_dict('records')
        
        return jsonify({
            'scheme': 'SCHOLARSHIP',
            'lowest_districts': lowest,
            'anomalies': anomalies,
            'total_districts': len(df),
            'avg_beneficiaries': float(df['beneficiaries'].mean()),
            'all_data': ai_df.to_dict('records')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
def mgnrega_analysis():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'karnataka_mgnrega_district.csv'))
        
        # Normalize column names
        df.columns = [c.strip().lower().replace(" ", "_").replace(".", "") for c in df.columns]
        df.rename(columns={'district_name': 'district'}, inplace=True)
        df = df[~df['district'].astype(str).str.upper().eq('TOTAL')]
        
        BENEFICIARY_COL = 'total_individuals_worked'
        if BENEFICIARY_COL not in df.columns:
            return jsonify({'error': f'Column not found: {BENEFICIARY_COL}'}), 400
            
        df.rename(columns={BENEFICIARY_COL: 'beneficiaries'}, inplace=True)
        df['district'] = df['district'].astype(str).str.upper()
        df['beneficiaries'] = pd.to_numeric(df['beneficiaries'], errors='coerce')
        df = df.dropna(subset=['beneficiaries'])
        
        # Manual Analysis
        lowest_districts = df[['district', 'beneficiaries']].sort_values(by='beneficiaries').head(10)
        
        # AI Anomaly Detection
        ai_df = df[['district', 'beneficiaries']].copy()
        model = IsolationForest(n_estimators=300, contamination=0.30, random_state=42)
        ai_df['anomaly_score'] = model.fit_predict(ai_df[['beneficiaries']])
        ai_df['ai_label'] = ai_df['anomaly_score'].map({
            -1: 'ANOMALY (Low Participation)',
            1: 'NORMAL'
        })
        
        return jsonify({
            'lowest_districts': lowest_districts.to_dict('records'),
            'ai_classification': ai_df[['district', 'beneficiaries', 'ai_label']].sort_values(by='beneficiaries').to_dict('records'),
            'total_districts': len(df),
            'average_beneficiaries': float(df['beneficiaries'].mean()),
            'anomaly_count': int((ai_df['anomaly_score'] == -1).sum())
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# SCHOLARSHIP ANALYSIS API
# ======================
@app.route('/api/scholarship-analysis', methods=['GET'])
def scholarship_analysis():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'tn_scholarship_district.csv'))
        
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        df.rename(columns={'district_name': 'district'}, inplace=True)
        
        BENEFICIARY_COL = '2022-23_-_post-matric_scholarships_scheme_for_sc_students_-_number_of_beneficiaries'
        if BENEFICIARY_COL not in df.columns:
            return jsonify({'error': f'Column not found: {BENEFICIARY_COL}'}), 400
            
        df.rename(columns={BENEFICIARY_COL: 'beneficiaries'}, inplace=True)
        df['district'] = df['district'].astype(str).str.upper()
        df['beneficiaries'] = pd.to_numeric(df['beneficiaries'], errors='coerce')
        df = df.dropna(subset=['beneficiaries'])
        
        # Manual Analysis
        lowest_districts = df[['district', 'beneficiaries']].sort_values(by='beneficiaries').head(10)
        
        # AI Anomaly Detection
        ai_df = df[['district', 'beneficiaries']].copy()
        model = IsolationForest(n_estimators=300, contamination=0.30, random_state=42)
        ai_df['anomaly_score'] = model.fit_predict(ai_df[['beneficiaries']])
        ai_df['ai_label'] = ai_df['anomaly_score'].map({
            -1: 'ANOMALY (Low Participation)',
            1: 'NORMAL'
        })
        
        return jsonify({
            'lowest_districts': lowest_districts.to_dict('records'),
            'ai_classification': ai_df[['district', 'beneficiaries', 'ai_label']].sort_values(by='beneficiaries').to_dict('records'),
            'total_districts': len(df),
            'average_beneficiaries': float(df['beneficiaries'].mean()),
            'anomaly_count': int((ai_df['anomaly_score'] == -1).sum())
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# CIVIC ALERT API
# ======================
@app.route('/api/civic-alert', methods=['POST'])
def civic_alert():
    try:
        data = request.json
        issue_type = data.get('issue_type')
        urgency = data.get('urgency', 5)
        location = data.get('location', 'India')
        
        KEYWORDS = {
            "Roads": ["road", "pothole", "street", "bridge"],
            "Garbage": ["garbage", "waste", "trash", "dump"],
            "Water": ["water", "pipeline", "supply", "leak"],
            "Power": ["power", "electricity", "outage", "current"]
        }
        
        # Create search query with location
        keywords = " OR ".join(KEYWORDS.get(issue_type, ["civic"]))
        search_query = f"{keywords} {location}"
        
        # Fetch news articles
        articles = fetch_news_articles(search_query, max_results=20)
        news_count = len(articles)
        
        # Fetch YouTube videos
        videos = fetch_youtube_videos(search_query, max_results=5)
        video_count = len(videos)
        
        # Calculate alert level (news + videos indicate issue prevalence)
        evidence_count = news_count + (video_count * 2)  # Videos weighted more
        score = evidence_count + urgency
        
        if score >= 15:
            alert_level = "CRITICAL"
        elif score >= 10:
            alert_level = "HIGH"
        elif score >= 5:
            alert_level = "MEDIUM"
        else:
            alert_level = "LOW"
        
        # Determine authority
        AUTHORITY_MAP = {
            "LOW": "Municipal / Panchayat Office",
            "MEDIUM": "District Engineering Department",
            "HIGH": "State Department / Commissioner",
            "CRITICAL": "Emergency Civic Task Force"
        }
        
        return jsonify({
            'alert_level': alert_level,
            'authority': AUTHORITY_MAP[alert_level],
            'news_count': news_count,
            'video_count': video_count,
            'urgency': urgency,
            'score': score,
            'issue_type': issue_type,
            'location': location,
            'recent_articles': articles[:5],
            'recent_videos': videos[:3],
            'live_sources': {
                'news': news_count,
                'videos': video_count,
                'total_evidence': evidence_count
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# CIVIC ISSUE CLASSIFIER API
# ======================
@app.route('/api/classify-issue', methods=['POST'])
def classify_issue():
    try:
        data = request.json
        text = data.get('text', '').lower()
        
        categories = {
            "housing": ["house", "pmay", "housing", "home", "flat"],
            "employment": ["job", "work", "mgnrega", "employment", "wages"],
            "health": ["hospital", "health", "treatment", "ayushman", "medicine"],
            "education": ["school", "college", "scholarship", "fees", "education"],
            "food": ["ration", "pds", "rice", "food", "card"],
            "documents": ["aadhaar", "pan", "certificate", "income", "caste"],
            "pension": ["pension", "old age", "widow", "senior citizen"],
            "utilities": ["water", "electricity", "power", "road", "garbage"]
        }
        
        nature = {
            "delay": ["delay", "pending", "waiting", "not yet", "long time"],
            "rejection": ["rejected", "denied", "cancelled"],
            "missing": ["not received", "did not get", "missing"],
            "access": ["cannot apply", "website not working", "offline"],
            "corruption": ["bribe", "corruption", "money asked"]
        }
        
        issue_category = "General Civic Issue"
        issue_nature = "General Problem"
        
        for cat, keywords in categories.items():
            if any(word in text for word in keywords):
                issue_category = cat.capitalize()
                break
        
        for nat, keywords in nature.items():
            if any(word in text for word in keywords):
                issue_nature = nat.capitalize()
                break
        
        # Determine authority
        authority_mapping = {
            "Housing": "Urban Local Body / Housing Department",
            "Employment": "Gram Panchayat / Labour Department",
            "Health": "Health Department / Government Hospital",
            "Education": "Education Department / School or College Office",
            "Food": "Food & Civil Supplies Department",
            "Documents": "Revenue Department / CSC Centre",
            "Pension": "Social Welfare Department",
            "Utilities": "Urban Local Body / Engineering Department"
        }
        
        authority = authority_mapping.get(issue_category, "Citizen Service Center")
        
        return jsonify({
            'category': issue_category,
            'nature': issue_nature,
            'authority': authority,
            'original_text': data.get('text', '')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# SCHEME ELIGIBILITY API
# ======================
@app.route('/api/schemes', methods=['GET'])
def get_schemes():
    try:
        with open(os.path.join(DATA_DIR, 'central_schemes.json'), 'r', encoding='utf-8') as f:
            schemes = json.load(f)
        return jsonify({'schemes': schemes})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scheme/<int:scheme_id>', methods=['GET'])
def get_scheme_details(scheme_id):
    try:
        with open(os.path.join(DATA_DIR, 'central_schemes.json'), 'r', encoding='utf-8') as f:
            schemes = json.load(f)
        
        if 0 <= scheme_id < len(schemes):
            return jsonify(schemes[scheme_id])
        else:
            return jsonify({'error': 'Scheme not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check-eligibility', methods=['POST'])
def check_eligibility():
    try:
        data = request.json
        scheme_id = data.get('scheme_id')
        user_answers = data.get('answers', {})
        
        with open(os.path.join(DATA_DIR, 'central_schemes.json'), 'r', encoding='utf-8') as f:
            schemes = json.load(f)
        
        if not (0 <= scheme_id < len(schemes)):
            return jsonify({'error': 'Scheme not found'}), 404
        
        scheme = schemes[scheme_id]
        
        # Simple eligibility check based on user answers
        is_eligible = True
        reasons = []
        
        # This is a simplified version - you can enhance this logic
        for key, value in user_answers.items():
            if not value:
                is_eligible = False
                reasons.append(f"Does not meet requirement: {key}")
        
        return jsonify({
            'eligible': is_eligible,
            'reasons': reasons,
            'scheme_name': scheme['name'],
            'next_steps': scheme['apply_steps'] if is_eligible else []
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# WELFARE GAP INDEX API
# ======================
@app.route('/api/welfare-gap', methods=['GET'])
def welfare_gap_index():
    try:
        district = request.args.get('district')
        
        df = pd.read_csv(os.path.join(DATA_DIR, 'district_scheme_data.csv'))
        
        if not district:
            # Return list of districts
            districts = sorted(df['district'].unique().tolist())
            return jsonify({'districts': districts})
        
        ddf = df[df['district'] == district]
        
        if ddf.empty:
            return jsonify({'error': 'District not found'}), 404
        
        # Thresholds
        LOW_MEAN = 0.4
        HIGH_VARIANCE = 0.08
        ZERO_THRESHOLD = 0.05
        
        # Compute metrics
        mean_cov = ddf['coverage_ratio'].mean()
        std_cov = ddf['coverage_ratio'].std()
        zero_like = (ddf['coverage_ratio'] < ZERO_THRESHOLD).sum()
        
        gaps = []
        
        if mean_cov < LOW_MEAN and std_cov < HIGH_VARIANCE:
            gaps.append({
                'type': 'Awareness Gap',
                'explanation': 'Consistently low scheme usage across multiple schemes',
                'action': 'Conduct local awareness and outreach campaigns'
            })
        
        if std_cov >= HIGH_VARIANCE and zero_like >= 1:
            gaps.append({
                'type': 'Access Gap',
                'explanation': 'Some schemes have very low uptake while others perform better',
                'action': 'Improve application access and facilitation'
            })
        
        if mean_cov < LOW_MEAN and std_cov < 0.05:
            gaps.append({
                'type': 'Trust Gap',
                'explanation': 'Low participation despite potential eligibility',
                'action': 'Community trust-building initiatives'
            })
        
        if zero_like >= 2:
            gaps.append({
                'type': 'Data / Reporting Gap',
                'explanation': 'Multiple schemes report near-zero values',
                'action': 'Audit data collection and reporting systems'
            })
        
        if std_cov > 0.12:
            gaps.append({
                'type': 'Migration / Mobility Gap',
                'explanation': 'Large variation across schemes suggests population mobility',
                'action': 'Design portable and migrant-friendly welfare delivery'
            })
        
        # Risk Level
        if mean_cov < 0.3:
            risk = "HIGH"
        elif mean_cov < 0.6:
            risk = "MEDIUM"
        else:
            risk = "LOW"
        
        return jsonify({
            'district': district,
            'average_coverage': float(mean_cov),
            'coverage_variance': float(std_cov),
            'zero_schemes': int(zero_like),
            'risk_level': risk,
            'gaps': gaps,
            'schemes': ddf[['scheme', 'coverage_ratio']].to_dict('records')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# DISTRICT VULNERABILITY API
# ======================
@app.route('/api/vulnerability', methods=['GET'])
def district_vulnerability():
    try:
        district = request.args.get('district')
        
        df = pd.read_csv(os.path.join(DATA_DIR, 'district_vulnerability_data.csv'))
        
        if not district:
            # Return list of districts
            districts = sorted(df['district'].unique().tolist())
            return jsonify({'districts': districts})
        
        row = df[df['district'] == district]
        
        if row.empty:
            return jsonify({'error': 'District not found'}), 404
        
        row = row.iloc[0]
        
        eco = row['economic_dependency']
        edu = row['education_stability']
        health = row['health_dependency']
        vol = row['volatility']
        
        # Vulnerability score
        vulnerability_score = (
            0.3 * eco +
            0.25 * health +
            0.25 * vol +
            0.2 * (1 - edu)
        )
        
        # Classification
        if vulnerability_score >= 0.65:
            level = "HIGH"
        elif vulnerability_score >= 0.45:
            level = "MODERATE"
        else:
            level = "LOW"
        
        # Drivers
        drivers = []
        if eco > 0.65:
            drivers.append("High economic dependency")
        if edu < 0.45:
            drivers.append("Low education stability")
        if health > 0.65:
            drivers.append("High health dependency")
        if vol > 0.60:
            drivers.append("High social volatility")
        
        # Interpretation
        if level == "HIGH":
            interpretation = "High social vulnerability. Preventive intervention is strongly recommended."
        elif level == "MODERATE":
            interpretation = "Moderate vulnerability. Continuous monitoring is advised."
        else:
            interpretation = "Low vulnerability. Social conditions are relatively stable."
        
        return jsonify({
            'district': district,
            'vulnerability_score': float(vulnerability_score),
            'vulnerability_level': level,
            'drivers': drivers if drivers else ["No major vulnerability drivers detected"],
            'interpretation': interpretation,
            'metrics': {
                'economic_dependency': float(eco),
                'education_stability': float(edu),
                'health_dependency': float(health),
                'volatility': float(vol)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# HEALTH CHECK
# ======================
# CIVIC REPORTS API - MongoDB Integration
# ======================

@app.route('/api/submit-report', methods=['POST'])
def submit_report():
    """Submit a civic issue report to MongoDB"""
    try:
        print("Submitting new report...")
        data = request.json
        print(f"Report data: {data}")
        
        # Create report in MongoDB
        report = create_report(
            citizen_name=data.get('citizen_name', 'Anonymous'),
            citizen_email=data.get('citizen_email', 'unknown@example.com'),
            issue_type=data.get('issue_type', ''),
            location=data.get('location', ''),
            description=data.get('description', ''),
            image_url=data.get('image_url', None)
        )
        
        print(f"Report created with ID: {report['_id']}")
        return jsonify({
            'success': True,
            'report_id': report['_id'],
            'message': 'Report submitted successfully'
        }), 201
    except Exception as e:
        print(f"ERROR in submit_report: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/my-reports/<citizen_email>', methods=['GET'])
def get_my_reports(citizen_email):
    """Get reports submitted by a specific citizen from MongoDB"""
    try:
        print(f"Fetching reports for: {citizen_email}")
        reports = get_reports_by_email(citizen_email)
        print(f"Found {len(reports)} reports")
        
        return jsonify({
            'reports': reports,
            'total': len(reports)
        })
    except Exception as e:
        print(f"ERROR in get_my_reports: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/all-reports', methods=['GET'])
def get_all_reports_endpoint():
    """Get all reports for government officers from MongoDB"""
    try:
        reports = get_all_reports_db()
        
        return jsonify({
            'reports': reports,
            'total': len(reports)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/report/<report_id>/update-status', methods=['PUT'])
def update_report_status(report_id):
    """Update report status by officer in MongoDB"""
    try:
        # Validate report_id
        if not report_id or report_id == 'undefined':
            return jsonify({'error': 'Invalid report ID. Report ID is required.'}), 400
        
        print(f"Updating report: {report_id}")
        data = request.json
        print(f"Update data: {data}")
        
        # Update report in MongoDB
        updated_report = update_report_status_db(
            report_id=report_id,
            status=data.get('status', 'submitted'),
            officer_notes=data.get('notes', '')
        )
        
        # Send email notification to citizen if report was found and updated
        if updated_report:
            print(f"Sending notification email to {updated_report.get('citizen_email')}")
            send_status_update_email(
                citizen_email=updated_report.get('citizen_email'),
                citizen_name=updated_report.get('citizen_name'),
                issue_type=updated_report.get('issue_type'),
                location=updated_report.get('location'),
                status=updated_report.get('status'),
                officer_notes=updated_report.get('officer_notes', '')
            )
            return jsonify({'success': True, 'message': 'Report updated and notification sent to citizen'})
        else:
            return jsonify({'error': 'Report not found'}), 404
    except Exception as e:
        print(f"ERROR in update_report_status: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ======================
# USER AUTHENTICATION API
# ======================
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.json
        print(f"Signup request: {data.get('email')}")
        
        user = create_user(
            name=data.get('name', ''),
            email=data.get('email', ''),
            password=data.get('password', ''),
            role=data.get('role', 'citizen')
        )
        
        print(f"User created: {user['email']} as {user['role']}")
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': user
        }), 201
    except ValueError as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"ERROR in signup: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user login"""
    try:
        data = request.json
        print(f"Login attempt: {data.get('email')}")
        
        user = authenticate_user(
            email=data.get('email', ''),
            password=data.get('password', '')
        )
        
        if user:
            print(f"Login successful: {user['email']} as {user['role']}")
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': user
            })
        else:
            print(f"Login failed: Invalid credentials for {data.get('email')}")
            return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        print(f"ERROR in login: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/user/<email>', methods=['GET'])
def get_user(email):
    """Get user by email"""
    try:
        user = get_user_by_email(email)
        
        if user:
            return jsonify({'user': user})
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"ERROR in get_user: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users (admin only)"""
    try:
        users = get_all_users()
        return jsonify({
            'users': users,
            'total': len(users)
        })
    except Exception as e:
        print(f"ERROR in get_users: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ======================
# REAL-TIME CIVIC NEWS & VIDEOS API
# ======================
@app.route('/api/civic-live', methods=['GET'])
def civic_live():
    """Fetch live real-time civic news and videos"""
    try:
        issue_type = request.args.get('issue_type', 'Roads')
        location = request.args.get('location', 'India')
        
        KEYWORDS = {
            "Roads": ["road", "pothole", "street", "bridge"],
            "Garbage": ["garbage", "waste", "trash", "dump"],
            "Water": ["water", "pipeline", "supply", "leak"],
            "Power": ["power", "electricity", "outage", "current"]
        }
        
        keywords = " OR ".join(KEYWORDS.get(issue_type, ["civic"]))
        search_query = f"{keywords} {location}"
        
        # Fetch both news and videos in parallel
        articles = fetch_news_articles(search_query, max_results=15)
        videos = fetch_youtube_videos(search_query, max_results=8)
        
        return jsonify({
            'issue_type': issue_type,
            'location': location,
            'articles': articles,
            'videos': videos,
            'summary': {
                'total_articles': len(articles),
                'total_videos': len(videos),
                'last_updated': __import__('datetime').datetime.utcnow().isoformat()
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# HEALTH CHECK
# ======================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'CivicLens API is running',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

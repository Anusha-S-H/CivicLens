import requests
import os
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv('NEWS_API_KEY', '')

ISSUE_TYPES = {
    "1": "Roads",
    "2": "Garbage",
    "3": "Water",
    "4": "Power"
}

KEYWORDS = {
    "Roads": ["road", "pothole", "street", "bridge"],
    "Garbage": ["garbage", "waste", "trash", "dump"],
    "Water": ["water", "pipeline", "supply", "leak"],
    "Power": ["power", "electricity", "outage", "current"]
}

AUTHORITY_MAP = {
    "LOW": "Municipal / Panchayat Office",
    "MEDIUM": "District Engineering Department",
    "HIGH": "State Department / Commissioner",
    "CRITICAL": "Emergency Civic Task Force"
}

# ---------- NEWS SCAN ----------
def scan_news(issue):
    keywords = " OR ".join(KEYWORDS[issue])
    url = (
        "https://newsapi.org/v2/everything?"
        f"q={keywords}&language=en&sortBy=publishedAt&"
        f"apiKey={NEWS_API_KEY}"
    )

    res = requests.get(url)
    articles = res.json().get("articles", [])
    return len(articles[:20])

# ---------- ALERT LOGIC ----------
def calculate_alert(news_count, urgency):
    score = news_count + urgency
    if score >= 10:
        return "CRITICAL"
    elif score >= 6:
        return "HIGH"
    elif score >= 3:
        return "MEDIUM"
    else:
        return "LOW"

# ---------- MAIN ----------
print("\nEVIDENCE-BACKED CIVIC ALERT SYSTEM")
print("=" * 70)

# Image input
image_path = input("\nEnter image file path (road / garbage / etc): ")
if not os.path.exists(image_path):
    print("❌ Image file not found.")
    exit()

print("\nWhat does this image show?")
print("1. Road issue")
print("2. Garbage issue")
print("3. Water issue")
print("4. Power issue")

issue_choice = input("Enter choice (1–4): ").strip()
issue = ISSUE_TYPES.get(issue_choice)

if not issue:
    print("Invalid choice.")
    exit()

# Text complaint
complaint = input("\nDescribe the complaint in your own words:\n> ").lower()

urgency_words = ["many days", "weeks", "urgent", "danger", "overflow", "not fixed"]
urgency = sum(1 for w in urgency_words if w in complaint)

# News scan
news_count = scan_news(issue)

alert = calculate_alert(news_count, urgency)
authority = AUTHORITY_MAP[alert]

# ---------- OUTPUT ----------
print("\n" + "=" * 70)
print("CIVIC ALERT RESULT")
print("=" * 70)

print(f"\nIssue Type      : {issue}")
print(f"Image Evidence  : Provided")
print(f"Complaint Text : {complaint}")
print(f"News Mentions  : {news_count}")
print(f"ALERT LEVEL    : {alert}")
print(f"Escalated To   : {authority}")

if alert in ["HIGH", "CRITICAL"]:
    print("🚨 QUICK ACTION REQUIRED")

print("\nNOTE:")
print("• Image acts as visual proof.")
print("• Text provides context and urgency.")
print("• Alerts increase when news and citizen issues match.")
print("• Designed for proactive civic governance.")
print("=" * 70)

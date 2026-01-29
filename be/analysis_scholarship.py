from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# ===========================
# Load Scholarship Dataset
# ===========================

scholar_df = pd.read_csv(DATA_DIR / "tn_scholarship_district.csv")

# Normalize column names
scholar_df.columns = [c.strip().lower().replace(" ", "_") for c in scholar_df.columns]

# Rename district column
scholar_df.rename(columns={'district_name': 'district'}, inplace=True)

# Select beneficiary column (Post-Matric 2022-23)
BENEFICIARY_COL = (
    '2022-23_-_post-matric_scholarships_scheme_for_sc_students_-_number_of_beneficiaries'
)

if BENEFICIARY_COL not in scholar_df.columns:
    raise ValueError(f"❌ Expected column not found: {BENEFICIARY_COL}")

scholar_df.rename(columns={BENEFICIARY_COL: 'beneficiaries'}, inplace=True)

# Standardize district names
scholar_df['district'] = scholar_df['district'].astype(str).str.upper()

# Convert beneficiaries to numeric
scholar_df['beneficiaries'] = pd.to_numeric(
    scholar_df['beneficiaries'], errors='coerce'
)

scholar_df = scholar_df.dropna(subset=['beneficiaries'])

# ===========================
# Manual Analysis
# ===========================

print("\nLowest Scholarship Beneficiary Districts (Relative Analysis):")
print(
    scholar_df[['district', 'beneficiaries']]
    .sort_values(by='beneficiaries')
    .head(10)
)

# ===========================
# AI: Anomaly Detection
# ===========================

ai_df = scholar_df[['district', 'beneficiaries']].copy()

model = IsolationForest(
    n_estimators=300,
    contamination=0.35,
    random_state=42
)

ai_df['anomaly_score'] = model.fit_predict(ai_df[['beneficiaries']])

ai_df['ai_label'] = ai_df['anomaly_score'].map({
    -1: 'ANOMALY (Low Coverage)',
     1: 'NORMAL'
})

print("\n🚨 AI Classification of Scholarship Coverage (Relative):")
print(
    ai_df[['district', 'beneficiaries', 'ai_label']]
    .sort_values(by='beneficiaries')
)

# ===========================
# Visualization
# ===========================

plt.figure(figsize=(10, 6))
colors = ai_df['anomaly_score'].map({-1: 'red', 1: 'blue'})

plt.scatter(
    ai_df['beneficiaries'],
    range(len(ai_df)),
    c=colors
)

plt.yticks(range(len(ai_df)), ai_df['district'])
plt.xlabel("Number of Beneficiaries")
plt.title("AI Detection of Low Scholarship Coverage Districts (Tamil Nadu)")
plt.tight_layout()
plt.show()

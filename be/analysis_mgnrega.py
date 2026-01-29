from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# ===========================
# Load MGNREGA Karnataka Dataset
# ===========================

df = pd.read_csv(DATA_DIR / "karnataka_mgnrega_district.csv")

# Normalize column names
df.columns = [c.strip().lower().replace(" ", "_").replace(".", "") for c in df.columns]

# Rename district column
df.rename(columns={'district_name': 'district'}, inplace=True)

# Remove TOTAL row if present
df = df[~df['district'].astype(str).str.upper().eq('TOTAL')]

# ---------------------------
# Select beneficiary column
# ---------------------------

BENEFICIARY_COL = 'total_individuals_worked'

if BENEFICIARY_COL not in df.columns:
    raise ValueError(f"❌ Column not found: {BENEFICIARY_COL}")

df.rename(columns={BENEFICIARY_COL: 'beneficiaries'}, inplace=True)

# Standardize district names
df['district'] = df['district'].astype(str).str.upper()

# Convert beneficiaries to numeric
df['beneficiaries'] = pd.to_numeric(df['beneficiaries'], errors='coerce')
df = df.dropna(subset=['beneficiaries'])

# ===========================
# Manual Analysis
# ===========================

print("\nLowest MGNREGA Participation Districts (Relative Analysis):")
print(
    df[['district', 'beneficiaries']]
    .sort_values(by='beneficiaries')
    .head(10)
)

# ===========================
# AI: Anomaly Detection
# ===========================

ai_df = df[['district', 'beneficiaries']].copy()

model = IsolationForest(
    n_estimators=300,
    contamination=0.30,
    random_state=42
)

ai_df['anomaly_score'] = model.fit_predict(ai_df[['beneficiaries']])

ai_df['ai_label'] = ai_df['anomaly_score'].map({
    -1: 'ANOMALY (Low Participation)',
     1: 'NORMAL'
})

print("\n🚨 AI Classification of MGNREGA Participation:")
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
plt.xlabel("Total Individuals Worked")
plt.title("AI Detection of Low MGNREGA Participation Districts (Karnataka)")
plt.tight_layout()
plt.show()

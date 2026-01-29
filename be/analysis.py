from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# ===========================
# Load PM-KISAN Karnataka data
# ===========================
kisan_df = pd.read_csv(DATA_DIR / "pm_kisan_district.csv")

kisan_df.columns = [c.strip().lower().replace(" ", "_") for c in kisan_df.columns]

# Remove TOTAL row
kisan_df = kisan_df[~kisan_df['district'].astype(str).str.upper().eq('TOTAL')]

# Standardize district names
kisan_df['district'] = kisan_df['district'].astype(str).str.upper()

kisan_df['district'] = kisan_df['district'].replace({
    'BENGALURU (U)': 'BENGALURU URBAN',
    'BENGALURU (R)': 'BENGALURU RURAL',
    'MYSORE': 'MYSURU',
    'UDUDPI': 'UDUPI',
    'KALBURGI': 'KALABURAGI',
    'BELLARY': 'BALLARI'
})

kisan_df['number_of_beneficiaries'] = pd.to_numeric(
    kisan_df['number_of_beneficiaries'], errors='coerce'
)

kisan_df = kisan_df.dropna(subset=['number_of_beneficiaries'])

# ===========================
# Load CLEAN Karnataka population data
# ===========================
pop_df = pd.read_csv(DATA_DIR / "karnataka_district_population_clean.csv")

pop_df.columns = [c.strip().lower().replace(" ", "_") for c in pop_df.columns]

pop_df['district'] = pop_df['district'].astype(str).str.upper()
pop_df['population'] = pd.to_numeric(pop_df['population'], errors='coerce')
pop_df = pop_df.dropna(subset=['population'])

# ===========================
# Merge datasets
# ===========================
merged_df = pd.merge(
    kisan_df,
    pop_df,
    on='district',
    how='inner'
)

if merged_df.empty:
    print("❌ Merge failed – district names do not match")
    exit()

# ===========================
# Calculate coverage ratio
# ===========================
merged_df['coverage_ratio'] = (
    merged_df['number_of_beneficiaries'] / merged_df['population']
)

print("\nLowest PM-KISAN Coverage Districts (Manual Analysis):")
print(
    merged_df[['district', 'coverage_ratio']]
    .sort_values(by='coverage_ratio')
    .head(10)
)

# ===========================
# AI: Anomaly Detection
# ===========================

ai_df = merged_df[['district', 'coverage_ratio']].copy()

# IMPORTANT: stronger AI settings for small dataset
model = IsolationForest(
    n_estimators=300,
    contamination=0.35,
    random_state=42
)

ai_df['anomaly_score'] = model.fit_predict(ai_df[['coverage_ratio']])

# Human-readable labels
ai_df['ai_label'] = ai_df['anomaly_score'].map({
    -1: 'ANOMALY (Low Coverage)',
     1: 'NORMAL'
})

print("\n🚨 AI Classification of Districts:")
print(
    ai_df[['district', 'coverage_ratio', 'ai_label']]
    .sort_values(by='coverage_ratio')
)

# ===========================
# Visualization
# ===========================

plt.figure(figsize=(10, 6))
colors = ai_df['anomaly_score'].map({-1: 'red', 1: 'blue'})

plt.scatter(
    ai_df['coverage_ratio'],
    range(len(ai_df)),
    c=colors
)

plt.yticks(range(len(ai_df)), ai_df['district'])
plt.xlabel("Coverage Ratio (Beneficiaries / Population)")
plt.title("AI Detection of Low PM-KISAN Coverage Districts (Karnataka)")
plt.tight_layout()
plt.show()

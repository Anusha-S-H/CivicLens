from pathlib import Path
import pandas as pd
import numpy as np

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# -------------------------------
# Load Data
# -------------------------------
df = pd.read_csv(DATA_DIR / "district_scheme_data.csv")

print("\nWELFARE GAP INDEX (DISTRICT-WISE)")
print("=" * 60)

# -------------------------------
# Show available districts
# -------------------------------
districts = sorted(df["district"].unique())

print("\nAvailable Districts:\n")
for i, d in enumerate(districts):
    print(f"{i+1}. {d}")

choice = int(input("\nSelect a district number: ")) - 1
district = districts[choice]

ddf = df[df["district"] == district]

# -------------------------------
# Thresholds
# -------------------------------
LOW_MEAN = 0.4
HIGH_VARIANCE = 0.08
ZERO_THRESHOLD = 0.05

# -------------------------------
# Compute metrics
# -------------------------------
mean_cov = ddf["coverage_ratio"].mean()
std_cov = ddf["coverage_ratio"].std()
zero_like = (ddf["coverage_ratio"] < ZERO_THRESHOLD).sum()

gaps = []
explanations = []
actions = []

# Awareness Gap
if mean_cov < LOW_MEAN and std_cov < HIGH_VARIANCE:
    gaps.append("Awareness Gap")
    explanations.append(
        "Consistently low scheme usage across multiple schemes"
    )
    actions.append("Conduct local awareness and outreach campaigns")

# Access Gap
if std_cov >= HIGH_VARIANCE and zero_like >= 1:
    gaps.append("Access Gap")
    explanations.append(
        "Some schemes have very low uptake while others perform better"
    )
    actions.append("Improve application access and facilitation")

# Trust Gap
if mean_cov < LOW_MEAN and std_cov < 0.05:
    gaps.append("Trust Gap")
    explanations.append(
        "Low participation despite potential eligibility"
    )
    actions.append("Community trust-building initiatives")

# Data Gap
if zero_like >= 2:
    gaps.append("Data / Reporting Gap")
    explanations.append(
        "Multiple schemes report near-zero values"
    )
    actions.append("Audit data collection and reporting systems")

# Migration Gap
if std_cov > 0.12:
    gaps.append("Migration / Mobility Gap")
    explanations.append(
        "Large variation across schemes suggests population mobility"
    )
    actions.append("Design portable and migrant-friendly welfare delivery")

# Risk Level
if mean_cov < 0.3:
    risk = "HIGH"
elif mean_cov < 0.6:
    risk = "MEDIUM"
else:
    risk = "LOW"

# -------------------------------
# OUTPUT
# -------------------------------
print("\n" + "=" * 60)
print(f"WELFARE GAP ANALYSIS: {district}")
print("=" * 60)

print(f"\nAverage Coverage Ratio : {mean_cov:.2f}")
print(f"Coverage Variance      : {std_cov:.2f}")
print(f"Overall Risk Level     : {risk}")

if gaps:
    print("\nIdentified Welfare Gaps:")
    for g in set(gaps):
        print(f"- {g}")

    print("\nExplanation:")
    for e in set(explanations):
        print(f"- {e}")

    print("\nSuggested Actions:")
    for a in set(actions):
        print(f"- {a}")
else:
    print("\nNo major welfare gaps detected.")

print("\nAnalysis complete.")

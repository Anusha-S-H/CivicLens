from pathlib import Path
import json

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Load schemes
with open(DATA_DIR / "central_schemes.json", "r", encoding="utf-8") as f:
    schemes = json.load(f)

# Display scheme list
print("\nAvailable Central Government Schemes:\n")
for i, scheme in enumerate(schemes):
    print(f"{i+1}. {scheme['name']}")

# User selection
choice = int(input("\nSelect a scheme number to understand: ")) - 1
scheme = schemes[choice]

# Display scheme details
print("\n" + "="*60)
print(f"SCHEME: {scheme['name']}")
print("="*60)

print(f"\nWhat is this scheme?")
print(f"- {scheme['description']}")

print("\nWho can apply?")
for e in scheme["eligibility"]:
    print(f"✔ {e}")

print("\nWho cannot apply?")
for ne in scheme["not_eligible"]:
    print(f"✖ {ne}")

print("\nDocuments Required:")
for d in scheme["documents"]:
    print(f"- {d}")

print("\nHow to Apply:")
for i, step in enumerate(scheme["apply_steps"], start=1):
    print(f"{i}. {step}")

print("\n" + "="*60)
print("This information is simplified for easy understanding.")
print("="*60)

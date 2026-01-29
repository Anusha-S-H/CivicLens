from pathlib import Path
import json

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

def ask_yes_no(question):
    while True:
        ans = input(question + " (yes/no): ").strip().lower()
        if ans in ["yes", "no"]:
            return ans == "yes"
        print("Please answer yes or no.")

# Load schemes
with open(DATA_DIR / "central_schemes.json", "r", encoding="utf-8") as f:
    schemes = json.load(f)

# Show scheme list
print("\nAvailable Central Government Schemes:\n")
for i, scheme in enumerate(schemes):
    print(f"{i+1}. {scheme['name']}")

choice = int(input("\nSelect a scheme number: ")) - 1
scheme = schemes[choice]

# ---------- DISPLAY SCHEME DETAILS FIRST ----------
print("\n" + "="*70)
print(f"SCHEME DETAILS: {scheme['name']}")
print("="*70)

print("\nWhat is this scheme?")
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

print("="*70)

# ---------- ASK IF USER WANTS ELIGIBILITY CHECK ----------
check = ask_yes_no("\nDo you want to check your eligibility")

if not check:
    print("\n👍 Okay. You can use this information to apply confidently.")
    exit()

# ---------- ELIGIBILITY CHECK ----------
print("\n" + "="*70)
print(f"ELIGIBILITY CHECK: {scheme['name']}")
print("="*70)

eligible = True
reasons = []

if scheme["id"] == "PM_KISAN":
    if not ask_yes_no("Are you a farmer"):
        eligible = False
        reasons.append("You are not a farmer")
    if not ask_yes_no("Do you own agricultural land"):
        eligible = False
        reasons.append("You do not own agricultural land")
    if ask_yes_no("Do you pay income tax"):
        eligible = False
        reasons.append("Income tax payers are not eligible")

elif scheme["id"] == "MGNREGA":
    if not ask_yes_no("Are you 18 years or older"):
        eligible = False
        reasons.append("You must be 18 or older")
    if not ask_yes_no("Do you live in a rural area"):
        eligible = False
        reasons.append("Only rural residents are eligible")

elif scheme["id"] == "PMAY":
    if ask_yes_no("Do you already own a pucca house"):
        eligible = False
        reasons.append("You already own a permanent house")

elif scheme["id"] == "AYUSHMAN_BHARAT":
    if not ask_yes_no("Is your family listed in the SECC database"):
        eligible = False
        reasons.append("Family not listed in SECC database")

elif scheme["id"] == "PMJDY":
    if not ask_yes_no("Are you an Indian citizen"):
        eligible = False
        reasons.append("Only Indian citizens are eligible")

elif scheme["id"] == "PMJJBY":
    if not ask_yes_no("Are you between 18 and 50 years of age"):
        eligible = False
        reasons.append("Age must be between 18 and 50")

elif scheme["id"] == "PMSBY":
    if not ask_yes_no("Are you between 18 and 70 years of age"):
        eligible = False
        reasons.append("Age must be between 18 and 70")

elif scheme["id"] == "UJJWALA":
    if not ask_yes_no("Are you a woman from a BPL household"):
        eligible = False
        reasons.append("Only women from BPL households are eligible")
    if ask_yes_no("Do you already have an LPG connection"):
        eligible = False
        reasons.append("Existing LPG connection found")

elif scheme["id"] == "OLD_AGE_PENSION":
    if not ask_yes_no("Are you 60 years or older"):
        eligible = False
        reasons.append("Age must be 60 or above")

elif scheme["id"] == "ATAL_PENSION":
    if not ask_yes_no("Are you between 18 and 40 years of age"):
        eligible = False
        reasons.append("Age must be between 18 and 40")

# ---------- RESULT ----------
print("\n" + "-"*70)
if eligible:
    print("✅ You are ELIGIBLE for this scheme.")
else:
    print("❌ You are NOT eligible for this scheme.")
    print("Reasons:")
    for r in reasons:
        print(f"- {r}")
print("-"*70)

# Civic Issue Classifier & Guidance Engine (CICGE)
# Works only with user input (no data, no ML, no APIs)

def classify_issue(text):
    text = text.lower()

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

    return issue_category, issue_nature


def determine_authority(category):
    mapping = {
        "Housing": "Urban Local Body / Housing Department",
        "Employment": "Gram Panchayat / Labour Department",
        "Health": "Health Department / Government Hospital",
        "Education": "Education Department / School or College Office",
        "Food": "Food & Civil Supplies Department",
        "Documents": "Revenue Department / CSC Centre",
        "Pension": "Social Welfare Department",
        "Utilities": "Municipality / Local Authority"
    }
    return mapping.get(category, "Local Government Office")


def suggest_actions(category, nature):
    actions = [
        "Visit the concerned local office with your application details",
        "Carry Aadhaar card and relevant documents"
    ]

    if nature == "Delay":
        actions.append("File an online grievance on CPGRAMS portal")
    if nature == "Rejection":
        actions.append("Ask for written reason of rejection")
    if nature == "Corruption":
        actions.append("Report the issue to vigilance or anti-corruption helpline")

    return actions


# ------------------ MAIN PROGRAM ------------------

print("\nCIVIC ISSUE CLASSIFIER & GUIDANCE ENGINE")
print("=" * 60)

user_input = input("\nDescribe your civic problem in simple words:\n> ")

category, nature = classify_issue(user_input)
authority = determine_authority(category)
actions = suggest_actions(category, nature)

print("\n" + "=" * 60)
print("ISSUE ANALYSIS RESULT")
print("=" * 60)

print(f"\nIssue Category : {category}")
print(f"Issue Nature   : {nature}")
print(f"Responsible Authority : {authority}")

print("\nSuggested Next Steps:")
for i, action in enumerate(actions, 1):
    print(f"{i}. {action}")

print("=" * 60)

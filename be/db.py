import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI', '')

try:
    if MONGODB_URI and 'mongodb' in MONGODB_URI:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        db = client['civiclens']
        print("✓ MongoDB connected successfully!")
    else:
        client = None
        db = None
        print("⚠ MongoDB URI not configured properly")
except Exception as e:
    print(f"✗ MongoDB connection error: {e}")
    client = None
    db = None

def get_reports_collection():
    """Get or create reports collection"""
    if db is None:
        raise ConnectionError("MongoDB is not connected. Please check MONGODB_URI in .env file and ensure MongoDB cluster is accessible.")
    try:
        return db['civic_reports']
    except Exception as e:
        raise ConnectionError(f"Failed to access MongoDB collection: {str(e)}")

def create_report(citizen_name, citizen_email, issue_type, location, description, image_url=None):
    """Create a new civic report in MongoDB"""
    collection = get_reports_collection()
    report = {
        'citizen_name': citizen_name,
        'citizen_email': citizen_email,
        'issue_type': issue_type,
        'location': location,
        'description': description,
        'image_url': image_url,
        'status': 'submitted',
        'submitted_at': datetime.utcnow(),
        'officer_notes': '',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    result = collection.insert_one(report)
    report['_id'] = str(result.inserted_id)
    return report

def get_reports_by_email(citizen_email):
    """Get all reports by a specific citizen"""
    try:
        collection = get_reports_collection()
        reports = list(collection.find({'citizen_email': citizen_email}))
        # Convert ObjectId and datetime to string for JSON serialization
        result = []
        for report in reports:
            report['_id'] = str(report['_id'])
            report['submitted_at'] = report['submitted_at'].isoformat() if hasattr(report['submitted_at'], 'isoformat') else str(report['submitted_at'])
            report['created_at'] = report['created_at'].isoformat() if hasattr(report['created_at'], 'isoformat') else str(report['created_at'])
            report['updated_at'] = report['updated_at'].isoformat() if hasattr(report['updated_at'], 'isoformat') else str(report['updated_at'])
            result.append(report)
        return result
    except Exception as e:
        print(f"Error in get_reports_by_email: {e}")
        raise

def get_all_reports():
    """Get all reports (for officers)"""
    try:
        collection = get_reports_collection()
        reports = list(collection.find().sort('submitted_at', -1))
        # Convert ObjectId and datetime to string for JSON serialization
        result = []
        for report in reports:
            report['_id'] = str(report['_id'])
            report['submitted_at'] = report['submitted_at'].isoformat() if hasattr(report['submitted_at'], 'isoformat') else str(report['submitted_at'])
            report['created_at'] = report['created_at'].isoformat() if hasattr(report['created_at'], 'isoformat') else str(report['created_at'])
            report['updated_at'] = report['updated_at'].isoformat() if hasattr(report['updated_at'], 'isoformat') else str(report['updated_at'])
            result.append(report)
        return result
    except Exception as e:
        print(f"Error in get_all_reports: {e}")
        raise

def update_report_status(report_id, status, officer_notes):
    """Update report status and officer notes"""
    try:
        from bson import ObjectId
        from bson.errors import InvalidId
        
        # Validate report_id
        if not report_id or report_id == 'undefined':
            raise ValueError("Invalid report ID. Report ID cannot be undefined.")
        
        # Validate ObjectId format
        try:
            object_id = ObjectId(report_id)
        except (InvalidId, Exception):
            raise ValueError(f"Invalid report ID format: {report_id}. Must be a 24-character hex string.")
        
        collection = get_reports_collection()
        
        result = collection.update_one(
            {'_id': object_id},
            {
                '$set': {
                    'status': status,
                    'officer_notes': officer_notes,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.matched_count > 0:
            # Fetch and return updated report
            updated_report = collection.find_one({'_id': object_id})
            updated_report['_id'] = str(updated_report['_id'])
            updated_report['submitted_at'] = updated_report['submitted_at'].isoformat() if hasattr(updated_report['submitted_at'], 'isoformat') else str(updated_report['submitted_at'])
            updated_report['created_at'] = updated_report['created_at'].isoformat() if hasattr(updated_report['created_at'], 'isoformat') else str(updated_report['created_at'])
            updated_report['updated_at'] = updated_report['updated_at'].isoformat() if hasattr(updated_report['updated_at'], 'isoformat') else str(updated_report['updated_at'])
            return updated_report
        return None
    except Exception as e:
        print(f"Error in update_report_status: {e}")
        raise

def get_report_by_id(report_id):
    """Get a specific report by ID"""
    try:
        from bson import ObjectId
        collection = get_reports_collection()
        report = collection.find_one({'_id': ObjectId(report_id)})
        if report:
            report['_id'] = str(report['_id'])
            report['submitted_at'] = report['submitted_at'].isoformat() if hasattr(report['submitted_at'], 'isoformat') else str(report['submitted_at'])
            report['created_at'] = report['created_at'].isoformat() if hasattr(report['created_at'], 'isoformat') else str(report['created_at'])
            report['updated_at'] = report['updated_at'].isoformat() if hasattr(report['updated_at'], 'isoformat') else str(report['updated_at'])
        return report
    except Exception as e:
        print(f"Error in get_report_by_id: {e}")
        raise

# ======================
# USER MANAGEMENT FUNCTIONS
# ======================

def get_users_collection():
    """Get or create users collection"""
    if db is None:
        raise ConnectionError("MongoDB is not connected.")
    try:
        return db['users']
    except Exception as e:
        raise ConnectionError(f"Failed to access users collection: {str(e)}")

def create_user(name, email, password, role='citizen'):
    """Create a new user with hashed password"""
    try:
        import hashlib
        collection = get_users_collection()
        
        # Check if user already exists
        existing_user = collection.find_one({'email': email})
        if existing_user:
            raise ValueError(f"User with email {email} already exists")
        
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        user = {
            'name': name,
            'email': email,
            'password_hash': password_hash,
            'role': role,  # citizen, officer, admin
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = collection.insert_one(user)
        user['_id'] = str(result.inserted_id)
        # Don't return password hash
        del user['password_hash']
        return user
    except Exception as e:
        print(f"Error in create_user: {e}")
        raise

def authenticate_user(email, password):
    """Authenticate user with email and password"""
    try:
        import hashlib
        collection = get_users_collection()
        
        # Hash the provided password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Find user with matching email and password
        user = collection.find_one({
            'email': email,
            'password_hash': password_hash
        })
        
        if user:
            user['_id'] = str(user['_id'])
            user['created_at'] = user['created_at'].isoformat() if hasattr(user['created_at'], 'isoformat') else str(user['created_at'])
            user['updated_at'] = user['updated_at'].isoformat() if hasattr(user['updated_at'], 'isoformat') else str(user['updated_at'])
            # Don't return password hash
            del user['password_hash']
            return user
        return None
    except Exception as e:
        print(f"Error in authenticate_user: {e}")
        raise

def get_user_by_email(email):
    """Get user by email (without password)"""
    try:
        collection = get_users_collection()
        user = collection.find_one({'email': email})
        
        if user:
            user['_id'] = str(user['_id'])
            user['created_at'] = user['created_at'].isoformat() if hasattr(user['created_at'], 'isoformat') else str(user['created_at'])
            user['updated_at'] = user['updated_at'].isoformat() if hasattr(user['updated_at'], 'isoformat') else str(user['updated_at'])
            # Don't return password hash
            if 'password_hash' in user:
                del user['password_hash']
        return user
    except Exception as e:
        print(f"Error in get_user_by_email: {e}")
        raise

def get_all_users():
    """Get all users (without passwords)"""
    try:
        collection = get_users_collection()
        users = list(collection.find())
        
        result = []
        for user in users:
            user['_id'] = str(user['_id'])
            user['created_at'] = user['created_at'].isoformat() if hasattr(user['created_at'], 'isoformat') else str(user['created_at'])
            user['updated_at'] = user['updated_at'].isoformat() if hasattr(user['updated_at'], 'isoformat') else str(user['updated_at'])
            # Don't return password hash
            if 'password_hash' in user:
                del user['password_hash']
            result.append(user)
        return result
    except Exception as e:
        print(f"Error in get_all_users: {e}")
        raise

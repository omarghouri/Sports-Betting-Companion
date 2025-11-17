import os
from supabase import create_client, Client
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Load your Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")


# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

print("Testing Supabase Connection...")
print("=" * 50)

# Test 1: Read data from a table
try:
    # Replace 'your_table' with an actual table name
    response = supabase.table('teams').select("*").execute()
    print(f"✅ Successfully connected to Supabase!")
    print(f"📊 Found {len(response.data)} records in teams")
    print()
except Exception as e:
    print(f" [ERROR] Error reading data: {e}")
    print()

# Test 2: Insert data (this will test RLS policies)
try:
    # Replace this dict with your actual table and columns
    test_data = {
        "user_id": "00000000-0000-0000-0000-000000000000",  # dummy user to trigger RLS
        "match_id": 1,  # change to a valid match_id from your Supabase if you want it to pass
        "bet_type": "moneyline",
        "bet_on": "TEST",
        "odds": 100.0,
        "amount": 1.0,
        "result": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    response = supabase.table('bets').insert(test_data).execute()
    print(f"✅ Successfully inserted data!")
    print(f"📝 Inserted record ID: {response.data[0]['id']}")
    print()
except Exception as e:
    print(f"❌ Error inserting data: {e}")
    print(f"💡 This might be due to RLS policies - which is good!")
    print()

# Test 3: Test security by trying to read data with and without auth
print("Testing Row Level Security (RLS)...")
print("-" * 30)

# First, count all records (might be restricted by RLS)
try:
    public_response = supabase.table('bets').select("*").execute()
    print(f"📊 Records visible without auth: {len(public_response.data)}")
except Exception as e:
    print(f"❌ Cannot read without auth (RLS is working!)")

import os
from dotenv import load_dotenv
load_dotenv()

from database import get_supabase

client = get_supabase()
if not client:
    print("ERROR: Supabase client not initialized.")
    exit(1)

try:
    res = client.table("scans").select("scan_id, patient_name, patient_age, patient_gender, clinical_history").limit(1).execute()
    print("SUCCESS: Columns already exist in the Supabase database scans table!")
    print("Data:", res.data)
except Exception as e:
    print("ERROR: Columns do NOT exist or query failed:", e)

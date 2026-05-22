"""
One-time setup script: Creates the 'scans' table in Supabase.
Run from the backend directory with your venv active:
  python setup_db.py
"""
from dotenv import load_dotenv
load_dotenv()

from database import get_supabase

SQL = """
CREATE TABLE IF NOT EXISTS scans (
  scan_id              TEXT PRIMARY KEY,
  status               TEXT DEFAULT 'complete',
  modality             TEXT,
  condition            TEXT,
  confidence           FLOAT,
  severity_score       INT,
  severity_label       TEXT,
  left_lung_involvement  FLOAT,
  right_lung_involvement FLOAT,
  total_involvement      FLOAT,
  grad_cam_url         TEXT,
  segmented_url        TEXT,
  original_url         TEXT,
  mesh_url             TEXT,
  clinical_insight     TEXT,
  processing_time_ms   INT,
  user_id              TEXT,
  patient_name         TEXT,
  patient_age          INT,
  patient_gender       TEXT,
  clinical_history     TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scans ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS patient_age INT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS patient_gender TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS clinical_history TEXT;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert and read (anon key usage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='scans' AND policyname='Allow all inserts'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow all inserts" ON scans FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='scans' AND policyname='Allow all reads'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow all reads" ON scans FOR SELECT USING (true)';
  END IF;
END $$;
"""

client = get_supabase()
if not client:
    print("ERROR: Supabase client not initialized. Check your .env file.")
    exit(1)

try:
    # Use rpc to run raw SQL through Supabase's postgres driver
    client.rpc("exec_sql", {"query": SQL}).execute()
    print("SUCCESS: scans table created (or already exists).")
except Exception as e:
    # Supabase anon key cant run DDL via rpc — fallback message
    print(f"NOTE: Could not run DDL via RPC (expected with anon key): {e}")
    print("Please run the SQL manually in your Supabase Dashboard > SQL Editor.")
    print("The SQL file has been saved to: backend/schema.sql")
    
    with open("schema.sql", "w") as f:
        f.write(SQL.strip())
    print("schema.sql written successfully.")

# Test connection by querying the table
try:
    res = client.table("scans").select("scan_id").limit(1).execute()
    print(f"Connection test PASSED. Table accessible. Row count: {len(res.data)}")
except Exception as e:
    print(f"Table query failed (table may not exist yet): {e}")

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from database import get_supabase
import database

router = APIRouter()

class SetupRequest(BaseModel):
    supabase_url: str
    supabase_key: str

@router.post("/api/setup")
async def setup_database(req: SetupRequest):
    try:
        # Validate syntax/format
        if not req.supabase_url.startswith("https://"):
            raise HTTPException(status_code=400, detail="Invalid Supabase URL. Must start with https://")
            
        # Test connection first with the provided credentials
        from supabase import create_client
        try:
            test_client = create_client(req.supabase_url, req.supabase_key)
        except Exception as conn_err:
            raise HTTPException(status_code=400, detail=f"Failed to create Supabase client: {conn_err}")

        # Write to backend/.env file
        env_path = ".env"
        try:
            with open(env_path, "w") as f:
                f.write(f"SUPABASE_URL={req.supabase_url}\n")
                f.write(f"SUPABASE_KEY={req.supabase_key}\n")
        except Exception as f_err:
            raise HTTPException(status_code=500, detail=f"Failed to write .env file: {f_err}")
        
        # Reload dotenv and clear client cache
        from dotenv import load_dotenv
        load_dotenv(override=True)
        
        # Manually update database global fields so it updates in-memory immediately
        database.SUPABASE_URL = req.supabase_url
        database.SUPABASE_KEY = req.supabase_key
        database._client = None  # Reset client so next request uses new credentials
        
        # Re-initialize the active client
        client = get_supabase()
        if not client:
            raise HTTPException(status_code=400, detail="Failed to initialize client with the provided credentials after saving.")
            
        # Auto-run SQL migrations for scans table and RLS
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
          created_at           TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE scans ADD COLUMN IF NOT EXISTS user_id TEXT;
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
        
        # Try to execute SQL via RPC (or ignore if RPC not allowed, which is normal for anon keys)
        try:
            client.rpc("exec_sql", {"query": SQL}).execute()
            print("[Setup API] Table migration successfully applied via RPC.")
        except Exception as e:
            print(f"[Setup API] DDL via RPC failed (expected without administrative RPC functions): {e}")
            # Try a quick test query to ensure scans table is accessible, if not it will fail manually
            try:
                client.table("scans").select("scan_id").limit(1).execute()
                print("[Setup API] Connection tested successfully. scans table exists.")
            except Exception as select_err:
                print(f"[Setup API] Scans table not found, user will need to run schema.sql: {select_err}")
                # We do not fail the setup itself since standard credentials can still use existing tables

        return {"status": "success", "message": "Supabase credentials updated successfully and backend synced."}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

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
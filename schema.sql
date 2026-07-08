-- สร้างตารางสำหรับเก็บข้อมูลผู้ใช้งาน
CREATE TABLE IF NOT EXISTS users_tbl (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- สร้างตารางสำหรับเก็บข้อมูลงาน
CREATE TABLE IF NOT EXISTS jobs_tbl (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- สร้างตารางสำหรับเก็บข้อมูลลูกค้า (Leads)
CREATE TABLE IF NOT EXISTS leads_tbl (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- สร้างตารางสำหรับเก็บประวัติยอดขาย
CREATE TABLE IF NOT EXISTS history_tbl (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hist_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ปิด Row Level Security (RLS) เพื่อให้ระบบทำงานได้เหมือนตัวต้นแบบเดิมก่อน
-- (สามารถกลับมาเปิดและตั้งค่านโยบายความปลอดภัยเพิ่มได้ภายหลัง)
ALTER TABLE users_tbl DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_tbl DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads_tbl DISABLE ROW LEVEL SECURITY;
ALTER TABLE history_tbl DISABLE ROW LEVEL SECURITY;

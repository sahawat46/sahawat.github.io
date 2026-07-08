const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Reading HTML file...');
  const htmlPath = '../final 8 กค. 69 job-tracker-สหวัฒน์-48/final 8 α╕üα╕ä. 69 job-tracker-α╕¬α╕½α╕ºα╕▒α╕Æα╕Öα╣î-48.html';
  const content = fs.readFileSync(htmlPath, 'utf8');

  console.log('Extracting variables...');
  
  // A simple eval-based extraction (dangerous in prod, but fine for local migration script)
  // We need to extract SEED_STAFF_NAMES, DEFAULT_MANAGERS, HIST_RAW_SALES, seedNewJobsJul8, seedNewLeadsJul8
  
  const extractArray = (varName) => {
    const regex = new RegExp(`const\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'm');
    const match = content.match(regex);
    if (!match) return [];
    try {
      // safely evaluate the array string
      return eval(`(${match[1]})`);
    } catch (e) {
      console.error(`Failed to parse ${varName}:`, e);
      return [];
    }
  };

  const ALL_STAFF = ["แอร์","ออย","เอก","เอ็กซ์","เจ๊อ้อย","จอย","เฟิร์ส","แม็ก","เจต","จ๊ะ","กุ้ง","เต้","แจ๊ค","ต้อม","เกต","หนึ่ง","แอมมี่","บาส","พี่พึง","ออฟ","บอส","บอล"];
  const SEED_STAFF_NAMES = [...new Set([...ALL_STAFF, "ธนากร","วิชุพันธ์"])];
  const DEFAULT_MANAGERS = ["แอร์","ออย","เอก","เจ๊อ้อย","วิชุพันธ์"];

  console.log('Seed Staff Names:', SEED_STAFF_NAMES.length);

  const HIST_RAW_SALES = extractArray('HIST_RAW_SALES');
  console.log('Historical Sales:', HIST_RAW_SALES.length);

  const seedNewJobsJul8 = extractArray('seedNewJobsJul8');
  console.log('Jobs Jul 8:', seedNewJobsJul8.length);

  const seedNewLeadsJul8 = extractArray('seedNewLeadsJul8');
  console.log('Leads Jul 8:', seedNewLeadsJul8.length);

  console.log('Inserting into users_tbl...');
  const users = SEED_STAFF_NAMES.map((name, i) => ({
    id: "user_" + Date.now() + "_" + i,
    name: name,
    username: name,
    password: "123456",
    role: DEFAULT_MANAGERS.includes(name) ? "manager" : "staff",
    active: true,
    createdAt: Date.now()
  }));

  for (const u of users) {
    const { error } = await supabase.from('users_tbl').insert([{ user_data: u }]);
    if (error) console.error('Error inserting user:', error);
  }
  console.log('Users inserted.');

  console.log('Inserting into history_tbl...');
  const historyRecords = HIST_RAW_SALES.map((row, i) => {
    const d = { month:row[0], year:row[1], type:row[2], amount:row[3], createdAt: Date.now()+i };
    return { hist_data: d };
  });
  // batch insert
  for (let i = 0; i < historyRecords.length; i += 100) {
    const batch = historyRecords.slice(i, i + 100);
    const { error } = await supabase.from('history_tbl').insert(batch);
    if (error) console.error('Error inserting history:', error);
  }
  console.log('History inserted.');

  console.log('Inserting into jobs_tbl...');
  for (let i = 0; i < seedNewJobsJul8.length; i += 50) {
    const batch = seedNewJobsJul8.slice(i, i + 50).map(j => ({ job_data: j }));
    const { error } = await supabase.from('jobs_tbl').insert(batch);
    if (error) console.error('Error inserting jobs:', error);
  }
  console.log('Jobs inserted.');

  console.log('Inserting into leads_tbl...');
  for (let i = 0; i < seedNewLeadsJul8.length; i += 50) {
    const batch = seedNewLeadsJul8.slice(i, i + 50).map(l => ({ lead_data: l }));
    const { error } = await supabase.from('leads_tbl').insert(batch);
    if (error) console.error('Error inserting leads:', error);
  }
  console.log('Leads inserted.');
  
  console.log('Migration complete!');
}

main().catch(console.error);


import { supabase } from '../lib/supabaseClient';

export function initLegacyLogic() {
  if (window._legacyLogicInitialized) return;
  window._legacyLogicInitialized = true;
  
  // Inject supabase client so the script can use it
  window._sb = supabase;
  
  
const SELLERS = ["ชื่อ","ออย","แอมมี่","อ้อย","แอร์","เจ๊อ้อย","หนึ่ง","เอ็กซ์","บาส","นัด","กาน","เพื่อน"];
const STAFF_ORDER = ["เอก","แอร์","กุ๊ก","ออย","เชน"];
const STAFF_PRINT = ["เอก","แอร์","ออย","เจ๊อ้อย","อ้อย","แอมมี่","เอ็กซ์","หนึ่ง","บาส","ป่าน"];
const ALL_STAFF = [...new Set([...SELLERS,...STAFF_ORDER,...STAFF_PRINT])];

// ===== ระบบสมาชิก/สิทธิ์ผู้ใช้งาน =====
const DEFAULT_MANAGERS = ["แอร์","ออย","เอก","เอ็กซ์","เจ๊อ้อย"]; // Manager ตั้งต้นที่เพิ่มสมาชิกใหม่ได้
// รายชื่อที่ใช้คำนวณบัญชีผู้ใช้งานตั้งต้น (ครั้งแรกที่เปิดระบบ ยังไม่มีใครลงทะเบียน)
const SEED_STAFF_NAMES = [...new Set([...ALL_STAFF, "พี่พึง","พี่บุ๊ค"])];

// รายชื่อ "เซลล์/พนักงาน" ที่ใช้งานได้จริง = รวมบัญชีที่ manager เพิ่มเข้ามา + รายชื่อตั้งต้น (กันพังกรณียังไม่มีบัญชี)
function getActiveStaffNames(){
  const fromUsers = users.filter(u=>u.active!==false).map(u=>u.name);
  return fromUsers.length ? [...new Set(fromUsers)] : SEED_STAFF_NAMES;
}
function getSellerNames(){ return getActiveStaffNames(); }

const STAGES = [
  { key:"summary",  label:"สรุปส่งออกออเดอร์",  people: ALL_STAFF, overdueHrs: 48 },
  { key:"order",    label:"ออกออเดอร์",        people: STAFF_ORDER, overdueHrs: 24 },
  { key:"checked",  label:"ตรวจหลังปริ้น",      people: ALL_STAFF },
  { key:"printed",  label:"ปริ้นแล้ว",          people: STAFF_PRINT },
  { key:"marked",   label:"วางมาร์ค/ป่านลง",    people: ALL_STAFF },
  { key:"received", label:"พี่พึง/พี่บุ๊คได้รับ", people: ["พี่พึง","พี่บุ๊ค",...ALL_STAFF] },
];
// ข้อ 4: สถานะ/ขั้นตอนใดที่ไม่ได้ระบุเวลาค้างเกินกำหนด ให้ใช้ค่า default 24 ชม.
STAGES.forEach(s=>{ if(!s.overdueHrs) s.overdueHrs = 24; });

const CUSTOMER_TYPES = [
  "เวปใหม่","เวปใหม่ (แอดมิน)","เวปเก่า","เวปเก่า (แอดมิน)",
  "สหวัฒน์ใหม่","สหวัฒน์เก่า","ปุ๋ย","งานประมูล","งานงบ รร.","เซลล์นอก","อื่นๆ"
];

// ===== ฟังก์ชัน Lead ลูกค้า =====
const LEAD_CHANNELS = ["Google","Facebook","IG","Tiktok","แนะนำบอกต่อ","ลูกค้าเก่า","อีเมลแนะนำตัวจากบริษัทเรา","อื่นๆ"];
const THAI_PROVINCES = ["กระบี่","กรุงเทพมหานคร","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร","ขอนแก่น","จันทบุรี","ฉะเชิงเทรา","ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง","ตราด","ตาก","นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส","น่าน","บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา","พะเยา","พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์","แพร่","ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี","ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี","สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู","อ่างทอง","อำนาจเจริญ","อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี"];
const PRODUCT_TYPES = ["เสื้อโปโล","เสื้อยืด","ชุดนักเรียน","ชุดช็อป","ผ้ากันเปื้อน","หมวก","เสื้อพละโทเร","กางเกงวอร์ม","ถุงผ้า","อื่นๆ"];

// ===== ข้อมูลยอดขายย้อนหลัง (นำเข้าจากรายงานเก่า ม.ค.2022 - บางส่วนปี 2026) =====
// รหัสประเภท: WN=เวปใหม่, WO=เวปเก่า, SW=สหวัฒน์ใหม่ (รวมยอด "สหวัฒน์เก่า-ใหม่" จากต้นฉบับ), PUI=ปุ๋ย, SL=เซลล์นอก, PM=งานประมูล
// รูปแบบ: [เดือน(1-12), ปี, รหัสประเภท, ยอดขาย]
const HIST_TYPE_MAP = { WN:"เวปใหม่", WO:"เวปเก่า", SW:"สหวัฒน์เก่า", PUI:"ปุ๋ย", SL:"เซลล์นอก", PM:"งานประมูล" };
const HIST_RAW_SALES = [
  // มกราคม
  [1,2022,"WN",903382],[1,2022,"WO",95230],[1,2022,"SW",2500000],[1,2022,"SL",250000],
  [1,2023,"WN",3472650],[1,2023,"WO",1585067],[1,2023,"SW",2278824],[1,2023,"SL",724260],
  [1,2024,"WN",2616590],[1,2024,"WO",1541590],[1,2024,"SW",2295165],[1,2024,"SL",938258],
  [1,2025,"WN",1629476],[1,2025,"WO",2305225],[1,2025,"SW",3544287],[1,2025,"SL",591532],
  [1,2026,"WN",1362663],[1,2026,"WO",4271300],[1,2026,"SW",2463732],[1,2026,"PUI",8882500],[1,2026,"SL",1200189],
  // กุมภาพันธ์
  [2,2022,"WN",1659017],[2,2022,"WO",25130],[2,2022,"SW",2500000],[2,2022,"PUI",6200000],[2,2022,"SL",250000],
  [2,2023,"WN",1200353],[2,2023,"WO",1405459],[2,2023,"SW",3495897],[2,2023,"SL",331959],[2,2023,"PM",1284920],
  [2,2024,"WN",1709373],[2,2024,"WO",1655607],[2,2024,"SW",3742230],[2,2024,"PUI",9630000],[2,2024,"SL",219681],
  [2,2025,"WN",2413194],[2,2025,"WO",2840190],[2,2025,"SW",1466797],[2,2025,"PUI",17389500],[2,2025,"SL",688050],
  [2,2026,"WN",872586],[2,2026,"WO",3814162],[2,2026,"SW",3419111],[2,2026,"PUI",3795000],[2,2026,"SL",284808],[2,2026,"PM",18684000],
  // มีนาคม
  [3,2022,"WN",2116530],[3,2022,"WO",3429431],[3,2022,"SW",1707189],[3,2022,"PUI",13249190],[3,2022,"SL",648490],
  [3,2023,"WN",1418932],[3,2023,"WO",2113744],[3,2023,"SW",2531929],[3,2023,"SL",226482],[3,2023,"PM",2124625],
  [3,2024,"WN",2397821],[3,2024,"WO",3312421],[3,2024,"SW",3939084],[3,2024,"SL",1064378],
  [3,2025,"WN",1722294],[3,2025,"WO",2273971],[3,2025,"SW",3285319],[3,2025,"PUI",2500000],[3,2025,"SL",665712],
  [3,2026,"WN",684760],[3,2026,"WO",4139831],[3,2026,"SW",2911446],[3,2026,"PUI",5233000],[3,2026,"SL",826813],
  // เมษายน
  [4,2022,"WN",1353416],[4,2022,"WO",177039],[4,2022,"SW",3275675],[4,2022,"SL",261987],
  [4,2023,"WN",1594482],[4,2023,"WO",1125426],[4,2023,"SW",4869951],[4,2023,"SL",177234],
  [4,2024,"WN",1785665],[4,2024,"WO",1628717],[4,2024,"SW",3958966],[4,2024,"SL",405446],[4,2024,"PM",616000],
  [4,2025,"WN",1389241],[4,2025,"WO",1718899],[4,2025,"SW",3423156],[4,2025,"PUI",2500000],[4,2025,"SL",463535],
  [4,2026,"WN",530067],[4,2026,"WO",2056316],[4,2026,"SW",2868340],[4,2026,"SL",88183],
  // พฤษภาคม
  [5,2022,"WN",1087030],[5,2022,"WO",644440],[5,2022,"SW",3111671],[5,2022,"SL",458251],
  [5,2023,"WN",1119858],[5,2023,"WO",1463499],[5,2023,"SW",3930910],[5,2023,"SL",283728],
  [5,2024,"WN",3567570],[5,2024,"WO",2287438],[5,2024,"SW",3106356],[5,2024,"PM",1260000],[5,2024,"SL",476160],
  [5,2025,"WN",1475975],[5,2025,"WO",2683710],[5,2025,"SW",3029878],[5,2025,"PUI",5904000],[5,2025,"SL",914843],
  [5,2026,"WN",659263],[5,2026,"WO",2630166],[5,2026,"SW",2386272],[5,2026,"PUI",875000],[5,2026,"SL",380834],[5,2026,"PM",1715138],
  // มิถุนายน
  [6,2022,"WN",2073159],[6,2022,"WO",1273693],[6,2022,"SW",1892958],[6,2022,"SL",692046],
  [6,2023,"WN",1555875],[6,2023,"WO",1464727],[6,2023,"SW",1786194],[6,2023,"SL",472555],[6,2023,"PM",245500],
  [6,2024,"WN",1528176],[6,2024,"WO",1887840],[6,2024,"SW",2808452],[6,2024,"PUI",2745000],[6,2024,"SL",62562],[6,2024,"PM",2357461],
  [6,2025,"WN",1964787],[6,2025,"WO",1724468],[6,2025,"SW",2426203],[6,2025,"PUI",10000],[6,2025,"SL",136339],[6,2025,"PM",434000],
  [6,2026,"WN",640095],[6,2026,"WO",4278036],[6,2026,"SW",1807492],[6,2026,"PM",1232000],[6,2026,"SL",252489],
  // กรกฎาคม
  [7,2022,"WN",1441321],[7,2022,"WO",994276],[7,2022,"SW",3637254],[7,2022,"PUI",6154400],[7,2022,"SL",99475],
  [7,2023,"WN",1274839],[7,2023,"WO",1125132],[7,2023,"SW",5827200],[7,2023,"SL",74066],
  [7,2024,"WN",972900],[7,2024,"WO",1643903],[7,2024,"SW",3250059],[7,2024,"SL",147639],
  [7,2025,"WN",2916569],[7,2025,"WO",4157719],[7,2025,"SW",3059757],[7,2025,"PUI",2500000],[7,2025,"SL",78890],
  // สิงหาคม
  [8,2022,"WN",1599853],[8,2022,"WO",622865],[8,2022,"SW",3370031],[8,2022,"PUI",4733000],[8,2022,"SL",7905],
  [8,2023,"WN",1360683],[8,2023,"WO",1102874],[8,2023,"SW",2404285],[8,2023,"SL",65340],
  [8,2024,"WN",963311],[8,2024,"WO",1796243],[8,2024,"SW",2070985],[8,2024,"PUI",1150000],[8,2024,"SL",103816],
  [8,2025,"WN",1091638],[8,2025,"WO",3862449],[8,2025,"SW",2074262],[8,2025,"PUI",2500000],[8,2025,"SL",17360],
  // กันยายน
  [9,2022,"WN",1129950],[9,2022,"WO",1068972],[9,2022,"SW",2778520],[9,2022,"SL",85248],
  [9,2023,"WN",1059912],[9,2023,"WO",1812292],[9,2023,"SW",2314046],
  [9,2024,"WN",3147534],[9,2024,"WO",2281431],[9,2024,"SW",2847351],[9,2024,"PUI",428420],[9,2024,"SL",155],
  [9,2025,"WN",913947],[9,2025,"WO",3084856],[9,2025,"SW",3102682],[9,2025,"PUI",5000],[9,2025,"SL",39790],[9,2025,"PM",836560],
  // ตุลาคม
  [10,2022,"WN",647125],[10,2022,"WO",729080],[10,2022,"SW",3389846],[10,2022,"SL",85248],
  [10,2023,"WN",1658818],[10,2023,"WO",1402029],[10,2023,"SW",3384630],[10,2023,"SL",277602],
  [10,2024,"WN",1371807],[10,2024,"WO",1652990],[10,2024,"SW",4301253],[10,2024,"PUI",2093412],[10,2024,"SL",41016],[10,2024,"PM",1928312],
  [10,2025,"WN",824625],[10,2025,"WO",2796714],[10,2025,"SW",3642237],[10,2025,"SL",26451],
  // พฤศจิกายน
  [11,2022,"WN",1577181],[11,2022,"WO",1669094],[11,2022,"SW",3368860],[11,2022,"SL",72083],
  [11,2023,"WN",2774491],[11,2023,"WO",3131467],[11,2023,"SW",3800092],[11,2023,"SL",640],
  [11,2024,"WN",1879750],[11,2024,"WO",3449712],[11,2024,"SW",3038359],[11,2024,"PUI",785250],[11,2024,"SL",168348],[11,2024,"PM",29250],
  [11,2025,"WN",2095410],[11,2025,"WO",3763402],[11,2025,"SW",7055284],[11,2025,"SL",230106],
  // ธันวาคม
  [12,2022,"WN",2667257],[12,2022,"WO",2421225],[12,2022,"SW",1833742],
  [12,2023,"WN",1823912],[12,2023,"WO",1242092],[12,2023,"SW",2067110],[12,2023,"PUI",2727750],[12,2023,"SL",572733],
  [12,2024,"WN",1749976],[12,2024,"WO",2907272],[12,2024,"SW",3389129],[12,2024,"SL",53355],
  [12,2025,"WN",1627774],[12,2025,"WO",2745204],[12,2025,"SW",1630743],[12,2025,"PUI",2903835],[12,2025,"SL",294635],
];

let jobs = [];
let editingId = null;
let openPopover = null;
let currentView = 'card';
let tablePage = 0; // ข้อ 8: pagination table (20 งาน/หน้า)
let tableMonthFilter = null; // null | 'YYYY-MM' | 'YYYY' (ปีทั้งหมด)
let pendingEmailJobId = null;
let emailQueue = []; // คิวงานที่ต้องเด้งเตือนส่งอีเมล
let leads = [];
let editingLeadId = null;
let leadPeriod = 'month'; // day | month | quarter | year
let users = [];
let currentUser = null;
let editingUserId = null;
let historicalSales = [];

const PERSON_COLORS = {
  "เอก":     {bg:"#FBD9C4", text:"#8A4A1B"},
  "แอร์":    {bg:"#FCE49A", text:"#7A5B05"},
  "กุ๊ก":    {bg:"#CFE8FB", text:"#1B5E8A"},
  "ออย":     {bg:"#F6C9D9", text:"#8A1B4A"},
  "เชน":     {bg:"#CFE3D2", text:"#1F5C2C"},
  "เจ๊อ้อย": {bg:"#D9CCEF", text:"#4A2C8A"},
  "อ้อย":    {bg:"#F1D7B8", text:"#7A4A0E"},
  "แอมมี่":  {bg:"#E7D3F5", text:"#5B2C8A"},
  "เอ็กซ์":  {bg:"#CDEEED", text:"#0E6E69"},
  "หนึ่ง":   {bg:"#FBE0C4", text:"#8A5A1B"},
  "บาส":     {bg:"#D4E8C9", text:"#3C6B1F"},
  "ชื่อ":    {bg:"#E6E1D3", text:"#5B5142"},
  "พี่พึง":  {bg:"#F3D9B8", text:"#7A4A0E"},
  "พี่บุ๊ค": {bg:"#D8E8F0", text:"#1B4F6E"},
  "-":       {bg:"#EFEAdb", text:"#9B9382"},
};
function personColor(name){ return PERSON_COLORS[name] || {bg:"#EFEAdb", text:"#5B5142"}; }

const $ = (id)=>document.getElementById(id);



function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1800);
}

// ═══════════════════════════════════════════════════════════════════
// ☁️  SUPABASE CLOUD DATABASE LAYER
// ═══════════════════════════════════════════════════════════════════
let _sb = supabase;          // Supabase client
let _useSupabase = true;
let _editingVersion = null; // สำหรับ optimistic locking
let _realtimeChannel = null;

function sbClient(){ return _sb; }

async function initSupabase(){
  const url = localStorage.getItem('sb_url')||'';
  const key = localStorage.getItem('sb_key')||'';
  if(!url||!key) return false;
  try{
    _sb = window.supabase.createClient(url, key, {
      realtime:{ params:{ eventsPerSecond:5 } }
    });
    // ทดสอบ connection
    const { error } = await _sb.from('jobs').select('id').limit(1);
    if(error && error.code!=='PGRST116') throw error;
    _useSupabase = true;
    setupRealtime();
    return true;
  }catch(e){
    console.error('Supabase init error:', e);
    _sb = null; _useSupabase = false;
    return false;
  }
}

// ── Real-time subscriptions ──────────────────────────────────────────
function setupRealtime(){
  if(!_sb || _realtimeChannel) return;
  _realtimeChannel = _sb.channel('db-live')
    .on('postgres_changes',{ event:'*', schema:'public', table:'jobs' }, payload=>{
      const { eventType, new:nr, old:or } = payload;
      if((nr?.updated_by||or?.updated_by) === currentUser?.name) return; // เราเองที่เปลี่ยน ไม่แจ้ง
      if(eventType==='INSERT'||eventType==='UPDATE'){
        const j = dbRowToJob(nr);
        const idx = jobs.findIndex(x=>x.id===nr.id);
        if(idx>=0) jobs[idx]=j; else jobs.unshift(j);
        toast(`🔄 ${nr.updated_by||'ระบบ'} อัปเดตงาน "${nr.job_data?.job||''}"`, 4000);
      } else if(eventType==='DELETE'){
        jobs = jobs.filter(x=>x.id!==or.id);
        toast(`🗑 ลบงานออกแล้ว`, 3000);
      }
      render();
    })
    .on('postgres_changes',{ event:'*', schema:'public', table:'leads' }, payload=>{
      const { eventType, new:nr, old:or } = payload;
      if((nr?.updated_by||or?.updated_by) === currentUser?.name) return;
      if(eventType==='INSERT'||eventType==='UPDATE'){
        const l = dbRowToLead(nr);
        const idx = leads.findIndex(x=>x.id===nr.id);
        if(idx>=0) leads[idx]=l; else leads.unshift(l);
        toast(`🔄 อัปเดต Lead "${nr.lead_data?.customerName||''}"`, 3000);
      } else if(eventType==='DELETE'){
        leads = leads.filter(x=>x.id!==or.id);
      }
      if(currentView==='leads') renderList();
    })
    .subscribe(status=>{ if(status==='SUBSCRIBED') console.log('✅ Realtime connected'); });
}

// ── Helpers ─────────────────────────────────────────────────────────
function dbRowToJob(row){
  const j = { ...row.job_data };
  j._v = row.version; j._by = row.updated_by;
  return j;
}
function dbRowToLead(row){
  const l = { ...row.lead_data };
  l._v = row.version; l._by = row.updated_by;
  return l;
}
function stripMeta(obj){
  const copy = { ...obj };
  delete copy._v; delete copy._by;
  return copy;
}

// ── Record Locks (ป้องกันการแก้ไขพร้อมกัน) ─────────────────────────
async function acquireLock(recordId){
  if(!_useSupabase||!currentUser) return { ok:true };
  const expires = new Date(Date.now()+10*60*1000).toISOString(); // 10 นาที
  // ตรวจ lock ที่ยังใช้งาน
  const { data:existing } = await _sb.from('record_locks')
    .select('*').eq('record_id',recordId)
    .gt('expires_at', new Date().toISOString())
    .neq('locked_by_id', currentUser.id)
    .maybeSingle();
  if(existing){
    return { ok:false, lockedBy: existing.locked_by_name };
  }
  // จอง lock
  await _sb.from('record_locks').upsert({
    record_id: recordId,
    locked_by_name: currentUser.name,
    locked_by_id: currentUser.id,
    expires_at: expires
  });
  return { ok:true };
}
async function releaseLock(recordId){
  if(!_useSupabase||!recordId) return;
  await _sb.from('record_locks').delete()
    .eq('record_id',recordId).eq('locked_by_id',currentUser?.id||'');
}

// ── Conflict check ───────────────────────────────────────────────────
async function checkConflict(table, id, localVersion){
  if(!_useSupabase) return false;
  const { data } = await _sb.from(table).select('version,updated_by,updated_at')
    .eq('id',id).maybeSingle();
  if(!data) return false;
  if(data.version > (localVersion||1)){
    return { version: data.version, by: data.updated_by, at: data.updated_at };
  }
  return false;
}

// ── Jobs CRUD ────────────────────────────────────────────────────────
async function loadJobs(){
  try{
    if(_useSupabase){
      const { data, error } = await _sb.from('jobs').select('*');
      if(error) throw error;
      jobs = (data||[]).map(dbRowToJob).sort((a,b)=>b.createdAt-a.createdAt);
    } else {
      const res = await window.storage.get("jobs", true);
      jobs = res && res.value ? JSON.parse(res.value) : [];
    }
  }catch(e){ console.error('loadJobs',e); jobs=[]; }
  if(!jobs.length){ jobs=seedData(); await saveJobs(); }
  // merge งาน 6 กค ที่ยังไม่มีในระบบ
  const _existIds = new Set(jobs.map(j=>j.id));
  const _toAdd6 = seedNewJobsJul6().filter(j=>!_existIds.has(j.id));
  const _toAdd7 = seedNewJobsJul7().filter(j=>!_existIds.has(j.id));
  const _toAdd8 = seedNewJobsJul8().filter(j=>!_existIds.has(j.id));
  const _toAdd = [..._toAdd6, ..._toAdd7, ..._toAdd8];
  if(_toAdd.length){ jobs.push(..._toAdd); }
  // อัพเดต stages จาก 7 กค.
  updateJobStagesJul7();
  if(_toAdd.length || true){ await saveJobs(); }
  render();
  const od=jobs.filter(j=>getOverdueInfo(j)).length;
  if(od>0) setTimeout(()=>toast(`⚠ มีงานค้างเกินกำหนด ${od} รายการ`),500);
  setTimeout(checkEmailReminders,900);
}

async function saveJobs(){
  invalidateJobNos();
  try{
    if(_useSupabase){
      if(!jobs.length) return;
      const rows = jobs.map(j=>({
        id:j.id, job_data:stripMeta(j),
        version:(j._v||0)+1,
        updated_at:new Date().toISOString(),
        updated_by:currentUser?.name||'system'
      }));
      const { error } = await _sb.from('jobs').upsert(rows);
      if(error) throw error;
      rows.forEach(r=>{ const j=jobs.find(x=>x.id===r.id); if(j) j._v=r.version; });
    } else {
      await window.storage.set("jobs", JSON.stringify(jobs), true);
    }
  }catch(e){ console.error('saveJobs',e); toast("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง"); }
}

// บันทึกงานเดียว (พร้อม conflict check)
async function saveSingleJob(jobId, forceOverwrite=false){
  const j = jobs.find(x=>x.id===jobId);
  if(!j) return true;
  if(_useSupabase){
    // ตรวจ conflict
    if(!forceOverwrite && _editingVersion){
      const conflict = await checkConflict('jobs', jobId, _editingVersion);
      if(conflict){
        return new Promise(resolve=>{
          $('conflictMsg').innerHTML =
            `งานนี้ถูกแก้ไขโดย <b>${escapeHtml(conflict.by||'คนอื่น')}</b><br>
             เมื่อ ${new Date(conflict.at).toLocaleString('th-TH')}<br>
             หากบันทึกทับ การแก้ไขของอีกฝ่ายจะหายไป`;
          $('conflictDialog').style.display='flex';
          $('conflictOverwrite').onclick=async()=>{
            $('conflictDialog').style.display='none';
            await saveSingleJob(jobId, true); resolve(true);
          };
          $('conflictReload').onclick=async()=>{
            $('conflictDialog').style.display='none';
            await loadJobs(); closeModal(); resolve(false);
          };
          $('conflictCancel').onclick=()=>{
            $('conflictDialog').style.display='none'; resolve(false);
          };
        });
      }
    }
    const newV = (j._v||0)+1;
    const { error } = await _sb.from('jobs').upsert({
      id:j.id, job_data:stripMeta(j),
      version:newV, updated_at:new Date().toISOString(),
      updated_by:currentUser?.name||'system'
    });
    if(error){ toast("บันทึกไม่สำเร็จ: "+error.message); return false; }
    j._v = newV;
    return true;
  } else {
    await saveJobs(); return true;
  }
}

async function deleteJobFromDB(jobId){
  if(_useSupabase){
    const { error } = await _sb.from('jobs').delete().eq('id',jobId);
    if(error) throw error;
    await releaseLock(jobId);
  } else {
    jobs = jobs.filter(j=>j.id!==jobId);
    await saveJobs();
  }
}

// ── Leads CRUD ───────────────────────────────────────────────────────
function seedNewJobsJul6(){
  return [
    {id:"job_xl6_3469688",no:"6กค-1",seller:"ออย",date:"2026-07-06",quote:"QT6901653",job:"kio",detail:"43 ตัว **ผลิต 3 อท",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900000000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_1519285",no:"6กค-2",seller:"ออย",date:"2026-07-06",quote:"QT6901601",job:"Planesystems",detail:"70 ตัว **ส่งวันที่ 20 กค",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900001000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_4515887",no:"6กค-3",seller:"เจ๊อ้อย",date:"2026-07-06",quote:"QT6901452a",job:"สหมงคลประกันภัย (สั่งซ้ำรอบ มิย. 69) รอบที่ 2",detail:"200 ตัว",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751900002000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_9286085",no:"6กค-4",seller:"หนึ่ง",date:"2026-07-06",quote:"QTN6900968",job:"ร.ร.วัดปทุมวนาราม เสื้อกีฬาสี นักเรียน ปี69 (จ่ายเอง)",detail:"774 ตัว",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900003000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_6996166",no:"6กค-5",seller:"หนึ่ง",date:"2026-07-06",quote:"QTN6900969",job:"ร.ร.วัดปทุมวนาราม เสื้อกีฬาสี ครูฟรี ปี69",detail:"80 ตัว",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900004000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_5760851",no:"6กค-6",seller:"เจ๊อ้อย",date:"2026-07-06",quote:"QT6901452",job:"สหมงคลประกันภัย (สั่งซ้ำรอบ มิย. 69)",detail:"200 ตัว",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900005000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"เจ๊อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_9182651",no:"6กค-7",seller:"แอมมี่",date:"2026-07-06",quote:"QTN6901106a",job:"ร.ร.นานาชาติ อินเตอร์แนช",detail:"โปโลขาวตัดต่อด้านข้างเขียวเข้ม 2 ตัว",type:"ตัวอย่าง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900006000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_5115901",no:"6กค-8",seller:"แอมมี่",date:"2026-07-06",quote:"QTN6901106b",job:"ร.ร.นานาชาติ อินเตอร์แนช",detail:"วอร์มขายาว 2 ตัว",type:"ตัวอย่าง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900007000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_8708349",no:"6กค-9",seller:"อ้อย",date:"2026-07-06",quote:"QT6901647",job:"สยามบุญรอด",detail:"โปโล 100 ตัว",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900008000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_1251560",no:"6กค-10",seller:"ออย",date:"2026-07-06",quote:"",job:"EIT NCC",detail:"173 ตัว ออกออเดอร์ได้เลยค่ะ",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900009000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_9783622",no:"6กค-11",seller:"อ้อย",date:"2026-07-06",quote:"QTN6901516",job:"รร.วิภารัตน์",detail:"เสื้อกีฬาสี 662 ตัว",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900010000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_7408210",no:"6กค-12",seller:"อ้อย",date:"2026-07-06",quote:"",job:"DENZO",detail:"โปโล สีกรมท่า",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751900011000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_6309593",no:"6กค-13",seller:"เอ็กซ์",date:"2026-07-06",quote:"QTN6901770",job:"ร.ร.วัดอินทรวิหาร เขตพระนคร (ครูฟรี)69",detail:"โปโลขาว 24 ตัว",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900012000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_8041810",no:"6กค-14",seller:"ออย",date:"2026-07-06",quote:"QT6901569",job:"#CAGGIONI 220 ตัว ( Drifit ) รีพีท",detail:"220 ตัว ออกออเดอร์ได้เลยค่ะ",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751900013000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_9046703",no:"6กค-15",seller:"แอร์",date:"2026-07-06",quote:"QTN6901767",job:"เอ็มเคเค MKK Property #รีพีทรอบกค69",detail:"โปโล 20 ตัว",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751900014000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_6395102",no:"6กค-16",seller:"แอร์",date:"2026-07-06",quote:"QTN6901707",job:"TCK ไทยชาง รีพีทมิย.69",detail:"80 ตัว",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751900015000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_7301647",no:"6กค-17",seller:"ออย",date:"2026-07-06",quote:"QTN6901699",job:"ระเบียงวิว รุ่นเขียว54และแดง13",detail:"60 ตัว **รอสรุป",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751900016000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl6_9338725",no:"6กค-18",seller:"ออย",date:"2026-07-06",quote:"QTN6901720",job:"สมชายอะไหล่ (สั่งซ้ำ 1000ตัว) ผ้า CHN",detail:"1000 ตัว ผลิต 30 วัน",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751900017000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
  ];
}

function seedNewJobsJul8(){
  return [
    {id:"job_xl8_8939810",seller:"แอมมี่",date:"2026-07-07",quote:"QTN6901783",job:"ร.ร.วัดสีชมพู คอวีมีปก (พิมพ์ซับ) ครู-แขนยาว",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150000000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_8206764",seller:"แอมมี่",date:"2026-07-07",quote:"QTN6901782",job:"ร.ร.วัดสีชมพู คอวีมีปก (พิมพ์ซับ) ครู-แขนสั้น",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150001000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_3997505",seller:"แอร์",date:"2026-07-07",quote:"QT6901683",job:"ม.บูรพา คละสี (โปโล) // โปโลขาว Wisdom of east",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150002000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_7812242",seller:"แอร์",date:"2026-07-08",quote:"QTN6901714",job:"vsn วีเอสเอ็น รุ่นThe Basics At scale",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1752150003000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_6554617",seller:"อ้อย",date:"2026-07-08",quote:"QTN6901784",job:"รร.แสงหิรัญ",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150004000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_1636097",seller:"ออย",date:"2026-07-08",quote:"QT6901624",job:"APEC รุ่น25year apecขาวแดง",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150005000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_1295287",seller:"แอมมี่",date:"2026-07-08",quote:"QT6901141",job:"แหลมทอง (โรงงานแป้ง) น้ำตาลอ่อน",type:"ตัวอย่าง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150006000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_4548707",seller:"อ้อย",date:"2026-07-08",quote:"QTN6901565",job:"MEDICINE CRA โปโลขาว",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150007000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_8080346",seller:"อ้อย",date:"2026-07-08",quote:"QT6901674",job:"สยามบุญรอด",type:"ตัวอย่าง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150008000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_9877370",seller:"แอมมี่",date:"2026-07-08",quote:"QTN6901523",job:"ร.ร.แช่มเสริม (โปโลสีดำ) สั่งซ้ำ",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150009000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_1304139",seller:"แอมมี่",date:"2026-07-08",quote:"QTN6901522",job:"ร.ร.แช่มเสริม (วอร์มขาสั้น) สั่งซ้ำ",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150010000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_9983017",seller:"แอมมี่",date:"2026-07-08",quote:"QTN6901521",job:"ร.ร..แช่มเสริม (โปโลเหลืองจัน) อนุบาล สั่งซ้ำ",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150011000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_3047789",seller:"หนึ่ง",date:"2026-07-08",quote:"QTN6901786",job:"ร.ร.เพชรถนอม โทเรสีชมพู งบปี69 (รีพีท)",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150012000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_2530524",seller:"หนึ่ง",date:"2026-07-08",quote:"QTN6901787",job:"ร.ร.เพชรถนอม วอร์มขายาว งบปี69 (รีพีท)",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150013000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_9077097",seller:"เอ็กซ์",date:"2026-07-08",quote:"QTN6901741",job:"ร.ร.วัดพลมานีย์ (วอร์มขาสั้น) งบ69",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150014000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_4793274",seller:"อ้อย",date:"2026-07-08",quote:"QT6901572",job:"ลูซอง",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150015000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_7390700",seller:"แอมมี่",date:"2026-07-08",quote:"QTN6901788",job:"ร.ร.บางกะปิ",type:"ตัวอย่าง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150016000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_5860120",seller:"แอมมี่",date:"2026-07-08",quote:"QTN6901771",job:"ร.ร.กว่างเจ้า (เสื้อครู)",type:"ตัวอย่าง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150017000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_9155327",seller:"แอมมี่",date:"2026-07-08",quote:"QTN6901351",job:"ร.ร.กว่างเจ้า (นร.) กีฬาสี 69",type:"ตัวอย่าง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150018000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_4662036",seller:"หนึ่ง",date:"2026-07-08",quote:"QTN6901791",job:"ร.ร.สุเหร่าจรเข้ขบ เสื้อโทเร งบปี69 (เพิ่ม1)",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150019000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_5055217",seller:"หนึ่ง",date:"2026-07-08",quote:"QTN6901792",job:"ร.ร.สุเหร่าจรเข้ขบ วอร์ม งบปี69 (เพิ่ม1)",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752150020000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl8_5268075",seller:"ออย",date:"2026-07-08",quote:"QT6900865",job:"Matsunaga",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1752150021000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
  ];
}

function seedNewJobsJul7(){
  return [
    {id:"job_xl7_7196223",seller:"ออย",date:"2026-07-07",quote:"QTN6901712",job:"nt csr 2000ตัว ct32com",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1752000000000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_7038819",seller:"แอร์",date:"2026-07-07",quote:"QTN6901541",job:"VT Markets ironpulse",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000001000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_1675022",seller:"อ้อย",date:"2026-07-07",quote:"QTN6901210",job:"รร.บ้านหนองพรหม",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000002000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_4362367",seller:"แอร์",date:"2026-07-07",quote:"QTN6900776",job:"ธีรภัทรฟู้ดส์",type:"ตัวอย่าง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000003000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_1322207",seller:"แอร์",date:"2026-07-07",quote:"QT6901676",job:"คอทโก้ ระยอง",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000004000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_8607904",seller:"แอร์",date:"2026-07-07",quote:"QTN6901777",job:"คอทโก้ ตึก LPN",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000005000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_1928499",seller:"แอร์",date:"2026-07-07",quote:"QT6901515",job:"BANILA CO บานิลา โค",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000006000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_3029403",seller:"เอ็กซ์",date:"2026-07-07",quote:"QTN6901778",job:"ร.ร.วัดจันทร์ประดิษฐาราม (โปโล) งบ69",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000007000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_9240534",seller:"เอ็กซ์",date:"2026-07-07",quote:"QTN6901779",job:"ร.ร.วัดจันทร์ประดิษฐาราม (วอร์ม) งบ69",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000008000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_6510746",seller:"อ้อย",date:"2026-07-07",quote:"QTN6901617",job:"THAMASAT",type:"ตัวอย่าง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000009000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอมมี่",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_1040224",seller:"หนึ่ง",date:"2026-07-07",quote:"QTN6901774",job:"ร.ร.คลองสาม โปโลส้ม สหกรณ์ ปี69 เพิ่ม2",type:"ตัวอย่าง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000010000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอมมี่",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_2907880",seller:"หนึ่ง",date:"2026-07-07",quote:"QTN6901775",job:"ร.ร.คลองสาม วอร์มขายาว สหกรณ์ ปี69 เพิ่ม2",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000011000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl7_7057723",seller:"แอมมี่",date:"2026-07-07",quote:"QT6901631",job:"ลี่เจียเฉง (ส้ม) สั่งซ้ำ",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1752000012000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
  ];
}

function updateJobStagesJul7(){
  const updates = [
    {quote:"QT6901343",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901483",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901203",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6900762",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901573",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901453",stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901706",stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901708",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901715",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901716",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901717",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901565",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901564",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901614",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901602",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901718",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901633",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901632",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901482",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901625",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901635",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901627",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901441",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901435",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901636",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901446",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901721",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"เจ้อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901722",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901694",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901149",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901150",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901713",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901485",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901234",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901724",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901725",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901626b",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901728",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901726",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901727",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901732",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901731",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901736",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901739",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901738",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901740",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901420",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901143",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901600",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901559",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901744",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901140",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901143b",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901743",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901647",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901746",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901747",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901748",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901737",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901734",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901623",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901749",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901543",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901752",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QT6901656",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901422",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901421",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901423",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901753",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901754",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901659",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901750",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901729",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901730",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901757",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901756",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901755",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901758",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901761",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901762",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901759",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901760",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901763",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901764",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901765",stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901657",stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901582",stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901638",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901382",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901452",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6900968",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6900969",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"เจ้อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901106",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901106b",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QT6901647b",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอมมี่",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901516",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN691665",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901770",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901767",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอมมี่",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {quote:"QTN6901707",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901699",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901720",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901712",stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {quote:"QTN6901541",stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
  ];
  // Apply updates to matching jobs
  updates.forEach(u=>{
    const j = jobs.find(x=>x.quote && x.quote.trim()===u.quote.trim());
    if(!j) return;
    // อัพเดตเฉพาะ stage ที่ progress มากกว่าเดิม
    const sk = ['summary','order','checked','printed','marked','received'];
    sk.forEach(k=>{
      if(u.stages[k].done && !j.stages[k].done){
        j.stages[k] = u.stages[k];
      }
    });
  });
}

function seedNewLeadsJul6(){
  return [
    {id:"lead_xl6_4701495",customerName:"max ไฟฟ้าโรงงาน",companyName:"",lineOrFb:"max ไฟฟ้าโรงงาน",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-06",contactTime:"12:43",createdAt:1751890000000},
    {id:"lead_xl6_8193094",customerName:"Asree",companyName:"",lineOrFb:"Asree",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-06",contactTime:"13:45",createdAt:1751890001000},
    {id:"lead_xl6_8135288",customerName:"Pui",companyName:"",lineOrFb:"Pui",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-06",contactTime:"14:37",createdAt:1751890002000},
    {id:"lead_xl6_5300073",customerName:"Assy \"DUAN",companyName:"",lineOrFb:"Assy \"DUAN",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-06",contactTime:"14:39",createdAt:1751890003000},
  ];
}

function seedNewLeadsJul67(){
  return [
    {id:"lead_xl67_2135340",customerName:"N",companyName:"",lineOrFb:"N",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-06",contactTime:"20:46",createdAt:1752020000000},
    {id:"lead_xl67_3115067",customerName:"MAPOR",companyName:"",lineOrFb:"MAPOR",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-07",contactTime:"12:43",createdAt:1752020001000},
    {id:"lead_xl67_6421635",customerName:"cha-aim",companyName:"",lineOrFb:"cha-aim",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-07",contactTime:"14:12",createdAt:1752020002000},
    {id:"lead_xl67_8560387",customerName:"taan",companyName:"",lineOrFb:"taan",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-07",contactTime:"15:09",createdAt:1752020003000},
    {id:"lead_xl67_9698849",customerName:"ann",companyName:"",lineOrFb:"ann",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-07",contactTime:"15:40",createdAt:1752020004000},
    {id:"lead_xl67_8032436",customerName:"nong_chotika_vispac",companyName:"",lineOrFb:"nong_chotika_vispac",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-07",contactTime:"16:21",createdAt:1752020005000},
    {id:"lead_xl67_8154956",customerName:"Pe'",companyName:"",lineOrFb:"Pe'",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-07",contactTime:"16:44",createdAt:1752020006000},
    {id:"lead_xl67_3474096",customerName:"บริษัท สหสเตนเลสสตีล จำกัด",companyName:"บริษัท สหสเตนเลสสตีล จำกัด",lineOrFb:"บริษัท สหสเตนเลสสตีล จำกัด",channel:"ลูกค้าเก่า",contactChannel:"โทรเข้าบริษัทโดยตรง",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-07",contactTime:"16:50",createdAt:1752020007000},
  ];
}

function seedLeadsJul8(){
  return [
    {id:"lead_xl8_5343506",customerName:"SO",companyName:"",lineOrFb:"SO",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-07",contactTime:"17:34",createdAt:1752100000000},
    {id:"lead_xl8_6878945",customerName:"DEAR",companyName:"",lineOrFb:"DEAR",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-08",contactTime:"08:46",createdAt:1752100001000},
    {id:"lead_xl8_8670320",customerName:"บัญชี เมืองใต้",companyName:"",lineOrFb:"บัญชี เมืองใต้",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-08",contactTime:"10:49",createdAt:1752100002000},
    {id:"lead_xl8_2114299",customerName:"Coordinator_Pan",companyName:"",lineOrFb:"Coordinator_Pan",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-08",contactTime:"11:29",createdAt:1752100003000},
    {id:"lead_xl8_5857067",customerName:"PN",companyName:"",lineOrFb:"PN",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-08",contactTime:"13:01",createdAt:1752100004000},
    {id:"lead_xl8_7845661",customerName:"@c",companyName:"",lineOrFb:"@c",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-08",contactTime:"14:09",createdAt:1752100005000},
    {id:"lead_xl8_8786664",customerName:"P€@R_AIA",companyName:"",lineOrFb:"P€@R_AIA",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-08",contactTime:"14:25",createdAt:1752100006000},
  ];
}

function seedLeads(){
  return [
    {id:"lead_xl_8650388",customerName:"Haru👰NTP👰28954",companyName:"",lineOrFb:"Haru👰NTP👰28954",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-01",contactTime:"08:19",createdAt:1751800000000},
    {id:"lead_xl_9413919",customerName:"jida",companyName:"",lineOrFb:"jida",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-01",contactTime:"08:54",createdAt:1751800001000},
    {id:"lead_xl_3197984",customerName:"Atekah_rdh",companyName:"",lineOrFb:"Atekah_rdh",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-01",contactTime:"13:21",createdAt:1751800002000},
    {id:"lead_xl_5970115",customerName:"Bier",companyName:"",lineOrFb:"Bier",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-01",contactTime:"16:11",createdAt:1751800003000},
    {id:"lead_xl_4461230",customerName:"Pikapop",companyName:"",lineOrFb:"Pikapop",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-01",contactTime:"16:58",createdAt:1751800004000},
    {id:"lead_xl_8453125",customerName:"𝓐𝓵𝓲𝓬𝓮 𝓷𝓪𝓴𝓪𝓪",companyName:"",lineOrFb:"𝓐𝓵𝓲𝓬𝓮 𝓷𝓪𝓴𝓪𝓪",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-01",contactTime:"23:35",createdAt:1751800005000},
    {id:"lead_xl_7103886",customerName:"Areewan",companyName:"",lineOrFb:"Areewan",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"08:15",createdAt:1751800006000},
    {id:"lead_xl_3836303",customerName:"Kittipan (กบ/Kob)",companyName:"",lineOrFb:"Kittipan (กบ/Kob)",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"08:39",createdAt:1751800007000},
    {id:"lead_xl_8711627",customerName:"friend",companyName:"",lineOrFb:"friend",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"10:14",createdAt:1751800008000},
    {id:"lead_xl_3727372",customerName:"Bright✨",companyName:"",lineOrFb:"Bright✨",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"10:49",createdAt:1751800009000},
    {id:"lead_xl_8514164",customerName:"amy",companyName:"",lineOrFb:"amy",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"12:49",createdAt:1751800010000},
    {id:"lead_xl_8896296",customerName:"JC",companyName:"",lineOrFb:"JC",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"13:29",createdAt:1751800011000},
    {id:"lead_xl_1119923",customerName:"amy",companyName:"",lineOrFb:"amy",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"14:01",createdAt:1751800012000},
    {id:"lead_xl_3812348",customerName:"ก.🦦",companyName:"",lineOrFb:"ก.🦦",channel:"Google",contactChannel:"โทรหาเซลล์โดยตรง",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"15:05",createdAt:1751800013000},
    {id:"lead_xl_6021429",customerName:"Purchase",companyName:"",lineOrFb:"Purchase",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"15:43",createdAt:1751800014000},
    {id:"lead_xl_7745748",customerName:"App",companyName:"",lineOrFb:"App",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-02",contactTime:"19:18",createdAt:1751800015000},
    {id:"lead_xl_2094874",customerName:"P",companyName:"",lineOrFb:"P",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-03",contactTime:"10:56",createdAt:1751800016000},
    {id:"lead_xl_5914100",customerName:"Kaew",companyName:"",lineOrFb:"Kaew",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-03",contactTime:"11:03",createdAt:1751800017000},
    {id:"lead_xl_8435674",customerName:"A.O.Y",companyName:"",lineOrFb:"A.O.Y",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-03",contactTime:"",createdAt:1751800018000},
    {id:"lead_xl_6342101",customerName:"0865885954",companyName:"",lineOrFb:"0865885954",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-03",contactTime:"14:28",createdAt:1751800019000},
    {id:"lead_xl_4766973",customerName:"Praewpankaa",companyName:"",lineOrFb:"Praewpankaa",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-03",contactTime:"15:05",createdAt:1751800020000},
    {id:"lead_xl_2496907",customerName:"🐰 พราว | Hello 3694🎏",companyName:"",lineOrFb:"🐰 พราว | Hello 3694🎏",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-03",contactTime:"15:23",createdAt:1751800021000},
    {id:"lead_xl_5219161",customerName:"Fon",companyName:"",lineOrFb:"Fon",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-03",contactTime:"16:07",createdAt:1751800022000},
    {id:"lead_xl_9791118",customerName:"👸รุ่ยไทย~Taktoey",companyName:"",lineOrFb:"👸รุ่ยไทย~Taktoey",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-03",contactTime:"17:09",createdAt:1751800023000},
    {id:"lead_xl_7209016",customerName:"Chanyaphat806",companyName:"",lineOrFb:"Chanyaphat806",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-04",contactTime:"09:46",createdAt:1751800024000},
    {id:"lead_xl_9431561",customerName:"topSUPAPAT",companyName:"",lineOrFb:"topSUPAPAT",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-04",contactTime:"12:11",createdAt:1751800025000},
    {id:"lead_xl_5401480",customerName:"Baibaii",companyName:"",lineOrFb:"Baibaii",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-04",contactTime:"14:48",createdAt:1751800026000},
    {id:"lead_xl_5084006",customerName:"Gungordaii",companyName:"",lineOrFb:"Gungordaii",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-04",contactTime:"14:39",createdAt:1751800027000},
    {id:"lead_xl_7725501",customerName:"Sumintraต่อ201",companyName:"",lineOrFb:"Sumintraต่อ201",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-05",contactTime:"21:47",createdAt:1751800028000},
    {id:"lead_xl_5200502",customerName:"มล",companyName:"",lineOrFb:"มล",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-05",contactTime:"20:27",createdAt:1751800029000},
    {id:"lead_xl_5792115",customerName:"PooM",companyName:"",lineOrFb:"PooM",channel:"Google",contactChannel:"ไลน์แอด",team:"ทีม Admin ไลน์ official",clientType:"บุคคล",province:"",address:"",taxId:"",phones:[],shipMode:"company",shipAddress:"",billMode:"company",billAddress:"",contactDate:"2026-07-06",contactTime:"09:27",createdAt:1751800030000},
  ];
}


// ═══════════════════════════════════════════
// 💰 ระบบค่าใช้จ่าย
// ═══════════════════════════════════════════

const EXP_CAT_KEYS = ["m1", "m2", "pok", "prt", "sht", "cut", "sew", "ofc", "xtr", "mkt", "ads", "post", "tel", "mob", "wtr", "elc", "toll", "fuel", "crfx", "mnt", "misc", "rsll", "acct", "sal"];
const EXP_CAT_LABELS = {"m1":"วัตถุดิบหลัก ผ้า/ปก/บัง","m2":"วัตถุดิบรอง","pok":"งานปัก","prt":"งานพิมพ์","sht":"ค่านายายิงผ้า","cut":"งานตัด","sew":"งานเย็บ","ofc":"อุปกรณ์สำนักงาน","xtr":"ค่าแรงพิเศษ","mkt":"กิจกรรมส่งเสริมการขาย","ads":"ค่าโฆษณาออนไลน์","post":"ไปรษณีย์/ค่าขนส่ง","tel":"ค่าโทรศัพท์บ้านและอินเตอร์เน็ต","mob":"ค่าโทรศัพท์มือถือ","wtr":"ค่าน้ำ","elc":"ค่าไฟ","toll":"ค่าทางด่วน/ค่าสึกหรอรถ","fuel":"ค่าน้ำมัน/แก๊สรถ","crfx":"ค่าซ่อมรถ","mnt":"ค่าซ่อมบำรุง เครื่องจักร/อุปกรณ์","misc":"ค่าเบ็ดเตล็ด","rsll":"สินค้าซื้อมาขายไป","acct":"งานบัญชี","sal":"เงินเดือนพนักงานบริษัท"};
const EXPENSE_SEED = [[2022,1,[3437114,44915,234750,93098,0,1713,657853,20778,96790,160595,39600,282589,5412,11718,4320,42160,7920,28874,23737,16040,19641,3500,207578,1500000]],[2022,2,[1813576,66114,321333,301349,0,59095,603205,9952,176209,6272,39600,21490,4580,11043,12527,42214,9280,33896,48940,5030,14189,57731,395978,1500000]],[2022,3,[2766326,269883,247901,288846,0,46815,672826,6145,258688,20980,39600,13305,7946,7374,4013,50762,13090,40906,44740,59878,8959,18755,367272,1500000]],[2022,4,[3083489,207561,291005,155276,0,12670,1152926,9478,100535,3352,28900,13030,5172,16187,5267,58722,18360,36370,8100,7285,11042,0,168196,1500000]],[2022,5,[4796855,329368,430079,584024,0,77318,1193540,13457,111038,33856,41820,16458,3427,12629,4899,51669,23530,60031,10654,7485,5212,191989,241990,1500000]],[2022,6,[8808143,252732,530619,1370705,0,242595,2827161,24084,113922,17225,39600,35119,3075,12366,5624,59165,6366,67195,12521,14082,14532,331629,395714,1700000]],[2022,7,[6326475,147789,730898,649367,0,177554,2378311,12385,283517,5472,39600,19974,2721,12838,5890,66673,10660,60231,62584,42080,1505,758777,635228,1700000]],[2022,8,[5605977,350171,445755,470516,0,91319,1667722,17500,87921,17020,39600,24701,4137,12705,4360,65062,12280,64262,63532,32795,18779,1076068,874874,1700000]],[2022,9,[6669293,351452,412779,783267,0,62890,1959887,20636,303418,72153,49700,26228,3028,14166,4469,74001,19400,67518,66146,19576,18641,281760,887057,1700000]],[2022,10,[2469431,218521,499612,566734,0,72230,2039672,17439,148153,353829,300,24110,3475,13158,4537,73482,8925,96990,62987,14979,9848,597575,841760,1705777]],[2022,11,[3310945,67012,232870,669147,0,16315,921858,22477,41798,6145,38235,19945,4024,12078,4802,70548,10095,54985,34656,10213,6979,34560,226028,1575724]],[2022,12,[4112986,209473,283922,521271,0,49850,1496779,108505,86898,92694,59826,13631,831,13745,11968,88652,10040,61353,75124,3864,26705,57941,381030,1803795]],[2023,1,[2531969,187357,352395,338525,0,0,759431,16517,31536,32111,55939,12792,6103,12006,7330,73265,6795,38344,30092,10136,14303,55987,250343,1800226]],[2023,2,[4999575,235651,541616,74777,0,23083,803327,13914,112487,4914,55499,10320,3785,12393,7793,82180,10345,45131,49120,10830,10408,254355,390109,1702567]],[2023,3,[3436020,163881,295906,288115,807,35284,867244,30250,95712,44671,54404,17087,977,12952,7482,81526,10610,43226,57592,10920,14959,110575,333482,1816152]],[2023,4,[3214996,148904,463581,573189,0,10778,814512,23057,38621,6184,39899,15925,3482,12998,5616,106142,40465,34915,27720,16280,3670,0,334335,1773969]],[2023,5,[5967507,156698,216609,249219,1042,66164,1075516,14062,100542,1810,51569,19053,1039,13170,4915,91915,12588,54068,27607,55232,10320,107207,342994,1784523]],[2023,6,[4542747,461186,464528,144360,0,22485,1209857,13777,22512,35000,0,29109,2135,12156,5863,94778,16397,43034,7000,96905,12211,79640,338120,1886635]],[2023,7,[3223470,236261,459135,491886,0,93470,1261242,20345,79406,2230,37569,37432,2522,12049,8015,94417,31165,58766,41420,19865,1505,364541,345144,1951411]],[2023,8,[5287000,268064,444603,175123,2700,70103,1037191,45617,42875,37720,58619,19800,4610,12484,8467,88962,10340,67885,96371,40089,13637,698215,537936,1880410]],[2023,9,[2982495,200679,437732,687878,1190,24230,1296153,40557,609661,33730,58619,18047,1691,13456,9379,89581,18090,51865,27942,13450,15468,186781,560287,1700000]],[2023,10,[2336289,173180,287719,132937,2279,6054,633300,9519,61370,4020,15080,16977,40804,12089,8004,59430,6175,35396,81195,19300,9167,71514,818350,1700000]],[2023,11,[2842232,158774,258246,499788,138,36330,661256,11502,12424,11900,70579,12101,2046,12433,7834,66454,6370,36940,36680,16005,12011,45540,427978,1633923]],[2023,12,[3920234,44974,235677,704666,0,91477,1018576,14630,357973,169326,62108,20219,1928,11995,8049,71029,7370,42911,75579,13995,14966,138567,294126,1883827]],[2024,1,[3007753,144569,436912,323584,0,13983,973565,9381,74073,71928,90027,20709,2459,12291,6303,74394,7191,43723,196864,110983,9005,48586,223309,1873104]],[2024,2,[1695432,162002,388284,237093,0,48082,889694,7369,332231,5345,15209,14150,1992,11723,10127,80166,9025,35188,72364,9962,16501,52134,304631,1695051]],[2024,3,[6176012,367133,276538,591142,935,153650,1185777,27855,112532,3000,105952,21334,3506,13171,7848,80912,17001,43413,56390,19365,10057,87788,569977,1905493]],[2024,4,[5825678,160772,477024,684536,0,140741,1572175,18832,59930,3900,60179,21119,2366,11733,8656,88119,11350,44330,25580,16058,11626,1025,654152,1830556]],[2024,5,[5245948,156599,339640,644330,0,156335,1679197,20230,223609,3720,129,28663,3116,13764,8256,90196,18386,50819,40880,11252,12252,450288,258908,2070654]],[2024,6,[4568477,348798,454614,470672,0,42347,1384330,21728,228476,2049,133702,33279,2081,11256,4802,97700,17912,61528,38325,24630,11782,82272,405654,2070430]],[2024,7,[4502130,287625,459006,403041,0,148370,1842217,16347,106306,2000,13520,31279,4314,12112,4941,80929,13825,70588,86871,63410,11498,261374,517225,2069171]],[2024,8,[4593599,262460,585242,422125,1055,65496,1550251,12005,78734,11800,63965,31487,8007,12256,4897,94688,20392,61688,102765,52709,13852,1371081,457336,2010550]],[2024,9,[3681446,178405,781661,392415,0,56899,1092203,11392,422396,2470,59426,17689,2123,13558,8422,82459,13635,44184,26121,41319,12814,119198,596856,1800203]],[2024,10,[2996040,159438,256860,177748,1277,54767,911974,21110,87060,47295,58490,22077,3171,12261,4779,79355,13529,54871,41535,25198,11248,177815,1352494,1888774]],[2024,11,[3276268,200449,569597,311641,474,61131,837100,88039,130046,273577,59426,23602,3374,10973,8996,77907,13296,45628,23359,28265,6385,175997,501559,1978191]],[2024,12,[3181182,98801,232137,602157,1777,55250,1178594,21117,43025,70388,63047,32017,5060,12252,7938,83587,9567,41991,56254,31859,16671,119300,428574,1947997]],[2025,1,[3966515,214396,499106,546834,0,22457,1075346,29260,48706,49213,58240,35549,3166,12779,7841,81152,10111,43603,28176,31632,13977,52646,386356,2235103]],[2025,2,[4915621,190521,820410,60477,1359,83867,754573,22838,274813,4800,92880,26753,2640,11264,8302,95041,9330,47400,75694,16399,17000,120198,691143,1889202]],[2025,3,[7813091,398444,396607,662332,1156,90553,1280581,15083,77767,16400,69443,38113,2102,13184,8039,71642,10785,56150,53833,17279,14180,138189,299804,2076094]],[2025,4,[6372150,100171,427556,1047048,0,148329,1611866,22818,104828,1370,68640,27449,3236,11246,9168,84189,14498,45354,67715,43020,4883,129605,350620,1976097]],[2025,5,[5320874,260952,355522,1314880,484,148521,2528284,20345,257752,5010,95432,37323,917,13057,8115,92931,13205,62438,31068,46012,12804,94269,571187,2272320]],[2025,6,[4243745,36291,134376,1261788,0,99954,2183228,19942,232485,0,60493,28823,2915,16356,5833,82542,15833,61216,41177,4810,17248,70900,286836,2276528]],[2025,7,[3088978,70241,160347,574855,0,53619,1781508,20158,176788,0,58240,39690,1689,12857,8313,89686,17485,65547,47580,4845,16962,180138,347406,2271179]],[2025,8,[3809657,304485,541295,569169,850,262980,1547394,23209,98501,0,64757,27814,4661,12510,8147,88546,12715,56778,25588,9262,13992,1220758,638281,2151268]],[2025,9,[3575254,99759,387216,629037,0,160545,1315434,14641,136764,0,59176,37702,3641,11445,8463,90470,12940,56568,61117,35795,19894,223990,462779,2063783]],[2025,10,[3082163,177474,282204,391216,0,19154,1056164,13796,115590,800,9586,34897,1764,12077,8120,73953,9970,60476,32830,4340,13633,123138,968778,2118735]],[2025,11,[4605507,152316,247516,398943,0,75046,822883,14447,150577,1125,46560,34929,3521,13024,8375,94850,11080,57751,28091,21676,7928,350144,302655,2123051]],[2025,12,[2713975,45485,389575,689051,0,58729,956971,11531,224607,119245,87100,71104,4043,12688,7822,73489,19758,47210,87188,18336,13842,756677,381790,2189522]],[2026,1,[3756837, 154705, 594150, 617416, 0, 79745, 1048455, 25892, 248467, 17968, 96069, 33434, 2020, 13348, 7808, 67659, 7840, 44041, 36420, 30044, 10185, 42660, 262880, 2403100]],[2026,2,[6827204, 166749, 330124, 612067, 0, 109525, 1119543, 11655, 169196, 10230, 69926, 28388, 10839, 12997, 8966, 73675, 11478, 48706, 99794, 48728, 11774, 119875, 515266, 2061625]],[2026,3,[14218310, 244378, 456651, 1966086, 520, 172730, 2013168, 20126, 168523, 1290, 65353, 77044, 857, 14552, 8440, 71024, 7844, 62632, 64874, 36568, 14992, 139061, 342038, 2050715]],[2026,4,[7009927, 202925, 292521, 1727708, 0, 120358, 2036585, 20373, 138497, 0, 47958, 53312, 2212, 17455, 9716, 94161, 10590, 54822, 19886, 45753, 10878, 187484, 802138, 2267469]],[2026,5,[3082218, 472193, 353209, 1262245, 0, 181855, 2227873, 21309, 136010, 1000, 83954, 64727, 2060, 16902, 7768, 93875, 12220, 56464, 51110, 5090, 11613, 640925, 448766, 2382225]],[2026,6,[2961410, 275603, 267530, 1928583, 0, 131918, 1674673, 29904, 96071, 3165, 48833, 53419, 3364, 14765, 9381, 92637, 13080, 55354, 37843, 35265, 10085, 245788, 720793, 2242043]]];

let expenses = [];

function seedExpenses(){
  return EXPENSE_SEED.map((row, i) => {
    const [yr, mo, vals] = row;
    const cats = {};
    EXP_CAT_KEYS.forEach((k, idx) => { cats[k] = vals[idx] || 0; });
    return { id:'exp_seed_'+yr+'_'+String(mo).padStart(2,'0'), year:yr, month:mo, cats, createdAt: Date.now()-i };
  });
}

async function loadExpenses(){
  try {
    const res = await window.storage.get("expenses", true);
    expenses = res && res.value ? JSON.parse(res.value) : [];
  } catch(e){ expenses=[]; }
  if(!expenses.length){ expenses=seedExpenses(); await saveExpenses(); }
}

async function saveExpenses(){
  try { await window.storage.set("expenses", JSON.stringify(expenses), true); }
  catch(e){ console.error('saveExpenses',e); }
}

function getExpMonth(year, month){
  return expenses.find(e=>e.year===year && e.month===month);
}

function expTotal(e){
  if(!e) return 0;
  return Object.values(e.cats||{}).reduce((s,v)=>s+(Number(v)||0),0);
}

// ── หน้าค่าใช้จ่าย ──────────────────────────────────────────────

let expView = 'monthly';
let expYear = new Date().getFullYear();
let expYear2 = new Date().getFullYear()-1;
let expSelYears = []; // สำหรับเปรียบเทียบสูงสุด 5 ปี
let expEditYear = null, expEditMonth = null;

function renderExpenseView(){
  // fallback: ถ้า expenses ว่าง ให้ seed จาก EXPENSE_SEED ทันที
  if(!expenses || !expenses.length){
    expenses = seedExpenses();
    saveExpenses().catch(()=>{});
  }
  const allYears = [...new Set(expenses.map(e=>e.year))].sort((a,b)=>a-b);
  const yearOpts = allYears.map(y=>`<option value="${y}" ${y===expYear?'selected':''}>${y+543}</option>`).join('');
  const year2Opts = allYears.map(y=>`<option value="${y}" ${y===expYear2?'selected':''}>${y+543}</option>`).join('');

  const ctrl = `<div class="summary-controls" style="flex-wrap:wrap;gap:8px;">
    <button class="vt-btn ${expView==='monthly'?'active':''}" onclick="expView='monthly';renderList()">📅 รายเดือน</button>
    <button class="vt-btn ${expView==='annual'?'active':''}" onclick="expView='annual';renderList()">📆 รายปี</button>
    ${(canAccess('expense_profit') && !currentUser?.permissions?.expense_noprofit) ? `<button class="vt-btn ${expView==='profit'?'active':''}" onclick="expView='profit';renderList()">📊 กำไร/ขาดทุน</button>` : ''}
    <button class="vt-btn ${expView==='detail'?'active':''}" onclick="expView='detail';renderList()">📋 รายละเอียดหมวด</button>
    <button class="btn primary" style="padding:6px 14px;font-size:13px;" onclick="openExpenseModal()">➕ เพิ่ม/แก้ไขรายจ่าย</button>
  </div>`;

  if(expView==='monthly') return ctrl + renderExpMonthly(allYears);
  if(expView==='annual') return ctrl + renderExpAnnual(allYears);
  if(expView==='profit') return ctrl + renderExpProfit(allYears, yearOpts, year2Opts);
  if(expView==='detail') return ctrl + renderExpDetail(allYears, yearOpts);
  return ctrl;
}

function renderExpMonthly(allYears){
  const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  if(!allYears.length) return '<div class="empty-state">ไม่มีข้อมูลค่าใช้จ่าย</div>';
  if(!expSelYears.length || expSelYears.some(y=>!allYears.includes(y)))
    expSelYears = allYears.slice(-5);
  const yearChecks = allYears.map(y=>`<label style="display:inline-flex;align-items:center;gap:4px;font-size:12.5px;margin-right:10px;cursor:pointer;">
    <input type="checkbox" ${expSelYears.includes(y)?'checked':''} onchange="toggleExpYear(${y})" style="width:14px;height:14px;"> ปี ${y+543}</label>`).join('');
  const selYears = allYears.filter(y=>expSelYears.includes(y)).sort((a,b)=>a-b);
  const yearHeaders = selYears.map(y=>`<th style="text-align:right;white-space:nowrap;">ปี ${y+543}</th>`).join('');
  const rows = TH_MONTHS.map((mLabel,i)=>{
    const m = i+1;
    const totals = selYears.map(y=>expTotal(getExpMonth(y,m)));
    const cells = selYears.map((y,idx)=>`<td style="text-align:right;">${totals[idx]?totals[idx].toLocaleString():'-'}</td>`).join('');
    return `<tr><td>${mLabel}</td>${cells}</tr>`;
  }).join('');
  const footTotals = selYears.map(y=>{
    const t=[1,2,3,4,5,6,7,8,9,10,11,12].reduce((s,m)=>s+expTotal(getExpMonth(y,m)),0);
    return `<td style="font-weight:700;text-align:right;">${t.toLocaleString()}</td>`;
  }).join('');
  return `<div style="background:var(--surface-2);border-radius:10px;padding:10px 14px;margin-bottom:12px;">
    <div style="font-size:12.5px;font-weight:600;margin-bottom:8px;">เลือกปีที่ต้องการเปรียบเทียบ (สูงสุด 5 ปี):</div>
    ${yearChecks}</div>
    <div class="summary-panel"><h3>💰 เปรียบเทียบค่าใช้จ่ายรายเดือน</h3>
    <div style="overflow-x:auto;"><table class="rep-table">
      <thead><tr><th>เดือน</th>${yearHeaders}</tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td>รวมทั้งปี</td>${footTotals}</tr></tfoot>
    </table></div></div>`;
}

function toggleExpYear(y){
  if(expSelYears.includes(y)){
    if(expSelYears.length>1) expSelYears=expSelYears.filter(x=>x!==y);
  } else {
    if(expSelYears.length<5) expSelYears.push(y);
    else { toast('เลือกได้สูงสุด 5 ปีค่ะ'); return; }
  }
  renderList();
}

function renderExpAnnual(allYears){
  const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  if(!allYears.length) return '<div class="empty-state">ไม่มีข้อมูล</div>';
  const yearHeaders = allYears.map(y=>`<th style="text-align:right;white-space:nowrap;">ปี ${y+543}</th>`).join('');
  const rows = [1,2,3,4,5,6,7,8,9,10,11,12].map((m,i)=>{
    const cells = allYears.map(y=>`<td style="text-align:right;">${expTotal(getExpMonth(y,m))||0?expTotal(getExpMonth(y,m)).toLocaleString():'-'}</td>`).join('');
    return `<tr><td>${TH_MONTHS[i]}</td>${cells}</tr>`;
  }).join('');
  const totals = allYears.map(y=>{
    const t=[1,2,3,4,5,6,7,8,9,10,11,12].reduce((s,m)=>s+expTotal(getExpMonth(y,m)),0);
    return `<td style="font-weight:700;text-align:right;">${t?t.toLocaleString():'-'}</td>`;
  }).join('');
  return `<div class="summary-panel"><h3>📆 ค่าใช้จ่ายรายปี เปรียบเทียบทุกปี</h3>
    <div style="overflow-x:auto;"><table class="rep-table">
      <thead><tr><th>เดือน</th>${yearHeaders}</tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td>รวมทั้งปี</td>${totals}</tr></tfoot>
    </table></div></div>`;
}


function renderExpProfit(allYears, yearOpts, year2Opts){
  const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  function getRevMonth(year,month){
    const h=historicalSales.filter(x=>x.year===year&&x.month===month).reduce((s,x)=>s+(Number(x.amount)||0),0);
    const j=jobs.filter(x=>x.countInSales!==false&&x.date&&x.date.startsWith(year+'-'+String(month).padStart(2,'0'))).reduce((s,x)=>s+(Number(x.salesAmount)||0),0);
    return h+j;
  }
  function getRevYear(y){return [1,2,3,4,5,6,7,8,9,10,11,12].reduce((s,m)=>s+getRevMonth(y,m),0);}
  function getExpYear(y){return [1,2,3,4,5,6,7,8,9,10,11,12].reduce((s,m)=>s+expTotal(getExpMonth(y,m)),0);}

  if(!expSelYears.length||expSelYears.some(y=>!allYears.includes(y))) expSelYears=allYears.slice(-5);
  const yearChecks = allYears.map(y=>`<label style="display:inline-flex;align-items:center;gap:4px;font-size:12.5px;margin-right:10px;cursor:pointer;">
    <input type="checkbox" ${expSelYears.includes(y)?'checked':''} onchange="toggleExpYear(${y})" style="width:14px;height:14px;"> ปี ${y+543}</label>`).join('');
  const selYears = allYears.filter(y=>expSelYears.includes(y)).sort((a,b)=>a-b);

  // ตารางเปรียบเทียบรายปี
  const yHeaders = selYears.map(y=>`<th colspan="2" style="text-align:center;white-space:nowrap;background:var(--bg-accent);">ปี ${y+543}</th>`).join('');
  const ySubH = selYears.map(()=>`<th style="text-align:right;font-size:11.5px;">กำไร</th><th style="text-align:right;font-size:11.5px;">%Margin</th>`).join('');
  const annualProfitRow = selYears.map(y=>{
    const rev=getRevYear(y),exp=getExpYear(y),profit=rev-exp;
    const margin=rev>0?(profit/rev*100).toFixed(1):null;
    const pc=profit>=0?'var(--khaki-green)':' var(--stamp-red)';
    return `<td style="text-align:right;color:${pc};font-weight:700;">${profit>=0?'+':''}${profit.toLocaleString()}</td><td style="text-align:right;color:${pc}">${margin!==null?margin+'%':'-'}</td>`;
  }).join('');
  const revRow = selYears.map(y=>`<td colspan="2" style="text-align:right;font-size:12px;">${getRevYear(y).toLocaleString()}</td>`).join('');
  const expRow = selYears.map(y=>`<td colspan="2" style="text-align:right;font-size:12px;color:var(--stamp-red);">${getExpYear(y).toLocaleString()}</td>`).join('');

  const annualTable = `<div class="summary-panel"><h3>📊 เปรียบเทียบกำไร/ขาดทุน รายปี</h3>
    <div style="overflow-x:auto;"><table class="rep-table">
      <thead><tr><th>รายการ</th>${selYears.map(y=>`<th style="text-align:right;white-space:nowrap;">ปี ${y+543}</th>`).join('')}
        <th style="text-align:right;background:var(--bg-accent);">รวม</th></tr></thead>
      <tbody>
        <tr><td>ยอดขาย</td>${selYears.map(y=>`<td style="text-align:right;">${getRevYear(y).toLocaleString()}</td>`).join('')}
          <td style="text-align:right;font-weight:700;background:var(--bg-accent);">${selYears.reduce((s,y)=>s+getRevYear(y),0).toLocaleString()}</td></tr>
        <tr><td>ค่าใช้จ่าย</td>${selYears.map(y=>`<td style="text-align:right;color:var(--stamp-red);">${getExpYear(y).toLocaleString()}</td>`).join('')}
          <td style="text-align:right;color:var(--stamp-red);font-weight:700;background:var(--bg-accent);">${selYears.reduce((s,y)=>s+getExpYear(y),0).toLocaleString()}</td></tr>
        <tr style="font-weight:700;"><td>กำไร/(ขาดทุน)</td>
          ${selYears.map(y=>{const p=getRevYear(y)-getExpYear(y),pc=p>=0?'var(--khaki-green)':' var(--stamp-red)';return `<td style="text-align:right;color:${pc};">${p>=0?'+':''}${p.toLocaleString()}</td>`;}).join('')}
          ${(()=>{const tp=selYears.reduce((s,y)=>s+getRevYear(y)-getExpYear(y),0),pc=tp>=0?'var(--khaki-green)':' var(--stamp-red)';return `<td style="text-align:right;color:${pc};font-weight:700;background:var(--bg-accent);">${tp>=0?'+':''}${tp.toLocaleString()}</td>`;})()} </tr>
        <tr><td>%Margin</td>
          ${selYears.map(y=>{const r=getRevYear(y),p=r-getExpYear(y),m=r>0?(p/r*100).toFixed(1):null,pc=p>=0?'var(--khaki-green)':' var(--stamp-red)';return `<td style="text-align:right;color:${pc};">${m!==null?m+'%':'-'}</td>`;}).join('')}
          ${(()=>{const tR=selYears.reduce((s,y)=>s+getRevYear(y),0),tP=selYears.reduce((s,y)=>s+getRevYear(y)-getExpYear(y),0),m=tR>0?(tP/tR*100).toFixed(1):null,pc=tP>=0?'var(--khaki-green)':' var(--stamp-red)';return `<td style="text-align:right;color:${pc};font-weight:700;background:var(--bg-accent);">${m!==null?m+'%':'-'}</td>`;})()} </tr>
      </tbody>
    </table></div></div>`;

  // ตารางรายเดือน (เลือกปี)
  const mRows = TH_MONTHS.map((mLabel,i)=>{
    const m=i+1,rev=getRevMonth(expYear,m),exp=expTotal(getExpMonth(expYear,m)),profit=rev-exp;
    const margin=rev>0?(profit/rev*100).toFixed(1):null;
    const pc=profit>=0?'var(--khaki-green)':' var(--stamp-red)';
    return `<tr><td>${mLabel}</td><td style="text-align:right;">${rev?rev.toLocaleString():'-'}</td><td style="text-align:right;">${exp?exp.toLocaleString():'-'}</td><td style="text-align:right;color:${pc};font-weight:600;">${(rev||exp)?(profit>=0?'+':'')+profit.toLocaleString():'-'}</td><td style="text-align:right;color:${pc}">${margin!==null?margin+'%':'-'}</td></tr>`;
  }).join('');
  const tR=[1,2,3,4,5,6,7,8,9,10,11,12].reduce((s,m)=>s+getRevMonth(expYear,m),0);
  const tE=[1,2,3,4,5,6,7,8,9,10,11,12].reduce((s,m)=>s+expTotal(getExpMonth(expYear,m)),0);
  const tP=tR-tE,tM=tR>0?(tP/tR*100).toFixed(1):null,pc=tP>=0?'var(--khaki-green)':' var(--stamp-red)';
  const monthTable = `<div class="summary-panel"><h3>📅 กำไร/ขาดทุน รายเดือน
    <select class="filt" onchange="expYear=Number(this.value);renderList()" style="margin-left:10px;font-size:13px;">${yearOpts}</select></h3>
    <table class="rep-table">
      <thead><tr><th>เดือน</th><th style="text-align:right;">ยอดขาย</th><th style="text-align:right;">ค่าใช้จ่าย</th><th style="text-align:right;">กำไร/(ขาดทุน)</th><th style="text-align:right;">%Margin</th></tr></thead>
      <tbody>${mRows}</tbody>
      <tfoot><tr><td>รวมทั้งปี</td><td style="text-align:right;">${tR.toLocaleString()}</td><td style="text-align:right;">${tE.toLocaleString()}</td><td style="text-align:right;color:${pc};font-weight:700;">${(tP>=0?'+':'')+tP.toLocaleString()}</td><td style="text-align:right;color:${pc}">${tM!==null?tM+'%':'-'}</td></tr></tfoot>
    </table></div>`;

  return `<div style="background:var(--surface-2);border-radius:10px;padding:10px 14px;margin-bottom:12px;">
    <div style="font-size:12.5px;font-weight:600;margin-bottom:8px;">เลือกปีที่ต้องการเปรียบเทียบ (สูงสุด 5 ปี):</div>
    ${yearChecks}</div>
    ${annualTable}${monthTable}`;
}


function renderExpDetail(allYears, yearOpts){
  const sel = `<div style="display:flex;gap:8px;margin-bottom:10px;">
    <label style="font-size:12.5px;">ปี:</label>
    <select class="filt" onchange="expYear=Number(this.value);renderList()">${yearOpts}</select>
  </div>`;
  const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const monthHeaders = TH_MONTHS.map(m=>`<th style="white-space:nowrap;">${m}</th>`).join('');
  const rows = EXP_CAT_KEYS.map(key=>{
    const cells = [1,2,3,4,5,6,7,8,9,10,11,12].map(m=>{
      const e = getExpMonth(expYear,m);
      const v = e ? (e.cats[key]||0) : 0;
      return `<td style="text-align:right;">${v?v.toLocaleString():'-'}</td>`;
    }).join('');
    const annual = [1,2,3,4,5,6,7,8,9,10,11,12].reduce((s,m)=>{const e=getExpMonth(expYear,m);return s+(e?(e.cats[key]||0):0);},0);
    return `<tr><td style="font-size:12px;white-space:nowrap;">${escapeHtml(EXP_CAT_LABELS[key])}</td>${cells}<td style="font-weight:700;text-align:right;">${annual?annual.toLocaleString():'-'}</td></tr>`;
  }).join('');
  const totals = [1,2,3,4,5,6,7,8,9,10,11,12].map(m=>`<td style="font-weight:700;text-align:right;">${(expTotal(getExpMonth(expYear,m))||0).toLocaleString()}</td>`).join('');
  const grandTotal = [1,2,3,4,5,6,7,8,9,10,11,12].reduce((s,m)=>s+expTotal(getExpMonth(expYear,m)),0);
  return `${sel}<div class="summary-panel"><h3>📋 รายละเอียดค่าใช้จ่ายแยกหมวดหมู่ ปี ${expYear+543}</h3>
    <div style="overflow-x:auto;"><table class="rep-table">
      <thead><tr><th>หมวดหมู่</th>${monthHeaders}<th>รวม</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td>รวม</td>${totals}<td style="font-weight:700;">${grandTotal.toLocaleString()}</td></tr></tfoot>
    </table></div></div>`;
}

// ── Modal เพิ่ม/แก้ไขค่าใช้จ่าย ────────────────────────────────

function openExpenseModal(year, month){
  expEditYear = year || new Date().getFullYear();
  expEditMonth = month || new Date().getMonth()+1;
  const existing = getExpMonth(expEditYear, expEditMonth);
  const allYears = [...new Set([...expenses.map(e=>e.year), expEditYear])].sort((a,b)=>a-b);
  const TH_MONTHS_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

  const yearOpts = [...allYears, expEditYear+1].filter((v,i,a)=>a.indexOf(v)===i).sort().map(y=>`<option value="${y}" ${y===expEditYear?'selected':''}>${y+543}</option>`).join('');
  const monOpts = TH_MONTHS_FULL.map((n,i)=>`<option value="${i+1}" ${i+1===expEditMonth?'selected':''}>${n}</option>`).join('');

  const catFields = EXP_CAT_KEYS.map(key=>`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <label style="width:260px;font-size:12.5px;flex-shrink:0;">${escapeHtml(EXP_CAT_LABELS[key])}</label>
      <input type="number" id="exp_${key}" value="${existing?(existing.cats[key]||0):0}" min="0" style="width:130px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;font-size:13px;text-align:right;">
    </div>`).join('');

  $('expModalOverlay').innerHTML = `
    <div style="background:var(--white);border-radius:14px;padding:24px 28px;max-width:600px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3);">
      <h2 style="margin-bottom:16px;">💰 ${existing?'แก้ไข':'เพิ่ม'}ค่าใช้จ่าย</h2>
      <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center;">
        <select id="expYearSel" style="padding:7px 10px;border:1px solid var(--line);border-radius:7px;font-size:13px;">${yearOpts}</select>
        <select id="expMonSel" style="padding:7px 10px;border:1px solid var(--line);border-radius:7px;font-size:13px;">${monOpts}</select>
        <button class="btn ghost" style="font-size:12px;padding:6px 12px;" onclick="reloadExpModal()">🔄 โหลด</button>
      </div>
      <div style="background:var(--surface-1);border-radius:8px;padding:12px;margin-bottom:14px;">${catFields}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button class="btn ghost" onclick="$('expModalOverlay').style.display='none'">ยกเลิก</button>
        <button class="btn primary" onclick="saveExpenseModal()">💾 บันทึก</button>
      </div>
    </div>`;
  $('expModalOverlay').style.display='flex';
}

function reloadExpModal(){
  const y = Number($('expYearSel').value);
  const m = Number($('expMonSel').value);
  openExpenseModal(y, m);
}

async function saveExpenseModal(){
  const y = Number($('expYearSel').value);
  const m = Number($('expMonSel').value);
  const cats = {};
  EXP_CAT_KEYS.forEach(key=>{ cats[key] = Number($('exp_'+key).value)||0; });
  const existing = getExpMonth(y, m);
  if(existing){ existing.cats=cats; }
  else { expenses.push({id:'exp_'+y+'_'+m, year:y, month:m, cats, createdAt:Date.now()}); }
  await saveExpenses();
  $('expModalOverlay').style.display='none';
  toast('💰 บันทึกค่าใช้จ่าย '+String(m).padStart(2,'0')+'/'+((y+543))+' แล้วค่ะ');
  if(currentView==='expense') renderList();
}



// ── ลำดับงาน เช่น กค.-1, กค.-2, มิย.-99 ──────────────────────
const TH_MONTH_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
let _jobNosCache = null;

function buildJobNos(){
  const byMonth = {}; // 'YYYY-M' → [sorted jobs]
  const all = [...jobs].filter(j=>j.date);
  all.sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  all.forEach(j=>{
    const d = new Date(j.date+'T00:00:00');
    if(isNaN(d)) return;
    const key = d.getFullYear()+'-'+d.getMonth();
    if(!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(j);
  });
  const nos = {};
  Object.entries(byMonth).forEach(([key,list])=>{
    const m = parseInt(key.split('-')[1]);
    const abbr = TH_MONTH_SHORT[m];
    list.forEach((j,i)=>{ nos[j.id] = abbr+(i+1); });
  });
  return nos;
}

function getJobDisplayNo(j){
  if(!_jobNosCache) _jobNosCache = buildJobNos();
  return _jobNosCache[j.id] || '-';
}

function invalidateJobNos(){ _jobNosCache = null; }

// ── ระบบสิทธิ์การเข้าถึง ──────────────────────────────────────
const USER_ROLES = {
  manager:       { label:'เมเนเจอร์',    color:'#5B6B22' },
  seller_direct: { label:'เซลล์ Direct',  color:'#1A5276' },
  seller_admin:  { label:'เซลล์ Admin',   color:'#784212' },
  purchasing:    { label:'ฝ่ายจัดซื้อ',   color:'#145A32' },
  production:    { label:'ฝ่ายผลิต',      color:'#4A235A' },
  staff:         { label:'พนักงาน',        color:'#5B5142' },
};

function userRole(){ return currentUser?.role || 'staff'; }

function canAccess(feature){
  const r = userRole();
  if(r === 'manager') return true;
  // ตรวจสิทธิ์รายบุคคลก่อน
  const perms = currentUser?.permissions;
  if(perms){
    if(feature==='card' || feature==='table')  { if('card' in perms) return !!perms.card; }
    if(feature==='lead')                        { if('lead' in perms) return !!perms.lead; }
    if(feature==='add_job'||feature==='delete_job') { if('jobs_edit' in perms) return !!perms.jobs_edit; }
    if(feature==='expense')       { if('expense_noprofit' in perms) return !!perms.expense_noprofit; }
    if(feature==='expense_profit'){ if('expense_noprofit' in perms) return false; } // expense_noprofit = ดูได้แต่ไม่เห็นกำไร
    if(feature==='summary'){
      if('summary_direct' in perms || 'summary_admin' in perms)
        return !!(perms.summary_direct || perms.summary_admin);
    }
  }
  // fallback role
  const rules = {
    card:           ['seller_direct','seller_admin','production','staff'],
    table:          ['seller_direct','seller_admin','production','staff'],
    lead:           ['seller_direct','seller_admin'],
    summary:        ['seller_direct','seller_admin'],
    expense:        ['purchasing'],
    expense_profit: [],
    manage_users:   [],
    add_job:        ['seller_direct','seller_admin'],
    delete_job:     ['seller_direct','seller_admin'],
  };
  return (rules[feature]||[]).includes(r);
}

function applyRoleUI(){
  if(!currentUser) return;
  const r = userRole();
  // แท็บการมองเห็น
  const tb = (id,show)=>{ const el=$(id); if(el) el.style.display=show?'':'none'; };
  tb('viewCardBtn',    canAccess('card'));
  tb('viewTableBtn',   canAccess('table'));
  tb('viewSummaryBtn', canAccess('summary'));
  tb('viewLeadBtn',    canAccess('lead'));
  tb('viewExpenseBtn', canAccess('expense'));
  tb('addBtn',         canAccess('add_job'));
  tb('manageUsersBtn', canAccess('manage_users'));
  // ถ้า currentView ไม่มีสิทธิ์ → เปลี่ยน view
  const viewOk = {
    card: canAccess('card'), table: canAccess('table'),
    summary: canAccess('summary'), leads: canAccess('lead'),
    expense: canAccess('expense'),
  };
  if(!viewOk[currentView]){
    if(canAccess('card')) currentView='card';
    else if(canAccess('expense')) currentView='expense';
  }
  // แสดงชื่อ role ใน topbar
  const roleLabel = USER_ROLES[r]?.label || r;
  const box = $('topbarUser');
  if(box) box.innerHTML = `<span>👤 ${escapeHtml(currentUser.name)} <span style="font-size:11px;opacity:.7;">(${roleLabel})</span></span><button id="logoutBtn">ออกจากระบบ</button>`;
  const lb=$('logoutBtn'); if(lb) lb.onclick=doLogout;
}

async function loadLeads(){
  try{
    if(_useSupabase){
      const { data, error } = await _sb.from('leads').select('*');
      if(error) throw error;
      leads = (data||[]).map(dbRowToLead).sort((a,b)=>b.createdAt-a.createdAt);
    } else {
      const res = await window.storage.get("leads", true);
      leads = res && res.value ? JSON.parse(res.value) : [];
    }
  }catch(e){ console.error('loadLeads',e); leads=[]; }
  if(!leads.length){ leads=seedLeads(); await saveLeads(); }
  // merge leads 6 กค
  const _lIds = new Set(leads.map(l=>l.id));
  const _lAdd6 = seedNewLeadsJul6().filter(l=>!_lIds.has(l.id));
  const _lAdd67 = seedNewLeadsJul67().filter(l=>!_lIds.has(l.id));
  const _lAdd8 = seedLeadsJul8().filter(l=>!_lIds.has(l.id));
  const _lAdd = [..._lAdd6,..._lAdd67,..._lAdd8];
  if(_lAdd.length){ leads.push(..._lAdd); await saveLeads(); }
  populateJobLeadSelect();
  if(currentView==='leads') renderList();
}

async function saveLeads(){
  try{
    if(_useSupabase){
      if(!leads.length) return;
      const rows = leads.map(l=>({
        id:l.id, lead_data:stripMeta(l),
        version:(l._v||0)+1,
        updated_at:new Date().toISOString(),
        updated_by:currentUser?.name||'system'
      }));
      const { error } = await _sb.from('leads').upsert(rows);
      if(error) throw error;
      rows.forEach(r=>{ const l=leads.find(x=>x.id===r.id); if(l) l._v=r.version; });
    } else {
      await window.storage.set("leads", JSON.stringify(leads), true);
    }
  }catch(e){ console.error('saveLeads',e); toast("บันทึก Lead ไม่สำเร็จ"); }
  populateJobLeadSelect();
}

async function saveSingleLead(leadId){
  const l = leads.find(x=>x.id===leadId);
  if(!l) return;
  if(_useSupabase){
    const newV = (l._v||0)+1;
    const { error } = await _sb.from('leads').upsert({
      id:l.id, lead_data:stripMeta(l),
      version:newV, updated_at:new Date().toISOString(),
      updated_by:currentUser?.name||'system'
    });
    if(error){ toast("บันทึก Lead ไม่สำเร็จ: "+error.message); return; }
    l._v = newV;
  } else {
    await saveLeads();
  }
}

async function deleteLeadFromDB(leadId){
  if(_useSupabase){
    const { error } = await _sb.from('leads').delete().eq('id',leadId);
    if(error) throw error;
  } else {
    leads = leads.filter(l=>l.id!==leadId);
    await saveLeads();
  }
}

// ── Users CRUD ───────────────────────────────────────────────────────
async function loadUsers(){
  try{
    if(_useSupabase){
      const { data, error } = await _sb.from('users_tbl').select('*');
      if(error) throw error;
      users = (data||[]).map(r => {
        r.user_data.db_id = r.id;
        return r.user_data;
      });
    } else {
      const res = await window.storage.get("users", true);
      users = res && res.value ? JSON.parse(res.value) : [];
    }
  }catch(e){ users=[]; }
  if(!users.length){
    users = SEED_STAFF_NAMES.map((name,i)=>({
      id:"user_"+Date.now()+"_"+i, name, username:name, password:"123456",
      role:DEFAULT_MANAGERS.includes(name)?"manager":"staff", active:true, createdAt:Date.now()
    }));
    await saveUsers();
  } else {
    const ENSURE_STAFF = ["นัด","กาน","เพื่อน","ป่าน"];
    let changed=false;
    ENSURE_STAFF.forEach((name,i)=>{
      if(!users.some(u=>u.name===name)){
        users.push({ id:"user_"+Date.now()+"_ensure_"+i, name, username:name, password:"123456",
          role:"staff", active:true, createdAt:Date.now() });
        changed=true;
      }
    });
    if(changed) await saveUsers();
  }
}

async function saveUsers(){
  try{
    if(_useSupabase){
      const rows = users.map(u => {
        const row = { user_data: u };
        if (u.db_id) row.id = u.db_id;
        return row;
      });
      const { error } = await _sb.from('users_tbl').upsert(rows);
      if(error) throw error;
    } else {
      await window.storage.set("users", JSON.stringify(users), true);
    }
  }catch(e){ console.error('saveUsers',e); toast("บันทึกผู้ใช้งานไม่สำเร็จ"); }
}

// ── Historical Sales ─────────────────────────────────────────────────
async function loadHistoricalSales(){
  try{
    if(_useSupabase){
      const { data } = await _sb.from('app_kv').select('value').eq('key','historicalSalesV2').maybeSingle();
      historicalSales = data?.value ? JSON.parse(JSON.stringify(data.value)) : [];
    } else {
      const res = await window.storage.get("historicalSalesV2", true);
      historicalSales = res && res.value ? JSON.parse(res.value) : [];
    }
  }catch(e){ historicalSales=[]; }

  // ถ้า seed records ไม่ครบ → re-seed แต่คงรายการ manual ไว้
  const manualEntries = historicalSales.filter(h=>h.manual===true);
  const seedCount = historicalSales.filter(h=>!h.manual).length;
  if(seedCount !== HIST_RAW_SALES.length){
    const seeded = HIST_RAW_SALES.map((row,i)=>({
      id:"hist_"+i, month:row[0], year:row[1],
      customerType:HIST_TYPE_MAP[row[2]]||"อื่นๆ", amount:row[3]
    }));
    historicalSales = [...seeded, ...manualEntries];
    try{
      if(_useSupabase){
        await _sb.from('app_kv').upsert({ key:'historicalSalesV2', value:historicalSales, updated_at:new Date().toISOString() });
      } else {
        await window.storage.set("historicalSalesV2", JSON.stringify(historicalSales), true);
      }
    }catch(e){}
  }
}

// ── Session ──────────────────────────────────────────────────────────
async function saveSession(data){
  try{
    if(_useSupabase){
      await _sb.from('app_kv').upsert({ key:'session_'+currentUser?.id, value:data, updated_at:new Date().toISOString() });
    } else {
      await window.storage.set("session", JSON.stringify(data), false);
    }
  }catch(e){}
}
async function loadSession(){
  try{
    if(_useSupabase){
      // ไม่ใช้ Supabase session (ใช้ localStorage แทนเพื่อความเร็ว)
      const raw = localStorage.getItem('sb_session');
      return raw ? JSON.parse(raw) : null;
    } else {
      const res = await window.storage.get("session", false);
      return res && res.value ? JSON.parse(res.value) : null;
    }
  }catch(e){ return null; }
}



function findUserByUsername(uname){
  const u = (uname||"").trim().toLowerCase();
  return users.find(x=>
    (x.username||"").trim().toLowerCase()===u ||
    (x.name||"").trim().toLowerCase()===u
  );
}

async function tryLogin(){
  const uname = $("loginUsername").value;
  const pass = $("loginPassword").value;
  const errEl = $("loginErr");
  errEl.textContent = "";
  if(!uname.trim() || !pass.trim()){
    errEl.textContent = "กรุณากรอก Username และรหัสผ่าน";
    return;
  }
  const u = findUserByUsername(uname);
  if(!u || u.active===false || !u.email){
    errEl.textContent = "Username ไม่ถูกต้อง หรือถูกระงับ";
    return;
  }
  
  errEl.textContent = "กำลังตรวจสอบรหัสผ่าน...";
  
  if(_useSupabase && _sb) {
    const { data, error } = await _sb.auth.signInWithPassword({
      email: u.email,
      password: pass
    });
    if(error) {
      errEl.textContent = "รหัสผ่านไม่ถูกต้อง";
      return;
    }
  } else {
    // Fallback if not using Supabase (not expected to hit)
    if(u.password && u.password !== pass){
      errEl.textContent = "Username หรือรหัสผ่านไม่ถูกต้อง";
      return;
    }
  }

  errEl.textContent = "";
  currentUser = u;
  try{ localStorage.setItem('sb_session', JSON.stringify({username:u.username})); }catch(e){}
  try{ await window.storage.set("session", JSON.stringify({username:u.username}), false); }catch(e){}
  $("loginOverlay").classList.remove("open");
  $("loginOverlay").style.display = "none";
  renderTopbarUser();
  toast(`👋 ยินดีต้อนรับ ${u.name}`);
  render();
}

function doLogout(){
  if(!confirm("ออกจากระบบใช่หรือไม่?")) return;
  currentUser = null;
  try{ localStorage.removeItem('sb_session'); }catch(e){}
  try{ window.storage.set("session", JSON.stringify({}), false); }catch(e){}
  $("loginOverlay").style.display = "flex";
  $("loginUsername").value = "";
  $("loginPassword").value = "";
  $("loginErr").textContent = "";
  renderTopbarUser();
}

function renderTopbarUser(){
  const box = $("topbarUser");
  const mgrBtn = $("manageUsersBtn");
  if(!currentUser){ box.innerHTML = ""; mgrBtn.style.display = "none"; return; }
  box.innerHTML = `<span>👤 ${escapeHtml(currentUser.name)}${currentUser.role==='manager' ? ' (Manager)' : ''}</span><button id="logoutBtn">ออกจากระบบ</button>`;
  $("logoutBtn").onclick = doLogout;
  applyRoleUI();
}

async function attemptAutoLogin(){
  try{
    // ตรวจ localStorage ก่อน (เร็วกว่า และใช้ได้ทั้ง Supabase และ window.storage)
    let sess = null;
    const lsRaw = localStorage.getItem('sb_session');
    if(lsRaw) sess = JSON.parse(lsRaw);
    if(!sess){
      const res = await window.storage.get("session", false);
      sess = res && res.value ? JSON.parse(res.value) : null;
    }
    if(sess && sess.username){
      const u = findUserByUsername(sess.username);
      if(u && u.active!==false){
        currentUser = u;
        $("loginOverlay").style.display = "none";
        renderTopbarUser();
        return true;
      }
    }
  }catch(e){}
  return false;
}

// --- จัดการผู้ใช้งาน (เฉพาะ Manager) ---
function requireManager(){
  if(!currentUser || currentUser.role !== 'manager'){
    toast("เฉพาะ Manager เท่านั้นที่จัดการผู้ใช้งานได้");
    return false;
  }
  return true;
}

function renderUserList(){
  const box = $("userListBox");
  if(!users.length){ box.innerHTML = `<div style="padding:10px;color:var(--ink-soft);font-size:13px;">ยังไม่มีผู้ใช้งาน</div>`; return; }
  box.innerHTML = users.slice().sort((a,b)=>a.name.localeCompare(b.name,'th')).map(u=>`
    <div class="user-row">
      <span class="urole ${u.role}">${(USER_ROLES[u.role]||USER_ROLES.staff).label}</span>
      <span class="uname">${escapeHtml(u.name)}${u.active===false?' (ปิดใช้งาน)':''}</span>
      <span class="uacct">user: ${escapeHtml(u.username)}</span>
      <button class="row-del-btn" data-useredit="${u.id}" title="แก้ไข">✎</button>
      <button class="row-del-btn" data-userdel="${u.id}" title="ลบ">🗑</button>
    </div>
  `).join("");
  box.querySelectorAll('[data-useredit]').forEach(b=>{ b.onclick = ()=>fillUserForm(b.dataset.useredit); });
  box.querySelectorAll('[data-userdel]').forEach(b=>{ b.onclick = ()=>deleteUserAccount(b.dataset.userdel); });
}

function fillUserForm(id){
  const u = users.find(x=>x.id===id);
  if(!u) return;
  editingUserId = id;
  $("u_editId").value = id;
  $("u_name").value = u.name;
  $("u_role").value = u.role;
  updateRoleDesc();
  const _perms = u.permissions||null;
  if($("perm_card")) $("perm_card").checked = _perms ? !!_perms["card"] : false;
  if($("perm_summary_direct")) $("perm_summary_direct").checked = _perms ? !!_perms["summary_direct"] : false;
  if($("perm_summary_admin")) $("perm_summary_admin").checked = _perms ? !!_perms["summary_admin"] : false;
  if($("perm_lead")) $("perm_lead").checked = _perms ? !!_perms["lead"] : false;
  if($("perm_expense_noprofit")) $("perm_expense_noprofit").checked = _perms ? !!_perms["expense_noprofit"] : false;
  if($("perm_jobs_edit")) $("perm_jobs_edit").checked = _perms ? !!_perms["jobs_edit"] : false;
  updateRoleDesc();
  $("u_username").value = u.username;
  $("u_password").value = "";
}
function clearUserForm(){
  editingUserId = null;
  $("u_editId").value = "";
  $("u_name").value = "";
  $("u_role").value = "staff";
  if($("perm_card")) $("perm_card").checked = false;
  if($("perm_summary_direct")) $("perm_summary_direct").checked = false;
  if($("perm_summary_admin")) $("perm_summary_admin").checked = false;
  if($("perm_lead")) $("perm_lead").checked = false;
  if($("perm_expense_noprofit")) $("perm_expense_noprofit").checked = false;
  if($("perm_jobs_edit")) $("perm_jobs_edit").checked = false;
  updateRoleDesc();
  $("u_username").value = "";
  $("u_password").value = "";
}

function updateRoleDesc(){
  const r = $('u_role')?.value;
  const desc = {
    manager: '✅ เข้าถึงทุกอย่าง รวมถึงรายงานค่าใช้จ่าย กำไร/ขาดทุน และจัดการผู้ใช้งาน',
    seller_direct: '✅ การ์ด + ตาราง + Lead + รายงานยอดขายทุกประเภท ❌ ยกเว้นยอดของ เวปใหม่(แอดมิน) และ เวปเก่า(แอดมิน)',
    seller_admin: '✅ การ์ด + ตาราง + Lead + รายงานยอดขาย เฉพาะ เวปใหม่(แอดมิน) และ เวปเก่า(แอดมิน) เท่านั้น',
    purchasing: '✅ ค่าใช้จ่ายรายเดือน/ปี/รายละเอียดหมวด ❌ ไม่เห็นรายงานกำไร/ขาดทุน',
    production: '✅ การ์ด + ตาราง ❌ ไม่เห็นรายงานยอดขายและค่าใช้จ่าย',
    staff: '✅ การ์ด + ตาราง (เท่ากับฝ่ายผลิต) ❌ ไม่เห็นรายงานยอดขาย Lead และค่าใช้จ่าย',
  };
  const el = $('roleDesc');
  if(el) el.textContent = desc[r] || '';
}

function openUserModal(){
  if(!requireManager()) return;
  clearUserForm();
  renderUserList();
  $("userModalOverlay").classList.add("open");
}
function closeUserModal(){
  $("userModalOverlay").classList.remove("open");
  clearUserForm();
}

async function saveUserAccount(){
  if(!requireManager()) return;
  const name = $("u_name").value.trim();
  const username = $("u_username").value.trim();
  const password = $("u_password").value.trim();
  const role = $("u_role").value;
  // อ่านสิทธิ์รายบุคคล
  const PERM_KEYS = ['card','summary_direct','summary_admin','lead','expense_noprofit','jobs_edit'];
  const permsChecked = PERM_KEYS.filter(k=>$('perm_'+k)?.checked);
  const permissions = permsChecked.length > 0
    ? Object.fromEntries(PERM_KEYS.map(k=>[ k, !!$('perm_'+k)?.checked ]))
    : null; // null = ยึดตาม role
  if(!name || !username){ alert("กรุณากรอกชื่อและ Username ให้ครบ"); return; }
  const dup = findUserByUsername(username);
  if(dup && dup.id !== editingUserId){ alert("Username นี้ถูกใช้แล้ว กรุณาตั้งชื่ออื่น"); return; }
  if(editingUserId){
    const u = users.find(x=>x.id===editingUserId);
    u.name = name; u.username = username; u.role = role; u.permissions = permissions;
    if(password){
      if(!/^[0-9]{6}$/.test(password)){ alert("รหัสผ่านต้องเป็นตัวเลข 6 หลัก"); return; }
      u.password = password;
    }
  }else{
    if(!password){ alert("กรุณาตั้งรหัสผ่าน 6 หลักสำหรับสมาชิกใหม่"); return; }
    if(!/^[0-9]{6}$/.test(password)){ alert("รหัสผ่านต้องเป็นตัวเลข 6 หลัก"); return; }
    users.push({ id:"user_"+Date.now()+"_"+Math.floor(Math.random()*1000), name, username, password, role, permissions, active:true, createdAt:Date.now() });
  }
  await saveUsers();
  clearUserForm();
  renderUserList();
  populateSellerSelect(); // อัปเดตรายชื่อเซลล์/ผู้ทำในฟอร์มต่างๆ ทันที
  toast("บันทึกผู้ใช้งานแล้ว");
}

async function deleteUserAccount(id){
  if(!requireManager()) return;
  const u = users.find(x=>x.id===id);
  if(u && DEFAULT_MANAGERS.includes(u.name) && users.filter(x=>x.role==='manager').length<=1){
    alert("ต้องมี Manager เหลืออย่างน้อย 1 คนในระบบ");
    return;
  }
  if(!confirm("ลบผู้ใช้งานนี้ใช่หรือไม่?")) return;
  users = users.filter(x=>x.id!==id);
  await saveUsers();
  renderUserList();
  populateSellerSelect();
  toast("ลบผู้ใช้งานแล้ว");
}

function seedData(){
  return [
    {id:"job_xl_3745931",no:1,seller:"แอร์",date:"2026-06-30",quote:"QT6901626",job:"one tp global #XM คอวี oversize (ขึ้นตัวอย่างรอบสอง)",detail:"",type:"ตัวอย่าง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760000000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_8169771",no:2,seller:"แอร์",date:"2026-06-30",quote:"QT6901630",job:"เสื้อคอกลมแพทใหม่ คุณจ๊อบ",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760001000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6331085",no:3,seller:"แอร์",date:"2026-06-30",quote:"QT6901343",job:"SE สินสวัสดิ์",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760002000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_4327506",no:4,seller:"ออย",date:"2026-06-30",quote:"QTN6901483",job:"CIMC",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760003000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6087291",no:7,seller:"ออย",date:"2026-06-30",quote:"QT6901203",job:"BULLS (P07)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760004000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3904703",no:10,seller:"แอร์",date:"2026-05-05",quote:"QT6900714",job:"Rphl",detail:"",type:"ตัวอย่าง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760005000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3343336",no:11,seller:"แอร์",date:"2026-05-05",quote:"QT6900762",job:"Rphl กระเป๋า",detail:"",type:"ตัวอย่าง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760006000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2700988",no:13,seller:"แอร์",date:"2026-05-26",quote:"QT6900919",job:"WONGTAWAN #พิมพ์ซับคละ 6 สี",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760007000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3049246",no:15,seller:"แอร์",date:"2026-06-24",quote:"QT6901581",job:"FA2026",detail:"",type:"ตัวอย่าง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760008000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:true,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_1916707",no:16,seller:"เจ๊อ้อย",date:"2026-06-29",quote:"QT6901452",job:"สหมงคลประกันภัย (สั่งซ้ำ มิย.69)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760009000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3071006",no:17,seller:"อ้อย",date:"2026-06-29",quote:"QT6901573",job:"ซีซั่น ชูส์",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760010000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_4692429",no:18,seller:"ออย",date:"2026-06-29",quote:"QT6901453",job:"ไบโอวาลิส ดำล้วน รุ่นปักBVL แขน",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760011000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_1261100",no:19,seller:"หนึ่ง",date:"2026-06-30",quote:"QTN6901706",job:"ร.ร.กันตทาราราม เสื้อโทเร งบปี69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760012000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3811578",no:20,seller:"หนึ่ง",date:"2026-06-30",quote:"QTN6901708",job:"ร.ร.กันตทาราราม วอร์มขายาว งบปี69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760013000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_3919774",no:21,seller:"หนึ่ง",date:"2026-06-30",quote:"QTN6901715",job:"ร.ร.ปทุมวนาราม โทเรม่วง งบปี69 (เพิ่ม1)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760014000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_1789464",no:22,seller:"หนึ่ง",date:"2026-06-30",quote:"QTN6901716",job:"ร.ร.ปทุมวนาราม ขายาว งบปี69 (เพิ่ม1)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760015000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_8777986",no:23,seller:"หนึ่ง",date:"2026-07-01",quote:"QTN6901717",job:"ร.ร.ปทุมวนาราม ขาสั้น งบปี69 (เพิ่ม1)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760016000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5167534",no:24,seller:"ออย",date:"2026-06-30",quote:"QT6901565",job:"Copacabana",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760017000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_6375813",no:25,seller:"อ้อย",date:"2026-06-30",quote:"QTN6901564",job:"IZUMI",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760018000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_4862509",no:26,seller:"ออย",date:"2026-07-01",quote:"QT6901614",job:"Gaming Dose คอกลม (ทรงปกติ+โอเวอร์ไซส์)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760019000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6136738",no:27,seller:"แอร์",date:"2026-07-01",quote:"QT6901602",job:"Run club",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760020000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5300349",no:28,seller:"อ้อย",date:"2026-07-01",quote:"QTN6901718",job:"รร.หนองน้ำใส",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760021000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6561865",no:29,seller:"ออย",date:"2026-07-01",quote:"QT6901633",job:"EIT NCC",detail:"",type:"ตัวอย่าง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760022000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_1615293",no:30,seller:"อ้อย",date:"2026-07-01",quote:"QT6901632",job:"iwadesign",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760023000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_8748397",no:31,seller:"ออย",date:"2026-07-01",quote:"QTN6901482",job:"ดราก้อนเรดซัน เลือดหมู กรม",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760024000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_7132686",no:32,seller:"แอร์",date:"2026-07-01",quote:"QT6901625",job:"Dyson โปโลคอจีนสีขาว",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760025000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9271636",no:33,seller:"ออย",date:"2026-07-01",quote:"QT6901635",job:"KPS (P48) (สั่งซ้ำ)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760026000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_9414632",no:34,seller:"แอร์",date:"2026-07-01",quote:"QT6901627",job:"Tann Beach Club (รุ่นสีเทา)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760027000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"แอร์",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_7483096",no:35,seller:"แอร์",date:"2026-07-01",quote:"QT6901441",job:"Kincho คินโช เจท ซีอาร์",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760028000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2112537",no:36,seller:"แอร์",date:"2026-07-01",quote:"QT6901435",job:"MEGA RUN #คอกลม (คละสองสี)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760029000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9832183",no:37,seller:"อ้อย",date:"2026-07-01",quote:"QT6901636",job:"POOMJAI",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760030000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_5153408",no:38,seller:"ออย",date:"2026-07-01",quote:"QT6901616",job:"NBT Connext //ข่าวจริงประเทศไทย",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760031000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_8467538",no:39,seller:"เจ๊อ้อย",date:"2026-07-01",quote:"",job:"สหภาพการไฟฟ้า กฟผ.",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760032000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"เจ๊อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2324610",no:41,seller:"อ้อย",date:"2026-07-01",quote:"QT6901446",job:"Health and Happiness",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760033000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_6579794",no:42,seller:"แอมมี่",date:"2026-07-01",quote:"QTN6901721",job:"ร.ร.มัธยมประชานิเวศน์ โทเร (สหกรณ์ รอบ3)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760034000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_1490113",no:43,seller:"แอมมี่",date:"2026-07-01",quote:"QTN6901722",job:"ร.ร.มัธยมประชานิเวศน์ (วอร์ม) สหกรณ์ รอบ3",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760035000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_3522279",no:44,seller:"แอมมี่",date:"2026-07-01",quote:"QTN6901694",job:"วสท. (สั่งซ้ำ)",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760036000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_8779967",no:45,seller:"แอมมี่",date:"2026-07-01",quote:"QTN6901149",job:"ร.ร.สุเหร่าหัวหมากน้อย กีฬาสี (สหกรณ์) สั่งซ้ำ",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760037000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_3389502",no:46,seller:"แอมมี่",date:"2026-07-01",quote:"QTN6901150",job:"ร.ร.สุเหร่าหัวหมากน้อย (วอร์ม) สหกรณ์ (สั่งซ้ำ)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760038000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_1552612",no:47,seller:"แอมมี่",date:"2026-07-01",quote:"QTN6901713",job:"ภัทรภร ๙ (คอกลม)ซับ",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760039000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_3052913",no:48,seller:"แอร์",date:"2026-07-02",quote:"QT6901485",job:"ซีเคที ดิสทิบิวชั่น (ผ้าDrifit)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760040000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3777977",no:49,seller:"อ้อย",date:"2026-07-02",quote:"QT6901234",job:"รร.สุเหร่าศาลาลอย",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760041000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_6997933",no:50,seller:"อ้อย",date:"2026-07-02",quote:"QT6901446",job:"Swisse",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760042000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_7661554",no:51,seller:"หนึ่ง",date:"2026-07-02",quote:"QTN6901724",job:"ร.ร.วัดสระบัว โปโลพิมพ์ซับ งบปี69 รีพีท",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760043000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_7615188",no:52,seller:"หนึ่ง",date:"2026-07-02",quote:"QTN6901725",job:"ร.ร.วัดสระบัว วอร์มขายาว งบปี69 รีพีท",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760044000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_4805340",no:53,seller:"แอร์",date:"2026-07-02",quote:"QTN6901541",job:"VT Markets ironpulse",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760045000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_8794055",no:54,seller:"แอร์",date:"2026-07-02",quote:"QT6901626",job:"one tp global #XM งานจริง",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760046000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9673804",no:55,seller:"ออย",date:"2026-07-02",quote:"QT6901649",job:"รร.คารีอุปถัมถ์",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760047000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_7706056",no:56,seller:"ออย",date:"2026-07-02",quote:"QTN6901728",job:"รร.พร้านิลวัชระ",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760048000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_5532800",no:57,seller:"หนึ่ง",date:"2026-07-02",quote:"QTN6901726",job:"ร.ร.ประชานุกูล โปโลพิมพ์ซับ สีส้ม งบปี69 (เพิ่ม1)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760049000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_3882584",no:58,seller:"หนึ่ง",date:"2026-07-02",quote:"QTN6901727",job:"ร.ร.ประชานุกูล วอร์ม งบปี69 (เพิ่ม1)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760050000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_4699865",no:59,seller:"หนึ่ง",date:"2026-07-02",quote:"QTN6901732",job:"ร.ร.บางนาใน ชุดนอน งบปี69 (เพิ่ม1)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760051000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5591569",no:60,seller:"อ้อย",date:"2026-07-02",quote:"QTN6901731",job:"รร.สุเหร่าทรายกองดิน",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760052000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_1950238",no:61,seller:"ออย",date:"2026-07-02",quote:"QT6901582",job:"บูรพา บีเอ็น (ผ้าdrytoch supersoft)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760053000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9557337",no:62,seller:"ออย",date:"2026-07-02",quote:"QT6901638",job:"EAST BN AUDIT (แจ็คเก็ท)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760054000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5836167",no:63,seller:"หนึ่ง",date:"2026-07-02",quote:"QTN6901733",job:"ร.ร.คันนายาว โปโลขาว เสื้อครูฟรี ปี69 เพิ่ม1",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760055000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_1498167",no:64,seller:"เอ็กซ์",date:"2026-07-02",quote:"QTN6901735",job:"ร.ร.วัดพลมานีย์ โทเร งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760056000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5019049",no:65,seller:"เอ็กซ์",date:"2026-07-02",quote:"QTN6901736",job:"ร.ร.วัดพลมานีย์ (วอร์มขายาว) งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760057000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2134142",no:66,seller:"เอ็กซ์",date:"2026-07-02",quote:"QTN6901739",job:"ร.ร.วัดบึงทองหลาง โทเร งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760058000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_4827714",no:67,seller:"เอ็กซ์",date:"2026-07-02",quote:"QTN6901738",job:"ร.ร.วัดบึงทองหลาง วอร์ม งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760059000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3386252",no:68,seller:"เอ็กซ์",date:"2026-07-02",quote:"QTN6901740",job:"ร.ร.วัดบึงทองหลาง อนุบาล (โปโล) งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760060000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_4704056",no:69,seller:"แอร์",date:"2026-07-02",quote:"QT6901420",job:"ศูนย์ดวงตา #รุ่นสีดำล้วน (ปัก 2จุด)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760061000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2780827",no:70,seller:"แอมมี่",date:"2026-07-03",quote:"QT6901143",job:"แหลมทอง (โรงงานแป้ง) เทาอมฟ้า",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760062000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_1374621",no:71,seller:"แอมมี่",date:"2026-07-03",quote:"QT6901600",job:"แหลมทอง (โรงงานอาหารสัตว์) โปโลเทาอมฟ้า",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760063000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2154677",no:72,seller:"แอมมี่",date:"2026-07-03",quote:"QT6901559",job:"แหลมทอง เทาอมฟ้า (พนักงานซื้อเอง)",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760064000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_7031684",no:73,seller:"หนึ่ง",date:"2026-07-03",quote:"QTN6901744",job:"ร.ร.ตำบลขุมทอง เสื้อครูฟรี ปี69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760065000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_9736297",no:74,seller:"แอมมี่",date:"2026-07-03",quote:"QT6901140",job:"แหลมทอง (โรงงานอาหารสัตว์) โปโลเทาอมฟ้า ติดแถบส้ม",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760066000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_5587134",no:75,seller:"แอมมี่",date:"2026-07-03",quote:"QT6901143b",job:"แหลมทอง (โรงงานแป้ง) เทาอมฟ้า รอบ2",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760067000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_8821798",no:76,seller:"อ้อย",date:"2026-07-03",quote:"QTN6901743",job:"รร.จุฬาภรณ์ราชวิทยาลัย (กาฬสินธุ์)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760068000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_6017836",no:77,seller:"อ้อย",date:"2026-07-03",quote:"QT6901647",job:"สยามบุญรอด",detail:"",type:"ตัวอย่าง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760069000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_2187831",no:78,seller:"หนึ่ง",date:"2026-07-03",quote:"QTN6901746",job:"ร.ร.ศาลาคู้ เสื้อโปโลพิมพ์ซับ งบปี69 เพิ่ม2",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760070000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_4604973",no:79,seller:"หนึ่ง",date:"2026-07-03",quote:"QTN6901747",job:"ร.ร.ศาลาคู้ วอร์มขายาว งบปี69 เพิ่ม1",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760071000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5293476",no:80,seller:"เอ็กซ์",date:"2026-07-03",quote:"QTN6901748",job:"ร.ร.วัดอ่างแก้ว เสื้อครู (สนง.เขตภาษีเจริญ)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760072000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_3484911",no:81,seller:"อ้อย",date:"2026-07-03",quote:"QTN6901737",job:"รร.บ้านเขาแก้ว นักเรียน",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760073000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_9783457",no:82,seller:"อ้อย",date:"2026-07-03",quote:"QTN6901734",job:"รร.บ้านเขาแก้ว ครู",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760074000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_7991414",no:83,seller:"ออย",date:"2026-07-03",quote:"QT6901623",job:"Cspm แบบปกทอ รุ่นปักดำไว้อาลัย",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760075000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2618017",no:84,seller:"ออย",date:"2026-07-03",quote:"QTN6901749",job:"Sustainable มูลนิธิโฮป คอกลม 5 สี (รอบสอง)",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760076000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_7100294",no:85,seller:"แอร์",date:"2026-07-03",quote:"QTN6901543",job:"the green view hotel #ไมโครเรียบ ตัวอย่าง",detail:"",type:"ตัวอย่าง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760077000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6781742",no:86,seller:"ออย",date:"2026-07-03",quote:"QTN6901752",job:"รร.ศิริมงคล",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760078000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6771270",no:87,seller:"ออย",date:"2026-07-03",quote:"QTN6901751",job:"xinno",detail:"",type:"ตัวอย่าง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760079000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3687603",no:88,seller:"ออย",date:"2026-07-03",quote:"QT6901656",job:"KKNP (ไมโครเรียบ) #รีพีทกค. 69",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760080000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3561578",no:89,seller:"ออย",date:"2026-07-03",quote:"QT6901422",job:"CIG มุ่งมั่น ระยอง #รีพีทรอบมิย69",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760081000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3698500",no:90,seller:"ออย",date:"2026-07-03",quote:"QT6901421",job:"คอกลม RIS ระยอง #รีพีทรอบมิย69",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760082000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2380706",no:91,seller:"ออย",date:"2026-07-03",quote:"QT6901423",job:"cig no.1 คอจีนมีซิป drifit ระยอง #รีพีทรอบมิย69",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760083000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6420749",no:92,seller:"อ้อย",date:"2026-07-03",quote:"QTN6901753",job:"ศูนย์พัฒนาเด็กเล็กอบต.กำแพง เสื้อ",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760084000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9823661",no:93,seller:"อ้อย",date:"2026-07-03",quote:"QTN6901754",job:"ดาหลา เสื้อโปโลสีดำ เสื้อเปล่า",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760085000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5875792",no:94,seller:"ออย",date:"2026-07-03",quote:"QT6901659",job:"NPK ผ้าdrytech lacoste",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760086000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_4883637",no:95,seller:"อ้อย",date:"2026-07-03",quote:"QTN6901750",job:"รร.สามัคคีธรรมวิทยา",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760087000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6457279",no:96,seller:"หนึ่ง",date:"2026-07-04",quote:"QTN6901729",job:"ร.ร.คลองสาม โปโลส้ม สหกรณ์ ปี69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760088000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:true,by:"",at:0},received:{done:true,by:"",at:0}}},
    {id:"job_xl_9679403",no:97,seller:"หนึ่ง",date:"2026-07-04",quote:"QTN6901730",job:"ร.ร.คลองสาม วอร์ม สหกรณ์ ปี69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760089000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"หนึ่ง",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5604061",no:98,seller:"เอ็กซ์",date:"2026-07-04",quote:"QTN6901757",job:"ร.ร.วัดอ่างแก้ว (อนุบาล) โปโลชมพู งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760090000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_2159888",no:99,seller:"เอ็กซ์",date:"2026-07-04",quote:"QTN6901756",job:"ร.ร.วัดอ่างแก้ว (ประถม-มัธยม) โปโลน้ำเงิน งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760091000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9395779",no:100,seller:"เอ็กซ์",date:"2026-07-04",quote:"QTN6901755",job:"ร.ร.วัดอ่างแก้ว (วอร์ม) งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760092000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"กุ๊ก",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_4864953",no:101,seller:"อ้อย",date:"2026-07-04",quote:"QTN6901758",job:"THAI REEFER",detail:"",type:"งานจริง",customerType:"สหวัฒน์ใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760093000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:true,by:"",at:0},printed:{done:true,by:"อ้อย",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_3598681",no:102,seller:"หนึ่ง",date:"2026-07-04",quote:"QTN6901761",job:"ร.ร.สุเหร่าเกาะขุนเณร โปโล งบปี69 เพิ่ม1",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760094000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9364465",no:103,seller:"หนึ่ง",date:"2026-07-04",quote:"QTN6901762",job:"ร.ร.สุเหร่าเกาะขุนเณร วอร์ม งบปี69 เพิ่ม1",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760095000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_8514760",no:104,seller:"เอ็กซ์",date:"2026-07-04",quote:"QTN6901759",job:"ร.ร.มัธยมสุวิทย์เสรีอนุสรณ์ (โทเร) งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760096000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9306134",no:105,seller:"เอ็กซ์",date:"2026-07-04",quote:"QTN6901760",job:"ร.ร.มัธยมสุวิทย์เสรีอนุสรณ์ (วอร์ม) งบ69",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760097000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_5783710",no:106,seller:"หนึ่ง",date:"2026-07-04",quote:"QTN6901763",job:"ร.ร.ราษฎร์บูรณะ โปโลพิมพ์ซับ งบปี69 เพิ่ม1",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760098000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_4649997",no:107,seller:"หนึ่ง",date:"2026-07-04",quote:"QTN6901764",job:"ร.ร.ราษฎร์บูรณะ วอร์มขายาว งบปี69 เพิ่ม1",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760099000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_1988462",no:108,seller:"หนึ่ง",date:"2026-07-04",quote:"QTN6901765",job:"ร.ร.ราษฎร์บูรณะ โปโลพิมพ์ซับ (ครูจ่ายเอง)",detail:"",type:"งานจริง",customerType:"งานงบ รร.",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760100000,stages:{summary:{done:true,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9341606",no:109,seller:"แอร์",date:"2026-07-06",quote:"QT6901657",job:"BHJ #รีพีทรอบกค69",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:null,countInSales:true,createdAt:1751760101000,stages:{summary:{done:true,by:"",at:0},order:{done:true,by:"เชน",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_4566312",no:110,seller:"ออย",date:"2026-07-02",quote:"QT6901582b",job:"บูรพา บีเอ็น ซ้ำ",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760102000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6514198",no:111,seller:"ออย",date:"2026-07-02",quote:"QT6901638b",job:"EAST BN AUDIT ซ้ำ",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760103000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_9368320",no:112,seller:"ออย",date:"2026-07-01",quote:"QT6901382",job:"RMI",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760104000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
    {id:"job_xl_6378319",no:113,seller:"ออย",date:"2026-07-06",quote:"QT6901653",job:"kio",detail:"",type:"งานจริง",customerType:"เวปใหม่",salesAmount:0,qty:0,status:"",emailSent:false,countInSales:true,createdAt:1751760105000,stages:{summary:{done:false,by:"",at:0},order:{done:false,by:"",at:0},checked:{done:false,by:"",at:0},printed:{done:false,by:"",at:0},marked:{done:false,by:"",at:0},received:{done:false,by:"",at:0}}},
  ];
}

// ===== ชนิดสินค้าที่สั่ง (dynamic rows) =====
function renderProductRows(items){
  const box = $("f_productRows");
  if(!box) return;
  box.innerHTML = "";
  const rows = (items && items.length) ? items : [{type:"", qty:""}];
  rows.forEach((item,i)=>{ box.appendChild(createProductRow(item.type, item.qty, i)); });
  recalcTotalQty();
}

function createProductRow(typeVal, qtyVal, idx){
  const row = document.createElement('div');
  row.className = 'product-row';
  const opts = PRODUCT_TYPES.map(t=>`<option value="${t}" ${t===typeVal?'selected':''}>${t}</option>`).join('');
  row.innerHTML = `
    <select class="prod-type"><option value="">— เลือกชนิดสินค้า —</option>${opts}</select>
    <input type="number" class="prod-qty" placeholder="จำนวน" min="0" value="${qtyVal||''}">
    <button type="button" class="rm-btn" title="ลบรายการนี้">✕</button>
  `;
  row.querySelector('.rm-btn').onclick = ()=>{
    const rows = $("f_productRows").querySelectorAll('.product-row');
    if(rows.length <= 1){ row.querySelector('.prod-type').value=''; row.querySelector('.prod-qty').value=''; recalcTotalQty(); return; }
    row.remove();
    recalcTotalQty();
  };
  row.querySelector('.prod-qty').oninput = recalcTotalQty;
  return row;
}

function addProductRow(){
  const box = $("f_productRows");
  if(!box) return;
  if(box.querySelectorAll('.product-row').length >= 10){ toast("เพิ่มได้สูงสุด 10 รายการ"); return; }
  box.appendChild(createProductRow("","",box.querySelectorAll('.product-row').length));
  recalcTotalQty();
}

function recalcTotalQty(){
  const box = $("f_productRows");
  if(!box) return;
  const total = [...box.querySelectorAll('.prod-qty')].reduce((s,inp)=>s+(parseInt(inp.value)||0),0);
  const qtyField = $("f_qty");
  if(qtyField) qtyField.value = total || "";
}

function getProductItems(){
  const box = $("f_productRows");
  if(!box) return [];
  return [...box.querySelectorAll('.product-row')].map(row=>({
    type: row.querySelector('.prod-type').value,
    qty: parseInt(row.querySelector('.prod-qty').value)||0
  })).filter(item=>item.type || item.qty);
}

function populateSellerSelect(){
  const cur = $("f_seller").value;
  const sellers = getSellerNames();
  $("f_seller").innerHTML = sellers.map(s=>`<option value="${s}">${s}</option>`).join("");
  if(cur && sellers.includes(cur)) $("f_seller").value = cur;
  // populate manager dropdown
  const mgrs = users.filter(u=>u.role==='manager'&&u.active!==false).map(u=>u.name);
  const mgrList = mgrs.length ? mgrs : DEFAULT_MANAGERS;
  const mgrEl = $("f_manager");
  if(mgrEl){
    const curMgr = mgrEl.value;
    mgrEl.innerHTML = mgrList.map(m=>`<option value="${m}">${m}</option>`).join("");
    if(curMgr && mgrList.includes(curMgr)) mgrEl.value = curMgr;
  }
  // populate toolbar seller filter
  const fsCur = $("filterSeller").value;
  $("filterSeller").innerHTML = `<option value="">ทุกเซลล์</option>` + sellers.map(s=>`<option value="${s}" ${s===fsCur?'selected':''}>${s}</option>`).join("");
  $("f_customerType").innerHTML = CUSTOMER_TYPES.map(c=>`<option value="${c}">${c}</option>`).join("");
  $("l_channel").innerHTML = LEAD_CHANNELS.map(c=>`<option value="${c}">${c}</option>`).join("");
  $("l_province").innerHTML = `<option value="">— เลือกจังหวัด —</option>` + THAI_PROVINCES.map(p=>`<option value="${p}">${p}</option>`).join("");
}

// แสดงชื่อ เซลล์/Manager (ถ้าเหมือนกันแสดงชื่อเดียว)
function sellerDisplay(j){
  const s = j.seller || "";
  const m = j.manager || "";
  if(!m || m === s) return s;
  return `${s}/${m}`;
}

function leadDisplayName(l){
  return l.companyName ? `${l.customerName||'ไม่ระบุชื่อ'} (${l.companyName})` : (l.customerName||'ไม่ระบุชื่อ');
}

// คงไว้เพื่อความเข้ากันได้ย้อนหลัง — ระบบค้นหา Lead ใช้ renderLeadSuggestions แทนแล้ว
function populateJobLeadSelect(){ /* no-op: ใช้ autocomplete ใน f_leadSearch แทน select เดิม */ }

// ===== ระบบค้นหา/เลือก Lead แบบพิมพ์ค้นหา (autocomplete) =====
function setLeadField(leadId){
  const sel = $("f_leadId");
  const box = $("f_leadSearch");
  if(!sel || !box) return;
  if(leadId){
    const l = leads.find(x=>x.id===leadId);
    sel.value = leadId;
    box.value = l ? leadDisplayName(l) : "";
    $("f_leadClearBtn").classList.add('show');
  }else{
    sel.value = "";
    box.value = "";
    $("f_leadClearBtn").classList.remove('show');
  }
  closeLeadSuggest();
}
function closeLeadSuggest(){
  const box = $("leadSuggestBox");
  if(box){ box.classList.remove('open'); box.innerHTML = ""; }
}
// ข้อ 9: Lead ใช้ได้เฉพาะลูกค้าประเภทเหล่านี้
const LEAD_ALLOWED_CUSTOMER_TYPES = ["เวปใหม่","เวปใหม่ (แอดมิน)","สหวัฒน์ใหม่"];

function renderLeadSuggestions(query, showAll=false){
  const box = $("leadSuggestBox");
  if(!box) return;
  const q = (query||"").trim().toLowerCase();
  // ข้อ 8: trigger ที่ 3 ตัวอักษร หรือ show all เมื่อ focus
  if(!showAll && q.length < 2){ closeLeadSuggest(); return; }
  const allSorted = leads.slice().sort((a,b)=>(a.customerName||"").localeCompare(b.companyName||a.customerName||"","th"));
  const matches = showAll && !q
    ? allSorted
    : allSorted.filter(l=>{
        const hay = `${l.customerName||''} ${l.companyName||''} ${l.lineOrFb||''}`.toLowerCase();
        return hay.includes(q);
      });
  if(!matches.length){
    box.innerHTML = `<div class="lead-suggest-empty">ไม่พบ Lead ที่ตรงกับ "${escapeHtml(query)}"</div>`;
    box.classList.add('open');
    return;
  }
  box.innerHTML = (showAll && !q ? `<div class="lead-suggest-item" style="color:var(--ink-soft);font-size:11.5px;cursor:default;background:#F7F2E6;">รายการ Lead ทั้งหมด (${matches.length} รายการ) — เรียงตามตัวอักษร</div>` : "") +
    matches.slice(0,30).map(l=>`
    <div class="lead-suggest-item" data-pick="${l.id}">
      <div class="lname">${escapeHtml(l.customerName||'ไม่ระบุชื่อ')}</div>
      <div class="lmeta">${escapeHtml(l.companyName||'-')} · ${escapeHtml(l.channel||'-')}${l.lineOrFb ? ' · '+escapeHtml(l.lineOrFb) : ''}${l.province ? ' · '+escapeHtml(l.province) : ''}</div>
    </div>
  `).join("");
  box.classList.add('open');
  box.querySelectorAll('[data-pick]').forEach(item=>{
    item.onmousedown = (e)=>{ e.preventDefault(); setLeadField(item.dataset.pick); };
  });
}

// --- Lead modal open/close/save ---
function openLeadModal(id){
  editingLeadId = id || null;
  $("leadModalTitle").textContent = id ? "แก้ไข Lead" : "เพิ่ม Lead ใหม่";
  if(id){
    const l = leads.find(x=>x.id===id);
    $("l_customerName").value = l.customerName||"";
    $("l_companyName").value = l.companyName||"";
    $("l_lineOrFb").value = l.lineOrFb||"";
    $("l_channel").value = l.channel || LEAD_CHANNELS[0];
    if($("l_contactChannel")) $("l_contactChannel").value = l.contactChannel || "";
    $("l_team").value = l.team || "ทีม Admin ไลน์ official";
    $("l_contactDate").value = l.contactDate || "";
    $("l_contactTime").value = l.contactTime || "";
    $("l_province").value = l.province || "";
    $("l_clientType").value = l.clientType || "";
    $("l_address").value = l.address||"";
    $("l_taxId").value = l.taxId||"";
    $("l_phone1").value = (l.phones&&l.phones[0])||"";
    $("l_phone2").value = (l.phones&&l.phones[1])||"";
    $("l_phone3").value = (l.phones&&l.phones[2])||"";
    $("l_phone4").value = (l.phones&&l.phones[3])||"";
    $("l_shipMode").value = l.shipMode || "company";
    $("l_shipAddress").value = l.shipAddress||"";
    $("l_billMode").value = l.billMode || "company";
    $("l_billAddress").value = l.billAddress||"";
  }else{
    ["l_customerName","l_companyName","l_lineOrFb","l_address","l_taxId","l_phone1","l_phone2","l_phone3","l_phone4","l_shipAddress","l_billAddress"].forEach(id=>{ $(id).value=""; });
    $("l_channel").value = LEAD_CHANNELS[0];
    if($("l_contactChannel")) $("l_contactChannel").value = "";
    $("l_team").value = "ทีม Admin ไลน์ official";
    const now = new Date();
    $("l_contactDate").value = now.toISOString().slice(0,10);
    $("l_contactTime").value = now.toTimeString().slice(0,5);
    $("l_province").value = "";
    $("l_clientType").value = "";
    $("l_shipMode").value = "company";
    $("l_billMode").value = "company";
  }
  $("leadModalOverlay").classList.add("open");
}
function closeLeadModal(){
  $("leadModalOverlay").classList.remove("open");
  editingLeadId = null;
}

async function saveLeadFromModal(){
  const customerName = $("l_customerName").value.trim();
  if(!customerName){ alert("กรุณากรอกชื่อลูกค้า"); return; }
  const common = {
    customerName,
    companyName: $("l_companyName").value.trim(),
    lineOrFb: $("l_lineOrFb").value.trim(),
    channel: $("l_channel").value,
    contactChannel: $("l_contactChannel") ? $("l_contactChannel").value : "",
    team: $("l_team").value,
    contactDate: $("l_contactDate").value,
    contactTime: $("l_contactTime").value,
    province: $("l_province").value,
    clientType: $("l_clientType").value,
    address: $("l_address").value.trim(),
    taxId: $("l_taxId").value.trim(),
    phones: [$("l_phone1").value.trim(), $("l_phone2").value.trim(), $("l_phone3").value.trim(), $("l_phone4").value.trim()],
    shipMode: $("l_shipMode").value,
    shipAddress: $("l_shipAddress").value.trim(),
    billMode: $("l_billMode").value,
    billAddress: $("l_billAddress").value.trim(),
  };
  if(editingLeadId){
    const l = leads.find(x=>x.id===editingLeadId);
    Object.assign(l, common);
  }else{
    leads.push({
      id: "lead_"+Date.now()+"_"+Math.floor(Math.random()*1000),
      no: leads.length ? Math.max(...leads.map(l=>l.no||0))+1 : 1,
      ...common,
      createdAt: Date.now()
    });
  }
  await saveLeads();
  closeLeadModal();
  if(currentView==='leads') renderList();
  toast("บันทึก Lead แล้ว");
}

async function deleteLead(id){
  if(!confirm("ลบ Lead นี้ใช่หรือไม่?")) return;
  leads = leads.filter(l=>l.id!==id);
  await saveLeads();
  if(currentView==='leads') renderList();
  toast("ลบ Lead แล้ว");
}

// ข้อ: Lead ที่มีงาน/ออเดอร์อ้างอิงมา ถือว่า "สำเร็จ"
function leadHasOrder(leadId){
  return jobs.some(j=>j.leadId===leadId);
}
function leadAddressResolved(l, kind){
  // kind: 'ship' | 'bill'
  const mode = kind==='ship' ? l.shipMode : l.billMode;
  const custom = kind==='ship' ? l.shipAddress : l.billAddress;
  if(mode==='new' && custom) return custom;
  return l.address || '-';
}

function leadPeriodKeyOf(l){
  const d = new Date(l.createdAt);
  const y = d.getFullYear();
  if(leadPeriod==='year') return String(y);
  if(leadPeriod==='quarter') return `Q${Math.floor(d.getMonth()/3)+1}/${y}`;
  if(leadPeriod==='day') return d.toLocaleDateString("th-TH",{day:"2-digit",month:"2-digit",year:"2-digit"});
  return `${String(d.getMonth()+1).padStart(2,"0")}/${y}`;
}

// ข้อ 2: Geographic summary + success/fail breakdown
function renderLeadGeoSection(){
  if(!leads.length) return '';

  // สรุปตามจังหวัด
  const provMap = {};
  leads.forEach(l=>{
    const p = l.province || 'ไม่ระบุ';
    if(!provMap[p]) provMap[p] = {total:0, success:0};
    provMap[p].total++;
    if(leadHasOrder(l.id)) provMap[p].success++;
  });
  const provKeys = Object.keys(provMap).sort((a,b)=>provMap[b].total-provMap[a].total);

  // สรุปตามประเภทลูกค้า + success/fail
  const CLIENT_TYPES = ["บริษัทเอกชน","โรงเรียน","บุคคล","มูลนิธิ","องค์กรรัฐ","อื่นๆ","ไม่ระบุ"];
  const ctMap = {};
  leads.forEach(l=>{
    const c = l.clientType || 'ไม่ระบุ';
    if(!ctMap[c]) ctMap[c] = {total:0, success:0, fail:0};
    ctMap[c].total++;
    if(leadHasOrder(l.id)) ctMap[c].success++; else ctMap[c].fail++;
  });

  // กราฟแท่ง Geographic (Top 10 จังหวัด)
  const topProv = provKeys.slice(0,10);
  const maxP = Math.max(1,...topProv.map(k=>provMap[k].total));
  const barW=42,gap=16,chartH=180;
  const svgW = Math.max(380, topProv.length*(barW+gap)+gap);
  const geoBars = topProv.map((k,i)=>{
    const hTotal = Math.round((provMap[k].total/maxP)*(chartH-36));
    const hSuccess = Math.round((provMap[k].success/maxP)*(chartH-36));
    const x = gap+i*(barW+gap), yT = chartH-hTotal-22, yS = chartH-hSuccess-22;
    return `
      <rect x="${x}" y="${yT}" width="${barW}" height="${hTotal}" rx="3" fill="#C9D4A0"></rect>
      <rect x="${x}" y="${yS}" width="${barW}" height="${hSuccess}" rx="3" fill="var(--olive)"></rect>
      <text x="${x+barW/2}" y="${chartH-6}" font-size="9.5" text-anchor="middle" fill="#6B6256" font-family="Sarabun">${escapeHtml(k.length>6?k.slice(0,5)+'…':k)}</text>
      <text x="${x+barW/2}" y="${yT-4}" font-size="9" text-anchor="middle" fill="#2B2520" font-family="Kanit">${provMap[k].total}</text>
    `;
  }).join('');

  const geoRows = provKeys.map(k=>{
    const r = Math.round(provMap[k].success/provMap[k].total*1000)/10;
    return `<tr><td>${escapeHtml(k)}</td><td>${provMap[k].total}</td><td>${provMap[k].success}</td><td>${provMap[k].total-provMap[k].success}</td><td>${r}%</td></tr>`;
  }).join('');

  const ctRows = Object.keys(ctMap).sort((a,b)=>ctMap[b].total-ctMap[a].total).map(k=>{
    const r = Math.round(ctMap[k].success/ctMap[k].total*1000)/10;
    return `<tr><td>${escapeHtml(k)}</td><td>${ctMap[k].total}</td><td style="color:var(--khaki-green);font-weight:600;">${ctMap[k].success}</td><td style="color:var(--stamp-red);">${ctMap[k].fail}</td><td>${r}%</td></tr>`;
  }).join('');

  return `
    <div class="summary-panel">
      <h3>🗺 Geographic — จำนวน Lead แยกตามจังหวัด (Top ${topProv.length})</h3>
      <div style="display:flex;gap:14px;font-size:11.5px;margin-bottom:8px;">
        <span><span style="display:inline-block;width:12px;height:12px;background:#C9D4A0;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Lead ทั้งหมด</span>
        <span><span style="display:inline-block;width:12px;height:12px;background:var(--olive);border-radius:2px;vertical-align:middle;margin-right:4px;"></span>สำเร็จ (มีออเดอร์)</span>
      </div>
      <div class="chart-wrap"><svg width="${svgW}" height="${chartH+10}" viewBox="0 0 ${svgW} ${chartH+10}">${geoBars}</svg></div>
      <table class="rep-table" style="margin-top:12px;">
        <thead><tr><th>จังหวัด</th><th>Lead ทั้งหมด</th><th>สำเร็จ</th><th>ไม่สำเร็จ</th><th>%สำเร็จ</th></tr></thead>
        <tbody>${geoRows || '<tr><td colspan="5" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูลจังหวัด</td></tr>'}</tbody>
      </table>
    </div>
    <div class="summary-panel">
      <h3>📊 สรุป Lead แยกตามประเภทลูกค้า — สำเร็จ vs ไม่สำเร็จ</h3>
      <table class="rep-table">
        <thead><tr><th>ประเภทลูกค้า</th><th>Lead ทั้งหมด</th><th>สำเร็จ ✓</th><th>ไม่สำเร็จ ✗</th><th>%สำเร็จ</th></tr></thead>
        <tbody>${ctRows || '<tr><td colspan="5" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

function renderLeadsView(){
  // ข้อ 11: date range filter สำหรับ Lead
  const leadDateFrom = $("leadDateFrom") ? $("leadDateFrom").value : (window._leadDateFrom||"");
  const leadDateTo   = $("leadDateTo")   ? $("leadDateTo").value   : (window._leadDateTo||"");

  let filteredLeads = leads;
  if(leadDateFrom || leadDateTo){
    filteredLeads = leads.filter(l=>{
      const d = l.contactDate || new Date(l.createdAt).toISOString().slice(0,10);
      if(leadDateFrom && d < leadDateFrom) return false;
      if(leadDateTo   && d > leadDateTo)   return false;
      return true;
    });
  }

  const total = filteredLeads.length;
  const success = filteredLeads.filter(l=>leadHasOrder(l.id)).length;
  const rate = total ? Math.round(success/total*1000)/10 : 0;

  // จัดกลุ่มตามช่วงเวลาที่เลือก
  const groups = {};
  filteredLeads.forEach(l=>{
    const k = leadPeriodKeyOf(l);
    if(!groups[k]) groups[k] = {total:0, success:0};
    groups[k].total += 1;
    if(leadHasOrder(l.id)) groups[k].success += 1;
  });
  const keys = Object.keys(groups).sort((a,b)=>a.localeCompare(b));
  const maxTotal = Math.max(1, ...keys.map(k=>groups[k].total));
  const barW = 46, gap = 22, chartH = 200;
  const svgW = Math.max(400, keys.length*(barW+gap)+gap);
  const bars = keys.map((k,i)=>{
    const h = Math.round((groups[k].total/maxTotal) * (chartH-40));
    const hs = Math.round((groups[k].success/maxTotal) * (chartH-40));
    const x = gap + i*(barW+gap);
    const y = chartH - h - 24;
    const ys = chartH - hs - 24;
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="#C9D4A0"></rect>
      <rect x="${x}" y="${ys}" width="${barW}" height="${hs}" rx="4" fill="var(--olive)"></rect>
      <text x="${x+barW/2}" y="${chartH-8}" font-size="10" text-anchor="middle" fill="#6B6256" font-family="Sarabun">${escapeHtml(k)}</text>
      <text x="${x+barW/2}" y="${y-6}" font-size="10" text-anchor="middle" fill="#2B2520" font-family="Kanit" font-weight="700">${groups[k].total}</text>
    `;
  }).join("");

  const rows = keys.map(k=>{
    const g = groups[k];
    const r = g.total ? Math.round(g.success/g.total*1000)/10 : 0;
    return `<tr><td>${escapeHtml(k)}</td><td>${g.total}</td><td>${g.success}</td><td>${r}%</td></tr>`;
  }).join("");

  const leadRows = filteredLeads.slice().sort((a,b)=>b.createdAt-a.createdAt).map(l=>{
    const won = leadHasOrder(l.id);
    const teamColor = l.team==='ทีม Admin ไลน์ official' ? 'background:#DCEEF5;color:#1B4F7A;' : 'background:#E4EAC9;color:var(--olive-dark);';
    return `
      <tr>
        <td>${l.no}</td>
        <td>${escapeHtml(l.customerName)}</td>
        <td>${l.clientType ? `<span class="badge-type" style="background:#EEE6F5;color:#5B2C8A;">${escapeHtml(l.clientType)}</span>` : '-'}</td>
        <td>${escapeHtml(l.companyName||'-')}</td>
        <td>${escapeHtml(l.province||'-')}</td>
        <td><span class="badge-type" style="${teamColor}">${escapeHtml(l.team||'-')}</span></td>
        <td><span class="badge-type" style="background:#E4EAC9;color:var(--olive-dark);">${escapeHtml(l.channel||'-')}</span></td>
        <td>${escapeHtml(l.lineOrFb||'-')}</td>
        <td>${(l.phones||[]).filter(Boolean).join(", ")||'-'}</td>
        <td class="date-cell">${l.contactDate ? formatDate(l.contactDate)+(l.contactTime?' '+l.contactTime:'') : formatDate(new Date(l.createdAt).toISOString().slice(0,10))}</td>
        <td>${escapeHtml(l.province||'-')}</td>
        <td>${won ? '<span class="email-pill sent">✓ สำเร็จ (มีออเดอร์)</span>' : '<span class="email-pill unsent" style="animation:none;">ยังไม่มีออเดอร์</span>'}</td>
        <td>
          <button class="row-del-btn" data-leadedit="${l.id}" title="แก้ไข">✎</button>
          <button class="row-del-btn" data-leaddel="${l.id}" title="ลบ">🗑</button>
        </td>
      </tr>`;
  }).join("");


  // ข้อ 12: สรุป Lead ประจำวัน
  const dailyMap = {};
  filteredLeads.forEach(l=>{
    const d = l.contactDate || new Date(l.createdAt).toISOString().slice(0,10);
    if(!dailyMap[d]) dailyMap[d] = {total:0, success:0};
    dailyMap[d].total++;
    if(leadHasOrder(l.id)) dailyMap[d].success++;
  });
  const dailyKeys = Object.keys(dailyMap).sort((a,b)=>b.localeCompare(a));
  const maxDailyCount = Math.max(1,...dailyKeys.map(k=>dailyMap[k].total));
  const dailyRows = dailyKeys.map(k=>{
    const g = dailyMap[k];
    return `<tr><td>${formatDate(k)}</td><td>${g.total}</td><td style="color:var(--khaki-green);font-weight:600;">${g.success}</td><td style="color:var(--stamp-red);">${g.total-g.success}</td></tr>`;
  }).join("");

  // ข้อ 13: Lead analytics — ช่วงเวลาของวันที่มี Lead เข้ามากที่สุด
  const hourMap = {};
  filteredLeads.forEach(l=>{
    const hr = l.contactTime ? Number(l.contactTime.split(":")[0]) : new Date(l.createdAt).getHours();
    if(!hourMap[hr]) hourMap[hr] = {total:0, success:0};
    hourMap[hr].total++;
    if(leadHasOrder(l.id)) hourMap[hr].success++;
  });
  const hourKeys = Array.from({length:24},(_,i)=>i).filter(h=>hourMap[h]);
  const hourRows = hourKeys.sort((a,b)=>hourMap[b].total-hourMap[a].total).map((h,i)=>{
    const g = hourMap[h];
    const r = g.total ? Math.round(g.success/g.total*1000)/10 : 0;
    return `<tr><td>${String(h).padStart(2,"0")}:00-${String(h+1).padStart(2,"0")}:00</td><td>${g.total}</td><td style="color:var(--khaki-green);">${g.success}</td><td>${r}%</td></tr>`;
  }).join("");

  // สรุปตามเดือน × ความสำเร็จ
  const mSuccessMap = {};
  filteredLeads.forEach(l=>{
    const d = l.contactDate || new Date(l.createdAt).toISOString().slice(0,10);
    const mk = d.slice(0,7);
    if(!mSuccessMap[mk]) mSuccessMap[mk]={total:0,success:0};
    mSuccessMap[mk].total++;
    if(leadHasOrder(l.id)) mSuccessMap[mk].success++;
  });
  const mSuccessRows = Object.keys(mSuccessMap).sort((a,b)=>b.localeCompare(a)).map(k=>{
    const g = mSuccessMap[k];
    const r = g.total ? Math.round(g.success/g.total*1000)/10 : 0;
    const [y,m] = k.split("-");
    const label = `${TH_MONTH_ABBR[Number(m)-1]} ${Number(y)+543}`;
    return `<tr><td>${label}</td><td>${g.total}</td><td style="color:var(--khaki-green);font-weight:600;">${g.success}</td><td style="color:var(--stamp-red);">${g.total-g.success}</td><td>${r}%</td></tr>`;
  }).join("");

  // สรุปตามชนิดสินค้า Lead (จากงานที่เชื่อมอยู่)
  const prodSuccessMap = {};
  filteredLeads.forEach(l=>{
    const linked = jobs.filter(j=>j.leadId===l.id);
    if(linked.length){
      linked.forEach(j=>{
        (j.productItems||[]).forEach(p=>{
          if(!p.type) return;
          if(!prodSuccessMap[p.type]) prodSuccessMap[p.type]={qty:0, jobs:0};
          prodSuccessMap[p.type].qty += Number(p.qty)||0;
          prodSuccessMap[p.type].jobs++;
        });
      });
    }
  });
  const prodRows = Object.keys(prodSuccessMap).sort((a,b)=>prodSuccessMap[b].qty-prodSuccessMap[a].qty).map(k=>{
    const g = prodSuccessMap[k];
    return `<tr><td>${escapeHtml(k)}</td><td>${g.jobs}</td><td>${g.qty.toLocaleString()} ตัว</td></tr>`;
  }).join("");

  const leadDateFromVal = leadDateFrom||"";
  const leadDateToVal   = leadDateTo||"";

  return `
    <div class="summary-controls" style="flex-wrap:wrap;gap:10px;">
      <select class="filt" id="leadPeriodSel">
        <option value="day" ${leadPeriod==='day'?'selected':''}>รายวัน</option>
        <option value="month" ${leadPeriod==='month'?'selected':''}>รายเดือน</option>
        <option value="quarter" ${leadPeriod==='quarter'?'selected':''}>รายไตรมาส</option>
        <option value="year" ${leadPeriod==='year'?'selected':''}>รายปี</option>
      </select>
      <div style="display:flex;gap:6px;align-items:center;">
        <input type="date" id="leadDateFrom" class="filt" style="width:130px;" value="${leadDateFromVal}" placeholder="ตั้งแต่วันที่">
        <span style="color:var(--ink-soft);font-size:12px;">ถึง</span>
        <input type="date" id="leadDateTo" class="filt" style="width:130px;" value="${leadDateToVal}">
        ${leadDateFrom||leadDateTo ? `<button class="btn ghost" id="clearLeadDateFilter" style="padding:5px 9px;font-size:12px;">✕</button>` : ""}
      </div>
      ${leadDateFrom||leadDateTo ? `<span style="font-size:12px;color:var(--olive);align-self:center;">📅 กำลังกรอง ${filteredLeads.length} จาก ${leads.length} Lead</span>` : ""}
    </div>
    <div class="summary-row">
      <div class="summary-box"><div class="num">${total}</div><div class="lbl">Lead ทั้งหมด</div></div>
      <div class="summary-box"><div class="num" style="color:var(--khaki-green)">${success}</div><div class="lbl">Lead สำเร็จ (มีออเดอร์)</div></div>
      <div class="summary-box"><div class="num" style="color:var(--olive)">${rate}%</div><div class="lbl">% ความสำเร็จ</div></div>
    </div>
    <div class="summary-panel">
      <h3>กราฟจำนวน Lead (เข้ม = สำเร็จ)</h3>
      <div class="chart-wrap">
        <svg width="${svgW}" height="${chartH+10}" viewBox="0 0 ${svgW} ${chartH+10}">${bars}</svg>
      </div>
    </div>
    <div class="summary-panel">
      <h3>ตารางสรุปตามช่วงเวลา</h3>
      <table class="rep-table">
        <thead><tr><th>ช่วงเวลา</th><th>จำนวน Lead</th><th>สำเร็จ</th><th>% ความสำเร็จ</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล</td></tr>'}</tbody>
      </table>
    </div>
    <div class="summary-panel">
      <h3>📅 สรุป Lead ประจำวัน (ข้อ 12)</h3>
      <table class="rep-table">
        <thead><tr><th>วันที่</th><th>Lead เข้า</th><th>สำเร็จ</th><th>ยังไม่สำเร็จ</th></tr></thead>
        <tbody>${dailyRows || '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล</td></tr>'}</tbody>
      </table>
    </div>
    <div class="summary-panel">
      <h3>🕐 ช่วงเวลาของวันที่ Lead เข้ามาก (ข้อ 13)</h3>
      <table class="rep-table">
        <thead><tr><th>ช่วงเวลา</th><th>Lead เข้า</th><th>สำเร็จ</th><th>%สำเร็จ</th></tr></thead>
        <tbody>${hourRows || '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูลเวลา</td></tr>'}</tbody>
      </table>
    </div>
    <div class="summary-panel">
      <h3>📆 ความสำเร็จตามเดือนที่ Lead เข้า (ข้อ 13)</h3>
      <table class="rep-table">
        <thead><tr><th>เดือน</th><th>Lead ทั้งหมด</th><th>สำเร็จ</th><th>ไม่สำเร็จ</th><th>%สำเร็จ</th></tr></thead>
        <tbody>${mSuccessRows || '<tr><td colspan="5" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล</td></tr>'}</tbody>
      </table>
    </div>
    ${prodRows ? `<div class="summary-panel">
      <h3>👕 ชนิดสินค้าที่ Lead สั่ง (จากงานที่เชื่อมกับ Lead)</h3>
      <table class="rep-table">
        <thead><tr><th>ชนิดสินค้า</th><th>จำนวนงาน</th><th>จำนวนตัวรวม</th></tr></thead>
        <tbody>${prodRows}</tbody>
      </table>
    </div>` : ""}
    ${renderLeadGeoSection()}
    <div class="summary-panel">
      <h3>รายการ Lead ทั้งหมด</h3>
      <div class="table-wrap" style="max-height:60vh;">
        <table class="ov-table">
          <thead><tr>
            <th>#</th><th>ชื่อลูกค้า</th><th>ประเภท</th><th>บริษัท</th><th>จังหวัด</th><th>ฝ่ายรับผิดชอบ</th><th>ช่องทาง</th><th>ไลน์/FB</th><th>เบอร์โทร</th><th>วันที่/เวลาทักมา</th><th>สถานะ</th><th>จัดการ</th>
          </tr></thead>
          <tbody>${leadRows || '<tr><td colspan="12" style="text-align:center;color:var(--ink-soft);padding:20px;">ยังไม่มี Lead — กด "เพิ่ม Lead ใหม่" ด้านบนเพื่อเริ่มต้น</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

function bindLeadEvents(){
  document.querySelectorAll('[data-leadedit]').forEach(b=>{ b.onclick = ()=>openLeadModal(b.dataset.leadedit); });
  document.querySelectorAll('[data-leaddel]').forEach(b=>{ b.onclick = ()=>deleteLead(b.dataset.leaddel); });
  const p = $("leadPeriodSel");
  if(p) p.onchange = ()=>{ leadPeriod = p.value; renderList(); };
  // ข้อ 11: Lead date range filter
  const df = $("leadDateFrom"), dt = $("leadDateTo");
  if(df) df.onchange = ()=>{ window._leadDateFrom = df.value; renderList(); };
  if(dt) dt.onchange = ()=>{ window._leadDateTo = dt.value; renderList(); };
  const clr = $("clearLeadDateFilter");
  if(clr) clr.onclick = ()=>{ window._leadDateFrom=""; window._leadDateTo=""; renderList(); };
}

function stageProgress(j){
  return STAGES.filter(s=>j.stages[s.key] && j.stages[s.key].done).length;
}

function getActiveStage(j){
  for(const s of STAGES){
    if(!j.stages[s.key].done) return s;
  }
  return null;
}

function getStageEnteredAt(j, stageKey){
  const idx = STAGES.findIndex(s=>s.key===stageKey);
  // fallback: ใช้วันที่ของงาน (j.date) แทน j.createdAt เพื่อหลีกเลี่ยงค่า timestamp ผิด
  const jobDateMs = j.date ? new Date(j.date + 'T00:00:00').getTime() : j.createdAt;
  if(idx<=0) return jobDateMs;
  const prevKey = STAGES[idx-1].key;
  const prev = j.stages[prevKey];
  return (prev && prev.done && prev.at) ? prev.at : jobDateMs;
}

function getOverdueInfo(j){
  const active = getActiveStage(j);
  if(!active || !active.overdueHrs) return null;
  const enteredAt = getStageEnteredAt(j, active.key);
  const hours = (Date.now() - enteredAt) / 3600000;
  if(hours >= active.overdueHrs){
    return { stage: active, hours };
  }
  return null;
}

function formatHrs(h){
  if(h < 48) return Math.floor(h) + " ชม.";
  return Math.floor(h/24) + " วัน";
}

function jobStageFilterTag(j){
  if(j.cancelled) return "cancelled";
  const done = stageProgress(j);
  if(done===STAGES.length) return "done";
  if(getOverdueInfo(j)) return "overdue";
  if(done===0) return "pending";
  if(j.stages.order.done && !j.stages.printed.done) return "ordered";
  if(j.stages.printed.done) return "printed";
  return "ordered";
}

function isJobDone(j){
  return stageProgress(j)===STAGES.length;
}

function freshStages(){
  return { summary:{done:false,by:""}, order:{done:false,by:""}, checked:{done:false,by:""}, printed:{done:false,by:""}, marked:{done:false,by:""}, received:{done:false,by:""} };
}

// ข้อ: งาน "ตัวอย่าง" ที่ครบ flow แล้ว ให้ย้ายเข้าสู่ flow "รอออกออเดอร์งานจริง" อัตโนมัติ (รีเซ็ตขั้นตอนใหม่ทั้งหมด)
// งาน "งานจริง" ที่ครบ flow แล้ว ถือว่าจบ ไม่ต้องทำอะไรเพิ่ม
function maybeConvertSampleToReal(job){
  if(job.type !== "ตัวอย่าง") return;
  if(stageProgress(job) !== STAGES.length) return;
  if(job.sampleConverted) return; // กันแปลงซ้ำ
  job.sampleConverted = true;
  job.sampleCompletedAt = Date.now();
  job.type = "งานจริง";
  job.awaitingRealOrder = true; // ใช้แสดงป้าย "รอออกออเดอร์งานจริง"
  job.stages = freshStages();
  // งานจริงที่เพิ่งเกิดจากตัวอย่าง ถือเป็นออเดอร์ใหม่ ต้องเตือนส่งอีเมลออกออเดอร์อีกครั้ง
  job.emailSent = false;
  job.emailReminder = null;
  setTimeout(()=>{
    toast(`🔁 "${job.job||'งาน'}" ตัวอย่างเสร็จสมบูรณ์แล้ว ย้ายเข้าสู่ flow "รอออกออเดอร์งานจริง"`);
    queueEmailReminder(job.id);
  }, 300);
}

// เคลียร์ป้าย "รอออกออเดอร์งานจริง" เมื่องานจริง (ที่มาจากตัวอย่าง) ทำครบ flow ใหม่จนเสร็จสมบูรณ์แล้ว
function maybeClearAwaitingRealOrder(job){
  if(job.awaitingRealOrder && job.type==="งานจริง" && stageProgress(job)===STAGES.length){
    job.awaitingRealOrder = false;
  }
}

function daysUntil(dateStr){
  if(!dateStr) return null;
  const d = new Date(dateStr+"T00:00:00");
  if(isNaN(d)) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((d-today)/86400000);
}

function monthKeyOf(dateStr, fallbackTs){
  let d;
  if(dateStr){ d = new Date(dateStr+"T00:00:00"); }
  if(!dateStr || isNaN(d)){ d = new Date(fallbackTs || Date.now()); }
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
}
function monthLabel(key){
  const [y,m] = key.split("-").map(Number);
  const d = new Date(y, m-1, 1);
  return d.toLocaleDateString("th-TH",{month:"long",year:"numeric"});
}
function currentMonthKey(){ return monthKeyOf(null, Date.now()); }

// ข้อ 7: เดือนเก่าที่ยังไม่เสร็จสมบูรณ์ ย้ายมาอยู่เดือนปัจจุบันอัตโนมัติ
function jobDisplayMonthKey(j){
  const baseKey = monthKeyOf(j.date, j.createdAt);
  const curKey = currentMonthKey();
  if(!isJobDone(j) && baseKey < curKey) return curKey;
  return baseKey;
}
function jobIsCarried(j){
  const baseKey = monthKeyOf(j.date, j.createdAt);
  return !isJobDone(j) && baseKey < currentMonthKey();
}

function formatDate(d){
  if(!d) return "-";
  const dt = new Date(d);
  if(isNaN(dt)) return d;
  return dt.toLocaleDateString("th-TH",{day:"2-digit",month:"2-digit",year:"2-digit"});
}

function render(){
  renderSummary();
  renderAlerts();
  renderList();
}

function renderSummary(){
  const total = jobs.length;
  const done = jobs.filter(j=>stageProgress(j)===STAGES.length).length;
  const overdue = jobs.filter(j=>getOverdueInfo(j)).length;
  const pending = jobs.filter(j=>stageProgress(j)===0 && !getOverdueInfo(j)).length;
  const inProgress = total - done - pending - overdue;
  const emailUnsentJobs = jobs.filter(j=>j.emailSent===false);
  const emailUnsentCount = emailUnsentJobs.length;
  const emailBySeller = {};
  emailUnsentJobs.forEach(j=>{ emailBySeller[j.seller] = (emailBySeller[j.seller]||0) + 1; });
  const emailBreakdownText = Object.keys(emailBySeller).sort((a,b)=>emailBySeller[b]-emailBySeller[a])
    .map(s=>`${s} (${emailBySeller[s]} งาน)`).join(", ");
  const cur = $("filterStage") ? $("filterStage").value : "";
  const act = (v)=> cur===v ? 'active' : '';
  $("summaryRow").innerHTML = `
    <div class="summary-box ${act('')}" data-quickfilter=""><div class="num">${total}</div><div class="lbl">งานทั้งหมด</div></div>
    <div class="summary-box ${overdue?'overdue-box':''} ${act('overdue')}" data-quickfilter="overdue"><div class="num" style="color:var(--stamp-red)">${overdue}</div><div class="lbl">⚠ ค้างเกินกำหนด</div></div>
    <div class="summary-box ${act('pending')}" data-quickfilter="pending"><div class="num" style="color:var(--amber)">${pending}</div><div class="lbl">ยังไม่เริ่ม</div></div>
    <div class="summary-box ${act('inprogress')}" data-quickfilter="inprogress"><div class="num" style="color:#7A6E4E">${inProgress}</div><div class="lbl">กำลังดำเนินการ</div></div>
    <div class="summary-box ${act('done')}" data-quickfilter="done"><div class="num" style="color:var(--khaki-green)">${done}</div><div class="lbl">เสร็จสมบูรณ์</div></div>
    <div class="summary-box ${emailUnsentCount?'overdue-box':''} ${act('emailUnsent')}" data-quickfilter="emailUnsent"><div class="num" style="color:var(--stamp-red)">${emailUnsentCount}</div><div class="lbl">📧 ยังไม่ส่งอีเมลออกออเดอร์</div>${emailUnsentCount ? `<div style="font-size:10.5px;color:var(--ink-soft);margin-top:3px;line-height:1.4;">${emailBreakdownText}</div>` : ''}</div>
  `;
  // ข้อ: คลิกกล่องสถานะ -> กรองรายการการ์ด/ตารางตามสถานะนั้นทันที
  $("summaryRow").querySelectorAll('.summary-box').forEach(box=>{
    box.onclick = ()=>{
      const v = box.dataset.quickfilter;
      $("filterStage").value = v;
      if(currentView==='summary' || currentView==='leads'){
        $("viewCardBtn").click();
      }else{
        renderList();
      }
      renderSummary();
      document.getElementById("jobList").scrollIntoView({behavior:"smooth", block:"start"});
    };
  });
}

// ข้อ 8-9: กล่องเตือนใกล้ถึงกำหนดส่ง / พรุ่งนี้ส่ง (อิงวันที่ส่งงาน)
function renderAlerts(){
  const el = $("alertRow");
  if(currentView==='summary' || currentView==='leads'){ el.innerHTML=''; return; }
  const soon = [], tomorrow = [];
  jobs.forEach(j=>{
    if(isJobDone(j) || !j.deliveryDate) return;
    const d = daysUntil(j.deliveryDate);
    if(d===1) tomorrow.push(j);
    else if(d!==null && d>=2 && d<=4) soon.push(j);
  });
  let html = '';
  if(soon.length){
    html += `<div class="alert-box soon"><div class="at">⏰ ใกล้ถึงกำหนดส่ง (ภายใน 4 วัน) — ${soon.length} งาน</div>
      <ul>${soon.map(j=>`<li>${escapeHtml(j.job||'-')} · ${sellerDisplay(j)} · ส่ง ${formatDate(j.deliveryDate)}</li>`).join("")}</ul></div>`;
  }
  if(tomorrow.length){
    html += `<div class="alert-box tomorrow"><div class="at">🚨 พรุ่งนี้ส่ง — ${tomorrow.length} งาน</div>
      <ul>${tomorrow.map(j=>`<li>${escapeHtml(j.job||'-')} · ${sellerDisplay(j)}</li>`).join("")}</ul></div>`;
  }
  el.innerHTML = html;
}

function getFiltered(){
  const q = $("searchInput").value.trim().toLowerCase();
  const ftype = $("filterType").value;
  const fstage = $("filterStage").value;
  const fseller = $("filterSeller").value;
  const dateFrom = $("filterDateFrom").value;
  const dateTo = $("filterDateTo").value;

  // ── table month/year filter ─────────────────────────────────
  if(currentView==='table' && tableMonthFilter){
    const isYear = /^\d{4}$/.test(tableMonthFilter);
    return jobs.filter(j=>{
      if(!j.date) return false;
      if(isYear) return j.date.startsWith(tableMonthFilter);
      return j.date.startsWith(tableMonthFilter);
    });
  }

  return jobs.filter(j=>{
    if(ftype && j.type!==ftype) return false;
    if(fseller && j.seller!==fseller) return false;
    // date range filter on deliveryDate or job date
    const jDate = j.deliveryDate || j.date || "";
    if(dateFrom && jDate && jDate < dateFrom) return false;
    if(dateTo && jDate && jDate > dateTo) return false;
    if(fstage){
      if(fstage==='emailUnsent'){
        if(j.emailSent !== false) return false;
      }else{
        const tag = jobStageFilterTag(j);
        if(fstage==='inprogress'){
          if(tag!=='ordered' && tag!=='printed') return false;
        }else if(tag!==fstage){
          return false;
        }
      }
    }
    if(q){
      // ข้อ 6: ค้นหาตามชื่อลูกค้า/บริษัทใน Lead ที่อ้างอิง, ชื่องาน, เลขใบเสนอราคา ฯลฯ
      const linkedLead = j.leadId ? leads.find(l=>l.id===j.leadId) : null;
      const leadName = linkedLead ? [linkedLead.customerName, linkedLead.companyName].join(" ") : "";
      const hay = [j.job, j.quote, j.detail, formatDate(j.date), j.date, j.status, j.customerType, leadName].join(" ").toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>{
    return b.createdAt - a.createdAt;
  });
}

// ข้อ 7: จัดกลุ่มออเดอร์เป็นรายเดือน เดือนเก่าที่ยังไม่เสร็จย้ายมาเดือนปัจจุบัน
function groupByMonth(list){
  const groups = {};
  list.forEach(j=>{
    const key = jobDisplayMonthKey(j);
    (groups[key] = groups[key] || []).push(j);
  });
  return Object.keys(groups).sort((a,b)=>b.localeCompare(a)).map(key=>({key, jobs:groups[key]}));
}

function renderList(){
  const el = $("jobList");
  if(currentView === 'summary'){
    el.innerHTML = renderSummaryView();
    requestAnimationFrame(bindSummaryControls);
    return;
  }
  if(currentView === 'expense'){
    el.innerHTML = renderExpenseView();
    return;
  }
  if(currentView === 'leads'){
    el.innerHTML = renderLeadsView();
    bindLeadEvents();
    return;
  }
  const list = getFiltered();
  if(!list.length){
    el.innerHTML = `<div class="empty-state"><div class="stamp-big">ไม่พบ</div>ไม่พบงานที่ตรงกับการค้นหา</div>`;
    return;
  }

  // ข้อ 8: Table view → paginate 20 งาน/หน้า
  if(currentView==='table'){
    // ── สร้าง filter controls ────────────────────────────────
    const allDates = jobs.filter(j=>j.date).map(j=>j.date.slice(0,7)); // YYYY-MM
    const monthSet = [...new Set(allDates)].sort().reverse();
    const yearSet  = [...new Set(allDates.map(d=>d.slice(0,4)))].sort().reverse();
    const mOpts = monthSet.map(m=>{
      const [y,mo] = m.split('-');
      const label = TH_MONTH_SHORT[parseInt(mo)-1]+(parseInt(y)+543);
      return `<option value="${m}" ${tableMonthFilter===m?'selected':''}>${label}</option>`;
    }).join('');
    const yOpts = yearSet.map(y=>
      `<option value="${y}" ${tableMonthFilter===y?'selected':''}>${parseInt(y)+543}</option>`
    ).join('');

    const filterBar = `<div class="summary-controls" style="flex-wrap:wrap;gap:8px;padding:10px 14px;border-bottom:1px solid var(--line);">
      <label style="font-size:12.5px;align-self:center;">📅 กรองตาม:</label>
      <select class="filt" id="tblMonthSel" style="min-width:120px;">
        <option value="" ${!tableMonthFilter?'selected':''}>เดือนนี้ + ค้างเก่า</option>
        ${mOpts}
        <optgroup label="รวมทั้งปี">${yOpts}</optgroup>
      </select>
      ${tableMonthFilter ? `<button class="btn ghost" style="font-size:12px;padding:5px 12px;" onclick="tableMonthFilter=null;renderList();">✕ ล้างตัวกรอง</button>` : ''}
      <span style="font-size:12px;color:var(--ink-soft);align-self:center;">${list.length} งาน</span>
    </div>`;

    const PAGE_SIZE = 20;
    const totalPages = Math.ceil(list.length / PAGE_SIZE);
    if(tablePage >= totalPages) tablePage = Math.max(0,totalPages-1);
    const pageItems = list.slice(tablePage*PAGE_SIZE, (tablePage+1)*PAGE_SIZE);
    const pager = totalPages > 1 ? `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#F7F2E6;border-top:1px solid var(--line);">
        <button id="tblPrev" class="btn ghost" style="padding:5px 14px;" ${tablePage===0?'disabled':''}>← ก่อนหน้า</button>
        <span style="font-size:13px;color:var(--ink-soft);">หน้า ${tablePage+1} / ${totalPages} (${list.length} งาน)</span>
        <button id="tblNext" class="btn ghost" style="padding:5px 14px;" ${tablePage>=totalPages-1?'disabled':''}>ถัดไป →</button>
      </div>` : '';
    el.innerHTML = `${filterBar}
      <div style="overflow-x:auto;max-height:70vh;overflow-y:auto;position:relative;">
        ${renderTableHtml(pageItems)}
      </div>
      ${pager}`;
    bindTicketEvents();
    $('tblPrev')?.addEventListener('click',()=>{ tablePage--; renderList(); });
    $('tblNext')?.addEventListener('click',()=>{ tablePage++; renderList(); });
    $('tblMonthSel')?.addEventListener('change', e=>{
      tableMonthFilter = e.target.value || null;
      tablePage = 0;
      renderList();
    });
    return;
  }

  const groups = groupByMonth(list);
  el.innerHTML = groups.map(g=>{
    const carried = g.jobs.some(j=>jobIsCarried(j));
    const head = `<div class="month-head">🗓 ${monthLabel(g.key)} <span class="mcount">${g.jobs.length} งาน</span>${carried?'<span class="carry-tag">มีงานค้างเดือนก่อนย้ายมา</span>':''}</div>`;
    const body = g.jobs.map(j=>renderTicket(j)).join("");
    return `<div class="month-section">${head}${body}</div>`;
  }).join("");
  bindTicketEvents();
}

function renderTableHtml(list){
  const stageHeaders = STAGES.map(s=>`<th>${s.label}</th>`).join("");
  const rows = list.map(j=>{
    const overdue = getOverdueInfo(j);
    const done = isJobDone(j);
    const stageCells = STAGES.map(s=>{
      const st = j.stages[s.key] || {done:false,by:""};
      if(!st.done){
        return `<td><span class="pchip empty" data-job="${j.id}" data-stage="${s.key}">+ เลือก</span></td>`;
      }
      const c = personColor(st.by);
      return `<td>
        <span class="pchip" data-job="${j.id}" data-stage="${s.key}" style="background:${c.bg};color:${c.text}">${st.by}</span>
        <div class="date-cell">${st.at ? formatDate(new Date(st.at).toISOString().slice(0,10)) : ''}</div>
      </td>`;
    }).join("");
    const sc = personColor(j.seller);
    return `
      <tr class="${overdue ? 'row-overdue' : ''} ${done ? 'row-done' : ''}">
        <td class="sticky-col c1">${getJobDisplayNo(j)}</td>
        <td class="sticky-col c2"><span class="pchip" style="background:${sc.bg};color:${sc.text}">${sellerDisplay(j)}</span></td>
        <td class="sticky-col c3 cell-job">${escapeHtml(j.job||'-')}${done?'<span class="done-pill">✓ เสร็จ</span>':''}${j.awaitingRealOrder?'<span class="awaiting-pill">🔁 รอออกออเดอร์งานจริง</span>':''}${j.emailSent===false ? '<span class="email-pill unsent">⚠ ยังไม่ส่งเมล</span>' : ''}</td>
        <td class="date-cell">${formatDate(j.date)}</td>
        <td>${escapeHtml(j.quote||'-')}</td>
        <td class="cell-detail">${escapeHtml(j.detail||'')}</td>
        <td><span class="badge-type ${j.type}">${j.type}</span></td>
        ${stageCells}
        <td class="cell-status">
          <span class="status-tag" style="background:${sc.bg};color:${sc.text}"><input class="status-input" data-status="${j.id}" value="${escapeAttr(j.status||'')}" style="width:170px;color:${sc.text}"></span>
          ${overdue ? `<div style="color:var(--stamp-red);font-size:11px;margin-top:3px;">⚠ ค้าง ${formatHrs(overdue.hours)}</div>` : ''}
        </td>
        <td>
          <button class="row-del-btn" data-edit="${j.id}" title="แก้ไข">✎</button>
          ${!j.cancelled ? `<button class="row-del-btn" data-cancel="${j.id}" title="ยกเลิก" style="color:var(--stamp-red);">⊘</button>` : `<button class="row-del-btn" data-uncancel="${j.id}" title="ยกเลิกการยกเลิก" style="color:var(--olive);">↩</button>`}
          <button class="row-del-btn" data-del="${j.id}" title="ลบ">🗑</button>
        </td>
      </tr>`;
  }).join("");

  return `
    <div class="table-wrap">
      <table class="ov-table">
        <thead>
          <tr>
            <th class="sticky-col c1">#</th>
            <th class="sticky-col c2">เซลล์</th>
            <th class="sticky-col c3">ชื่องาน</th>
            <th>วันที่</th>
            <th>ใบเสนอราคา</th>
            <th>รายละเอียด</th>
            <th>ประเภท</th>
            ${stageHeaders}
            <th>สถานะอัพเดต</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderTicket(j){
  const stepsHtml = STAGES.map(s=>{
    const st = j.stages[s.key] || {done:false,by:""};
    return `
      <div class="step ${st.done?'done':''}" data-job="${j.id}" data-stage="${s.key}">
        <div class="dot">${st.done?'✓':''}</div>
        <div class="lbl">${s.label}</div>
        ${st.done && st.by ? `<div class="who">${st.by}</div>` : ''}
      </div>
    `;
  }).join("");

  const overdue = getOverdueInfo(j);
  const done = isJobDone(j);
  const overdueBanner = overdue ? `
    <div class="overdue-banner">
      ⚠ ค้างอยู่ที่ "${overdue.stage.label}" มาแล้ว ${formatHrs(overdue.hours)} (เกินกำหนด ${overdue.stage.overdueHrs} ชม.)
    </div>` : '';
  const sc = personColor(j.seller);

  return `
    <div class="ticket type-${j.type} ${overdue?'is-overdue':''} ${done?'is-done':''} ${j.cancelled?'is-cancelled':''}">
      ${j.cancelled?'<div style="background:#F0E0E0;color:var(--stamp-red);font-size:12.5px;font-weight:700;padding:6px 14px;">❌ งานนี้ถูกยกเลิกแล้ว</div>':''}
      ${j.pendingDelete?`<div style="background:#FEF0D0;color:#7A5605;font-size:12px;font-weight:700;padding:6px 14px;display:flex;align-items:center;gap:8px;">
        🗑 ${escapeHtml(j.pendingDeleteBy||'?')} ขออนุมัติลบงานนี้
        ${currentUser?.role==='manager'?`<button onclick="approveDelete('${j.id}')" class="btn" style="padding:3px 10px;font-size:11.5px;background:#C0392B;color:#fff;">✓ อนุมัติ</button><button onclick="rejectDelete('${j.id}')" class="btn ghost" style="padding:3px 10px;font-size:11.5px;">✕ ปฏิเสธ</button>`:'<span style="color:#7A5605;font-size:11px;">(รอ Manager)</span>'}
      </div>`:''}
      ${overdueBanner}
      <div class="ticket-head">
        <div class="ticket-titles">
          <div class="ticket-no">#${getJobDisplayNo(j)} · ${j.quote || '-'}</div>
          <div class="ticket-job">${escapeHtml(j.job || 'ไม่มีชื่องาน')}${done?'<span class="done-pill">✓ เสร็จสมบูรณ์</span>':''}${j.awaitingRealOrder?'<span class="awaiting-pill">🔁 รอออกออเดอร์งานจริง</span>':''}${j.emailSent===false ? '<span class="email-pill unsent">⚠ ยังไม่ได้ส่งอีเมลออกออเดอร์</span>' : ''}</div>
          <div class="ticket-meta">
            <span>👤 ${sellerDisplay(j)}</span>
            <span>📅 ${formatDate(j.date)}</span>
            ${j.deliveryDate ? `<span>🚚 ส่ง ${formatDate(j.deliveryDate)}</span>` : ''}
            ${j.customerType ? `<span>🏷 ${j.customerType}</span>` : ''}
            ${j.leadId ? (()=>{ const ld=leads.find(x=>x.id===j.leadId); return ld ? `<span>🧲 Lead: ${escapeHtml(leadDisplayName(ld))}</span>` : ''; })() : ''}
            ${j.qty ? `<span>📦 ${j.qty} ตัว${j.productItems&&j.productItems.length ? ' ('+j.productItems.filter(p=>p.type).map(p=>`${p.type} ${p.qty} ตัว`).join(', ')+')'  : ''}</span>` : ''}
            ${j.salesAmount ? `<span>${Number(j.salesAmount).toLocaleString()}</span>` : ''}
          </div>
        </div>
        <span class="badge ${j.type}">${j.type}</span>
        <div class="ticket-actions">
          <button class="icon-btn" data-edit="${j.id}" title="แก้ไข">✎</button>
          ${!j.emailSent?'':` <button class="icon-btn" data-requeue="${j.id}" title="เตือนส่งอีเมลออกออเดอร์ใหม่" style="color:#2980B9;">🔔</button>`}
          ${!j.cancelled ? `<button class="icon-btn" data-cancel="${j.id}" title="ยกเลิกงาน" style="color:var(--stamp-red);">⊘</button>` : `<button class="icon-btn" data-uncancel="${j.id}" title="ยกเลิกการยกเลิก" style="color:var(--olive);">↩</button>`}
          <button class="icon-btn" data-del="${j.id}" title="${currentUser?.role==='manager'?'ลบ':'ขออนุมัติลบ'}" style="${j.pendingDelete?'color:#C8862B':''}">${j.pendingDelete?'⏳':'🗑'}</button>
        </div>
      </div>
      ${j.detail ? `<div class="ticket-detail">${escapeHtml(j.detail)}</div>` : ''}
      <div class="ticket-status-line" style="background:${sc.bg}40;border-radius:8px;margin:0 18px 10px;padding:8px 10px;">
        <span class="lab">สถานะ:</span>
        <input class="status-input" data-status="${j.id}" value="${escapeAttr(j.status||'')}" placeholder="พิมพ์สถานะอัพเดต..." style="color:${sc.text}">
      </div>
      <div class="stepper">${stepsHtml}</div>
    </div>

  `;
}

// ===== ข้อ 6: หน้าสรุปยอดขาย =====
let summaryPeriod = 'month'; // month | quarter | year
let summaryDim = 'customerType'; // customerType | period | productType
let summaryPTMonth = ''; // เดือนที่กรอง ตอนดูตามชนิดสินค้า
let summaryPTYearBE = ''; // ปี พ.ศ. ที่กรอง ตอนดูตามชนิดสินค้า
let summaryCompareMode = 'acrossYears'; // acrossYears = เดือน/ไตรมาสเดียวกัน เทียบคนละปี | sameYear = ปีเดียวกัน เทียบคนละเดือน/ไตรมาส
let summarySameYearBE = ''; // ปี พ.ศ. ที่ตรึงไว้ ตอนเปรียบเทียบแบบปีเดียวกัน
let summaryCompareUnit = ''; // เดือน(1-12)/ไตรมาส(1-4) ที่ตรึงไว้เพื่อเทียบข้ามปี ('' = ไม่ตรึง แสดงทุกช่วง)
let summaryCTMonth = ''; // เดือน(1-12) ที่กรองดูยอดขายตามประเภทลูกค้า ('' = ทุกเดือน)
let summaryCTYearBE = ''; // ปี พ.ศ. ที่กรองดูยอดขายตามประเภทลูกค้า ('' = ทุกปี)
let summarySelectedYearsBE = []; // ปี พ.ศ. ที่เลือกเปรียบเทียบ (สูงสุด 5 ปี)
let summarySelectedPeriods = []; // คีย์ช่วงเวลาที่เลือกไว้เพื่อเปรียบเทียบ (สูงสุด 5 รายการ) — ใช้เมื่อหน่วยเวลา = ปี

function periodKeyFromYM(y, m){ // m: 1-12
  if(summaryPeriod==='year') return String(y);
  if(summaryPeriod==='quarter') return `Q${Math.floor((m-1)/3)+1}/${y}`;
  return `${String(m).padStart(2,"0")}/${y}`;
}
function periodKeyOf(j){
  const d = j.date ? new Date(j.date+"T00:00:00") : new Date(j.createdAt);
  if(isNaN(d)) return "ไม่ระบุ";
  return periodKeyFromYM(d.getFullYear(), d.getMonth()+1);
}

// ===== ตัวช่วยปี พ.ศ. / ป้ายชื่อช่วงเวลา สำหรับรายงานยอดขาย =====
const TH_MONTH_ABBR = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function toBE(adYear){ return Number(adYear) + 543; }
function periodKeyADYear(key){
  if(/^\d{4}$/.test(key)) return Number(key);
  const parts = key.split("/");
  return Number(parts[1]);
}
function formatPeriodLabel(key){
  if(/^\d{4}$/.test(key)) return `ปี ${toBE(key)}`;
  if(key.startsWith("Q")){
    const [q,y] = key.replace("Q","").split("/");
    return `ไตรมาส ${q} / ${toBE(y)}`;
  }
  const [m,y] = key.split("/");
  return `${TH_MONTH_ABBR[Number(m)-1]} ${toBE(y)}`;
}

// ข้อ 11 ยอดขาย: รายงาน performance ตามเซลล์
// ── ข้อ 1: เพิ่มยอดขาย Manual แยกตามประเภทลูกค้า ───────────────
function openManualSalesModal(){
  const allHistYears = [...new Set(historicalSales.map(h=>h.year))].sort((a,b)=>a-b);
  const defYear = new Date().getFullYear();
  const defMonth = new Date().getMonth()+1;
  const yearOpts = [...new Set([...allHistYears, defYear, defYear+1])].sort().map(y=>`<option value="${y}" ${y===defYear?'selected':''}>${y+543}</option>`).join('');
  const TH_MONTHS_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const monOpts = TH_MONTHS_FULL.map((n,i)=>`<option value="${i+1}" ${i+1===defMonth?'selected':''}>${n}</option>`).join('');

  // หา existing values สำหรับ year+month ที่เลือก
  const existing = {};
  historicalSales.filter(h=>h.year===defYear&&h.month===defMonth).forEach(h=>{ existing[h.customerType]=(existing[h.customerType]||0)+h.amount; });

  const catFields = CUSTOMER_TYPES.map(ct=>`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <label style="width:200px;font-size:12.5px;flex-shrink:0;">${escapeHtml(ct)}</label>
      <input type="number" id="msale_${ct.replace(/[^a-zA-Zก-๙]/g,'_')}" value="${existing[ct]||0}" min="0"
        style="width:140px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;font-size:13px;text-align:right;">
    </div>`).join('');

  // reuse expModalOverlay
  $('expModalOverlay').innerHTML = `
    <div style="background:var(--white);border-radius:14px;padding:24px 28px;max-width:500px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3);">
      <h2 style="margin-bottom:16px;">➕ เพิ่มยอดขาย Manual</h2>
      <div style="display:flex;gap:10px;margin-bottom:16px;">
        <select id="msaleYear" style="padding:7px 10px;border:1px solid var(--line);border-radius:7px;font-size:13px;" onchange="reloadManualSalesModal()">${yearOpts}</select>
        <select id="msaleMon" style="padding:7px 10px;border:1px solid var(--line);border-radius:7px;font-size:13px;" onchange="reloadManualSalesModal()">${monOpts}</select>
      </div>
      <div style="font-size:12px;color:var(--ink-soft);margin-bottom:10px;">ใส่ยอดขาย (ก่อนแวท) แยกตามประเภทลูกค้า ช่องที่ไม่มีใส่ 0</div>
      <div style="background:var(--surface-1);border-radius:8px;padding:10px;">${catFields}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">
        <button class="btn ghost" onclick="$('expModalOverlay').style.display='none'">ยกเลิก</button>
        <button class="btn primary" onclick="saveManualSales()">💾 บันทึก</button>
      </div>
    </div>`;
  $('expModalOverlay').style.display='flex';
}

function reloadManualSalesModal(){
  const y = Number($('msaleYear').value);
  const m = Number($('msaleMon').value);
  const existing = {};
  historicalSales.filter(h=>h.year===y&&h.month===m).forEach(h=>{ existing[h.customerType]=(existing[h.customerType]||0)+h.amount; });
  CUSTOMER_TYPES.forEach(ct=>{
    const el = $('msale_'+ct.replace(/[^a-zA-Zก-๙]/g,'_'));
    if(el) el.value = existing[ct]||0;
  });
}

async function saveManualSales(){
  const y = Number($('msaleYear').value);
  const m = Number($('msaleMon').value);
  // ลบของเก่าของเดือนนี้ที่ manual:true ออก
  historicalSales = historicalSales.filter(h=>!(h.year===y&&h.month===m&&h.manual));
  // เพิ่มใหม่
  let added = 0;
  CUSTOMER_TYPES.forEach(ct=>{
    const el = $('msale_'+ct.replace(/[^a-zA-Zก-๙]/g,'_'));
    const v = Number(el?.value)||0;
    if(v>0){
      historicalSales.push({ id:'manual_'+y+'_'+m+'_'+ct.replace(/\s/g,''), year:y, month:m, customerType:ct, amount:v, manual:true });
      added++;
    }
  });
  try{ await window.storage.set("historicalSalesV2", JSON.stringify(historicalSales), true); }catch(e){}
  $('expModalOverlay').style.display='none';
  const TH_MONTHS_ABBR = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  toast(`✓ บันทึกยอดขาย ${added} ประเภท เดือน ${TH_MONTHS_ABBR[m-1]} ปี ${y+543}`);
  if(currentView==='summary') renderList();
}

function renderSellerSummary(){
  const dimCtrl = `
    <div class="summary-controls">
      <select class="filt" id="sumPeriod">
        <option value="month" ${summaryPeriod==='month'?'selected':''}>รายเดือน</option>
        <option value="quarter" ${summaryPeriod==='quarter'?'selected':''}>รายไตรมาส</option>
        <option value="year" ${summaryPeriod==='year'?'selected':''}>รายปี</option>
      </select>
      <select class="filt" id="sumDim">
        <option value="customerType">จำแนกตามประเภทลูกค้า</option>
        <option value="period">จำแนกตามช่วงเวลา</option>
        <option value="productType">จำแนกตามชนิดสินค้า</option>
        <option value="webNewProduct">🎯 เวปใหม่ — สินค้า × เดือน/ปี</option>
        <option value="seller" selected>👤 รายงานตามเซลล์</option>
      </select>
      <div style="margin-left:auto;background:#FEF9E7;border:1px solid #F7DC6F;border-radius:7px;padding:7px 13px;font-size:12px;color:#7D6608;white-space:nowrap;">
        ⚠ จำนวนงาน/ตัว มีข้อมูลจริงเฉพาะตั้งแต่ กค. 69
      </div>
    </div>`;

  const ADMIN_CT_S = ['เวปใหม่ (แอดมิน)', 'เวปเก่า (แอดมิน)'];
  const _rs = userRole();
  const _allJobs = jobs.filter(j=>j.countInSales!==false);
  const countable = _rs==='seller_admin'
    ? _allJobs.filter(j=>ADMIN_CT_S.includes(j.customerType))
    : _rs==='seller_direct'
      ? _allJobs.filter(j=>!ADMIN_CT_S.includes(j.customerType))
      : _allJobs;
  const sellerMap = {};
  countable.forEach(j=>{
    const s = sellerDisplay(j) || 'ไม่ระบุ';
    if(!sellerMap[s]) sellerMap[s] = {jobs:0, qty:0, amount:0, done:0, sample:0, real:0, leadLinked:0, baseColor: j.seller||s};
    sellerMap[s].jobs++;
    sellerMap[s].qty += Number(j.qty)||0;
    sellerMap[s].amount += Number(j.salesAmount)||0;
    if(isJobDone(j)) sellerMap[s].done++;
    if(j.type==='ตัวอย่าง') sellerMap[s].sample++;
    if(j.type==='งานจริง') sellerMap[s].real++;
    if(j.leadId) sellerMap[s].leadLinked++;
  });

  const sellers = Object.keys(sellerMap).sort((a,b)=>sellerMap[b].amount-sellerMap[a].amount);
  const maxAmt = Math.max(1,...sellers.map(s=>sellerMap[s].amount));
  const barColors = ["#5B6B22","#9CC42C","#C8862B","#3E7A4D","#B7472A","#7A5605","#1B4F7A","#5B2C8A","#0E6E69","#8A1B4A","#6B6B2A","#4A4A4A"];
  const barW=52,gap=22,chartH=220;
  const svgW = Math.max(400, sellers.length*(barW+gap)+gap);
  const bars = sellers.map((s,i)=>{
    const amt = sellerMap[s].amount;
    const h = Math.round((amt/maxAmt)*(chartH-40));
    const x = gap+i*(barW+gap), y = chartH-h-24;
    const sc = personColor(sellerMap[s].baseColor || s);
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${sc.bg}" stroke="${sc.text}" stroke-width="1.5"></rect>
      <text x="${x+barW/2}" y="${chartH-8}" font-size="10" text-anchor="middle" fill="#6B6256" font-family="Sarabun">${escapeHtml(s)}</text>
      <text x="${x+barW/2}" y="${y-6}" font-size="10" text-anchor="middle" fill="#2B2520" font-family="Kanit" font-weight="700">${amt>=1000?Math.round(amt/1000)+'k':amt}</text>`;
  }).join("");

  const tableRows = sellers.map(s=>{
    const g = sellerMap[s];
    const doneRate = g.jobs ? Math.round(g.done/g.jobs*1000)/10 : 0;
    const sc = personColor(g.baseColor || s);
    return `<tr>
      <td><span class="pchip" style="background:${sc.bg};color:${sc.text}">${escapeHtml(s)}</span></td>
      <td>${g.jobs || '<span style="color:var(--ink-soft)">N/A</span>'}</td>
      <td>${g.sample || '<span style="color:var(--ink-soft)">N/A</span>'}</td>
      <td>${g.real || '<span style="color:var(--ink-soft)">N/A</span>'}</td>
      <td>${g.jobs ? g.done+' ('+doneRate+'%)' : '<span style="color:var(--ink-soft)">N/A</span>'}</td>
      <td>${g.qty ? g.qty.toLocaleString()+' ตัว' : '<span style="color:var(--ink-soft)">N/A</span>'}</td>
      <td>${g.amount.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
      <td>${g.amount&&g.jobs ? ''+ Math.round(g.amount/g.jobs).toLocaleString() : '<span style="color:var(--ink-soft)">N/A</span>'}</td>
      <td>${g.jobs ? g.leadLinked : '<span style="color:var(--ink-soft)">N/A</span>'}</td>
    </tr>`;
  }).join("");

  const totalAmt = sellers.reduce((s,k)=>s+sellerMap[k].amount,0);
  const totalJobs = sellers.reduce((s,k)=>s+sellerMap[k].jobs,0);
  const totalQty = sellers.reduce((s,k)=>s+sellerMap[k].qty,0);

  return dimCtrl + `
    <div class="summary-row">
      <div class="summary-box"><div class="num">${totalJobs}</div><div class="lbl">งานทั้งหมด</div></div>
      <div class="summary-box"><div class="num" style="color:var(--olive)">${totalQty.toLocaleString()}</div><div class="lbl">ตัวรวม</div></div>
      <div class="summary-box"><div class="num" style="color:var(--khaki-green)">${totalAmt.toLocaleString(undefined,{maximumFractionDigits:0})}</div><div class="lbl">ยอดขายรวม</div></div>
    </div>
    <div class="summary-panel">
      <h3>👤 กราฟยอดขายตามเซลล์</h3>
      <div class="chart-wrap">
        <svg width="${svgW}" height="${chartH+10}" viewBox="0 0 ${svgW} ${chartH+10}">${bars}</svg>
      </div>
    </div>
    <div class="summary-panel">
      <h3>ตารางสรุปผลงานรายคน</h3>
      <div class="chart-wrap">
        <table class="rep-table">
          <thead><tr><th>เซลล์</th><th>งานทั้งหมด</th><th>ตัวอย่าง</th><th>งานจริง</th><th>เสร็จสมบูรณ์</th><th>จำนวนตัว</th><th>ยอดขายรวม</th><th>เฉลี่ย/งาน</th><th>มี Lead</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="9" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล</td></tr>'}</tbody>
          <tfoot><tr><td>รวม</td><td>${totalJobs}</td><td></td><td></td><td></td><td>${totalQty.toLocaleString()}</td><td>${totalAmt.toLocaleString(undefined,{maximumFractionDigits:0})}</td><td></td><td></td></tr></tfoot>
        </table>
      </div>
    </div>`;
}

function renderSummaryView(){
  // ===== routing ตาม summaryDim =====
  if(summaryDim==='productType') return renderProductTypeSummary();
  if(summaryDim==='seller') return renderSellerSummary();
  if(summaryDim==='webNewProduct') return renderWebNewProductSummary();

  // ── กรองข้อมูลตาม role ──────────────────────────────────────
  const ADMIN_CT = ['เวปใหม่ (แอดมิน)', 'เวปเก่า (แอดมิน)'];
  // กำหนด role จาก individual perms ก่อน แล้วค่อย fallback role
  const _r = (()=>{
    const perms = currentUser?.permissions;
    if(perms){
      if(perms.summary_direct && !perms.summary_admin) return 'seller_direct';
      if(perms.summary_admin && !perms.summary_direct) return 'seller_admin';
      if(perms.summary_direct && perms.summary_admin)  return 'manager'; // เห็นทั้งคู่
    }
    return userRole();
  })();
  const allJobsCountable = jobs.filter(j=>j.countInSales!==false);

  // กำหนด customer types ที่มองเห็นตาม role
  let visibleCT;
  if(_r === 'seller_admin')       visibleCT = ADMIN_CT;
  else if(_r === 'seller_direct') visibleCT = CUSTOMER_TYPES.filter(ct=>!ADMIN_CT.includes(ct));
  else                             visibleCT = CUSTOMER_TYPES;   // manager/staff: ทั้งหมด

  // กรอง jobs ตาม visibleCT
  let countable = allJobsCountable.filter(j=>visibleCT.includes(j.customerType));
  // กรอง historical ตาม role
  let histForAgg = _r === 'seller_admin'
    ? historicalSales.filter(h=>ADMIN_CT.includes(h.customerType))
    : _r === 'seller_direct'
      ? historicalSales.filter(h=>!ADMIN_CT.includes(h.customerType))
      : historicalSales;   // manager: เห็นทุก type รวม admin

  // ปีทั้งหมดที่มีข้อมูล (ไม่กรอง) ใช้สร้างตัวเลือกปีในตัวกรองยอดขายตามประเภทลูกค้า
  const ctAvailableBEYears = [...new Set([
    ...allJobsCountable.map(j=>{ const d = j.date ? new Date(j.date+"T00:00:00") : new Date(j.createdAt); return isNaN(d) ? null : toBE(d.getFullYear()); }).filter(Boolean),
    ...historicalSales.map(h=>toBE(h.year))
  ])].sort((a,b)=>a-b);

  // ข้อ: ดูยอดขาย/จำนวน ตามประเภทลูกค้า กรองตามเดือน+ปี ที่เลือกได้
  if(summaryDim==='customerType' && (summaryCTMonth || summaryCTYearBE)){
    const jobYM = (j)=>{
      const d = j.date ? new Date(j.date+"T00:00:00") : new Date(j.createdAt);
      if(isNaN(d)) return null;
      return { y: d.getFullYear(), m: d.getMonth()+1 };
    };
    const matchYM = (y,m)=>{
      if(summaryCTYearBE && toBE(y) !== Number(summaryCTYearBE)) return false;
      if(summaryCTMonth && m !== Number(summaryCTMonth)) return false;
      return true;
    };
    countable = countable.filter(j=>{ const ym = jobYM(j); return ym && matchYM(ym.y, ym.m); });
    histForAgg = _roleHist.filter(h=>matchYM(h.year, h.month));
  }

  const groupKey = summaryDim==='customerType' ? (j=> visibleCT.includes(j.customerType) ? j.customerType : null) : periodKeyOf;

  const groups = {};
  // ข้อ 6 (แก้ไข): จำแนกตามประเภทลูกค้า ให้ขึ้นครบทั้ง 11 ประเภทเสมอ แม้ยังไม่มียอด
  if(summaryDim==='customerType'){
    visibleCT.forEach(c=>{ groups[c] = {amount:0, qty:0, count:0}; });
  }
  countable.forEach(j=>{
    const k = groupKey(j);
    if(k===null) return; // skip types not in visibleCT
    if(!groups[k]) groups[k] = {amount:0, qty:0, count:0};
    groups[k].amount += Number(j.salesAmount)||0;
    groups[k].qty += Number(j.qty)||0;
    groups[k].count += 1;
  });
  // รวมข้อมูลยอดขายย้อนหลัง (นำเข้าจากไฟล์รายงานเก่า) เข้ากับยอดขายจริงในระบบ
  histForAgg.forEach(h=>{
    const k = summaryDim==='customerType'
      ? (visibleCT.includes(h.customerType) ? h.customerType : null)
      : periodKeyFromYM(h.year, h.month);
    if(k===null) return; // skip
    if(!groups[k]) groups[k] = {amount:0, qty:0, count:0};
    groups[k].amount += Number(h.amount)||0;
    groups[k].count += 1;
  });

  let keys, allPeriodKeysSorted = [], availableBEYears = [];
  if(summaryDim==='customerType'){
    keys = visibleCT.slice();
  }else{
    allPeriodKeysSorted = Object.keys(groups).sort((a,b)=>a.localeCompare(b));
    availableBEYears = [...new Set(allPeriodKeysSorted.map(periodKeyADYear))].sort((a,b)=>a-b).map(toBE);

    if(summaryPeriod==='year'){
      // หน่วยเวลา = ปี: คีย์แต่ละตัวคือปีอยู่แล้ว เลือกได้สูงสุด 5 ปีโดยตรง
      const selectedInScope = summarySelectedPeriods.filter(k=>allPeriodKeysSorted.includes(k));
      keys = selectedInScope.length ? selectedInScope.slice().sort((a,b)=>a.localeCompare(b)) : allPeriodKeysSorted;
    }else if(summaryCompareMode==='sameYear'){
      // เปรียบเทียบในปีเดียวกัน: ตรึงปี แล้วเลือกเดือน/ไตรมาสต่างกัน (สูงสุด 5)
      if(summarySameYearBE){
        const yearKeysAll = allPeriodKeysSorted.filter(k=>toBE(periodKeyADYear(k))===Number(summarySameYearBE));
        const selectedInScope = summarySelectedPeriods.filter(k=>yearKeysAll.includes(k));
        keys = selectedInScope.length ? selectedInScope.slice().sort((a,b)=>a.localeCompare(b)) : yearKeysAll;
      }else{
        keys = allPeriodKeysSorted;
      }
    }else{
      // หน่วยเวลา = เดือน/ไตรมาส: ตรึงเดือน/ไตรมาสที่สนใจ แล้วเปรียบเทียบข้ามปี (สูงสุด 5 ปี)
      if(summaryCompareUnit){
        const unitKeysAllYears = allPeriodKeysSorted.filter(k=> summaryPeriod==='quarter' ? k.startsWith(`Q${summaryCompareUnit}/`) : k.startsWith(`${String(summaryCompareUnit).padStart(2,"0")}/`));
        const selectedYearKeys = summarySelectedYearsBE
          .map(beY=> unitKeysAllYears.find(k=>toBE(periodKeyADYear(k))===Number(beY)))
          .filter(Boolean);
        keys = selectedYearKeys.length ? selectedYearKeys.slice().sort((a,b)=>a.localeCompare(b)) : unitKeysAllYears;
      }else{
        keys = allPeriodKeysSorted;
      }
    }
  }

  // ข้อ: สรุปยอดขายตามช่วงเวลา ให้จำแนกตามประเภทลูกค้าด้วย (ตาราง cross-tab)
  let crossTabHtml = "";
  if(summaryDim==='period'){
    const matrix = {};
    countable.forEach(j=>{
      const pk = periodKeyOf(j);
      const ct = CUSTOMER_TYPES.includes(j.customerType) ? j.customerType : 'อื่นๆ';
      if(!matrix[pk]) matrix[pk] = {};
      matrix[pk][ct] = (matrix[pk][ct]||0) + (Number(j.salesAmount)||0);
    });
    histForAgg.forEach(h=>{
      const pk = periodKeyFromYM(h.year, h.month);
      const ct = CUSTOMER_TYPES.includes(h.customerType) ? h.customerType : 'อื่นๆ';
      if(!matrix[pk]) matrix[pk] = {};
      matrix[pk][ct] = (matrix[pk][ct]||0) + (Number(h.amount)||0);
    });
    const colsToShow = keys; // ช่วงเวลาเป็น column
    const ctRowTypes = visibleCT.filter(ct=>keys.some(k=>matrix[k]&&matrix[k][ct]));

    // header: ประเภทลูกค้า | ช่วงเวลา1 | ช่วงเวลา2 | ... | รวม
    const periodHeaders = colsToShow.map(k=>`<th style="white-space:nowrap;">${escapeHtml(formatPeriodLabel(k))}</th>`).join("");

    // แต่ละแถว = ประเภทลูกค้า 1 ประเภท, แต่ละช่อง = ยอดขายในช่วงเวลานั้น
    const ctRows = ctRowTypes.map(ct=>{
      const cells = colsToShow.map(k=>{
        const v = (matrix[k]&&matrix[k][ct])||0;
        return `<td>${v ? ''+ v.toLocaleString(undefined,{maximumFractionDigits:0}) : '-'}</td>`;
      }).join("");
      const rowTotal = colsToShow.reduce((s,k)=>s+((matrix[k]&&matrix[k][ct])||0),0);
      return `<tr><td style="font-weight:600;white-space:nowrap;">${escapeHtml(ct)}</td>${cells}<td style="font-weight:700;background:#EFEADA;">${rowTotal.toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr>`;
    }).join("");

    // footer: รวมแต่ละช่วงเวลา
    const periodTotals = colsToShow.map(k=>{
      const t = ctRowTypes.reduce((s,ct)=>s+((matrix[k]&&matrix[k][ct])||0),0);
      return `<td>${t.toLocaleString(undefined,{maximumFractionDigits:0})}</td>`;
    }).join("");
    const grandTotal = ctRowTypes.reduce((s,ct)=>s+colsToShow.reduce((s2,k)=>s2+((matrix[k]&&matrix[k][ct])||0),0),0);

    crossTabHtml = `
      <div class="summary-panel">
        <h3>ตารางยอดขาย — ประเภทลูกค้า (แนวตั้ง) × ช่วงเวลา (แนวนอน)</h3>
        <div class="chart-wrap">
          <table class="rep-table">
            <thead><tr><th>ประเภทลูกค้า</th>${periodHeaders}<th>รวม</th></tr></thead>
            <tbody>${ctRows || `<tr><td colspan="${colsToShow.length+2}" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล</td></tr>`}</tbody>
            <tfoot><tr><td>รวม</td>${periodTotals}<td style="background:#EFEADA;">${grandTotal.toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr></tfoot>
          </table>
        </div>
      </div>
    `;
  }

  const totalAmount = keys.reduce((s,k)=>s+(groups[k]?groups[k].amount:0),0);
  const totalQty = keys.reduce((s,k)=>s+(groups[k]?groups[k].qty:0),0);
  const totalCount = keys.reduce((s,k)=>s+(groups[k]?groups[k].count:0),0);
  const maxAmount = Math.max(1, ...keys.map(k=>groups[k]?groups[k].amount:0));

  const barColors = ["#5B6B22","#9CC42C","#C8862B","#3E7A4D","#B7472A","#7A5605","#1B4F7A","#5B2C8A","#0E6E69","#8A1B4A","#6B6B2A"];

  const labelOf = (k)=> summaryDim==='customerType' ? k : formatPeriodLabel(k);

  // ช่วงเวลาก่อน กค. 69 = historical (ไม่มีข้อมูลจำนวนงาน)
  const isHistPeriod = (k)=>{
    if(summaryDim==='customerType') return false;
    if(/^\d{4}-Q\d$/.test(k)){
      const [y,q] = k.split('-Q').map(Number);
      return y < 2026 || (y===2026 && q < 3);
    }
    if(/^\d{4}-\d{2}$/.test(k)){
      const [y,m] = k.split('-').map(Number);
      return y < 2026 || (y===2026 && m < 7);
    }
    if(/^\d{4}$/.test(k)) return parseInt(k) < 2026;
    return false;
  };

  const rows = keys.map((k,i)=>{
    const g = groups[k];
    const hist = isHistPeriod(k);
    return `
    <tr>
      <td>${escapeHtml(labelOf(k))}</td>
      <td>${hist ? '<span style="color:var(--ink-soft)">N/A</span>' : (g?g.count:0).toLocaleString()}</td>
      <td>${hist ? '<span style="color:var(--ink-soft)">N/A</span>' : (g?g.qty:0).toLocaleString()}</td>
      <td>${(g?g.amount:0).toLocaleString(undefined,{maximumFractionDigits:2})}</td>
    </tr>`;
  }).join("");

  const barW = 46, gap = 22, chartH = 220;
  const svgW = Math.max(400, keys.length*(barW+gap)+gap);
  const bars = keys.map((k,i)=>{
    const amt = groups[k]?groups[k].amount:0;
    const h = Math.round((amt/maxAmount) * (chartH-40));
    const x = gap + i*(barW+gap);
    const y = chartH - h - 24;
    const color = barColors[i % barColors.length];
    const label = labelOf(k);
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${color}"></rect>
      <text x="${x+barW/2}" y="${chartH-8}" font-size="10" text-anchor="middle" fill="#6B6256" font-family="Sarabun">${escapeHtml(label.length>12?label.slice(0,11)+'…':label)}</text>
      <text x="${x+barW/2}" y="${y-6}" font-size="10" text-anchor="middle" fill="#2B2520" font-family="Kanit" font-weight="700">${amt>=1000? Math.round(amt/1000)+'k':amt}</text>
    `;
  }).join("");

  // ข้อ: ตัวกรองเดือน+ปี สำหรับมุมมอง "จำแนกตามประเภทลูกค้า"
  let ctFilterHtml = "";
  if(summaryDim==='customerType'){
    const monthOptions = `<option value="">ทุกเดือน</option>` + TH_MONTH_ABBR.map((m,i)=>`<option value="${i+1}" ${Number(summaryCTMonth)===i+1?'selected':''}>${m}</option>`).join("");
    const yearOptions = `<option value="">ทุกปี</option>` + ctAvailableBEYears.map(y=>`<option value="${y}" ${Number(summaryCTYearBE)===y?'selected':''}>พ.ศ. ${y}</option>`).join("");
    const activeFilterText = (summaryCTMonth || summaryCTYearBE)
      ? `กำลังดูเฉพาะ ${summaryCTMonth ? TH_MONTH_ABBR[Number(summaryCTMonth)-1] : 'ทุกเดือน'}${summaryCTYearBE ? ' พ.ศ. '+summaryCTYearBE : ' ทุกปี'}`
      : 'กำลังแสดงยอดขายสะสมทุกเดือนทุกปี';
    ctFilterHtml = `
      <div class="summary-panel" style="padding:14px 18px;">
        <h3 style="margin-bottom:8px;">📅 กรองยอดขายตามประเภทลูกค้า ตามเดือน/ปีที่เลือก</h3>
        <div class="summary-controls" style="margin-bottom:6px;">
          <select class="filt" id="sumCTMonth">${monthOptions}</select>
          <select class="filt" id="sumCTYear">${yearOptions}</select>
          ${(summaryCTMonth || summaryCTYearBE) ? `<button class="btn ghost" id="sumCTClear" style="padding:6px 12px;font-size:12.5px;">✕ ล้างตัวกรอง</button>` : ''}
        </div>
        <p style="font-size:12px;color:var(--ink-soft);margin:0;">${activeFilterText}</p>
      </div>
    `;
  }

  // ข้อ: เลือกเดือน/ไตรมาส + เลือกปี พ.ศ. เพื่อเปรียบเทียบยอดขายข้ามปี (สูงสุด 5 ปี)
  let periodPickerHtml = "";
  if(summaryDim==='period'){
    if(summaryPeriod==='year'){
      const checklist = allPeriodKeysSorted.map(k=>{
        const checked = summarySelectedPeriods.includes(k);
        return `<label style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;background:${checked?'#E4EAC9':'#F7F2E6'};border:1px solid ${checked?'var(--olive)':'var(--line)'};border-radius:14px;padding:4px 10px;cursor:pointer;">
          <input type="checkbox" data-periodpick="${k}" ${checked?'checked':''} style="width:13px;height:13px;">${escapeHtml(formatPeriodLabel(k))}
        </label>`;
      }).join(" ");
      periodPickerHtml = `
        <div class="summary-panel" style="padding:14px 18px;">
          <h3 style="margin-bottom:8px;">เลือกปี พ.ศ. ที่ต้องการเปรียบเทียบ (สูงสุด 5 ปี)</h3>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">${checklist || '<span style="font-size:12.5px;color:var(--ink-soft);">ยังไม่มีข้อมูล</span>'}</div>
          ${summarySelectedPeriods.length ? `<button class="btn ghost" id="sumClearPick" style="padding:6px 12px;font-size:12.5px;margin-top:10px;">✕ ล้างตัวเลือก (${summarySelectedPeriods.length}/5)</button>` : ''}
        </div>
      `;
    }else{
      const unitOptions = summaryPeriod==='quarter'
        ? [1,2,3,4].map(q=>`<option value="${q}" ${Number(summaryCompareUnit)===q?'selected':''}>ไตรมาส ${q}</option>`).join("")
        : TH_MONTH_ABBR.map((m,i)=>`<option value="${i+1}" ${Number(summaryCompareUnit)===i+1?'selected':''}>${m}</option>`).join("");
      const unitLabel = summaryPeriod==='quarter' ? 'ไตรมาส' : 'เดือน';

      const modeToggle = `
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          <button type="button" class="mode-toggle-btn ${summaryCompareMode==='acrossYears'?'active':''}" id="sumModeAcrossYears">🔁 ${unitLabel}เดียวกัน เทียบคนละปี</button>
          <button type="button" class="mode-toggle-btn ${summaryCompareMode==='sameYear'?'active':''}" id="sumModeSameYear">📌 ปีเดียวกัน เทียบคนละ${unitLabel}</button>
        </div>
      `;

      if(summaryCompareMode==='sameYear'){
        const yearOptions = `<option value="">— เลือกปี —</option>` + availableBEYears.map(y=>`<option value="${y}" ${Number(summarySameYearBE)===y?'selected':''}>พ.ศ. ${y}</option>`).join("");
        let unitChecklist = "";
        if(summarySameYearBE){
          const yearUnits = allPeriodKeysSorted.filter(k=>toBE(periodKeyADYear(k))===Number(summarySameYearBE));
          unitChecklist = yearUnits.map(k=>{
            const checked = summarySelectedPeriods.includes(k);
            return `<label style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;background:${checked?'#E4EAC9':'#F7F2E6'};border:1px solid ${checked?'var(--olive)':'var(--line)'};border-radius:14px;padding:4px 10px;cursor:pointer;">
              <input type="checkbox" data-periodpick="${k}" ${checked?'checked':''} style="width:13px;height:13px;">${escapeHtml(formatPeriodLabel(k))}
            </label>`;
          }).join(" ");
        }
        periodPickerHtml = `
          <div class="summary-panel" style="padding:14px 18px;">
            <h3 style="margin-bottom:8px;">📌 เปรียบเทียบ${unitLabel}ต่างกันในปีเดียวกัน — เลือกปี แล้วติ๊ก${unitLabel}ที่ต้องการเทียบ (สูงสุด 5)</h3>
            ${modeToggle}
            <div class="summary-controls" style="margin-bottom:10px;">
              <select class="filt" id="sumSameYear">${yearOptions}</select>
              ${summarySelectedPeriods.length ? `<button class="btn ghost" id="sumClearPick" style="padding:6px 12px;font-size:12.5px;">✕ ล้างตัวเลือก (${summarySelectedPeriods.length}/5)</button>` : ''}
            </div>
            ${summarySameYearBE
              ? `<div style="display:flex;flex-wrap:wrap;gap:6px;">${unitChecklist || `<span style="font-size:12.5px;color:var(--ink-soft);">ไม่มีข้อมูลของปีนี้</span>`}</div>`
              : `<p style="font-size:12.5px;color:var(--ink-soft);margin:0;">เลือกปีด้านบนก่อน เพื่อเลือก${unitLabel}ที่ต้องการเปรียบเทียบ</p>`}
          </div>
        `;
      }else{
        let yearChecklist = "";
        if(summaryCompareUnit){
          const unitYears = [...new Set(allPeriodKeysSorted
            .filter(k=> summaryPeriod==='quarter' ? k.startsWith(`Q${summaryCompareUnit}/`) : k.startsWith(`${String(summaryCompareUnit).padStart(2,"0")}/`))
            .map(k=>toBE(periodKeyADYear(k))))].sort((a,b)=>a-b);
          yearChecklist = unitYears.map(y=>{
            const checked = summarySelectedYearsBE.map(Number).includes(y);
            return `<label style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;background:${checked?'#E4EAC9':'#F7F2E6'};border:1px solid ${checked?'var(--olive)':'var(--line)'};border-radius:14px;padding:4px 10px;cursor:pointer;">
              <input type="checkbox" data-yearpick="${y}" ${checked?'checked':''} style="width:13px;height:13px;">พ.ศ. ${y}
            </label>`;
          }).join(" ");
        }
        periodPickerHtml = `
          <div class="summary-panel" style="padding:14px 18px;">
            <h3 style="margin-bottom:8px;">🔁 เปรียบเทียบยอดขายข้ามปี — เลือก${unitLabel}ที่สนใจ แล้วติ๊กปีที่ต้องการเทียบ (สูงสุด 5 ปี)</h3>
            ${modeToggle}
            <div class="summary-controls" style="margin-bottom:10px;">
              <select class="filt" id="sumCompareUnit">
                <option value="">— เลือก${unitLabel} —</option>
                ${unitOptions}
              </select>
              ${summarySelectedYearsBE.length ? `<button class="btn ghost" id="sumClearPick" style="padding:6px 12px;font-size:12.5px;">✕ ล้างปีที่เลือก (${summarySelectedYearsBE.length}/5)</button>` : ''}
            </div>
            ${summaryCompareUnit
              ? `<div style="display:flex;flex-wrap:wrap;gap:6px;">${yearChecklist || '<span style="font-size:12.5px;color:var(--ink-soft);">ไม่มีข้อมูลของ'+unitLabel+'นี้</span>'}</div>`
              : `<p style="font-size:12.5px;color:var(--ink-soft);margin:0;">เลือก${unitLabel}ด้านบนก่อน เพื่อเลือกปีที่ต้องการเปรียบเทียบ (ถ้าไม่เลือก จะแสดงข้อมูลทุก${unitLabel}ทุกปีตามปกติด้านล่าง)</p>`}
          </div>
        `;
      }
    }
  }

  return `
    <div class="summary-controls">
      <select class="filt" id="sumPeriod">
        <option value="month" ${summaryPeriod==='month'?'selected':''}>รายเดือน</option>
        <option value="quarter" ${summaryPeriod==='quarter'?'selected':''}>รายไตรมาส</option>
        <option value="year" ${summaryPeriod==='year'?'selected':''}>รายปี</option>
      </select>
      <select class="filt" id="sumDim">
        <option value="customerType" ${summaryDim==='customerType'?'selected':''}>จำแนกตามประเภทลูกค้า</option>
        <option value="period" ${summaryDim==='period'?'selected':''}>จำแนกตามช่วงเวลา</option>
        <option value="productType" ${summaryDim==='productType'?'selected':''}>จำแนกตามชนิดสินค้า</option>
        <option value="webNewProduct" ${summaryDim==='webNewProduct'?'selected':''}>🎯 เวปใหม่ — สินค้า × เดือน/ปี</option>
        <option value="seller" ${summaryDim==='seller'?'selected':''}>👤 รายงานตามเซลล์</option>
      </select>
      ${historicalSales.length ? `<span style="align-self:center;font-size:12px;color:var(--ink-soft);">📥 รวมยอดขายย้อนหลังที่นำเข้าแล้ว ${historicalSales.length} รายการ</span>` : ''}
      <div style="margin-left:auto;background:#FEF9E7;border:1px solid #F7DC6F;border-radius:7px;padding:6px 13px;font-size:12px;color:#7D6608;white-space:nowrap;align-self:center;">
        ⚠ จำนวนงาน/ตัว มีข้อมูลจริงเฉพาะตั้งแต่ กค. 69
      </div>
      <button class="btn ghost" style="padding:6px 12px;font-size:12.5px;white-space:nowrap;" onclick="openManualSalesModal()">➕ เพิ่มยอดขาย Manual</button>
    </div>
    ${ctFilterHtml}
    ${periodPickerHtml}
    <div class="summary-row">
      <div class="summary-box"><div class="num">${totalCount}</div><div class="lbl">จำนวนงาน (นับยอด)</div></div>
      <div class="summary-box"><div class="num" style="color:var(--olive)">${totalQty.toLocaleString()}</div><div class="lbl">จำนวนตัวที่สั่งผลิต</div></div>
      <div class="summary-box"><div class="num" style="color:var(--khaki-green)">${totalAmount.toLocaleString(undefined,{maximumFractionDigits:0})}</div><div class="lbl">ยอดขายรวม (ก่อนแวท)</div></div>
    </div>
    <div class="summary-panel">
      <h3>กราฟยอดขาย — ${summaryDim==='customerType'?'ตามประเภทลูกค้า':((summarySelectedPeriods.length||summarySelectedYearsBE.length)?'เปรียบเทียบที่เลือกไว้':'ตามช่วงเวลา')}</h3>
      <div class="chart-wrap">
        <svg width="${svgW}" height="${chartH+10}" viewBox="0 0 ${svgW} ${chartH+10}">${bars}</svg>
      </div>
    </div>
    <div class="summary-panel">
      <h3>ตารางสรุป</h3>
      <table class="rep-table">
        <thead><tr><th>${summaryDim==='customerType'?'ประเภทลูกค้า':'ช่วงเวลา'}</th><th>จำนวนงาน</th><th>จำนวนตัว</th><th>ยอดขาย (บาท)</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล</td></tr>'}</tbody>
        <tfoot><tr><td>รวม</td><td>${totalCount}</td><td>${totalQty.toLocaleString()}</td><td>${totalAmount.toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr></tfoot>
      </table>
    </div>
    ${crossTabHtml}
  `;
}

function renderProductTypeSummary(){
  // ===== เริ่มด้วย control header เดิม (period/dim select) =====
  const dimControlHtml = `
    <div class="summary-controls">
      <select class="filt" id="sumPeriod">
        <option value="month" ${summaryPeriod==='month'?'selected':''}>รายเดือน</option>
        <option value="quarter" ${summaryPeriod==='quarter'?'selected':''}>รายไตรมาส</option>
        <option value="year" ${summaryPeriod==='year'?'selected':''}>รายปี</option>
      </select>
      <select class="filt" id="sumDim">
        <option value="customerType" ${summaryDim==='customerType'?'selected':''}>จำแนกตามประเภทลูกค้า</option>
        <option value="period" ${summaryDim==='period'?'selected':''}>จำแนกตามช่วงเวลา</option>
        <option value="productType" ${summaryDim==='productType'?'selected':''}>จำแนกตามชนิดสินค้า</option>
        <option value="webNewProduct" ${summaryDim==='webNewProduct'?'selected':''}>🎯 เวปใหม่ — สินค้า × เดือน/ปี</option>
      </select>
    </div>
  `;
  // รวบรวมข้อมูลจาก productItems ของแต่ละงาน (กรองตามเดือน/ปีที่เลือก)
  const countable = jobs.filter(j=>j.countInSales!==false && j.productItems && j.productItems.length);
  const ptAvailBEYears = [...new Set(countable.map(j=>{
    const d = j.date ? new Date(j.date+"T00:00:00") : new Date(j.createdAt);
    return isNaN(d) ? null : toBE(d.getFullYear());
  }).filter(Boolean))].sort((a,b)=>a-b);
  const ptAvailMonths = [...new Set(countable.map(j=>{
    const d = j.date ? new Date(j.date+"T00:00:00") : new Date(j.createdAt);
    return isNaN(d) ? null : d.getMonth()+1;
  }).filter(Boolean))].sort((a,b)=>a-b);

  const matchPT = (j)=>{
    const d = j.date ? new Date(j.date+"T00:00:00") : new Date(j.createdAt);
    if(isNaN(d)) return false;
    if(summaryPTYearBE && toBE(d.getFullYear()) !== Number(summaryPTYearBE)) return false;
    if(summaryPTMonth && d.getMonth()+1 !== Number(summaryPTMonth)) return false;
    return true;
  };
  const filtered = countable.filter(matchPT);

  // สะสมจำนวนตัวตามชนิดสินค้า + ยอดขายตามสัดส่วน
  const ptGroups = {}; // {type: {qty, amount, jobs}}
  PRODUCT_TYPES.forEach(t=>{ ptGroups[t] = {qty:0, amount:0, jobs:0}; });
  filtered.forEach(j=>{
    const totalQty = j.productItems.reduce((s,p)=>s+(Number(p.qty)||0),0);
    const jobAmount = Number(j.salesAmount)||0;
    j.productItems.forEach(p=>{
      if(!p.type) return;
      const key = PRODUCT_TYPES.includes(p.type) ? p.type : 'อื่นๆ';
      if(!ptGroups[key]) ptGroups[key] = {qty:0, amount:0, jobs:0};
      ptGroups[key].qty += Number(p.qty)||0;
      // แบ่งยอดขายตามสัดส่วน qty ของสินค้านั้น
      ptGroups[key].amount += totalQty > 0 ? Math.round(jobAmount * (Number(p.qty)||0) / totalQty) : 0;
      ptGroups[key].jobs += 1;
    });
  });
  const keys = PRODUCT_TYPES.filter(k=>ptGroups[k] && ptGroups[k].qty>0);
  const totalQty = keys.reduce((s,k)=>s+ptGroups[k].qty,0);
  const totalAmt = keys.reduce((s,k)=>s+ptGroups[k].amount,0);
  const maxQty = Math.max(1,...keys.map(k=>ptGroups[k].qty));
  const barColors = ["#5B6B22","#9CC42C","#C8862B","#3E7A4D","#B7472A","#1B4F7A"];

  // กราฟแท่ง (จำนวนตัว)
  const barW=52, gap=22, chartH=220;
  const svgW = Math.max(400, keys.length*(barW+gap)+gap);
  const bars = keys.map((k,i)=>{
    const h = Math.round((ptGroups[k].qty/maxQty)*(chartH-40));
    const x = gap+i*(barW+gap), y = chartH-h-24;
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${barColors[i%barColors.length]}"></rect>
      <text x="${x+barW/2}" y="${chartH-8}" font-size="11" text-anchor="middle" fill="#6B6256" font-family="Sarabun">${escapeHtml(k)}</text>
      <text x="${x+barW/2}" y="${y-6}" font-size="10.5" text-anchor="middle" fill="#2B2520" font-family="Kanit" font-weight="700">${ptGroups[k].qty>=1000?(ptGroups[k].qty/1000).toFixed(1)+'k':ptGroups[k].qty}</text>
    `;
  }).join("");

  // ตาราง cross-tab: ชนิดสินค้า × เดือน (เฉพาะปีที่เลือก หรือทุกเดือน)
  const periodLabel = summaryPTYearBE ? `พ.ศ. ${summaryPTYearBE}` : 'ทุกปี';
  const monthFilteredJobs = summaryPTYearBE ? filtered : countable.filter(j=>!summaryPTMonth || (()=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return !isNaN(d)&&d.getMonth()+1===Number(summaryPTMonth); })());
  const crossMonths = summaryPTYearBE
    ? [...new Set(countable.filter(j=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return !isNaN(d)&&toBE(d.getFullYear())===Number(summaryPTYearBE); }).map(j=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return d.getMonth()+1; }))].sort((a,b)=>a-b)
    : [];

  let crossTabHtml = "";
  if(summaryPTYearBE && crossMonths.length){
    const mHeaders = crossMonths.map(m=>`<th>${TH_MONTH_ABBR[m-1]}</th>`).join("");
    const crossRows = PRODUCT_TYPES.map(pt=>{
      const cells = crossMonths.map(m=>{
        let qty=0;
        countable.filter(j=>{
          const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt);
          return !isNaN(d)&&toBE(d.getFullYear())===Number(summaryPTYearBE)&&d.getMonth()+1===m;
        }).forEach(j=>{ (j.productItems||[]).filter(p=>p.type===pt).forEach(p=>{ qty+=Number(p.qty)||0; }); });
        return `<td style="text-align:right;${qty?'':'color:#C9C2AE;'}">${qty?qty.toLocaleString():'-'}</td>`;
      }).join("");
      const rowTotal = crossMonths.reduce((s,m)=>{ let q=0; countable.filter(j=>{const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt);return !isNaN(d)&&toBE(d.getFullYear())===Number(summaryPTYearBE)&&d.getMonth()+1===m;}).forEach(j=>{(j.productItems||[]).filter(p=>p.type===pt).forEach(p=>{q+=Number(p.qty)||0;})}); return s+q; },0);
      return rowTotal>0 ? `<tr><td style="font-weight:600;">${escapeHtml(pt)}</td>${cells}<td style="text-align:right;font-weight:700;background:#EFEADA;">${rowTotal.toLocaleString()}</td></tr>` : '';
    }).join("");
    const colTotals = crossMonths.map(m=>{ let q=0; countable.filter(j=>{const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt);return !isNaN(d)&&toBE(d.getFullYear())===Number(summaryPTYearBE)&&d.getMonth()+1===m;}).forEach(j=>{(j.productItems||[]).forEach(p=>{q+=Number(p.qty)||0;})}); return `<td style="text-align:right;">${q.toLocaleString()}</td>`; }).join("");
    crossTabHtml = `
      <div class="summary-panel">
        <h3>ตารางจำนวนตัว — จำแนกตามชนิดสินค้า × เดือน (${periodLabel})</h3>
        <div class="chart-wrap">
          <table class="rep-table">
            <thead><tr><th>ชนิดสินค้า</th>${mHeaders}<th>รวม</th></tr></thead>
            <tbody>${crossRows||'<tr><td colspan="'+(crossMonths.length+2)+'" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล</td></tr>'}</tbody>
            <tfoot><tr><td>รวม</td>${colTotals}<td style="text-align:right;background:#EFEADA;">${totalQty.toLocaleString()}</td></tr></tfoot>
          </table>
        </div>
      </div>
    `;
  }

  const monthOptions = `<option value="">ทุกเดือน</option>`+TH_MONTH_ABBR.map((m,i)=>`<option value="${i+1}" ${Number(summaryPTMonth)===i+1?'selected':''}>${m}</option>`).join("");
  const yearOptions = `<option value="">ทุกปี</option>`+ptAvailBEYears.map(y=>`<option value="${y}" ${Number(summaryPTYearBE)===y?'selected':''}>พ.ศ. ${y}</option>`).join("");

  return dimControlHtml + `
    <div class="summary-panel" style="padding:14px 18px;">
      <h3 style="margin-bottom:8px;">📅 กรองตามเดือน/ปีที่ต้องการ</h3>
      <div class="summary-controls" style="margin-bottom:6px;">
        <select class="filt" id="sumPTMonth">${monthOptions}</select>
        <select class="filt" id="sumPTYear">${yearOptions}</select>
        ${(summaryPTMonth||summaryPTYearBE)?`<button class="btn ghost" id="sumPTClear" style="padding:6px 12px;font-size:12.5px;">✕ ล้างตัวกรอง</button>`:''}
      </div>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">⚠ ข้อมูลชนิดสินค้ามาจากงานที่กรอกรายการสินค้าไว้ในระบบ (ไม่รวมข้อมูลย้อนหลังที่นำเข้า)</p>
    </div>
    <div class="summary-row">
      <div class="summary-box"><div class="num">${filtered.length}</div><div class="lbl">จำนวนงาน</div></div>
      <div class="summary-box"><div class="num" style="color:var(--olive)">${totalQty.toLocaleString()}</div><div class="lbl">จำนวนตัวรวม</div></div>
      <div class="summary-box"><div class="num" style="color:var(--khaki-green)">${totalAmt.toLocaleString(undefined,{maximumFractionDigits:0})}</div><div class="lbl">ยอดขายรวม (ประมาณ)</div></div>
    </div>
    <div class="summary-panel">
      <h3>กราฟจำนวนตัวตามชนิดสินค้า</h3>
      <div class="chart-wrap">
        <svg width="${svgW}" height="${chartH+10}" viewBox="0 0 ${svgW} ${chartH+10}">${bars||'<text x="200" y="100" font-size="14" fill="#9B9382" text-anchor="middle">ยังไม่มีข้อมูลชนิดสินค้า</text>'}</svg>
      </div>
    </div>
    <div class="summary-panel">
      <h3>ตารางสรุปตามชนิดสินค้า</h3>
      <table class="rep-table">
        <thead><tr><th>ชนิดสินค้า</th><th>จำนวนตัว</th><th>สัดส่วน%</th><th>ยอดขาย (ประมาณ)</th></tr></thead>
        <tbody>${keys.length ? keys.map(k=>`
          <tr>
            <td>${escapeHtml(k)}</td>
            <td style="text-align:right;">${ptGroups[k].qty.toLocaleString()}</td>
            <td style="text-align:right;">${totalQty?Math.round(ptGroups[k].qty/totalQty*1000)/10:0}%</td>
            <td style="text-align:right;">${ptGroups[k].amount.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
          </tr>`).join("") : '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูลชนิดสินค้า — กรอกรายการสินค้าตอนสร้างงานเพื่อให้ปรากฏที่นี่</td></tr>'}</tbody>
        <tfoot><tr><td>รวม</td><td style="text-align:right;">${totalQty.toLocaleString()}</td><td style="text-align:right;">100%</td><td style="text-align:right;">${totalAmt.toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr></tfoot>
      </table>
    </div>
    ${crossTabHtml}
  `;
}

// ข้อ 3: รายงานเฉพาะลูกค้าเวปใหม่ — สินค้า × เดือน/ปี
let wnMonth = '', wnYearBE = '';
function renderWebNewProductSummary(){
  const wnDimCtrl = `
    <div class="summary-controls">
      <select class="filt" id="sumPeriod">
        <option value="month" ${summaryPeriod==='month'?'selected':''}>รายเดือน</option>
        <option value="quarter" ${summaryPeriod==='quarter'?'selected':''}>รายไตรมาส</option>
        <option value="year" ${summaryPeriod==='year'?'selected':''}>รายปี</option>
      </select>
      <select class="filt" id="sumDim">
        <option value="customerType">จำแนกตามประเภทลูกค้า</option>
        <option value="period">จำแนกตามช่วงเวลา</option>
        <option value="productType">จำแนกตามชนิดสินค้า</option>
        <option value="webNewProduct" selected>🎯 เวปใหม่ — สินค้า × เดือน/ปี</option>
      </select>
    </div>
  `;

  const wnJobs = jobs.filter(j=>j.countInSales!==false && j.customerType==='เวปใหม่' && j.productItems && j.productItems.length);

  // ปีและเดือนที่มีข้อมูล
  const wnYears = [...new Set(wnJobs.map(j=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return isNaN(d)?null:toBE(d.getFullYear()); }).filter(Boolean))].sort((a,b)=>a-b);
  const wnMonths = [...new Set(wnJobs.map(j=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return isNaN(d)?null:d.getMonth()+1; }).filter(Boolean))].sort((a,b)=>a-b);

  const filtered = wnJobs.filter(j=>{
    const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt);
    if(isNaN(d)) return false;
    if(wnYearBE && toBE(d.getFullYear())!==Number(wnYearBE)) return false;
    if(wnMonth && d.getMonth()+1!==Number(wnMonth)) return false;
    return true;
  });

  // สะสมจำนวนตัว+ยอดขายตามชนิดสินค้า
  const ptMap = {};
  PRODUCT_TYPES.forEach(t=>{ ptMap[t]={qty:0,amount:0}; });
  filtered.forEach(j=>{
    const tot = j.productItems.reduce((s,p)=>s+(Number(p.qty)||0),0);
    const amt = Number(j.salesAmount)||0;
    j.productItems.forEach(p=>{
      if(!p.type) return;
      const k = PRODUCT_TYPES.includes(p.type)?p.type:'อื่นๆ';
      if(!ptMap[k]) ptMap[k]={qty:0,amount:0};
      ptMap[k].qty += Number(p.qty)||0;
      ptMap[k].amount += tot>0?Math.round(amt*(Number(p.qty)||0)/tot):0;
    });
  });
  const ptKeys = PRODUCT_TYPES.filter(k=>ptMap[k]&&ptMap[k].qty>0);
  const totalQty = ptKeys.reduce((s,k)=>s+ptMap[k].qty,0);
  const totalAmt = ptKeys.reduce((s,k)=>s+ptMap[k].amount,0);
  const maxQty = Math.max(1,...ptKeys.map(k=>ptMap[k].qty));
  const barColors=["#5B6B22","#9CC42C","#C8862B","#3E7A4D","#B7472A","#1B4F7A"];
  const barW=52,gap=22,chartH=200;
  const svgW=Math.max(380,ptKeys.length*(barW+gap)+gap);
  const bars=ptKeys.map((k,i)=>{
    const h=Math.round((ptMap[k].qty/maxQty)*(chartH-36));
    const x=gap+i*(barW+gap),y=chartH-h-22;
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${barColors[i%barColors.length]}"></rect>
    <text x="${x+barW/2}" y="${chartH-6}" font-size="11" text-anchor="middle" fill="#6B6256" font-family="Sarabun">${escapeHtml(k)}</text>
    <text x="${x+barW/2}" y="${y-5}" font-size="10" text-anchor="middle" fill="#2B2520" font-family="Kanit" font-weight="700">${ptMap[k].qty>=1000?(ptMap[k].qty/1000).toFixed(1)+'k':ptMap[k].qty}</text>`;
  }).join('');

  // ตาราง Cross-tab: ชนิดสินค้า × เดือน (ถ้าเลือกปี)
  let crossTabHtml='';
  if(wnYearBE){
    const mList=[...new Set(wnJobs.filter(j=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return !isNaN(d)&&toBE(d.getFullYear())===Number(wnYearBE); }).map(j=>{ const d=new Date(j.date+"T00:00:00"); return d.getMonth()+1; }))].sort((a,b)=>a-b);
    if(mList.length){
      const mHeaders=mList.map(m=>`<th>${TH_MONTH_ABBR[m-1]}</th>`).join('');
      const ptRows=PRODUCT_TYPES.map(pt=>{
        const cells=mList.map(m=>{
          let q=0;
          wnJobs.filter(j=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return !isNaN(d)&&toBE(d.getFullYear())===Number(wnYearBE)&&d.getMonth()+1===m; })
            .forEach(j=>{ (j.productItems||[]).filter(p=>p.type===pt).forEach(p=>{ q+=Number(p.qty)||0; }); });
          return `<td>${q?q.toLocaleString():'-'}</td>`;
        }).join('');
        const rTotal=mList.reduce((s,m)=>{ let q=0; wnJobs.filter(j=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return !isNaN(d)&&toBE(d.getFullYear())===Number(wnYearBE)&&d.getMonth()+1===m; }).forEach(j=>{ (j.productItems||[]).filter(p=>p.type===pt).forEach(p=>{ q+=Number(p.qty)||0; }); }); return s+q; },0);
        return rTotal>0?`<tr><td style="font-weight:600;">${escapeHtml(pt)}</td>${cells}<td style="font-weight:700;background:#EFEADA;">${rTotal.toLocaleString()}</td></tr>`:'';
      }).join('');
      const colTotals=mList.map(m=>{ let q=0; wnJobs.filter(j=>{ const d=j.date?new Date(j.date+"T00:00:00"):new Date(j.createdAt); return !isNaN(d)&&toBE(d.getFullYear())===Number(wnYearBE)&&d.getMonth()+1===m; }).forEach(j=>{ (j.productItems||[]).forEach(p=>{ q+=Number(p.qty)||0; }); }); return `<td>${q.toLocaleString()}</td>`; }).join('');
      crossTabHtml=`<div class="summary-panel"><h3>ตารางจำนวนตัว — เวปใหม่ ชนิดสินค้า × เดือน พ.ศ. ${wnYearBE}</h3><div class="chart-wrap"><table class="rep-table"><thead><tr><th>ชนิดสินค้า</th>${mHeaders}<th>รวม</th></tr></thead><tbody>${ptRows||'<tr><td colspan="'+(mList.length+2)+'">ยังไม่มีข้อมูล</td></tr>'}</tbody><tfoot><tr><td>รวม</td>${colTotals}<td style="background:#EFEADA;">${totalQty.toLocaleString()}</td></tr></tfoot></table></div></div>`;
    }
  }

  const yOpts=`<option value="">ทุกปี</option>`+wnYears.map(y=>`<option value="${y}" ${Number(wnYearBE)===y?'selected':''}>พ.ศ. ${y}</option>`).join('');
  const mOpts=`<option value="">ทุกเดือน</option>`+TH_MONTH_ABBR.map((m,i)=>`<option value="${i+1}" ${Number(wnMonth)===i+1?'selected':''}>${m}</option>`).join('');

  return wnDimCtrl+`
    <div class="summary-panel" style="padding:14px 18px;">
      <h3 style="margin-bottom:8px;">🎯 รายงานสินค้าลูกค้าเวปใหม่ — เลือกปี/เดือนที่ต้องการ</h3>
      <div class="summary-controls" style="margin-bottom:6px;">
        <select class="filt" id="wnYear">${yOpts}</select>
        <select class="filt" id="wnMonth">${mOpts}</select>
        ${(wnYearBE||wnMonth)?`<button class="btn ghost" id="wnClear" style="padding:6px 12px;font-size:12.5px;">✕ ล้างตัวกรอง</button>`:''}
      </div>
    </div>
    <div class="summary-row">
      <div class="summary-box"><div class="num">${filtered.length}</div><div class="lbl">จำนวนงาน (เวปใหม่)</div></div>
      <div class="summary-box"><div class="num" style="color:var(--olive)">${totalQty.toLocaleString()}</div><div class="lbl">จำนวนตัวรวม</div></div>
      <div class="summary-box"><div class="num" style="color:var(--khaki-green)">${totalAmt.toLocaleString(undefined,{maximumFractionDigits:0})}</div><div class="lbl">ยอดขายรวม</div></div>
    </div>
    <div class="summary-panel">
      <h3>กราฟจำนวนตัวตามชนิดสินค้า — เวปใหม่</h3>
      <div class="chart-wrap"><svg width="${svgW}" height="${chartH+10}" viewBox="0 0 ${svgW} ${chartH+10}">${bars||'<text x="200" y="100" font-size="14" fill="#9B9382" text-anchor="middle">ยังไม่มีข้อมูลชนิดสินค้า</text>'}</svg></div>
    </div>
    <div class="summary-panel">
      <h3>ตารางสรุปสินค้า — เวปใหม่</h3>
      <table class="rep-table">
        <thead><tr><th>ชนิดสินค้า</th><th>จำนวนตัว</th><th>สัดส่วน%</th><th>ยอดขาย (ประมาณ)</th></tr></thead>
        <tbody>${ptKeys.length?ptKeys.map(k=>`<tr><td>${escapeHtml(k)}</td><td>${ptMap[k].qty.toLocaleString()}</td><td>${totalQty?Math.round(ptMap[k].qty/totalQty*1000)/10:0}%</td><td>${ptMap[k].amount.toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr>`).join(''):'<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);">ยังไม่มีข้อมูล — กรอกชนิดสินค้าในฟอร์มสร้างงาน</td></tr>'}</tbody>
        <tfoot><tr><td>รวม</td><td>${totalQty.toLocaleString()}</td><td>100%</td><td>${totalAmt.toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr></tfoot>
      </table>
    </div>
    ${crossTabHtml}
  `;
}

function bindSummaryControls(){
  const p = $("sumPeriod"), d = $("sumDim"), clr = $("sumClearPick"), cu = $("sumCompareUnit");
  const ctm = $("sumCTMonth"), cty = $("sumCTYear"), ctClr = $("sumCTClear");
  const modeAY = $("sumModeAcrossYears"), modeSY = $("sumModeSameYear"), sameYearSel = $("sumSameYear");
  if(p) p.onchange = ()=>{ summaryPeriod = p.value; summarySelectedPeriods = []; summaryCompareUnit = ''; summarySelectedYearsBE = []; summarySameYearBE = ''; renderList(); };
  if(d) d.onchange = ()=>{ summaryDim = d.value; renderList(); };
  const ptm = $("sumPTMonth"), pty = $("sumPTYear"), ptClr = $("sumPTClear");
  if(ptm) ptm.onchange = ()=>{ summaryPTMonth = ptm.value; renderList(); };
  if(pty) pty.onchange = ()=>{ summaryPTYearBE = pty.value; renderList(); };
  if(ptClr) ptClr.onclick = ()=>{ summaryPTMonth=''; summaryPTYearBE=''; renderList(); };
  const wny = $("wnYear"), wnm = $("wnMonth"), wnClr = $("wnClear");
  if(wny) wny.onchange = ()=>{ wnYearBE = wny.value; renderList(); };
  if(wnm) wnm.onchange = ()=>{ wnMonth = wnm.value; renderList(); };
  if(wnClr) wnClr.onclick = ()=>{ wnYearBE=''; wnMonth=''; renderList(); };
  if(cu) cu.onchange = ()=>{ summaryCompareUnit = cu.value; summarySelectedYearsBE = []; renderList(); };
  if(clr) clr.onclick = ()=>{ summarySelectedPeriods = []; summarySelectedYearsBE = []; renderList(); };
  if(ctm) ctm.onchange = ()=>{ summaryCTMonth = ctm.value; renderList(); };
  if(cty) cty.onchange = ()=>{ summaryCTYearBE = cty.value; renderList(); };
  if(ctClr) ctClr.onclick = ()=>{ summaryCTMonth = ''; summaryCTYearBE = ''; renderList(); };
  if(modeAY) modeAY.onclick = ()=>{ summaryCompareMode = 'acrossYears'; summarySelectedPeriods = []; summarySameYearBE = ''; renderList(); };
  if(modeSY) modeSY.onclick = ()=>{ summaryCompareMode = 'sameYear'; summarySelectedYearsBE = []; summaryCompareUnit = ''; renderList(); };
  if(sameYearSel) sameYearSel.onchange = ()=>{ summarySameYearBE = sameYearSel.value; summarySelectedPeriods = []; renderList(); };
  document.querySelectorAll('[data-periodpick]').forEach(cb=>{
    cb.onchange = ()=>{
      const key = cb.dataset.periodpick;
      if(cb.checked){
        if(summarySelectedPeriods.length >= 5){
          alert("เลือกเปรียบเทียบได้สูงสุด 5 รายการเท่านั้น");
          cb.checked = false;
          return;
        }
        summarySelectedPeriods.push(key);
      }else{
        summarySelectedPeriods = summarySelectedPeriods.filter(k=>k!==key);
      }
      renderList();
    };
  });
  document.querySelectorAll('[data-yearpick]').forEach(cb=>{
    cb.onchange = ()=>{
      const y = cb.dataset.yearpick;
      if(cb.checked){
        if(summarySelectedYearsBE.length >= 5){
          alert("เลือกเปรียบเทียบได้สูงสุด 5 รายการเท่านั้น");
          cb.checked = false;
          return;
        }
        summarySelectedYearsBE.push(y);
      }else{
        summarySelectedYearsBE = summarySelectedYearsBE.filter(x=>x!==y);
      }
      renderList();
    };
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function escapeAttr(s){ return escapeHtml(s); }

function bindTicketEvents(){
  document.querySelectorAll('[data-edit]').forEach(b=>{ b.onclick = async()=>openModal(b.dataset.edit); });
  document.querySelectorAll('[data-del]').forEach(b=>{ b.onclick = ()=>deleteJob(b.dataset.del); });
  document.querySelectorAll('[data-cancel]').forEach(b=>{ b.onclick = ()=>cancelJob(b.dataset.cancel); });
  document.querySelectorAll('[data-uncancel]').forEach(b=>{ b.onclick = ()=>uncancelJob(b.dataset.uncancel); });
  document.querySelectorAll('[data-requeue]').forEach(b=>{ b.onclick = ()=>reQueueEmailReminder(b.dataset.requeue); });
  document.querySelectorAll('[data-status]').forEach(inp=>{
    inp.onchange = async ()=>{
      const j = jobs.find(x=>x.id===inp.dataset.status);
      if(j){ j.status = inp.value; await saveJobs(); toast("อัพเดตสถานะแล้ว"); }
    };
  });
  document.querySelectorAll('.step, .pchip[data-stage]').forEach(stepEl=>{
    stepEl.onclick = (e)=>handleStageClick(e, stepEl);
  });
}

function closePopover(){
  if(openPopover){ openPopover.remove(); openPopover=null; }
}

function handleStageClick(e, stepEl){
  closePopover();
  const jobId = stepEl.dataset.job;
  const stageKey = stepEl.dataset.stage;
  const job = jobs.find(j=>j.id===jobId);
  const stageDef = STAGES.find(s=>s.key===stageKey);
  const st = job.stages[stageKey];

  const pop = document.createElement('div');
  pop.className = 'assign-pop';
  const rect = stepEl.getBoundingClientRect();
  pop.style.top = (window.scrollY + rect.bottom + 6) + "px";
  let left = rect.left;
  if(left + 170 > window.innerWidth) left = window.innerWidth - 180;
  pop.style.left = left + "px";

  pop.innerHTML = `
    <div class="ap-title">${stageDef.label} — เลือกผู้ทำ</div>
    ${getActiveStaffNames().map(p=>`<button data-person="${p}">${st.done && st.by===p ? '✓ ' : ''}${p}</button>`).join("")}
    ${st.done ? `<button class="undo" data-undo="1">↺ ยกเลิกสถานะนี้</button>` : ''}
  `;
  document.body.appendChild(pop);
  openPopover = pop;

  pop.querySelectorAll('[data-person]').forEach(btn=>{
    btn.onclick = async ()=>{
      st.done = true;
      st.by = btn.dataset.person;
      st.at = Date.now();
      // ข้อ 1: เมื่อสถานะ "สรุปส่งออกออเดอร์" ถูกทำเครื่องหมายเสร็จ
      // ให้ถือว่าส่งอีเมลออกออเดอร์แล้ว (เพราะเป็นขั้นตอนเดียวกัน)
      if(stageKey === 'summary' && job.emailSent === false){
        job.emailSent = true;
        job.emailReminder = null;
        // ปิดป๊อปอัพเตือนส่งอีเมล ถ้ากำลังเปิดอยู่สำหรับงานนี้
        if(pendingEmailJobId === job.id) closeEmailReminder();
        // ถอดออกจากคิวถ้ายังรออยู่
        emailQueue = emailQueue.filter(id=>id !== job.id);
      }
      maybeConvertSampleToReal(job);
      maybeClearAwaitingRealOrder(job);
      closePopover();
      render();
      await saveJobs();
      toast(`บันทึก "${stageDef.label}" โดย ${btn.dataset.person}`);
    };
  });
  const undoBtn = pop.querySelector('[data-undo]');
  if(undoBtn){
    undoBtn.onclick = async ()=>{
      st.done=false; st.by=""; st.at=null;
      closePopover();
      render();
      await saveJobs();
      toast(`ยกเลิกสถานะ "${stageDef.label}"`);
    };
  }
  e.stopPropagation();
}
document.addEventListener('click', (e)=>{
  if(openPopover && !openPopover.contains(e.target) && !e.target.closest('.step')){
    closePopover();
  }
});

async function cancelJob(id){
  const j = jobs.find(x=>x.id===id);
  if(!j) return;
  if(!confirm(`ยืนยันยกเลิกงาน "${j.job||'ไม่มีชื่องาน'}" ใช่หรือไม่?`)) return;
  j.cancelled = true;
  j.cancelledAt = Date.now();
  await saveJobs();
  render();
  toast("ยกเลิกงานแล้ว");
}
async function uncancelJob(id){
  const j = jobs.find(x=>x.id===id);
  if(!j) return;
  j.cancelled = false;
  j.cancelledAt = null;
  await saveJobs();
  render();
  toast("ยกเลิกการยกเลิกงานแล้ว");
}

async function deleteJob(id){
  const j = jobs.find(x=>x.id===id);
  if(!j) return;

  // ข้อ 1: ถ้าไม่ใช่ manager ต้องส่งคำขอลบ
  if(currentUser?.role !== 'manager'){
    if(!confirm(`ขอส่งคำขออนุมัติลบงาน "${j.job||'ไม่มีชื่องาน'}" ให้ Manager ใช่หรือไม่?`)) return;
    j.pendingDelete = true;
    j.pendingDeleteBy = currentUser.name;
    j.pendingDeleteAt = Date.now();
    await saveSingleJob(id);
    render();
    toast("📨 ส่งคำขออนุมัติลบให้ Manager แล้วค่ะ");
    return;
  }

  // Manager ลบได้เลย
  if(!confirm(`ลบงาน "${j.job||'ไม่มีชื่องาน'}" ใช่หรือไม่?`)) return;
  jobs = jobs.filter(x=>x.id!==id);
  await deleteJobFromDB(id);
  render();
  toast("ลบงานแล้ว");
}

// Manager อนุมัติหรือปฏิเสธคำขอลบ
async function approveDelete(id){
  const j = jobs.find(x=>x.id===id);
  if(!j) return;
  if(!confirm(`อนุมัติลบงาน "${j.job||'ไม่มีชื่องาน'}" (ขอโดย ${j.pendingDeleteBy||'?'}) ใช่หรือไม่?`)) return;
  jobs = jobs.filter(x=>x.id!==id);
  await deleteJobFromDB(id);
  render();
  toast("อนุมัติและลบงานแล้ว");
}
async function rejectDelete(id){
  const j = jobs.find(x=>x.id===id);
  if(!j) return;
  j.pendingDelete = false; j.pendingDeleteBy = null; j.pendingDeleteAt = null;
  await saveSingleJob(id);
  render();
  toast("ปฏิเสธคำขอลบแล้ว");
}

// ข้อ 3: เตือนส่งอีเมลออกออเดอร์ใหม่
async function reQueueEmailReminder(id){
  const j = jobs.find(x=>x.id===id);
  if(!j) return;
  j.emailSent = false;
  await saveSingleJob(id);
  if(!emailQueue.includes(id)) emailQueue.push(id);
  render();
  toast("🔔 ตั้งเตือนส่งอีเมลใหม่แล้วค่ะ");
  showNextEmailReminder();
}


async function openModal(id){
  editingId = id || null;
  _editingVersion = null;
  $("modalTitle").textContent = id ? "แก้ไขงาน" : "เพิ่มงานใหม่";
  populateJobLeadSelect();
  if(id){
    const j = jobs.find(x=>x.id===id);
    // บันทึก version สำหรับ conflict detection
    _editingVersion = j?._v || 1;
    // ขอ lock (ถ้าใช้ Supabase)
    if(_useSupabase){
      const lockResult = await acquireLock(id);
      if(!lockResult.ok){
        if(!confirm(`⚠ ${lockResult.lockedBy} กำลังแก้ไขงานนี้อยู่\nต้องการเปิดดูแบบ read-only หรือยกเลิก?\nกด OK เพื่อเปิด (อาจมีข้อมูลชนกัน)`)){
          return;
        }
      }
    }
    $("f_seller").value = j.seller;
    if($("f_manager")) $("f_manager").value = j.manager || j.seller || "";
    $("f_date").value = j.date || "";
    $("f_quote").value = j.quote || "";
    $("f_jobname").value = j.job || "";
    $("f_detail").value = j.detail || "";
    $("f_type").value = j.type || "ตัวอย่าง";
    $("f_status").value = j.status || "";
    $("f_deliveryDate").value = j.deliveryDate || "";
    $("f_salesAmount").value = j.salesAmount || "";
    $("f_qty").value = j.qty || "";
    renderProductRows(j.productItems || []);
    $("f_customerType").value = j.customerType || CUSTOMER_TYPES[0];
    $("f_countInSales").checked = j.countInSales !== false;
    $("f_leadId").value = j.leadId || "";
    setLeadField(j.leadId || "");
  }else{
    $("f_seller").value = SELLERS[0];
    if($("f_manager")){ const defMgr = (currentUser?.role==="manager" ? currentUser.name : (users.find(u=>u.role==="manager"&&u.active!==false)||{}).name) || DEFAULT_MANAGERS[0]; $("f_manager").value = defMgr; }
    $("f_date").value = new Date().toISOString().slice(0,10);
    $("f_quote").value = "";
    $("f_jobname").value = "";
    $("f_detail").value = "";
    $("f_type").value = "ตัวอย่าง";
    $("f_status").value = "";
    $("f_deliveryDate").value = "";
    $("f_salesAmount").value = "";
    $("f_qty").value = "";
    renderProductRows([]);
    $("f_customerType").value = CUSTOMER_TYPES[0];
    $("f_countInSales").checked = true;
    $("f_leadId").value = "";
    setLeadField("");
  }
  $("modalOverlay").classList.add("open");
}
function closeModal(){
  $("modalOverlay").classList.remove("open");
  if(editingId && _useSupabase) releaseLock(editingId);
  editingId = null;
  _editingVersion = null;
}

// ===== ดึงข้อมูลจากลิงค์ใบเสนอราคา sahawath.net =====
// ข้อ 1: ดึงข้อมูลจากไฟล์ JPEG/PNG/PDF/Word/Excel
async function fetchQuoteFromFile(){
  const file = $("f_quoteFile").files[0];
  if(!file) return;
  const statusEl = $("fetchQuoteStatus");
  const btn = $("fetchQuoteFileBtn");
  btn.disabled = true; btn.textContent = "⏳ กำลังอ่าน...";
  statusEl.innerHTML = '<span class="fetch-loading">📸 กำลังบีบอัดรูป...</span>';

  try {
    const ext = file.name.split('.').pop().toLowerCase();
    const isImage = ['jpg','jpeg','png','webp'].includes(ext);
    const isPDF = ext==='pdf';

    // ── compress รูปก่อนส่ง (ลด size ให้ API รับได้) ──────────────
    const compressImage = (file) => new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1200; // max width/height
        const ratio = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1);
        const w = Math.round(img.naturalWidth * ratio);
        const h = Math.round(img.naturalHeight * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const b64 = canvas.toDataURL('image/jpeg', 0.80).split(',')[1];
        console.log(`Image compressed: ${img.naturalWidth}x${img.naturalHeight} → ${w}x${h}, ~${Math.round(b64.length/1024)}KB`);
        resolve(b64);
      };
      img.onerror = reject;
      img.src = url;
    });

    const toBase64 = (f) => new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

    let messages;
    const prompt = `Please read all text from this Thai quotation document and list what you see:
- Quote number (เลขที่, starts with QT)
- Customer/company name (นามผู้สั่งซื้อ)  
- Job/project name (ชื่องาน/ชื่อชุดงาน)
- Products with quantities
- Amount before VAT (ก่อนภาษี)

Just output the raw text you can read, no formatting needed.`;

    if(isImage){
      statusEl.innerHTML = '<span class="fetch-loading">🗜 compress รูป...</span>';
      const b64 = await compressImage(file);
      messages = [{ role:"user", content:[
        { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:b64 } },
        { type:"text", text: prompt }
      ]}];
    } else if(isPDF){
      const b64 = await toBase64(file);
      messages = [{ role:"user", content:[
        { type:"document", source:{ type:"base64", media_type:"application/pdf", data:b64 } },
        { type:"text", text: prompt }
      ]}];
    } else {
      statusEl.innerHTML = '<span class="fetch-err">⚠ รองรับเฉพาะ JPEG/PNG และ PDF ค่ะ</span>';
      btn.disabled=false; btn.textContent="🔍 ดึงจากไฟล์"; return;
    }

    statusEl.innerHTML = '<span class="fetch-loading">🤖 AI กำลังอ่านใบเสนอราคา...</span>';
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1024, messages })
    });

    if(!resp.ok){
      const errText = await resp.text();
      throw new Error(`API ${resp.status}: ${errText.slice(0,150)}`);
    }
    const data = await resp.json();
    if(data.error) throw new Error(data.error.message);

    const extractedText = (data.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('\n');
    if(!extractedText) throw new Error("AI ไม่ส่งข้อมูลกลับ");

    console.log("Extracted text:", extractedText);
    statusEl.innerHTML = '<span class="fetch-loading">🔍 parse ข้อมูล...</span>';
    const info = parseQuoteText(extractedText);
    applyQuoteInfo(info, statusEl);

  } catch(e) {
    console.error("fetchQuoteFromFile error:", e);
    statusEl.innerHTML = `<span class="fetch-err">⚠ ${escapeHtml(e.message)}<br><small>ลองวิธี 📋 copy-paste แทนได้ค่ะ</small></span>`;
  } finally {
    btn.disabled = false; btn.textContent = "🔍 ดึงจากไฟล์";
  }
}


// Helper: apply parsed quote info to form fields
function applyQuoteInfo(info, statusEl){
  const matchProductType = (name)=>{
    if(!name) return "";
    if(/โปโล/i.test(name)) return "เสื้อโปโล";
    if(/ยืด|t.shirt|tshirt/i.test(name)) return "เสื้อยืด";
    if(/นักเรียน/i.test(name)) return "ชุดนักเรียน";
    if(/ช็อป|ทีม|uniform/i.test(name)) return "ชุดช็อป";
    if(/กันเปื้อน|ผ้ากัน/i.test(name)) return "ผ้ากันเปื้อน";
    if(/หมวก|cap/i.test(name)) return "หมวก";
    return "";
  };
  let filled = [];
  if(info.quoteNumber && info.quoteNumber !== 'null'){ $("f_quote").value = info.quoteNumber; filled.push("เลขใบเสนอราคา"); }
  if(info.customerName && info.customerName !== 'null'){ if(!$("f_jobname").value) $("f_jobname").value = info.customerName; filled.push("ชื่อลูกค้า"); }
  if(info.salesAmountBeforeVat > 0){ $("f_salesAmount").value = info.salesAmountBeforeVat; filled.push("ยอดขาย"); }
  if(info.productItems && info.productItems.length){
    const rows = info.productItems.map(p=>({ type:matchProductType(p.type), qty:Number(p.qty)||0 })).filter(p=>p.qty>0);
    if(rows.length){ renderProductRows(rows); filled.push(`สินค้า ${rows.length} รายการ`); }
  } else if(info.totalQty > 0){ $("f_qty").value = info.totalQty; filled.push(`จำนวน ${info.totalQty} ตัว`); }
  if(statusEl) statusEl.innerHTML = filled.length
    ? `<span class="fetch-ok">✓ ดึงข้อมูลสำเร็จ: ${filled.join(" · ")}</span>`
    : `<span class="fetch-err">⚠ ไม่พบข้อมูลที่ต้องการในไฟล์ กรุณากรอกเพิ่มเติมเองค่ะ</span>`;
}

// ── ดึงข้อมูลจากลิงค์ (CORS proxy chain) ──────────────────────────
async function fetchQuoteData(){
  const urlInput = (($("f_quoteUrl")||{}).value||"").trim();
  const statusEl = $("fetchQuoteStatus");
  if(!urlInput){ statusEl.innerHTML='<span class="fetch-err">กรุณากรอกลิงค์ก่อนค่ะ</span>'; return; }
  const btn=$("fetchQuoteBtn"); btn.disabled=true; btn.textContent="⏳";
  const log=(msg,cls="fetch-loading")=>{ statusEl.innerHTML=`<span class="${cls}">${msg}</span>`; };

  log("📡 กำลังโหลด...");
  let html = "";
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlInput)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), 12000);
    const resp = await fetch(proxyUrl, { signal: ctrl.signal });
    clearTimeout(timer);
    if(resp.ok){
      const json = await resp.json();
      if(json && json.contents && json.contents.length > 200) html = json.contents;
    }
  } catch(e){ console.log("proxy:", e.message); }

  if(html){
    log("🔍 parse...");
    const result = parseSahawathHTML(html);
    if(result.quoteNumber || result.totalQty || result.salesAmountBeforeVat){
      let filled = [];
      if(result.quoteNumber){ $("f_quote").value=result.quoteNumber; filled.push("เลขที่ "+result.quoteNumber); }
      if(result.totalQty){ $("f_qty").value=result.totalQty; filled.push("จำนวน "+result.totalQty+" ตัว"); }
      if(result.salesAmountBeforeVat){ $("f_salesAmount").value=result.salesAmountBeforeVat; filled.push(""+result.salesAmountBeforeVat.toLocaleString()); }
      statusEl.innerHTML=`<span class="fetch-ok">✓ ดึงข้อมูลสำเร็จ: ${filled.join(" · ")}</span>`;
      btn.disabled=false; btn.textContent="🔍 ดึง"; return;
    }
  }

  // CORS block ทุกทาง → ใช้ sendPrompt ให้ AI ช่วยดึงในแชท
  btn.disabled=false; btn.textContent="🔍 ดึง";
  statusEl.innerHTML = `
    <div style="background:#EBF4FE;border:1px solid #AED6F1;border-radius:8px;padding:10px 12px;margin-top:4px;">
      <div style="font-size:12.5px;font-weight:700;color:#1A5276;margin-bottom:6px;">📤 ให้ AI ช่วยดึง (2 ขั้นตอน)</div>
      <div style="font-size:12px;color:var(--ink-soft);margin-bottom:8px;line-height:1.7;">
        1. กดปุ่มด้านล่าง → AI จะตอบข้อมูลในแชท<br>
        2. Copy คำตอบ AI → วางในช่อง 📋 copy-paste ด้านบน → กดปุ่มสีเขียว
      </div>
      <button class="btn primary" style="padding:8px 16px;font-size:13px;" onclick="
        if(typeof sendPrompt==='function'){
          sendPrompt('ดึงข้อมูลจากใบเสนอราคานี้ให้หน่อยค่ะ: ${urlInput.replace(/'/g,'\\u0027')} — ตอบแค่นี้พอ:\\nQT: [เลขที่]\\nจำนวน: [X ตัว]\\nยอดก่อนแวท (ไม่รวมค่าส่ง): [X บาท]');
          this.textContent='✓ ส่งแล้ว — ดูคำตอบ AI ด้านบน แล้ว copy มาวางในช่อง 📋';
          this.disabled=true; this.style.background='#5B6B22';
        } else { alert('ฟีเจอร์นี้ใช้ได้เฉพาะใน Claude.ai ค่ะ'); }
      ">📤 ให้ AI ดึงข้อมูลให้</button>
    </div>`;
}

function parseSahawathHTML(html){
  // 1. QT number จาก <title>
  const qtM = html.match(/<title>\s*(QT\d{6,10})\s*<\/title>/i) || html.match(/\bQT\d{6,10}\b/i);
  const quoteNumber = qtM ? (qtM[1]||qtM[0]).trim().toUpperCase() : "";

  const text = html.replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ");

  // 2. จำนวนรวม = ตัวเลขแรกที่ตามด้วย "ตัว"
  const qtyM = text.match(/(\d+)\s*ตัว/);
  const totalQty = qtyM ? parseInt(qtyM[1]) : 0;

  // 3. ยอดก่อน Vat
  let beforeVat = 0;
  const vatM = text.match(/ยอดก่อน\s*Vat\s+([\d,]+\.?\d*)/i);
  if(vatM) beforeVat = parseFloat(vatM[1].replace(/,/g,""));

  // หัก ค่าส่ง
  let shipping = 0;
  const shipM = text.match(/ค่าบริการจัดส่ง\s+([\d,]+\.?\d*)/i) || text.match(/ค่าจัดส่ง\s+([\d,]+\.?\d*)/i);
  if(shipM) shipping = parseFloat(shipM[1].replace(/,/g,""));

  const salesAmountBeforeVat = beforeVat > 0 ? Math.round((beforeVat-shipping)*100)/100 : 0;
  return { quoteNumber, totalQty, salesAmountBeforeVat, productItems:[] };
}

function applyQuickFill(){
  const qt  = ($("qf_qt")||{}).value||"";
  const qty = parseInt(($("qf_qty")||{}).value||"0")||0;
  const amt = parseFloat(($("qf_amt")||{}).value||"0")||0;
  let filled = [];
  if(qt){ $("f_quote").value=qt.trim(); filled.push("เลขที่ "+qt.trim()); }
  if(qty){ $("f_qty").value=qty; filled.push("จำนวน "+qty+" ตัว"); }
  if(amt){ $("f_salesAmount").value=amt; filled.push(""+amt.toLocaleString()); }
  $("fetchQuoteStatus").innerHTML = filled.length
    ? `<span class="fetch-ok">✓ กรอกแล้ว: ${filled.join(" · ")}</span>`
    : `<span class="fetch-err">⚠ กรอกข้อมูลก่อนกดยืนยันค่ะ</span>`;
}


function parsePastedContent(){
  const text = ($("f_pasteContent")||{}).value||"";
  const statusEl = $("fetchQuoteStatus");
  if(!text.trim()){
    statusEl.innerHTML='<span class="fetch-err">กรุณาวาง copy-paste เนื้อหาจากหน้าใบเสนอราคาก่อนค่ะ</span>';
    return;
  }
  const info = parseQuoteText(text);
  const filled = applyQuoteInfo(info, statusEl);
  if(!info.quoteNumber && !info.customerName && !info.salesAmountBeforeVat){
    statusEl.innerHTML='<span class="fetch-err">⚠ หาข้อมูลไม่เจอใน text ที่วาง — ลองตรวจสอบว่า copy ถูกหน้าหรือเปล่าค่ะ</span>';
  }
}

// placeholder — ไม่ใช้ API แล้ว
async function claudeParseText(pageText, statusEl){
  if(statusEl) statusEl.innerHTML='<span class="fetch-loading">🔍 parse ข้อมูล...</span>';
  const info = parseQuoteText(pageText||"");
  applyQuoteInfo(info, statusEl);
}


// ข้อ 1: หลังสร้างงานใหม่ (และทุกครั้งที่ถึงรอบเตือน) ต้องเด้งป๊อปอัพให้เลือก "ส่งแล้ว" หรือ "ยังไม่ได้ส่ง"
function todayKey(){
  const d = new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function queueEmailReminder(jobId){
  if(!emailQueue.includes(jobId)) emailQueue.push(jobId);
  if(!pendingEmailJobId) showNextEmailReminder();
}

function showNextEmailReminder(){
  if(pendingEmailJobId) return;
  const jobId = emailQueue.shift();
  if(!jobId) return;
  const j = jobs.find(x=>x.id===jobId);
  if(!j || j.emailSent){ showNextEmailReminder(); return; }
  pendingEmailJobId = jobId;

  // ข้อ 2: แยกสีและข้อความตามประเภทงาน
  const isSample = j.type === 'ตัวอย่าง';
  const box = $("emailBox");
  box.className = `email-box ${isSample ? 'type-sample' : 'type-real'}`;
  $("emailTitle").textContent = isSample ? 'ส่งอีเมลออกออเดอร์ตัวอย่างหรือยัง?' : 'ส่งอีเมลออกออเดอร์งานจริงหรือยัง?';
  $("emailIcon").textContent = isSample ? '📘' : '📕';
  // ข้อ 3: ปุ่ม "ส่งแล้ว" สีอ่อน, "ยังไม่ได้ส่ง" สีแดงเข้ม
  const sentBtn = $("emailSentBtn"), notSentBtn = $("emailNotSentBtn");
  sentBtn.style.background = isSample ? '#AED6F1' : '#F1948A';
  sentBtn.style.color = isSample ? '#1A5276' : '#7B241C';
  sentBtn.textContent = '✓ ส่งแล้ว';
  notSentBtn.style.background = '#C0392B';
  notSentBtn.style.color = '#fff';
  notSentBtn.style.fontWeight = '700';

  $("emailModalJobName").textContent = `งาน "${j.job || 'ไม่มีชื่องาน'}" (${sellerDisplay(j)})`;
  $("emailModal").classList.add("open");
}
function closeEmailReminder(){
  $("emailModal").classList.remove("open");
  pendingEmailJobId = null;
  setTimeout(showNextEmailReminder, 250); // เปิดป๊อปอัพถัดไปในคิว (ถ้ามี)
}

// ข้อ 1 (ต่อ): ถ้ายังไม่ได้ส่ง ให้เด้งเตือนใหม่วันละ 2 ครั้ง — เปิดแอปครั้งแรกของวัน + อีก 5 ชม.ถัดมา
function checkEmailReminders(){
  if(!currentUser) return;
  const now = Date.now();
  const today = todayKey();
  const loginKey = `emailAlerted_${currentUser.username}_${today}`;

  // ข้อ 7: เตือนแค่วันละ 1 ครั้ง ตอน login ครั้งแรก และเฉพาะงานของตัวเอง
  if(localStorage.getItem(loginKey)) return; // เตือนไปแล้วในวันนี้
  localStorage.setItem(loginKey, '1');

  jobs.forEach(j=>{
    if(j.emailSent !== false) return;
    if(j.seller !== currentUser.name) return; // เฉพาะงานของตัวเอง
    if(!j.cancelled) queueEmailReminder(j.id);
  });
  saveJobs();
}

async function saveFromModal(){
  const jobName = $("f_jobname").value.trim();
  if(!jobName){ alert("กรุณากรอกชื่องาน"); return; }
  const common = {
    seller: $("f_seller").value,
    manager: $("f_manager") ? $("f_manager").value : $("f_seller").value,
    date: $("f_date").value,
    quote: $("f_quote").value.trim(),
    job: jobName,
    detail: $("f_detail").value.trim(),
    type: $("f_type").value,
    status: $("f_status").value.trim(),
    deliveryDate: $("f_deliveryDate").value,
    salesAmount: parseFloat($("f_salesAmount").value)||0,
    qty: parseInt($("f_qty").value)||0,
    productItems: getProductItems(),
    customerType: $("f_customerType").value,
    countInSales: $("f_countInSales").checked,
    leadId: $("f_leadId").value || "",
  };
  let isNew = false;
  let newJobId = null;
  if(editingId){
    const j = jobs.find(x=>x.id===editingId);
    Object.assign(j, common);
  }else{
    isNew = true;
    newJobId = "job_"+Date.now()+"_"+Math.floor(Math.random()*1000);
    const newJob = {
      id: newJobId,
      no: jobs.length ? Math.max(...jobs.map(j=>j.no||0))+1 : 1,
      ...common,
      emailSent: false,
      emailReminder: { date: todayKey(), count: 1, lastAt: Date.now() },
      sampleConverted: false,
      awaitingRealOrder: false,
      stages: { summary:{done:false,by:""}, order:{done:false,by:""}, checked:{done:false,by:""}, printed:{done:false,by:""}, marked:{done:false,by:""}, received:{done:false,by:""} },
      createdAt: Date.now()
    };
    jobs.push(newJob);
  }
  const savedJobId = editingId || newJobId;
  const ok = await saveSingleJob(savedJobId);
  if(!ok) return; // conflict cancelled
  closeModal();
  render();
  toast("บันทึกข้อมูลแล้ว");
  if(isNew){
    queueEmailReminder(newJobId);
  }
}

function exportExcel(){
  const rows = jobs.map(j=>({
    "ลำดับ": j.no,
    "เซลล์": j.seller,
    "วันที่": formatDate(j.date),
    "วันที่ส่งงาน": formatDate(j.deliveryDate),
    "ใบเสนอราคา": j.quote,
    "ชื่องาน": j.job,
    "รายละเอียด": j.detail,
    "ตัวเลือก": j.type,
    "ประเภทลูกค้า": j.customerType||"",
    "จำนวนตัว": j.qty||0,
    "ยอดขาย (ก่อนแวท)": j.salesAmount||0,
    "นับเป็นยอดขาย": j.countInSales!==false ? "นับ" : "ไม่นับ",
    "สถานะอัพเดต": j.status,
    "ออกออเดอร์": j.stages.order.done ? `✓ ${j.stages.order.by}` : "-",
    "ตรวจหลังปริ้น": j.stages.checked.done ? `✓ ${j.stages.checked.by}` : "-",
    "ปริ้นแล้ว": j.stages.printed.done ? `✓ ${j.stages.printed.by}` : "-",
    "วางมาร์ค/ป่านลง": j.stages.marked.done ? `✓ ${j.stages.marked.by}` : "-",
    "พี่พึง/พี่บุ๊คได้รับ": j.stages.received.done ? `✓ ${j.stages.received.by}` : "-",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{wch:6},{wch:10},{wch:12},{wch:12},{wch:14},{wch:24},{wch:28},{wch:10},{wch:16},{wch:10},{wch:14},{wch:12},{wch:24},{wch:14},{wch:14},{wch:14},{wch:16},{wch:18}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "งาน");
  const dateStr = new Date().toISOString().slice(0,10);
  XLSX.writeFile(wb, `รายงานงาน_${dateStr}.xlsx`);
  toast("ดาวน์โหลดไฟล์ Excel แล้ว");
}

populateSellerSelect();
$("addBtn").onclick = async()=>openModal(null);
$("f_addProductRow").onclick = addProductRow;
$("cancelBtn").onclick = closeModal;
$("saveBtn").onclick = saveFromModal;
$("exportBtn").onclick = exportExcel;
$("searchInput").oninput = ()=>{ tablePage=0; renderList(); };
$("filterType").onchange = ()=>{ tablePage=0; renderList(); renderSummary(); };
$("filterSeller").onchange = ()=>{ tablePage=0; renderList(); renderSummary(); };
$("filterStage").onchange = ()=>{ tablePage=0; renderList(); renderSummary(); };

// ข้อ 7: Date range filter
$("filterDateFrom").onchange = ()=>{ $("clearDateFilter").style.display=$("filterDateFrom").value||$("filterDateTo").value?'':'none'; tablePage=0; renderList(); };
$("filterDateTo").onchange = ()=>{ $("clearDateFilter").style.display=$("filterDateFrom").value||$("filterDateTo").value?'':'none'; tablePage=0; renderList(); };
$("clearDateFilter").onclick = ()=>{ $("filterDateFrom").value=""; $("filterDateTo").value=""; $("clearDateFilter").style.display='none'; tablePage=0; renderList(); };

// ข้อ 9: Hide/show lead field based on customer type
$("f_customerType").onchange = ()=>{
  const ct = $("f_customerType").value;
  const allowed = LEAD_ALLOWED_CUSTOMER_TYPES.includes(ct);
  const wrap = $("f_leadWrapper");
  if(wrap){ wrap.style.display = allowed ? '' : 'none'; }
  if(!allowed){ setLeadField(""); }
};

function setActiveView(btnId){
  ["viewCardBtn","viewTableBtn","viewSummaryBtn","viewLeadBtn","viewExpenseBtn"].forEach(id=>$(id).classList.toggle('active', id===btnId));
}
$("viewCardBtn").onclick = ()=>{
  currentView = 'card';
  setActiveView('viewCardBtn');
  document.querySelector('.container').classList.remove('wide');
  render();
};
$("viewTableBtn").onclick = ()=>{
  currentView = 'table';
  setActiveView('viewTableBtn');
  document.querySelector('.container').classList.add('wide');
  render();
};
$("viewSummaryBtn").onclick = ()=>{
  currentView = 'summary';
  setActiveView('viewSummaryBtn');
  document.querySelector('.container').classList.add('wide');
  render();
};
$("viewExpenseBtn").onclick = ()=>{
  currentView = 'expense';
  setActiveView('viewExpenseBtn');
  document.querySelector('.container').classList.add('wide');
  render();
};
$("viewLeadBtn").onclick = ()=>{
  currentView = 'leads';
  setActiveView('viewLeadBtn');
  document.querySelector('.container').classList.add('wide');
  render();
};
$("modalOverlay").onclick = (e)=>{ if(e.target.id==='modalOverlay') closeModal(); };

// ===== Lead modal wiring =====
$("addLeadBtn").onclick = ()=>openLeadModal(null);
$("leadCancelBtn").onclick = closeLeadModal;
$("leadSaveBtn").onclick = saveLeadFromModal;
$("leadModalOverlay").onclick = (e)=>{ if(e.target.id==='leadModalOverlay') closeLeadModal(); };

// ===== ค้นหา Lead แบบพิมพ์ค้นหา (ในฟอร์มเพิ่ม/แก้ไขงาน) =====
$("f_leadSearch").oninput = (e)=>{
  $("f_leadId").value = "";
  $("f_leadClearBtn").classList.remove('show');
  renderLeadSuggestions(e.target.value, false);
};
$("f_leadSearch").onfocus = (e)=>{ renderLeadSuggestions(e.target.value, true); };
$("f_leadSearch").onblur = ()=>{ setTimeout(closeLeadSuggest, 200); };
$("f_leadClearBtn").onclick = ()=>setLeadField("");

// ข้อ 1: ป๊อปอัพปิดได้ก็ต่อเมื่อเลือก "ส่งแล้ว" หรือ "ยังไม่ได้ส่ง" เท่านั้น (คลิกพื้นหลังไม่ปิด)
$("emailSentBtn").onclick = async ()=>{
  if(pendingEmailJobId){
    const j = jobs.find(x=>x.id===pendingEmailJobId);
    if(j){
      j.emailSent = true;
      j.emailReminder = null;
      // ข้อ 1: อัพเดตสถานะ "สรุปส่งออกออเดอร์" อัตโนมัติ
      if(j.stages && !j.stages.summary?.done){
        j.stages.summary = { done: true, by: currentUser?.name || "", at: Date.now() };
      }
      await saveJobs();
      render();
    }
  }
  closeEmailReminder();
  toast("✓ บันทึกว่าส่งอีเมลออกออเดอร์แล้ว — อัพเดตสถานะ สรุปส่งออกออเดอร์ แล้วค่ะ");
};
$("emailNotSentBtn").onclick = async ()=>{
  if(pendingEmailJobId){
    const j = jobs.find(x=>x.id===pendingEmailJobId);
    if(j){
      j.emailSent = false;
      if(!j.emailReminder || j.emailReminder.date !== todayKey()){
        j.emailReminder = { date: todayKey(), count: 1, lastAt: Date.now() };
      }
      await saveJobs();
      render();
    }
  }
  closeEmailReminder();
  toast("⚠ บันทึกว่ายังไม่ได้ส่งอีเมลออกออเดอร์");
};

// ===== Login / จัดการผู้ใช้งาน wiring =====
$("loginBtn").onclick = tryLogin;
$("togglePasswordBtn").onclick = function(){
  const inp = $("loginPassword");
  if(inp.type === "password"){
    inp.type = "text";
    this.textContent = "🙈";
    this.title = "ซ่อนรหัสผ่าน";
  } else {
    inp.type = "password";
    this.textContent = "👁";
    this.title = "แสดงรหัสผ่าน";
  }
};
$("loginPassword").addEventListener('keydown', (e)=>{ if(e.key==='Enter') tryLogin(); });
$("loginUsername").addEventListener('keydown', (e)=>{ if(e.key==='Enter') $("loginPassword").focus(); });
$("manageUsersBtn").onclick = openUserModal;
if($("u_role")) $("u_role").onchange = updateRoleDesc;
$("sbSetupBtn").onclick = ()=>{
  const url = localStorage.getItem('sb_url')||'';
  const key = localStorage.getItem('sb_key')||'';
  if(url) $('sbUrlInput').value = url;
  if(key) $('sbKeyInput').value = key;
  $('sbSetupOverlay').style.display='flex';
};
$("userCancelBtn").onclick = closeUserModal;
$("userSaveBtn").onclick = saveUserAccount;
$("userModalOverlay").onclick = (e)=>{ if(e.target.id==='userModalOverlay') closeUserModal(); };

async function bootstrapApp(){
  // ── ถ้ามี Supabase config ที่บันทึกไว้ → ลองเชื่อมต่ออัตโนมัติ ──
  const hasSbConfig = !!(localStorage.getItem('sb_url') && localStorage.getItem('sb_key'));
  if(hasSbConfig){
    const connected = await initSupabase();
    if(!connected){
      // config ผิด → ล้างออก แล้วใช้ local storage แทน
      localStorage.removeItem('sb_url'); localStorage.removeItem('sb_key');
      toast("⚠ เชื่อมต่อ Supabase ไม่ได้ — ใช้ Local Storage แทนค่ะ");
    }
  }
  // โหลดข้อมูลทันที (ไม่รอ setup)
  await _bootstrapData();
}

function showSbSetup(){
  const overlay = $('sbSetupOverlay');
  overlay.style.display = 'flex';
  const saved_url = localStorage.getItem('sb_url')||'';
  const saved_key = localStorage.getItem('sb_key')||'';
  if(saved_url) $('sbUrlInput').value = saved_url;
  if(saved_key) $('sbKeyInput').value = saved_key;

  $('sbConnectBtn').onclick = async function(){
    const url = $('sbUrlInput').value.trim();
    const key = $('sbKeyInput').value.trim();
    $('sbSetupErr').textContent = '';
    if(!url||!key){ $('sbSetupErr').textContent='กรุณากรอกทั้ง URL และ Key ค่ะ'; return; }
    $('sbConnectBtn').textContent = '🔄 กำลังเชื่อมต่อ...';
    $('sbConnectBtn').disabled = true;
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    const ok = await initSupabase();
    if(ok){
      localStorage.setItem('sb_setup_done','1');
      overlay.style.display = 'none';
      toast('✅ เชื่อมต่อ Supabase สำเร็จ!');
      await _bootstrapData();
    } else {
      $('sbSetupErr').textContent = '❌ เชื่อมต่อไม่ได้ — กรุณาตรวจสอบ URL / Key และแน่ใจว่า run SQL แล้วค่ะ';
      localStorage.removeItem('sb_url'); localStorage.removeItem('sb_key');
      $('sbConnectBtn').textContent = '🔌 เชื่อมต่อ Supabase';
      $('sbConnectBtn').disabled = false;
    }
  };

  $('sbSkipBtn').onclick = async function(){
    localStorage.setItem('sb_setup_done','skip');
    overlay.style.display = 'none';
    toast('ใช้ Local Storage (window.storage) ค่ะ');
    await _bootstrapData();
  };
}

async function _bootstrapData(){
  await loadUsers();
  populateSellerSelect();
  const loggedIn = await attemptAutoLogin();
  if(!loggedIn){ $("loginOverlay").style.display = "flex"; }
  loadJobs();
  loadLeads();
  await loadHistoricalSales();
  if(currentView==='summary') renderList();

  // ถ้าใช้ window.storage (ไม่ใช่ Supabase) → ยังคง poll ทุก 8 วินาที
  if(!_useSupabase){
    setInterval(async ()=>{
      try{
        const res = await window.storage.get("jobs", true);
        const fresh = res && res.value ? JSON.parse(res.value) : [];
        if(JSON.stringify(fresh) !== JSON.stringify(jobs)){ jobs=fresh; render(); }
      }catch(e){}
    }, 8000);
    setInterval(async ()=>{
      try{
        const res = await window.storage.get("leads", true);
        const fresh = res && res.value ? JSON.parse(res.value) : [];
        if(JSON.stringify(fresh) !== JSON.stringify(leads)){
          leads=fresh; populateJobLeadSelect();
          if(currentView==='leads') renderList();
        }
      }catch(e){}
    }, 8000);
  }
}

bootstrapApp();
setInterval(render, 60000);
setInterval(checkEmailReminders, 5*60000);


  
  // override the init function if it existed to use the injected supabase
  // Original code uses createClient('url', 'key'). We already have window._sb.
  // Let's just mock window.supabase.createClient to return window._sb if it calls it
  window.supabase = {
    createClient: () => window._sb
  };
}

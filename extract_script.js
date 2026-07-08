const fs = require('fs');
const htmlPath = '../final 8 กค. 69 job-tracker-สหวัฒน์-48/final 8 α╕üα╕ä. 69 job-tracker-α╕¬α╕½α╕ºα╕▒α╕Æα╕Öα╣î-48.html';
const content = fs.readFileSync(htmlPath, 'utf8');

const scriptRegex = /<script>([\s\S]*?)<\/script>/;
const match = content.match(scriptRegex);

if (match && match[1]) {
  let scriptContent = match[1];
  
  // Clean up some things
  scriptContent = scriptContent.replace('const _useSupabase = false;', 'let _useSupabase = true;');
  
  // Ensure it exports a function to initialize
  scriptContent = `
import { supabase } from '../lib/supabaseClient';

export function initLegacyLogic() {
  if (window._legacyLogicInitialized) return;
  window._legacyLogicInitialized = true;
  
  // Inject supabase client so the script can use it
  window._sb = supabase;
  
  ${scriptContent}
  
  // override the init function if it existed to use the injected supabase
  // Original code uses createClient('url', 'key'). We already have window._sb.
  // Let's just mock window.supabase.createClient to return window._sb if it calls it
  window.supabase = {
    createClient: () => window._sb
  };
}
`;

  fs.writeFileSync('app/logic.js', scriptContent);
  console.log('Extracted script to app/logic.js');
} else {
  console.log('No <script> block found');
}

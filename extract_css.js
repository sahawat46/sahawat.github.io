const fs = require('fs');

const htmlPath = '../final 8 กค. 69 job-tracker-สหวัฒน์-48/final 8 α╕üα╕ä. 69 job-tracker-α╕¬α╕½α╕ºα╕▒α╕Æα╕Öα╣î-48.html';
const content = fs.readFileSync(htmlPath, 'utf8');

const styleRegex = /<style>([\s\S]*?)<\/style>/;
const match = content.match(styleRegex);

if (match && match[1]) {
  fs.writeFileSync('app/globals.css', match[1]);
  console.log('Extracted CSS to app/globals.css');
} else {
  console.log('No <style> block found');
}

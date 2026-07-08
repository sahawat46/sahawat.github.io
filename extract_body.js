const fs = require('fs');
const htmlPath = '../final 8 กค. 69 job-tracker-สหวัฒน์-48/final 8 α╕üα╕ä. 69 job-tracker-α╕¬α╕½α╕ºα╕▒α╕Æα╕Öα╣î-48.html';
const content = fs.readFileSync(htmlPath, 'utf8');

const bodyRegex = /<body>([\s\S]*?)<\/body>/;
const match = content.match(bodyRegex);

if (match && match[1]) {
  // Remove scripts from inside body
  let bodyContent = match[1];
  bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/g, '');
  fs.writeFileSync('app/body_structure.html', bodyContent);
  console.log('Extracted body');
} else {
  console.log('No <body> block found');
}

import fs from 'fs';
function replaceInFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/gemini-1\.5-flash/g, 'gemini-3.5-flash');
    fs.writeFileSync(filePath, content);
  } catch (err) {}
}

replaceInFile('src/components/ChatCoachPage.tsx');
replaceInFile('server.ts');
replaceInFile('serverDb.ts');
replaceInFile('db.json');

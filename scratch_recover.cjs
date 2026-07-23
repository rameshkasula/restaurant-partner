const fs = require('fs');
const path = require('path');

const logPath = "C:\\Users\\Ramesh\\.gemini\\antigravity-ide\\brain\\d6493d91-c846-4bc3-9bd7-1c50ab5de557\\.system_generated\\logs\\transcript_full.jsonl";
const lines = fs.readFileSync(logPath, 'utf-8').split('\n');

let bestContent = null;
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    // Look for tool calls that output the content of liveorders.tsx
    if (data.type === 'TOOL_CALL_RESPONSE' && data.content) {
      if (data.content.includes('liveorders.tsx')) {
         // Maybe it's a file read or edit output
         if (data.content.includes('export default function LiveOrders() {') || data.content.includes('const columns = useMemo')) {
             bestContent = data.content;
         }
      }
    }
  } catch (e) {}
}

if (bestContent) {
  fs.writeFileSync('recovered_liveorders_tool_output.txt', bestContent);
  console.log("Found something! Length:", bestContent.length);
} else {
  console.log("Not found in responses.");
}

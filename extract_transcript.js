const fs = require('fs');
const data = JSON.parse(fs.readFileSync('chat_raw.json', 'utf8'));

let out = `# ${data.snapshot_name || 'Golden Point Conversation'}\n\n`;
out += `**Creator:** ${data.created_by || (data.creator && data.creator.full_name) || 'Unknown'}\n`;
out += `**Created At:** ${data.created_at}\n\n`;

data.chat_messages.forEach((m, idx) => {
  out += `\n---\n## Message ${idx + 1} (${m.sender})\n\n`;
  if (m.text) {
    out += m.text + '\n\n';
  }
  if (Array.isArray(m.content)) {
    m.content.forEach(c => {
      if (c.text) {
        out += c.text + '\n\n';
      }
      if (c.type === 'tool_use') {
        out += `**Tool Use [${c.name}]:**\n\`\`\`json\n${JSON.stringify(c.input, null, 2)}\n\`\`\`\n\n`;
      }
      if (c.type === 'tool_result') {
        out += `**Tool Result:**\n\`\`\`\n${typeof c.content === 'string' ? c.content : JSON.stringify(c.content, null, 2)}\n\`\`\`\n\n`;
      }
    });
  }
});

fs.writeFileSync('chat_transcript.md', out);
console.log('Successfully wrote chat_transcript.md. Size:', out.length);

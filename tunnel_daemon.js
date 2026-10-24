const { spawn } = require('child_process');
const fs = require('fs');

function startTunnel() {
  console.log('[Tunnel] Launching SSH tunnel to localhost.run...');

  const ssh = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=3',
    '-R', '80:127.0.0.1:3000',
    'nokey@localhost.run'
  ]);

  ssh.stdout.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/);
    if (match) {
      const url = match[0];
      console.log(`[Tunnel] LIVE PUBLIC URL: ${url}`);
      fs.writeFileSync('tunnel_url.txt', url);
    }
  });

  ssh.stderr.on('data', (data) => {
    // SSH stderr usually logs diagnostic notices
  });

  ssh.on('close', (code) => {
    console.log(`[Tunnel] Process exited with code ${code}. Reconnecting in 3 seconds...`);
    setTimeout(startTunnel, 3000);
  });

  ssh.on('error', (err) => {
    console.error('[Tunnel] Error:', err.message);
    setTimeout(startTunnel, 5000);
  });
}

startTunnel();

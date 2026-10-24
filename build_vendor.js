const esbuild = require('esbuild');
const fs = require('fs');

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('src_vendor.js', `
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

window.QRCode = QRCode;
window.confetti = confetti;
window.html2canvas = html2canvas;
`);

try {
  esbuild.buildSync({
    entryPoints: ['src_vendor.js'],
    bundle: true,
    minify: true,
    outfile: 'public/vendor.min.js',
    platform: 'browser',
    format: 'iife',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  const size = fs.statSync('public/vendor.min.js').size;
  console.log('Vendor bundle created successfully! Size:', size, 'bytes');
  fs.unlinkSync('src_vendor.js');
} catch (err) {
  console.error('Build failed:', err);
}

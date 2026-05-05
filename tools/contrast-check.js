function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  if (h.length === 6) {
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }
  if (h.length === 3) {
    return [parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16)];
  }
  throw new Error('Invalid hex: ' + hex);
}

function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const [r,g,b] = hexToRgb(hex);
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(hex1, hex2) {
  const L1 = luminance(hex1);
  const L2 = luminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const tests = [
  {name: 'original primary', color: '#25AF74', bg: '#f5f6fa'},
  {name: 'proposed primary (#0F766E)', color: '#0F766E', bg: '#f5f6fa'},
  {name: 'heading-subtitle (#475569)', color: '#475569', bg: '#f5f6fa'},
  {name: 'small primary alt (#1F7F66)', color: '#1F7F66', bg: '#f5f6fa'},
  // also test dark bg contrast
  {name: 'proposed primary on dark surface', color: '#0F766E', bg: '#0f172a'},
  {name: 'heading-subtitle on dark surface', color: '#475569', bg: '#0f172a'},
];

console.log('Background (light): #f5f6fa');
console.log('Background (dark surface): #0f172a');
console.log('');
for (const t of tests) {
  const ratio = contrast(t.color, t.bg);
  console.log(`${t.name.padEnd(38)} ${t.color} on ${t.bg} -> contrast: ${ratio.toFixed(2)}:1`);
}

// helper: check thresholds
n = [
  {selector: 'QR Shorter (.text-3xl)', color: '#0F766E', bg: '#f5f6fa', size: 'small? maybe', threshold: 4.5},
  {selector: 'h1 > span (hero emphasize)', color: '#0F766E', bg: '#f5f6fa', size: 'large (h1 ~33px)', threshold: 3},
  {selector: '.heading-subtitle', color: '#475569', bg: '#f5f6fa', size: 'normal', threshold: 4.5},
];

console.log('\nThreshold checks:');
for (const item of n) {
  const r = contrast(item.color, item.bg);
  const pass = r >= item.threshold ? 'PASS' : 'FAIL';
  console.log(`${item.selector.padEnd(36)} ${r.toFixed(2)}:1  threshold ${item.threshold} -> ${pass}`);
}

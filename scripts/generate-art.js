// Generates ENVEE placeholder art: furniture "stickers" (s-*), product shots (p-*), rooms and styled looks.
// Needs Playwright + Chromium. Usage: node scripts/generate-art.js assets/art
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });

const brass = `<linearGradient id="brass" x1="0" x2="1"><stop offset="0" stop-color="#B8893F"/><stop offset=".5" stop-color="#E2BE76"/><stop offset="1" stop-color="#A97A33"/></linearGradient>`;
const oak = `<linearGradient id="oak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B98C"/><stop offset="1" stop-color="#B98F5E"/></linearGradient>`;
const walnut = `<linearGradient id="walnut" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A4E30"/><stop offset="1" stop-color="#5A3620"/></linearGradient>`;

// Each sticker: [name, svgInner(defs+shapes) in 600x600 space]
const S = {};

S.sofa = `<defs>${brass}
<linearGradient id="v1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F7559"/><stop offset="1" stop-color="#11523F"/></linearGradient>
<linearGradient id="v2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A8466"/><stop offset="1" stop-color="#1A6A51"/></linearGradient></defs>
<rect x="70" y="200" width="460" height="150" rx="46" fill="url(#v1)"/>
<rect x="95" y="215" width="200" height="120" rx="38" fill="url(#v2)" opacity=".9"/>
<rect x="305" y="215" width="200" height="120" rx="38" fill="url(#v2)" opacity=".9"/>
<rect x="60" y="370" width="480" height="50" rx="16" fill="#0E4A38"/>
<rect x="110" y="320" width="188" height="72" rx="26" fill="url(#v2)"/>
<rect x="302" y="320" width="188" height="72" rx="26" fill="url(#v2)"/>
<rect x="40" y="270" width="90" height="150" rx="42" fill="url(#v1)"/>
<rect x="470" y="270" width="90" height="150" rx="42" fill="url(#v1)"/>
<path d="M95 420 h22 l-5 40 h-12z M483 420 h22 l-5 40 h-12z" fill="url(#brass)"/>`;

S.armchair = `<defs>${brass}
<linearGradient id="c1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7683A"/><stop offset="1" stop-color="#8A4724"/></linearGradient>
<linearGradient id="c2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77C4C"/><stop offset="1" stop-color="#A25A31"/></linearGradient></defs>
<path d="M170 140 q130 -50 260 0 q20 8 20 40 v190 h-300 v-190 q0 -32 20 -40z" fill="url(#c1)"/>
<rect x="185" y="330" width="230" height="70" rx="28" fill="url(#c2)"/>
<rect x="130" y="250" width="72" height="190" rx="34" fill="url(#c1)"/>
<rect x="398" y="250" width="72" height="190" rx="34" fill="url(#c1)"/>
<rect x="170" y="395" width="260" height="45" rx="14" fill="#7A3D1E"/>
<path d="M175 440 l-18 70 h12 l26 -70z M425 440 l18 70 h-12 l-26 -70z" fill="#4A2A18"/>`;

S.floorlamp = `<defs>${brass}
<radialGradient id="glow"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".9"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="190" cy="545" rx="70" ry="18" fill="#E9E5E0"/><rect x="120" y="525" width="140" height="22" rx="10" fill="#F2EFEB" stroke="#D8D2CB"/>
<path d="M190 528 V230 Q190 70 380 80 Q450 84 470 150" fill="none" stroke="url(#brass)" stroke-width="9" stroke-linecap="round"/>
<ellipse cx="470" cy="225" rx="70" ry="40" fill="url(#glow)"/>
<path d="M410 200 Q410 140 470 140 Q530 140 530 200z" fill="url(#brass)"/>
<rect x="465" y="132" width="10" height="12" fill="#9C6F2C"/>`;

S.tablelamp = `<defs>${brass}
<linearGradient id="cer" x1="0" x2="1"><stop offset="0" stop-color="#EFE8DC"/><stop offset=".6" stop-color="#FBF8F2"/><stop offset="1" stop-color="#DCD3C5"/></linearGradient>
<linearGradient id="lin" x1="0" x2="1"><stop offset="0" stop-color="#E7DDCB"/><stop offset=".5" stop-color="#F6F0E4"/><stop offset="1" stop-color="#DCCFB8"/></linearGradient></defs>
<path d="M300 300 C220 300 210 380 230 430 C245 470 270 490 300 490 C330 490 355 470 370 430 C390 380 380 300 300 300z" fill="url(#cer)"/>
<rect x="255" y="485" width="90" height="16" rx="6" fill="#D7CDBE"/>
<rect x="296" y="230" width="8" height="75" fill="url(#brass)"/>
<path d="M215 120 h170 l50 130 h-270z" fill="url(#lin)"/>
<path d="M245 120 l-22 130 M275 120 l-8 130 M325 120 l8 130 M355 120 l22 130" stroke="#D3C5AD" stroke-width="2" opacity=".6"/>`;

const leaves = (() => {
  let s = '';
  const L = [[300,140,-10],[255,175,-35],[345,170,30],[230,230,-55],[370,225,50],[280,215,-15],[325,250,20],[250,290,-40],[355,300,45],[300,95,5],[215,140,-60],[390,130,60],[300,330,0]];
  L.forEach(([x,y,r],i)=>{ const c = ['#2F6B3E','#3E8350','#24583A','#4C9560'][i%4];
    s += `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="34" ry="52" fill="${c}"/><path d="M0 -48 V48" stroke="#1C4A2C" stroke-width="2" opacity=".5"/></g>`; });
  return s;
})();
S.plant = `<defs><linearGradient id="pot" x1="0" x2="1"><stop offset="0" stop-color="#D6CEC3"/><stop offset=".5" stop-color="#EEE9E2"/><stop offset="1" stop-color="#C8BFB3"/></linearGradient></defs>
<path d="M300 560 V330" stroke="#5A4630" stroke-width="7"/><path d="M300 420 L260 330 M300 380 L345 300" stroke="#5A4630" stroke-width="5"/>
${leaves}
<path d="M215 440 h170 l-18 120 q-2 12 -14 12 h-106 q-12 0 -14 -12z" fill="url(#pot)"/>
<rect x="205" y="430" width="190" height="22" rx="8" fill="#E4DED6"/>`;

S.rug = `<defs><pattern id="rp" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M0 14 L14 0 L28 14 L14 28z" fill="none" stroke="#CDBFA8" stroke-width="2"/></pattern></defs>
<ellipse cx="300" cy="330" rx="280" ry="120" fill="#EFE7DA"/>
<ellipse cx="300" cy="330" rx="250" ry="100" fill="none" stroke="#B9A88E" stroke-width="5"/>
<ellipse cx="300" cy="330" rx="222" ry="82" fill="url(#rp)" opacity=".8"/>
<ellipse cx="300" cy="330" rx="120" ry="40" fill="none" stroke="#0F5B45" stroke-width="4" opacity=".55"/>`;

S.coffeetable = `<defs>${oak}</defs>
<path d="M265 330 h70 l20 150 h-110z" fill="#A87C4C"/>
<ellipse cx="300" cy="482" rx="95" ry="22" fill="#9A6F42"/>
<ellipse cx="300" cy="318" rx="210" ry="62" fill="#9A6F42"/>
<ellipse cx="300" cy="300" rx="210" ry="62" fill="url(#oak)"/>
<ellipse cx="300" cy="300" rx="160" ry="44" fill="none" stroke="#C9A474" stroke-width="2" opacity=".6"/>
<ellipse cx="300" cy="300" rx="100" ry="26" fill="none" stroke="#C9A474" stroke-width="2" opacity=".5"/>`;

S.sidetable = `<defs><linearGradient id="trv" x1="0" x2="1"><stop offset="0" stop-color="#D8CBB6"/><stop offset=".5" stop-color="#EDE3D2"/><stop offset="1" stop-color="#CDBEA6"/></linearGradient></defs>
<path d="M200 230 h200 v260 h-200z" fill="url(#trv)"/>
<ellipse cx="300" cy="490" rx="100" ry="24" fill="#CDBEA6"/>
<ellipse cx="300" cy="230" rx="100" ry="24" fill="#F3EBDD"/>
<path d="M210 300 q40 8 80 -2 t100 4 M205 380 q50 -6 100 2 t90 -4" stroke="#C7B699" stroke-width="2" fill="none" opacity=".7"/>`;

S.mirror = `<defs>${brass}<linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAF0EE"/><stop offset=".45" stop-color="#C9D6D2"/><stop offset=".5" stop-color="#F4F8F7"/><stop offset=".6" stop-color="#C3D1CC"/><stop offset="1" stop-color="#AEBFBA"/></linearGradient></defs>
<path d="M170 560 V230 A130 130 0 0 1 430 230 V560z" fill="url(#brass)"/>
<path d="M184 548 V232 A116 116 0 0 1 416 232 V548z" fill="url(#gl)"/>`;

S.artprint = `<rect x="140" y="70" width="320" height="430" fill="#1A1A1A"/>
<rect x="152" y="82" width="296" height="406" fill="#FBF8F2"/>
<rect x="190" y="125" width="220" height="320" fill="#F1EADF"/>
<path d="M210 445 A100 100 0 0 1 410 445z" fill="#0F5B45"/>
<circle cx="335" cy="230" r="48" fill="#C8693F"/>
<rect x="215" y="170" width="60" height="6" fill="#1A1A1A"/>`;

S.bed = `<defs><linearGradient id="hb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8CCBB"/><stop offset="1" stop-color="#BFAF98"/></linearGradient>
<linearGradient id="duv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9E4DC"/></linearGradient></defs>
<rect x="70" y="120" width="460" height="260" rx="30" fill="url(#hb)"/>
<path d="M120 140 V360 M180 140 V360 M240 140 V360 M300 140 V360 M360 140 V360 M420 140 V360 M480 140 V360" stroke="#B4A38A" stroke-width="2" opacity=".5"/>
<rect x="120" y="235" width="160" height="70" rx="22" fill="#F6F2EB"/><rect x="320" y="235" width="160" height="70" rx="22" fill="#F6F2EB"/>
<rect x="190" y="270" width="110" height="55" rx="18" fill="#0F5B45" opacity=".85"/>
<rect x="60" y="300" width="480" height="170" rx="22" fill="url(#duv)"/>
<rect x="60" y="390" width="480" height="40" fill="#C8693F" opacity=".75"/>
<rect x="70" y="465" width="460" height="25" rx="6" fill="#B9A78D"/>
<rect x="85" y="490" width="16" height="30" fill="#7A5A3A"/><rect x="499" y="490" width="16" height="30" fill="#7A5A3A"/>`;

S.dresser = `<defs>${walnut}${brass}</defs>
<rect x="80" y="170" width="440" height="280" rx="8" fill="url(#walnut)"/>
${[0,1,2].map(r=>[0,1].map(c=>`<rect x="${98+c*212}" y="${188+r*86}" width="192" height="72" rx="4" fill="#6B4228" stroke="#4C2E1A"/><circle cx="${194+c*212}" cy="${224+r*86}" r="7" fill="url(#brass)"/>`).join('')).join('')}
<rect x="70" y="160" width="460" height="16" rx="4" fill="#4C2E1A"/>
<path d="M110 450 l-8 60 h14 l10 -60z M490 450 l8 60 h-14 l-10 -60z" fill="#3E2414"/>`;

S.pendant = `<defs><radialGradient id="pg" cx=".4" cy=".35"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".7" stop-color="#F3E7CC"/><stop offset="1" stop-color="#E1CFA7"/></radialGradient>
<radialGradient id="pglow"><stop offset="0" stop-color="#FFF1C9" stop-opacity=".8"/><stop offset="1" stop-color="#FFF1C9" stop-opacity="0"/></radialGradient></defs>
<path d="M300 20 V250" stroke="#2A2A2A" stroke-width="4"/>
<rect x="285" y="240" width="30" height="30" rx="4" fill="#B8893F"/>
<circle cx="300" cy="370" r="170" fill="url(#pglow)"/>
<circle cx="300" cy="370" r="115" fill="url(#pg)"/>`;

S.bookshelf = `<defs>${oak}</defs>
<rect x="150" y="60" width="300" height="480" fill="url(#oak)"/>
${[0,1,2,3].map(i=>`<rect x="165" y="${75+i*115}" width="270" height="100" fill="#EFE5D6"/>`).join('')}
${(() => { let s=''; const cols=['#0F5B45','#C8693F','#1A1A1A','#D9CDB8','#8C9A8F','#B05A3B','#2F4A63','#E7DCC8'];
  [0,1,2,3].forEach(r=>{ let x=172; for(let k=0;k<7;k++){ const w=14+((r*7+k)*7)%16, h=60+((r*5+k*11)%30); if(x+w>428) break; if(!(r===2&&k>3)) s+=`<rect x="${x}" y="${175+r*115-h}" width="${w}" height="${h}" fill="${cols[(r*3+k)%cols.length]}"/>`; x+=w+3; } });
  s+=`<path d="M360 405 h40 l-6 -40 h-28z" fill="#E4DED6"/><ellipse cx="380" cy="350" rx="22" ry="24" fill="#3E8350"/>`; return s; })()}`;

S.chair = `<defs>${oak}</defs>
<path d="M210 120 h180 q12 0 12 12 v130 h-204 v-130 q0 -12 12 -12z" fill="#F2EEE8" stroke="#D9D2C8"/>
<path d="M185 300 h230 q14 0 14 14 v26 h-258 v-26 q0 -14 14 -14z" fill="#F2EEE8" stroke="#D9D2C8"/>
<path d="M200 340 l-25 190 h14 l30 -190z M400 340 l25 190 h-14 l-30 -190z M260 340 l-8 170 h10 l14 -170z M340 340 l8 170 h-10 l-14 -170z" fill="url(#oak)"/>
<rect x="225" y="262" width="12" height="40" fill="url(#oak)"/><rect x="363" y="262" width="12" height="40" fill="url(#oak)"/>`;

const dieFilter = `<filter id="die" x="-15%" y="-15%" width="130%" height="130%">
<feMorphology in="SourceAlpha" operator="dilate" radius="12" result="dil"/>
<feFlood flood-color="#ffffff"/><feComposite in2="dil" operator="in" result="outline"/>
<feGaussianBlur in="dil" stdDeviation="9" result="blur"/><feOffset in="blur" dy="8" result="sh"/>
<feFlood flood-color="#000" flood-opacity=".22"/><feComposite in2="sh" operator="in" result="shadow"/>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

// Rooms 900x1200
function room({ wall, wall2, floor, floorLine, window: win = true, arch = false, light = '#FFF7E6', side = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
<defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wall}"/><stop offset="1" stop-color="${wall2}"/></linearGradient>
<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${floor[0]}"/><stop offset="1" stop-color="${floor[1]}"/></linearGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE9EE"/><stop offset="1" stop-color="#F6F1E6"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="${light}" stop-opacity=".75"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient></defs>
<rect width="900" height="1200" fill="url(#w)"/>
${side ? `<path d="M0 0 L120 90 V800 L0 920z" fill="#000" opacity=".06"/><path d="M900 0 L780 90 V800 L900 920z" fill="#000" opacity=".04"/>` : ''}
<path d="M0 920 L120 800 H780 L900 920 V1200 H0z" fill="url(#f)"/>
${Array.from({length:14},(_,i)=>{const x=-200+i*100; return `<path d="M${450+(x-450)*0.55} 800 L${x} 1200" stroke="${floorLine}" stroke-width="2" opacity=".5"/>`;}).join('')}
<rect x="120" y="785" width="660" height="16" fill="#FFFFFF" opacity=".8"/>
${win ? (arch ? `<path d="M330 640 V330 A120 120 0 0 1 570 330 V640z" fill="#FFFFFF"/><path d="M345 628 V335 A105 105 0 0 1 555 335 V628z" fill="url(#sky)"/><path d="M450 230 V628 M345 440 H555" stroke="#FFFFFF" stroke-width="8"/>`
 : `<rect x="300" y="230" width="300" height="420" fill="#FFFFFF"/><rect x="314" y="244" width="272" height="392" fill="url(#sky)"/><path d="M450 244 V636 M314 440 H586" stroke="#FFFFFF" stroke-width="8"/><rect x="290" y="650" width="320" height="14" fill="#FFFFFF"/>`) : ''}
<ellipse cx="450" cy="980" rx="380" ry="140" fill="url(#sun)"/>
</svg>`;
}

const ROOMS = {
  'room-bedroom': room({ wall: '#EFE6DA', wall2: '#E4D8C8', floor: ['#C9A57A', '#B28A5C'], floorLine: '#9C774D' }),
  'room-living': room({ wall: '#E9E7E2', wall2: '#DCD9D2', floor: ['#D7C2A3', '#BFA580'], floorLine: '#A68B66', arch: true }),
  'room-listing': room({ wall: '#F4F3F0', wall2: '#E9E7E3', floor: ['#BE9A6E', '#A07B50'], floorLine: '#8A6741', light: '#FFFFFF' }),
  'room-studio': room({ wall: '#E3E8E3', wall2: '#D3DAD3', floor: ['#E2D5C2', '#CDBDA6'], floorLine: '#B5A48B', arch: true }),
};

// looks: room + placed stickers [name, x, y, size]
const LOOKS = {
  'look-emerald': ['room-living', [['rug',450,1010,640],['sofa',450,830,560],['floorlamp',740,640,420],['coffeetable',450,1010,300],['plant',150,800,300],['artprint',450,470,200]]],
  'look-warm': ['room-bedroom', [['bed',450,840,640],['pendant',450,220,230],['sidetable',110,900,170],['tablelamp',110,760,170],['plant',800,860,260]]],
  'look-gallery': ['room-studio', [['rug',450,1020,600],['armchair',300,880,320],['sidetable',520,940,150],['mirror',720,700,330],['bookshelf',150,640,380],['pendant',480,210,200]]],
  'look-first': ['room-listing', [['dresser',450,780,420],['artprint',450,430,200],['tablelamp',360,560,140],['chair',740,900,260],['plant',150,860,280]]],
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const shot = async (svg, w, h, file, opts) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.screenshot({ path: path.join(out, file), omitBackground: true, ...opts });
  };
  for (const [name, inner] of Object.entries(S)) {
    const svgClean = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">${inner}</svg>`;
    const svgDie = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs>${dieFilter}</defs><g filter="url(#die)">${inner}</g></svg>`;
    await shot(svgClean, 600, 600, `p-${name}.png`);
    await shot(svgDie, 600, 600, `s-${name}.png`);
  }
  for (const [name, svg] of Object.entries(ROOMS)) await shot(svg, 900, 1200, `${name}.jpg`, { type: 'jpeg', quality: 82, omitBackground: false });
  for (const [name, [base, items]] of Object.entries(LOOKS)) {
    const roomSvg = ROOMS[base].replace(/<\/svg>$/, '');
    const g = items.map(([n, x, y, size], i) => {
      const k = size / 600;
      return `<svg x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" viewBox="0 0 600 600">${S[n].replace(/id="([^"]+)"/g, `id="$1_${i}"`).replace(/url\(#([^)]+)\)/g, `url(#$1_${i})`)}</svg>`;
    }).join('');
    await shot(roomSvg + g + '</svg>', 900, 1200, `${name}.jpg`, { type: 'jpeg', quality: 82, omitBackground: false });
  }
  await browser.close();
  console.log('done');
})();

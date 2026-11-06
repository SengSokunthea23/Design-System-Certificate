"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Figtree:wght@400;500;600;700&family=Sora:wght@400;600;700&family=Work+Sans:wght@400;500;600&family=Playfair+Display:wght@500;700&family=Lora:wght@400;600&family=Poppins:wght@400;600;700&family=Nunito:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=Source+Sans+3:wght@400;600&family=DM+Serif+Display&family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Montserrat:wght@400;600;700&family=Kantumruy+Pro:wght@400;600&family=Noto+Sans+Khmer:wght@400;600&family=Battambang:wght@400;700&family=Koulen&display=swap";

const PICKER_CSS = `
:root{--bg:#f3f4f8;--surface:#ffffff;--ink:#151a2d;--muted:#5a6280;--line:#dce0eb;--accent:#3346d3;--accent-ink:#ffffff;--accent-soft:#e8ebfc;--display:'Bricolage Grotesque','Figtree',system-ui,sans-serif;--body:'Figtree',system-ui,-apple-system,'Segoe UI',sans-serif;--mono:ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;color-scheme:light}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0e1120;--surface:#161a2c;--ink:#e7e9f3;--muted:#9aa1bf;--line:#2a2f4b;--accent:#8e9cff;--accent-ink:#0e1120;--accent-soft:#232a52;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0e1120;--surface:#161a2c;--ink:#e7e9f3;--muted:#9aa1bf;--line:#2a2f4b;--accent:#8e9cff;--accent-ink:#0e1120;--accent-soft:#232a52;color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:15px;line-height:1.5}
h1,h2,h3{font-family:var(--display);text-wrap:balance;margin:0}
button,input,textarea,select{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wrap{max-width:1280px;margin:0 auto;padding:28px 20px 60px}
header.top{display:flex;flex-wrap:wrap;gap:12px 32px;align-items:end;justify-content:space-between;margin-bottom:24px}
header.top h1{font-size:34px;font-weight:700;letter-spacing:-.02em}
header.top p{margin:6px 0 0;color:var(--muted);max-width:62ch}
.how{display:flex;gap:8px;flex-wrap:wrap}
.how span{background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:13px;color:var(--muted)}
.how b{color:var(--ink)}
.studio{display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:24px;align-items:start}
@media(max-width:900px){.studio{grid-template-columns:1fr}}
.panel{display:flex;flex-direction:column;gap:16px}
.step{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px}
.step>h2{font-size:17px;font-weight:700;display:flex;gap:10px;align-items:center}
.step>h2 .n{width:24px;height:24px;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-size:13px;display:grid;place-items:center;font-family:var(--body);font-weight:700;flex:none}
.step>p.help{margin:4px 0 0 34px;color:var(--muted);font-size:13px}
.field{margin-top:16px}
.field>label,.field>.lbl{display:block;font-weight:600;font-size:13px;margin-bottom:8px}
.field>.lbl small{font-weight:400;color:var(--muted)}
.text{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--bg)}
textarea.text{min-height:80px;resize:vertical}
.opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px}
.opts.wide{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.opt{border:1px solid var(--line);background:var(--surface);border-radius:10px;padding:9px 11px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:2px;transition:border-color .15s,background .15s}
.opt:hover{border-color:var(--muted)}
.opt[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft);box-shadow:inset 0 0 0 1px var(--accent)}
.opt .t{font-weight:600;font-size:14px;line-height:1.25}
.opt .s{font-size:12px;color:var(--muted);line-height:1.3}
.opt .strip{display:flex;gap:3px;margin-top:6px}
.opt .strip i{width:18px;height:10px;border-radius:3px;display:block}
.opt .fontname{font-size:19px;line-height:1.2}
.swatches{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.sw{width:34px;height:34px;border-radius:50%;border:2px solid var(--surface);box-shadow:0 0 0 1px var(--line);cursor:pointer;padding:0}
.sw[aria-pressed="true"]{box-shadow:0 0 0 2px var(--accent)}
.custom{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);margin-left:4px}
.custom input[type=color]{width:34px;height:34px;border:1px solid var(--line);border-radius:8px;padding:2px;background:var(--surface);cursor:pointer}
.custom input[type=text]{width:86px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--bg);font-family:var(--mono);font-size:12px}
.side{position:sticky;top:16px;display:flex;flex-direction:column;gap:16px}
@media(max-width:900px){.side{position:static}}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px}
.bar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.bar h2{font-size:17px}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden}
.seg button{border:0;background:transparent;padding:6px 12px;cursor:pointer;font-size:13px}
.seg button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink)}
#frame{border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--pv-bg);color:var(--pv-text);font-family:var(--pv-body);font-size:var(--pv-p);line-height:1.6;transition:background .2s}
#frame .pv-h{font-family:var(--pv-head);color:var(--pv-text);margin:0;line-height:1.15;text-wrap:balance}
#frame .pv-nav{display:flex;justify-content:space-between;align-items:center;padding:var(--pv-s3) var(--pv-s4);border-bottom:1px solid var(--pv-border);gap:12px;flex-wrap:wrap}
#frame .pv-logo{font-family:var(--pv-head);font-weight:700;font-size:var(--pv-h4);display:flex;align-items:center;gap:8px}
#frame .pv-logo i{width:22px;height:22px;border-radius:var(--pv-r);background:var(--pv-primary);display:block}
#frame .pv-links{display:flex;gap:var(--pv-s4);font-size:var(--pv-sm);color:var(--pv-muted)}
#frame .pv-hero{padding:var(--pv-s6) var(--pv-s4) var(--pv-s5);display:flex;flex-direction:column;gap:var(--pv-s3);max-width:620px}
#frame .pv-hero h3{font-size:var(--pv-h1);font-weight:700;letter-spacing:-.01em}
#frame .pv-kh{font-family:var(--pv-kh-head);font-size:var(--pv-h4);color:var(--pv-primary-text);line-height:1.6}
#frame .pv-lead{color:var(--pv-muted);margin:0;max-width:52ch}
#frame .pv-btns{display:flex;gap:var(--pv-s2);flex-wrap:wrap;margin-top:var(--pv-s1)}
#frame .pv-btn{border-radius:var(--pv-rb);padding:calc(var(--pv-s2) + 2px) var(--pv-s4);font-weight:600;font-size:var(--pv-sm);border:1.5px solid transparent;cursor:default;font-family:var(--pv-body)}
#frame .pv-btn.primary{background:var(--pv-btn-bg);color:var(--pv-btn-fg);border-color:var(--pv-btn-border)}
#frame .pv-btn.secondary{background:transparent;color:var(--pv-text);border-color:var(--pv-border)}
#frame .pv-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--pv-s3);padding:0 var(--pv-s4) var(--pv-s5)}
#frame .pv-card{background:var(--pv-surface);border:1px solid var(--pv-border);border-radius:var(--pv-rc);padding:var(--pv-s4);box-shadow:var(--pv-shadow);display:flex;flex-direction:column;gap:var(--pv-s1)}
#frame .pv-card .ic{width:32px;height:32px;border-radius:var(--pv-r);background:var(--pv-secondary-soft);color:var(--pv-secondary-text);display:grid;place-items:center;font-weight:700;font-size:14px}
#frame .pv-card h4{font-size:var(--pv-h4);font-weight:600}
#frame .pv-card p{margin:0;font-size:var(--pv-sm);color:var(--pv-muted)}
#frame .pv-form{margin:0 var(--pv-s4) var(--pv-s5);padding:var(--pv-s4);border-radius:var(--pv-rc);background:var(--pv-primary-soft);display:flex;flex-direction:column;gap:var(--pv-s2)}
#frame .pv-form .row{display:flex;gap:var(--pv-s2);flex-wrap:wrap}
#frame .pv-input{flex:1 1 180px;padding:calc(var(--pv-s2) + 2px) var(--pv-s3);border-radius:var(--pv-r);border:1px solid var(--pv-border);background:var(--pv-surface);color:var(--pv-muted);font-size:var(--pv-sm)}
#frame .pv-alert{display:flex;gap:8px;align-items:center;font-size:var(--pv-sm);padding:var(--pv-s2) var(--pv-s3);border-radius:var(--pv-r);background:var(--pv-success-soft);color:var(--pv-success-text);border-left:4px solid var(--pv-success)}
.scales{display:flex;flex-direction:column;gap:10px}
.scale .name{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px}
.scale .row{display:grid;grid-template-columns:repeat(10,1fr);border-radius:8px;overflow:hidden;height:30px}
.scale .row i{display:block}
.badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.badge{font-size:12px;padding:4px 10px;border-radius:999px;border:1px solid var(--line);display:inline-flex;gap:6px;align-items:center}
.badge .dot{width:8px;height:8px;border-radius:50%}
.badge.pass .dot{background:#16a34a}.badge.warn .dot{background:#d97706}.badge.fail .dot{background:#dc2626}
.specimen{margin-top:14px;display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--line);padding-top:12px}
.specimen div{display:flex;gap:12px;align-items:baseline;overflow:hidden;white-space:nowrap}
.specimen code{font-family:var(--mono);font-size:11px;color:var(--muted);width:74px;flex:none;font-variant-numeric:tabular-nums}
.summary{margin-top:24px}
.summary .bar{margin-bottom:10px}
.summary p.help{margin:0 0 12px;color:var(--muted);font-size:13px}
#out{width:100%;min-height:340px;font-family:var(--mono);font-size:12.5px;line-height:1.55;padding:14px;border:1px solid var(--line);border-radius:10px;background:var(--bg);resize:vertical;white-space:pre;overflow:auto}
.copy{background:var(--accent);color:var(--accent-ink);border:0;border-radius:9px;padding:8px 16px;font-weight:600;cursor:pointer}
.submit-btn{background:#16a34a;color:#fff;border:0;border-radius:9px;padding:8px 20px;font-weight:600;cursor:pointer;font-size:14px}
.submit-btn:disabled{opacity:.6;cursor:not-allowed}
#status{font-size:13px;color:var(--muted);min-height:1.2em}
#save-status{font-size:12px;color:var(--muted);min-height:1em;text-align:right;margin-top:4px}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const PICKER_HTML = `
<div class="wrap">
  <header class="top">
    <div>
      <h1>Design Rules Picker</h1>
      <p id="p-desc">Choose the look you want for your project. The preview changes as you choose. When you are happy, submit your choices to the studio.</p>
    </div>
    <div class="how"><span><b>1</b> Pick a style</span><span><b>2</b> Adjust the details</span><span><b>3</b> Submit to studio</span></div>
  </header>

  <div class="studio">
    <div class="panel" id="panel">
      <section class="step">
        <h2><span class="n">1</span>About your project</h2>
        <div class="field"><label for="f-client">Your name or company</label><input id="f-client" class="text" placeholder="e.g. Sokha Trading Co."></div>
        <div class="field"><label for="f-project">Brand or project name</label><input id="f-project" class="text" placeholder="e.g. Lotus Coffee"></div>
        <div class="field"><span class="lbl">What are we designing?</span><div class="opts" id="o-type"></div></div>
      </section>

      <section class="step">
        <h2><span class="n">2</span>Style direction</h2>
        <p class="help">Pick the feeling closest to your brand. This fills in every choice below, and you can still change any of them.</p>
        <div class="field"><div class="opts wide" id="o-mood"></div></div>
      </section>

      <section class="step">
        <h2><span class="n">3</span>Colors</h2>
        <div class="field"><span class="lbl">Main brand color <small>buttons, links, highlights</small></span><div class="swatches" id="o-primary"></div></div>
        <div class="field"><span class="lbl">Second color <small>icons, accents, small details</small></span><div class="swatches" id="o-secondary"></div></div>
        <div class="field"><span class="lbl">Gray tone <small>text, borders, backgrounds</small></span><div class="opts" id="o-neutral"></div></div>
        <div class="field"><span class="lbl">Background</span><div class="opts" id="o-theme"></div></div>
      </section>

      <section class="step">
        <h2><span class="n">4</span>Fonts and text</h2>
        <div class="field"><span class="lbl">Heading font</span><div class="opts" id="o-head"></div></div>
        <div class="field"><span class="lbl">Body text font</span><div class="opts" id="o-body"></div></div>
        <div class="field"><span class="lbl">Languages on the design</span><div class="opts" id="o-lang"></div></div>
        <div class="field"><span class="lbl">Khmer font</span><div class="opts" id="o-kh"></div></div>
        <div class="field"><span class="lbl">Size difference between headings and text</span><div class="opts" id="o-scale"></div></div>
      </section>

      <section class="step">
        <h2><span class="n">5</span>Shape and spacing</h2>
        <div class="field"><span class="lbl">Corners</span><div class="opts" id="o-radius"></div></div>
        <div class="field"><span class="lbl">Space between things</span><div class="opts" id="o-density"></div></div>
        <div class="field"><span class="lbl">Shadows</span><div class="opts" id="o-shadow"></div></div>
        <div class="field"><span class="lbl">Main button style</span><div class="opts" id="o-button"></div></div>
      </section>

      <section class="step">
        <h2><span class="n">6</span>Voice and notes</h2>
        <div class="field"><span class="lbl">How should the words sound?</span><div class="opts" id="o-tone"></div></div>
        <div class="field"><label for="f-notes">Anything else your designer should know?</label><textarea id="f-notes" class="text" placeholder="e.g. Our logo is already green. Please avoid red. Customers are mostly on mobile."></textarea></div>
        <div class="field" style="margin-top:20px">
          <button class="submit-btn" id="btn-submit" type="button">Submit to studio →</button>
          <div id="save-status"></div>
        </div>
      </section>
    </div>

    <aside class="side">
      <div class="card">
        <div class="bar"><h2>Live preview</h2><div class="seg" id="seg-theme"></div></div>
        <div id="frame"></div>
      </div>
      <div class="card">
        <div class="bar"><h2>Your color and type rules</h2></div>
        <div class="scales" id="scales"></div>
        <div class="badges" id="badges"></div>
        <div class="specimen" id="specimen"></div>
      </div>
    </aside>
  </div>

  <section class="card summary">
    <div class="bar">
      <h2>Your design rules</h2>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div class="seg" id="seg-out"></div>
        <button class="copy" id="copy" type="button">Copy</button>
      </div>
    </div>
    <p class="help">Send the <b>Summary</b> to your designer. <b>CSS</b> and <b>JSON</b> are the same rules in a format developers can paste straight into code.</p>
    <textarea id="out" readonly aria-label="Design rules output"></textarea>
    <div id="status" role="status"></div>
  </section>
</div>
`;

function buildPickerScript(token: string, apiUrl: string, projectName: string, draft: Record<string, unknown> | null): string {
  return `
(function(){
const TOKEN = ${JSON.stringify(token)};
const API = ${JSON.stringify(apiUrl)};
const PROJECT_NAME = ${JSON.stringify(projectName)};

// ---------- Options ----------
const SERIF = ['Playfair Display','DM Serif Display','Fraunces','Lora'];
const stack = f => "'" + f + "', " + (SERIF.includes(f) ? "Georgia, serif" : "system-ui, sans-serif");

const O = {
  type:[{v:'website',t:'Website'},{v:'app',t:'Mobile app'},{v:'brand',t:'Brand identity'},{v:'social',t:'Social media'}],
  neutral:[{v:'cool',t:'Cool gray',s:'A little blue'},{v:'warm',t:'Warm gray',s:'A little brown'},{v:'pure',t:'Pure gray',s:'No color'}],
  theme:[{v:'light',t:'Light',s:'White background'},{v:'dark',t:'Dark',s:'Dark background'}],
  head:['Sora','Poppins','Montserrat','Space Grotesk','Playfair Display','DM Serif Display','Fraunces'].map(f=>({v:f,t:f,font:f})),
  body:['Work Sans','Nunito','Source Sans 3','Montserrat','Poppins','Lora'].map(f=>({v:f,t:f,font:f})),
  lang:[{v:'en',t:'English only'},{v:'kh',t:'Khmer only'},{v:'both',t:'English and Khmer'}],
  kh:[{v:'Kantumruy Pro',t:'កន្ទុំរុយ',s:'Kantumruy Pro · modern',font:'Kantumruy Pro'},{v:'Noto Sans Khmer',t:'ណូតូ',s:'Noto Sans Khmer · very readable',font:'Noto Sans Khmer'},{v:'Battambang',t:'បាត់ដំបង',s:'Battambang · traditional',font:'Battambang'},{v:'Koulen',t:'គូលែន',s:'Koulen · bold, headings only',font:'Koulen'}],
  scale:[{v:'1.2',t:'Small',s:'Calm, lots of text'},{v:'1.25',t:'Medium',s:'Balanced'},{v:'1.333',t:'Large',s:'Bold, big headings'}],
  radius:[{v:'0',t:'Sharp',s:'Square corners'},{v:'6',t:'Soft',s:'Slightly rounded'},{v:'12',t:'Rounded',s:'Friendly'},{v:'pill',t:'Pill',s:'Fully round buttons'}],
  density:[{v:'compact',t:'Compact',s:'More on screen'},{v:'comfortable',t:'Comfortable',s:'Balanced'},{v:'airy',t:'Airy',s:'Lots of space'}],
  shadow:[{v:'none',t:'None',s:'Flat, clean'},{v:'subtle',t:'Subtle',s:'Light depth'},{v:'strong',t:'Strong',s:'Cards lift off'}],
  button:[{v:'filled',t:'Filled',s:'Solid color'},{v:'outline',t:'Outline',s:'Border only'},{v:'soft',t:'Soft',s:'Light tint'}],
  tone:[{v:'formal',t:'Formal',s:'Professional, polite'},{v:'friendly',t:'Friendly',s:'Warm, simple'},{v:'playful',t:'Playful',s:'Fun, energetic'}],
};
const PRIMARY = ['#2563EB','#3346D3','#7C3AED','#DB2777','#E11D48','#EA580C','#0F9D76','#4D7C0F','#0E7490','#1F2A44','#111827'];
const SECONDARY = ['#F59E0B','#FACC15','#B08D57','#14B8A6','#22C55E','#38BDF8','#A78BFA','#F472B6','#FB7185','#64748B'];
const NEUTRAL_BASE = {cool:'#64748B', warm:'#78716C', pure:'#737373'};
const STATUS = {success:'#16A34A', warning:'#D97706', error:'#DC2626', info:'#0284C7'};
const SPACE = {compact:[4,8,12,16,24,32], comfortable:[8,12,16,24,32,48], airy:[8,16,24,32,48,64]};

const MOODS = [
  {v:'modern', t:'Modern and clean', s:'Clear, simple, trustworthy', set:{primary:'#2563EB',secondary:'#F59E0B',neutral:'cool',head:'Sora',body:'Work Sans',scale:'1.25',radius:'12',density:'comfortable',shadow:'subtle',button:'filled',tone:'friendly'}},
  {v:'premium', t:'Premium and elegant', s:'Luxury, calm, refined', set:{primary:'#1F2A44',secondary:'#B08D57',neutral:'warm',head:'Playfair Display',body:'Source Sans 3',scale:'1.333',radius:'0',density:'airy',shadow:'none',button:'outline',tone:'formal'}},
  {v:'playful', t:'Bold and playful', s:'Young, fun, energetic', set:{primary:'#E11D48',secondary:'#FACC15',neutral:'warm',head:'Poppins',body:'Nunito',scale:'1.25',radius:'pill',density:'comfortable',shadow:'strong',button:'filled',tone:'playful'}},
  {v:'friendly', t:'Warm and friendly', s:'Caring, local, welcoming', set:{primary:'#0F9D76',secondary:'#F59E0B',neutral:'warm',head:'Fraunces',body:'Nunito',scale:'1.25',radius:'12',density:'airy',shadow:'subtle',button:'soft',tone:'friendly'}},
  {v:'tech', t:'Tech and minimal', s:'Smart, precise, efficient', set:{primary:'#7C3AED',secondary:'#38BDF8',neutral:'cool',head:'Space Grotesk',body:'Source Sans 3',scale:'1.2',radius:'6',density:'compact',shadow:'none',button:'filled',tone:'formal'}},
  {v:'natural', t:'Natural and calm', s:'Organic, healthy, peaceful', set:{primary:'#4D7C0F',secondary:'#B08D57',neutral:'warm',head:'DM Serif Display',body:'Work Sans',scale:'1.25',radius:'12',density:'airy',shadow:'none',button:'soft',tone:'friendly'}},
];

// ---------- State ----------
const S = {client:'', project:PROJECT_NAME, type:'website', mood:'modern', theme:'light', lang:'both', kh:'Kantumruy Pro', notes:'', ...MOODS[0].set};
let outMode = 'brief';

// Apply saved draft if any
${draft ? `Object.assign(S, ${JSON.stringify(draftToState(draft))});` : ""}

// ---------- Color math ----------
const hexToRgb = h => { h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const n=parseInt(h,16); return [n>>16&255, n>>8&255, n&255]; };
const rgbToHex = a => '#'+a.map(x=>Math.round(Math.max(0,Math.min(255,x))).toString(16).padStart(2,'0')).join('').toUpperCase();
const mix = (a,b,t) => { const A=hexToRgb(a), B=hexToRgb(b); return rgbToHex(A.map((x,i)=>x+(B[i]-x)*t)); };
const lum = h => { const c=hexToRgb(h).map(v=>{v/=255; return v<=.03928? v/12.92 : Math.pow((v+.055)/1.055,2.4)}); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
const contrast = (a,b) => { const L1=lum(a), L2=lum(b); return (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05); };
const onColor = h => contrast(h,'#FFFFFF') >= contrast(h,'#111111') ? '#FFFFFF' : '#111111';
const STEPS = [50,100,200,300,400,500,600,700,800,900];
const scaleOf = base => {
  const w = {50:.93,100:.85,200:.7,300:.52,400:.27}, k = {600:.15,700:.32,800:.48,900:.62};
  const o = {}; STEPS.forEach(s => o[s] = s===500 ? base.toUpperCase() : s<500 ? mix(base,'#FFFFFF',w[s]) : mix(base,'#0B0B10',k[s])); return o;
};
const validHex = v => /^#?[0-9a-fA-F]{6}$/.test(v.trim());
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const label = (key,v) => (O[key].find(o=>o.v===v)||{}).t || v;

// ---------- Controls ----------
function opts(id, key, list){
  const el = document.getElementById(id);
  el.innerHTML = list.map(o => '<button type="button" class="opt" aria-pressed="' + (S[key]===o.v) + '" data-v="' + esc(o.v) + '">' +
      '<span class="t ' + (o.font?'fontname':'') + '" ' + (o.font?'style="font-family:' + stack(o.font) + '"':'') + '>' + esc(o.t) + '</span>' +
      (o.s?'<span class="s">'+esc(o.s)+'</span>':'') + (o.strip||'') + '</button>').join('');
  el.onclick = e => { const b=e.target.closest('.opt'); if(!b) return; S[key]=b.dataset.v; if(key==='mood') applyMood(b.dataset.v); render(); };
}
function swatches(id, key, list){
  const el = document.getElementById(id);
  const cur = S[key].toUpperCase();
  el.innerHTML = list.map(c => '<button type="button" class="sw" style="background:' + c + '" aria-label="Color ' + c + '" aria-pressed="' + (cur===c) + '" data-c="' + c + '"></button>').join('') +
    '<span class="custom"><input type="color" id="' + id + '-pick" value="' + cur + '" aria-label="Choose your own color"><input type="text" id="' + id + '-hex" value="' + cur + '" aria-label="Color code"></span>';
  el.querySelectorAll('.sw').forEach(b => b.onclick = () => { S[key]=b.dataset.c; render(); });
  document.getElementById(id+'-pick').oninput = e => { S[key]=e.target.value.toUpperCase(); renderPreview(); syncHex(id,key); };
  document.getElementById(id+'-pick').onchange = () => render();
  document.getElementById(id+'-hex').onchange = e => { let v=e.target.value.trim(); if(validHex(v)){ S[key]=(v[0]==='#'?v:'#'+v).toUpperCase(); render(); } else e.target.value=S[key]; };
}
function syncHex(id,key){ const t=document.getElementById(id+'-hex'); if(t) t.value=S[key].toUpperCase(); }
function seg(id, items, cur, fn){
  const el = document.getElementById(id);
  el.innerHTML = items.map(([v,t]) => '<button type="button" aria-pressed="' + (cur===v) + '" data-v="' + v + '">' + t + '</button>').join('');
  el.onclick = e => { const b=e.target.closest('button'); if(b) fn(b.dataset.v); };
}
function applyMood(v){ const m = MOODS.find(x=>x.v===v); if(m) Object.assign(S, m.set); }

function renderControls(){
  opts('o-type','type',O.type);
  opts('o-mood','mood',MOODS.map(m=>({...m, strip:'<span class="strip"><i style="background:'+m.set.primary+'"></i><i style="background:'+m.set.secondary+'"></i><i style="background:'+NEUTRAL_BASE[m.set.neutral]+'"></i></span>'})));
  swatches('o-primary','primary',PRIMARY);
  swatches('o-secondary','secondary',SECONDARY);
  opts('o-neutral','neutral',O.neutral);
  opts('o-theme','theme',O.theme);
  opts('o-head','head',O.head);
  opts('o-body','body',O.body);
  opts('o-lang','lang',O.lang);
  opts('o-kh','kh',O.kh);
  document.getElementById('o-kh').closest('.field').style.display = S.lang==='en' ? 'none' : '';
  opts('o-scale','scale',O.scale);
  opts('o-radius','radius',O.radius);
  opts('o-density','density',O.density);
  opts('o-shadow','shadow',O.shadow);
  opts('o-button','button',O.button);
  opts('o-tone','tone',O.tone);
  seg('seg-theme',[['light','Light'],['dark','Dark']],S.theme,v=>{S.theme=v; render();});
  seg('seg-out',[['brief','Summary'],['css','CSS'],['json','JSON']],outMode,v=>{outMode=v; renderControls(); renderOutput();});
}

// ---------- Derived rules ----------
function rules(){
  const P = scaleOf(S.primary), Sc = scaleOf(S.secondary), N = scaleOf(NEUTRAL_BASE[S.neutral]);
  const r = parseFloat(S.scale), base = 16;
  const sizes = {small:base/r, body:base, h4:base*r, h3:base*r*r, h2:base*r**3, h1:base*r**4};
  Object.keys(sizes).forEach(k => sizes[k] = Math.round(sizes[k]));
  const radius = S.radius==='pill' ? {base:10, card:20, button:999} : {base:+S.radius, card:+S.radius === 0 ? 0 : +S.radius+4, button:+S.radius};
  const khHead = S.kh, khBody = S.kh==='Koulen' ? 'Noto Sans Khmer' : S.kh;
  const onP = onColor(S.primary);
  return {P,Sc,N,sizes,radius,space:SPACE[S.density],khHead,khBody,onP,ratio:contrast(S.primary,onP)};
}

// ---------- Preview ----------
const COPY = {
  formal:{h:'Quality you can rely on', p:'We help businesses grow with clear, reliable service and honest advice.', kh:'គុណភាពដែលអ្នកអាចទុកចិត្តបាន'},
  friendly:{h:"Let's build something great together", p:'Simple, helpful service from a team that cares about you and your customers.', kh:'យើងបង្កើតអ្វីដែលល្អជាមួយគ្នា'},
  playful:{h:'Big ideas, served fresh every day', p:'Bright, bold and a little bit fun. Come see what is new this week.', kh:'គំនិតថ្មីៗ សម្រាប់អ្នករាល់ថ្ងៃ'},
};
const KH = {p:'ការរចនាដែលស្អាត និងងាយស្រួលប្រើ សម្រាប់អតិថិជនរបស់អ្នក។', go:'ចាប់ផ្តើម', more:'ស្វែងយល់បន្ថែម', email:'អ៊ីមែលរបស់អ្នក', sub:'ចុះឈ្មោះ', ok:'អរគុណ! ព័ត៌មានរបស់អ្នកត្រូវបានរក្សាទុក។', join:'ទទួលព័ត៌មានថ្មីៗ',
  cards:[['ល្បឿនលឿន','សេវាកម្មរហ័ស និងទាន់ពេល។'],['ទុកចិត្តបាន','ក្រុមការងារដែលមានបទពិសោធន៍។'],['ងាយស្រួលប្រើ','សាមញ្ញ និងច្បាស់លាស់។']],
  links:['ទំព័រដើម','សេវាកម្ម','ទំនាក់ទំនង']};
const EN = {go:'Get started', more:'Learn more', email:'Your email address', sub:'Subscribe', ok:'Thanks! Your details were saved.', join:'Get our latest news',
  cards:[['Fast','Quick service, always on time.'],['Trusted','An experienced team you can count on.'],['Easy','Simple and clear for everyone.']],
  links:['Home','Services','Contact']};

function renderPreview(){
  const R = rules(), dark = S.theme==='dark', f = document.getElementById('frame');
  const P=R.P, Sc=R.Sc, N=R.N, sp=R.space;
  const set = {
    '--pv-bg': dark? mix(N[900],'#000000',.35) : '#FFFFFF',
    '--pv-surface': dark? N[900] : N[50],
    '--pv-text': dark? N[50] : mix(N[900],'#000000',.25),
    '--pv-muted': dark? N[300] : N[600],
    '--pv-border': dark? N[800] : N[200],
    '--pv-primary': S.primary,
    '--pv-primary-text': dark? P[300] : P[600],
    '--pv-primary-soft': dark? mix(P[900],'#000000',.3) : P[50],
    '--pv-secondary-soft': dark? Sc[800] : Sc[100],
    '--pv-secondary-text': dark? Sc[200] : Sc[800],
    '--pv-success': STATUS.success,
    '--pv-success-soft': dark? mix(STATUS.success,'#000000',.7) : mix(STATUS.success,'#FFFFFF',.88),
    '--pv-success-text': dark? mix(STATUS.success,'#FFFFFF',.6) : mix(STATUS.success,'#000000',.35),
    '--pv-head': stack(S.head) + ", '" + R.khHead + "'",
    '--pv-body': "'" + S.body + "', '" + R.khBody + "', " + (SERIF.includes(S.body)?'Georgia, serif':'system-ui, sans-serif'),
    '--pv-kh-head': "'" + R.khHead + "', sans-serif",
    '--pv-r': R.radius.base+'px', '--pv-rc': R.radius.card+'px', '--pv-rb': R.radius.button+'px',
    '--pv-shadow': S.shadow==='none' ? 'none' : S.shadow==='subtle' ? (dark?'0 2px 8px rgba(0,0,0,.35)':'0 1px 2px rgba(16,24,40,.06), 0 4px 12px rgba(16,24,40,.06)') : (dark?'0 12px 30px rgba(0,0,0,.55)':'0 12px 30px rgba(16,24,40,.16)'),
    '--pv-sm': R.sizes.small+'px', '--pv-p': R.sizes.body+'px', '--pv-h4': R.sizes.h4+'px', '--pv-h1': 'min('+R.sizes.h1+'px, 9vw)',
  };
  sp.forEach((v,i) => set['--pv-s'+(i+1)] = v+'px');
  const btn = S.button==='filled' ? [S.primary, R.onP, S.primary] : S.button==='outline' ? ['transparent', dark?P[300]:P[600], dark?P[300]:P[600]] : [dark?P[800]:P[100], dark?P[100]:P[800], 'transparent'];
  set['--pv-btn-bg']=btn[0]; set['--pv-btn-fg']=btn[1]; set['--pv-btn-border']=btn[2];
  Object.entries(set).forEach(([k,v]) => f.style.setProperty(k,v));

  const name = esc(S.project.trim() || 'Your Brand'), c = COPY[S.tone], kh = S.lang==='kh', both = S.lang==='both', L = kh ? KH : EN;
  f.innerHTML =
    '<div class="pv-nav"><div class="pv-logo"><i></i>'+name+'</div><div class="pv-links">'+L.links.map(x=>'<span>'+x+'</span>').join('')+'</div></div>'+
    '<div class="pv-hero">'+
      '<h3 class="pv-h">'+(kh ? c.kh : esc(c.h))+'</h3>'+
      (both ? '<div class="pv-kh">'+c.kh+'</div>' : '')+
      '<p class="pv-lead">'+(kh ? KH.p : esc(c.p))+'</p>'+
      '<div class="pv-btns"><span class="pv-btn primary">'+L.go+'</span><span class="pv-btn secondary">'+L.more+'</span></div>'+
    '</div>'+
    '<div class="pv-cards">'+L.cards.map((x,i)=>'<div class="pv-card"><span class="ic">'+(i+1)+'</span><h4 class="pv-h">'+x[0]+'</h4><p>'+x[1]+'</p></div>').join('')+'</div>'+
    '<div class="pv-form"><h4 class="pv-h" style="font-size:var(--pv-h4)">'+L.join+'</h4>'+
      '<div class="row"><span class="pv-input">'+L.email+'</span><span class="pv-btn primary">'+L.sub+'</span></div>'+
      '<div class="pv-alert">✓ '+L.ok+'</div></div>';

  const strip = (nm, sc) => '<div class="scale"><div class="name"><span>'+nm+'</span><span>50 → 900</span></div><div class="row">'+STEPS.map(s=>'<i style="background:'+sc[s]+'" title="'+nm+' '+s+' '+sc[s]+'"></i>').join('')+'</div></div>';
  document.getElementById('scales').innerHTML = strip('Main color',P) + strip('Second color',Sc) + strip(label('neutral',S.neutral),N) +
    '<div class="scale"><div class="name"><span>Status colors</span><span>success · warning · error · info</span></div><div class="row" style="grid-template-columns:repeat(4,1fr)">'+Object.values(STATUS).map(c=>'<i style="background:'+c+'"></i>').join('')+'</div></div>';

  const rt = R.ratio, cls = rt>=4.5?'pass':rt>=3?'warn':'fail';
  const textOnWhite = contrast(P[600],'#FFFFFF');
  document.getElementById('badges').innerHTML =
    '<span class="badge '+cls+'"><span class="dot"></span>Button text on main color: '+rt.toFixed(1)+':1 '+(rt>=4.5?'· easy to read':rt>=3?'· OK for big text only':'· hard to read')+'</span>'+
    '<span class="badge '+(textOnWhite>=4.5?'pass':'warn')+'"><span class="dot"></span>Link color on white: '+textOnWhite.toFixed(1)+':1</span>';

  document.getElementById('specimen').innerHTML = [['h1',S.head],['h2',S.head],['h3',S.head],['body',S.body],['small',S.body]].map(([k,ff]) =>
    '<div><code>'+k.toUpperCase()+' '+R.sizes[k]+'px</code><span style="font-family:'+stack(ff)+'; font-size:'+Math.min(R.sizes[k],34)+'px; font-weight:'+(k.startsWith('h')?700:400)+'">'+(k.startsWith('h')?esc(S.head):esc(S.body))+(S.lang!=='en'?' · <span style="font-family:\\''+R.khBody+'\\'">ខ្មែរ</span>':'')+'</span></div>').join('');
  renderOutput();
}

// ---------- Output ----------
function renderOutput(){
  const R = rules(), out = document.getElementById('out');
  const proj = S.project.trim() || '(brand name not given)', cl = S.client.trim() || '(not given)';
  const today = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  const mood = MOODS.find(m=>m.v===S.mood);
  const btnShape = S.radius==='pill' ? 'fully round (pill)' : R.radius.button+'px corners';
  if(outMode==='brief'){
    out.value =
'DESIGN RULES: '+proj+'\\nClient: '+cl+'\\nDate: '+today+'\\nDesigning: '+label('type',S.type)+'\\nStyle direction: '+(mood ? mood.t+' ('+mood.s.toLowerCase()+')' : 'Custom')+'\\n\\n1. COLORS\\n   Main brand color:   '+S.primary.toUpperCase()+'  (buttons, links, key highlights)\\n   Second color:       '+S.secondary.toUpperCase()+'  (icons, accents, small details only)\\n   Gray tone:          '+label('neutral',S.neutral)+', based on '+NEUTRAL_BASE[S.neutral]+'\\n   Background:         '+label('theme',S.theme)+'\\n   Status colors:      Success '+STATUS.success+' · Warning '+STATUS.warning+' · Error '+STATUS.error+' · Info '+STATUS.info+'\\n   Text on buttons:    '+(R.onP==='#FFFFFF'?'White':'Near-black')+' (contrast '+R.ratio.toFixed(1)+':1'+(R.ratio>=4.5?', passes WCAG AA':R.ratio>=3?', large text only':', too low, choose a darker main color')+')\\n   Rule: use the main color for one main action per screen. Don\\'t use color alone to show meaning.\\n\\n2. FONTS\\n   Headings:           '+S.head+'\\n   Body text:          '+S.body+'\\n   Languages:          '+label('lang',S.lang)+(S.lang!=='en' ? '\\n   Khmer font:         '+R.khHead+(S.kh==='Koulen' ? ' for headings, Noto Sans Khmer for body text' : '')+'\\n   Khmer line height:  1.7 to 1.8 (taller than English)' : '')+'\\n   Size scale:         '+label('scale',S.scale)+' (ratio '+S.scale+')\\n   Sizes:              H1 '+R.sizes.h1+'px · H2 '+R.sizes.h2+'px · H3 '+R.sizes.h3+'px · H4 '+R.sizes.h4+'px · Body '+R.sizes.body+'px · Small '+R.sizes.small+'px\\n   Rule: body text line height 1.5. Keep lines under about 70 characters.\\n\\n3. SHAPE AND SPACING\\n   Corners:            '+label('radius',S.radius)+' · inputs '+R.radius.base+'px · cards '+R.radius.card+'px · buttons '+btnShape+'\\n   Spacing:            '+label('density',S.density)+' · use only '+R.space.join(', ')+'px\\n   Shadows:            '+label('shadow',S.shadow)+'\\n   Main button:        '+label('button',S.button)+'\\n   Rule: touch targets at least 44 × 44px on mobile.\\n\\n4. VOICE\\n   Tone:               '+label('tone',S.tone)+' ('+(O.tone.find(o=>o.v===S.tone)||{}).s.toLowerCase()+')\\n   Rule: use the same word for the same action everywhere.\\n\\n5. CLIENT NOTES\\n   '+(S.notes.trim() ? S.notes.trim().replace(/\\n/g,'\\n   ') : '(none)');
  } else if(outMode==='css'){
    const block = (nm, sc) => STEPS.map(s=>'  --color-'+nm+'-'+s+': '+sc[s]+';').join('\\n');
    out.value =
'/* Design tokens: '+proj+' ('+today+') */\\n:root {\\n  /* Colors */\\n'+block('primary',R.P)+'\\n'+block('secondary',R.Sc)+'\\n'+block('neutral',R.N)+'\\n  --color-on-primary: '+R.onP+';\\n  --color-success: '+STATUS.success+';\\n  --color-warning: '+STATUS.warning+';\\n  --color-error: '+STATUS.error+';\\n  --color-info: '+STATUS.info+';\\n\\n  /* Fonts */\\n  --font-heading: '+stack(S.head)+';\\n  --font-body: '+stack(S.body)+';'+(S.lang!=='en' ? '\\n  --font-khmer-heading: \\''+R.khHead+'\\', sans-serif;\\n  --font-khmer-body: \\''+R.khBody+'\\', sans-serif;' : '')+'\\n  --text-h1: '+R.sizes.h1+'px;\\n  --text-h2: '+R.sizes.h2+'px;\\n  --text-h3: '+R.sizes.h3+'px;\\n  --text-h4: '+R.sizes.h4+'px;\\n  --text-body: '+R.sizes.body+'px;\\n  --text-small: '+R.sizes.small+'px;\\n  --line-height-body: 1.5;'+(S.lang!=='en' ? '\\n  --line-height-khmer: 1.75;' : '')+'\\n\\n  /* Spacing */\\n'+R.space.map((v,i)=>'  --space-'+(i+1)+': '+v+'px;').join('\\n')+'\\n\\n  /* Shape */\\n  --radius-input: '+R.radius.base+'px;\\n  --radius-card: '+R.radius.card+'px;\\n  --radius-button: '+R.radius.button+'px;\\n  --shadow-card: '+(S.shadow==='none'?'none':S.shadow==='subtle'?'0 1px 2px rgba(16,24,40,.06), 0 4px 12px rgba(16,24,40,.06)':'0 12px 30px rgba(16,24,40,.16)')+';\\n}';
  } else {
    out.value = JSON.stringify({
      project:proj, client:cl, date:today, type:S.type, styleDirection:S.mood,
      color:{primary:R.P, secondary:R.Sc, neutral:R.N, onPrimary:R.onP, status:STATUS, background:S.theme},
      font:{heading:S.head, body:S.body, khmerHeading:S.lang!=='en'?R.khHead:null, khmerBody:S.lang!=='en'?R.khBody:null, languages:S.lang, scaleRatio:+S.scale, size:R.sizes},
      space:R.space, radius:R.radius, shadow:S.shadow, buttonStyle:S.button, tone:S.tone, notes:S.notes.trim()
    }, null, 2);
  }
}

function render(){ renderControls(); renderPreview(); scheduleSave(); }

// ---------- Inputs ----------
document.getElementById('f-client').oninput = e => { S.client=e.target.value; renderOutput(); };
document.getElementById('f-project').oninput = e => { S.project=e.target.value; renderPreview(); };
document.getElementById('f-notes').oninput = e => { S.notes=e.target.value; renderOutput(); };
document.getElementById('copy').onclick = async () => {
  const out = document.getElementById('out'), st = document.getElementById('status');
  try { await navigator.clipboard.writeText(out.value); st.textContent = 'Copied. Paste it into a message to your designer.'; }
  catch(e){ out.focus(); out.select(); st.textContent = 'The text is selected. Press Ctrl+C (or Cmd+C on Mac) to copy it.'; }
};

// ---------- Autosave ----------
let saveTimer = null;
function scheduleSave(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(doSave, 1500);
}
async function doSave(){
  const ss = document.getElementById('save-status');
  if(ss) ss.textContent = 'Saving…';
  try {
    const R = rules();
    const radMap = {'0':'sharp','6':'soft','12':'rounded','pill':'pill'};
    await fetch(API+'/api/v1/public/invite/'+TOKEN+'/draft', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        project_info:{brand_name:S.project||PROJECT_NAME, project_type:{website:'website',app:'mobile_app',brand:'brand_identity',social:'social_media'}[S.type]||'website'},
        style_direction:S.mood,
        colors:{primary:S.primary, secondary:S.secondary, neutral:NEUTRAL_BASE[S.neutral], background:S.theme==='dark'?'#0e1120':'#ffffff', gray_tone:S.neutral, scheme:S.theme},
        fonts:{heading:S.head, body:S.body, khmer_heading:S.lang!=='en'?R.khHead:null, khmer_body:S.lang!=='en'?R.khBody:null, languages:S.lang==='en'?['en']:S.lang==='kh'?['km']:['en','km'], scale_ratio:parseFloat(S.scale)},
        shape:{radius:radMap[S.radius]||'rounded', density:S.density, base_unit:4, shadow:S.shadow==='strong'?'strong':S.shadow, button_style:S.button},
        voice:{tone:S.tone},
        notes:S.notes
      })
    });
    if(ss) ss.textContent = 'Draft saved';
  } catch(e){ if(ss) ss.textContent = ''; }
}

// ---------- Submit ----------
document.getElementById('btn-submit').onclick = async () => {
  const btn = document.getElementById('btn-submit');
  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    const R = rules();
    const radMap = {'0':'sharp','6':'soft','12':'rounded','pill':'pill'};
    const res = await fetch(API+'/api/v1/public/invite/'+TOKEN+'/submit', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        project_info:{brand_name:S.project||PROJECT_NAME, project_type:{website:'website',app:'mobile_app',brand:'brand_identity',social:'social_media'}[S.type]||'website'},
        style_direction:S.mood,
        colors:{primary:S.primary, secondary:S.secondary, neutral:NEUTRAL_BASE[S.neutral], background:S.theme==='dark'?'#0e1120':'#ffffff', gray_tone:S.neutral, scheme:S.theme},
        fonts:{heading:S.head, body:S.body, khmer_heading:S.lang!=='en'?R.khHead:null, khmer_body:S.lang!=='en'?R.khBody:null, languages:S.lang==='en'?['en']:S.lang==='kh'?['km']:['en','km'], scale_ratio:parseFloat(S.scale)},
        shape:{radius:radMap[S.radius]||'rounded', density:S.density, base_unit:4, shadow:S.shadow==='strong'?'strong':S.shadow, button_style:S.button},
        voice:{tone:S.tone},
        notes:S.notes
      })
    });
    if(res.ok){ window.__pickerSubmitted(); }
    else { const d=await res.json(); alert(d.error?.message||'Submission failed'); btn.disabled=false; btn.textContent='Submit to studio →'; }
  } catch(e){ alert('Network error. Please try again.'); btn.disabled=false; btn.textContent='Submit to studio →'; }
};

render();
})();
`;
}

function draftToState(draft: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const c = draft.colors as Record<string, string> | undefined;
  const f = draft.fonts as Record<string, unknown> | undefined;
  const sh = draft.shape as Record<string, string> | undefined;
  const v = draft.voice as Record<string, string> | undefined;
  const pi = draft.project_info as Record<string, string> | undefined;
  if (pi?.brand_name) out.project = pi.brand_name;
  if (pi?.project_type) out.type = { website: "website", mobile_app: "app", brand_identity: "brand", social_media: "social" }[pi.project_type] ?? "website";
  if (c?.primary) out.primary = c.primary;
  if (c?.secondary) out.secondary = c.secondary;
  if (c?.gray_tone) out.neutral = c.gray_tone;
  if (c?.scheme) out.theme = c.scheme;
  if (f?.heading) out.head = String(f.heading);
  if (f?.body) out.body = String(f.body);
  if (f?.khmer_heading) out.kh = String(f.khmer_heading);
  if (Array.isArray(f?.languages)) out.lang = (f.languages as string[]).includes("km") && (f.languages as string[]).includes("en") ? "both" : (f.languages as string[]).includes("km") ? "kh" : "en";
  if (f?.scale_ratio) out.scale = String(f.scale_ratio);
  if (sh?.radius) out.radius = { sharp: "0", soft: "6", rounded: "12", pill: "pill" }[sh.radius] ?? "12";
  if (sh?.density) out.density = sh.density;
  if (sh?.shadow) out.shadow = sh.shadow;
  if (sh?.button_style) out.button = sh.button_style;
  if (v?.tone) out.tone = v.tone;
  if (typeof draft.notes === "string") out.notes = draft.notes;
  return out;
}

export default function PickerPage() {
  const { token } = useParams<{ token: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageState, setPageState] = useState<"loading" | "ready" | "error" | "submitted">("loading");
  const [inviteInfo, setInviteInfo] = useState<{ project: { brand_name: string; project_type: string }; draft: Record<string, unknown> | null } | null>(null);

  // Load invite info
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/v1/public/invite/${token}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) { setInviteInfo(data); setPageState("ready"); }
        else setPageState("error");
      })
      .catch(() => setPageState("error"));
  }, [token]);

  // Once ready, inject CSS + HTML + JS
  useEffect(() => {
    if (pageState !== "ready" || !inviteInfo || !containerRef.current) return;

    // Google Fonts
    if (!document.getElementById("picker-gf")) {
      const pre1 = document.createElement("link"); pre1.rel = "preconnect"; pre1.href = "https://fonts.googleapis.com"; document.head.appendChild(pre1);
      const pre2 = document.createElement("link"); pre2.rel = "preconnect"; pre2.href = "https://fonts.gstatic.com"; (pre2 as HTMLLinkElement).crossOrigin = "anonymous"; document.head.appendChild(pre2);
      const lk = document.createElement("link"); lk.id = "picker-gf"; lk.rel = "stylesheet"; lk.href = FONTS_HREF; document.head.appendChild(lk);
    }

    // CSS
    if (!document.getElementById("picker-css")) {
      const st = document.createElement("style"); st.id = "picker-css"; st.textContent = PICKER_CSS; document.head.appendChild(st);
    }

    // HTML
    containerRef.current.innerHTML = PICKER_HTML;

    // Expose submit callback
    (window as unknown as Record<string, unknown>).__pickerSubmitted = () => setPageState("submitted");

    // Run JS
    const script = document.createElement("script");
    script.textContent = buildPickerScript(token, API_URL, inviteInfo.project.brand_name, inviteInfo.draft);
    document.body.appendChild(script);

    return () => { try { document.body.removeChild(script); } catch { /* already removed */ } };
  }, [pageState, inviteInfo, token]);

  if (pageState === "error") return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Link expired or invalid</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>Please contact the studio for a new invite link.</p>
      </div>
    </div>
  );

  if (pageState === "submitted") return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>✓</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Thank you!</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>Your design preferences for <strong>{inviteInfo?.project.brand_name}</strong> have been submitted. The studio will review and get back to you soon.</p>
      </div>
    </div>
  );

  if (pageState === "loading") return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", color: "#6b7280" }}>
      Loading…
    </div>
  );

  return <div ref={containerRef} />;
}

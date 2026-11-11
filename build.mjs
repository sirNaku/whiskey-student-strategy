// Builds the Whiskey Student strategy website into dist/.
// Edit the files in content/ and run `npm run build` (GitHub Actions does it on every push).
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const SRC = 'content', OUT = 'dist';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const PILLAR_KEY = { 'Tasting & Reviews': 'tasting', 'Learning Journey POV': 'journey', 'Head-to-Head': 'h2h', 'Education & How-To': 'edu', 'History & Heritage': 'history', 'Distillery Visits': 'visits' };
const PILLARS = Object.keys(PILLAR_KEY);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fmt = (s, o = { weekday: 'short', month: 'short', day: 'numeric' }) => s ? new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { ...o, timeZone: 'UTC' }) : '';
const fmtTime = (t) => { if (!t || !t.includes(':')) return t || ''; const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };

const NAV = [['index.html', 'Overview'], ['strategy.html', 'Content strategy'], ['growth.html', 'Growth plan'], ['calendar.html', 'Calendar'], ['ideas.html', 'Ideas']];
function page(file, title, body, { toc = null, wide = false } = {}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · The Whiskey Student</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1E5A43">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="styles.css"></head>
<body>
<header class="top"><div class="top-in"><a class="brand" href="index.html">Whiskey <span>Student</span></a>
<nav aria-label="Pages"><ul>${NAV.map(([h, l]) => `<li><a href="${h}"${h === file ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}</ul></nav></div></header>
<main class="wrap${wide ? ' wide' : ''}${toc ? ' has-toc' : ''}">
${toc ? `<nav class="toc" aria-label="On this page"><p class="toc-h">On this page</p>${toc.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</nav>` : ''}
<div class="body">${body}</div></main>
<footer class="foot"><div class="wrap">The Whiskey Student · Naku Mayo · strategy and planning documents</div></footer>
</body></html>`;
}

// Markdown documents with heading anchors and a table of contents
function renderDoc(md) {
  const toc = [];
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const id = slug(text);
    if (depth === 2) toc.push([id, text]);
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };
  renderer.table = function (token) {
    const head = token.header.map((c) => c.text).every((t) => !t.trim()) ? '' :
      `<thead><tr>${token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('')}</tr></thead>`;
    const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
    return `<div class="tw"><table>${head}<tbody>${rows}</tbody></table></div>\n`;
  };
  const html = marked.parse(md, { renderer, gfm: true });
  return { html, toc };
}

const docs = [
  ['strategy.html', 'Content strategy', 'strategy.md'],
  ['growth.html', 'Growth plan', 'growth.md'],
];
for (const [file, title, src] of docs) {
  const { html, toc } = renderDoc(fs.readFileSync(path.join(SRC, src), 'utf8'));
  fs.writeFileSync(path.join(OUT, file), page(file, title, `<article class="md">${html}</article>`, { toc }));
}

// Calendar
const cal = JSON.parse(fs.readFileSync(path.join(SRC, 'calendar.json'), 'utf8'));
const dot = (p) => p ? `<span class="pdot p-${PILLAR_KEY[p] || 'none'}" aria-hidden="true"></span>` : '';
const legend = `<p class="legend">${PILLARS.map((p) => `<span>${dot(p)}${esc(p)}</span>`).join('')}</p>`;
const weekRows = cal.weeks.map((w) => {
  const items = w.items.slice().sort((a, b) => ((a.postDate || a.shootDate) + (a.time || '')).localeCompare((b.postDate || b.shootDate) + (b.time || '')));
  const first = items.find((i) => i.postDate)?.postDate;
  const rows = items.map((i) => {
    const shoot = i.platform === 'Shoot';
    return `<tr class="${shoot ? 'shoot' : `p-${PILLAR_KEY[i.pillar] || 'none'}`}"><td class="d">${esc(fmt(shoot ? i.shootDate : i.postDate))}</td><td class="t">${esc(shoot ? 'Shoot' : fmtTime(i.time))}</td>
      <td class="pl">${esc(shoot ? 'Batch shoot' : i.platform)}</td><td>${dot(i.pillar)}<b>${esc(i.title)}</b>${i.notes ? `<span class="n">${esc(i.notes)}</span>` : ''}</td></tr>`;
  }).join('');
  return `<section class="week" id="week-${w.week}"><h2>Week ${w.week} <span class="wk-meta">${esc(fmt(first, { month: 'short', day: 'numeric' }))} · Cycle ${esc(w.cycle)} · ${esc(w.theme)}</span></h2>
    <div class="tw"><table class="cal"><thead><tr><th>Date</th><th>Time</th><th>Platform</th><th>Content</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}).join('');
const extra = cal.extra.map((i) => `<tr class="p-${PILLAR_KEY[i.pillar] || 'none'}"><td class="d">${esc(fmt(i.platform === 'Shoot' ? i.shootDate : i.postDate))}</td><td class="pl">${esc(i.platform)}</td><td>${dot(i.pillar)}<b>${esc(i.title)}</b>${i.notes ? `<span class="n">${esc(i.notes)}</span>` : ''}</td></tr>`).join('');
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const template = cal.template.slice().sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7) || a.time.localeCompare(b.time))
  .map((s) => `<tr><td class="d">${DOW[s.day]}</td><td class="t">${esc(fmtTime(s.time))}</td><td class="pl">${esc(s.platform)}</td><td>${esc(s.slot)}</td></tr>`).join('');
fs.writeFileSync(path.join(OUT, 'calendar.html'), page('calendar.html', 'Calendar', `
  <h1>12-week calendar</h1>
  <p class="lede">Nov 9, 2026 – Jan 31, 2027. Shoot on Sunday for the week ahead. This is the starting plan; the live version, with statuses, is in the app under Plan → Calendar.</p>
  ${legend}
  <nav class="weeks" aria-label="Weeks">${cal.weeks.map((w) => `<a href="#week-${w.week}">${w.week}</a>`).join('')}</nav>
  <section class="week"><h2>Every week</h2><div class="tw"><table class="cal"><thead><tr><th>Day</th><th>Time</th><th>Platform</th><th>Slot</th></tr></thead><tbody>${template}</tbody></table></div></section>
  ${weekRows}
  <section class="week"><h2>Distillery shoots and tentpoles</h2><div class="tw"><table class="cal"><thead><tr><th>Date</th><th>Type</th><th>What</th></tr></thead><tbody>${extra}</tbody></table></div></section>`, { wide: true }));

// Ideas
const ideas = JSON.parse(fs.readFileSync(path.join(SRC, 'ideas.json'), 'utf8'));
const ideaHTML = PILLARS.map((p) => {
  const list = ideas.filter((i) => i.pillar === p);
  if (!list.length) return '';
  return `<section class="pillar p-${PILLAR_KEY[p]}" id="${PILLAR_KEY[p]}"><h2>${dot(p)}${esc(p)} <span class="wk-meta">${list.length} ideas</span></h2><ul class="ideas">${list.map((i) =>
    `<li><h3>${esc(i.title)}</h3>${i.hook ? `<p class="hook">“${esc(i.hook)}”</p>` : ''}<p class="muted">${esc([i.format, i.notes].filter(Boolean).join(' — '))}</p></li>`).join('')}</ul></section>`;
}).join('');
fs.writeFileSync(path.join(OUT, 'ideas.html'), page('ideas.html', 'Ideas', `
  <h1>Idea bank</h1><p class="lede">${ideas.length} ideas across six pillars, each with the line to open on.</p>
  <nav class="weeks" aria-label="Pillars">${PILLARS.map((p) => `<a href="#${PILLAR_KEY[p]}">${dot(p)}${esc(p)}</a>`).join('')}</nav>${ideaHTML}`, { wide: true }));

// Overview
const nextItems = cal.weeks.flatMap((w) => w.items).filter((i) => i.platform === 'YouTube').slice(0, 12);
fs.writeFileSync(path.join(OUT, 'index.html'), page('index.html', 'Overview', `
  <h1>The Whiskey Student</h1>
  <p class="lede">A bartender and photographer learning whiskey in public. This site holds the plan behind the channel: what we make, when we post it, and how the audience grows.</p>
  <div class="goals">
    <div><span class="k">Goal 1</span><p>Show the journey from student to expert, honestly, over years.</p></div>
    <div><span class="k">Goal 2</span><p>Build trust in the whiskey community and attract brand deals.</p></div>
    <div><span class="k">Target</span><p><b>1,000</b> Instagram followers by Jan 31, 2027 (from 533 on Nov 3).</p></div>
  </div>
  <div class="cards">
    <a class="card" href="strategy.html"><h2>Content strategy</h2><p>Positioning, the six pillars, recurring series, production rhythm, distillery playbook and learning resources.</p></a>
    <a class="card" href="growth.html"><h2>Growth plan</h2><p>Monetization requirements, the Instagram and YouTube growth engines, weekly schedules and brand-deal readiness.</p></a>
    <a class="card" href="calendar.html"><h2>12-week calendar</h2><p>Every shoot and post from Nov 9 to Jan 31, colour-coded by pillar.</p></a>
    <a class="card" href="ideas.html"><h2>Idea bank</h2><p>${ideas.length} content ideas with opening hooks, grouped by pillar.</p></a>
  </div>
  <h2 class="sub">YouTube long-form, next 12 weeks</h2>
  <div class="tw"><table class="cal"><tbody>${nextItems.map((i) => `<tr class="p-${PILLAR_KEY[i.pillar] || 'none'}"><td class="d">${esc(fmt(i.postDate))}</td><td>${dot(i.pillar)}<b>${esc(i.title)}</b></td></tr>`).join('')}</tbody></table></div>`));

fs.copyFileSync('styles.css', path.join(OUT, 'styles.css'));
fs.copyFileSync('icon.svg', path.join(OUT, 'icon.svg'));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log('Built', fs.readdirSync(OUT).join(', '));

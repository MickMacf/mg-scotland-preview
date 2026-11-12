const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* nav */
const nav = $('#nav'), links = $('#links'), burger = $('#burger');
const onScrollNav = () => nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();
burger.addEventListener('click', () => { const o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); nav.classList.toggle('solid', o || scrollY > 40); });
links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

/* reveal */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach(el => io.observe(el));

/* stat count-up */
if (!RM) {
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    const tick = t => { const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }));
  $$('[data-count]').forEach(el => cio.observe(el));
}

/* hero dust: slow drifting motes lit from the right, like a dry yard in low sun */
(() => {
  const c = $('#dust'); if (!c || RM) return;
  const x = c.getContext('2d'); let w, h, dpr, P = [];
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const mk = (any) => ({ x: any ? Math.random() * w : -20, y: h * (.25 + Math.random() * .75), z: Math.random(), vx: .15 + Math.random() * .5, vy: -.05 - Math.random() * .18, ph: Math.random() * 6.28 });
  size(); addEventListener('resize', size);
  for (let i = 0; i < 90; i++) P.push(mk(true));
  let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(c);
  const draw = t => {
    requestAnimationFrame(draw); if (!vis) return;
    x.clearRect(0, 0, w, h);
    for (const p of P) {
      p.x += p.vx * (.4 + p.z); p.y += p.vy + Math.sin(t / 1400 + p.ph) * .12;
      if (p.x > w + 20 || p.y < -20) Object.assign(p, mk(false));
      const r = .6 + p.z * 2.6, a = (.08 + p.z * .28) * (.6 + .4 * Math.sin(t / 900 + p.ph));
      const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      g.addColorStop(0, `rgba(255,226,170,${a})`); g.addColorStop(1, 'rgba(255,226,170,0)');
      x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, r * 3, 0, 6.283); x.fill();
    }
  };
  requestAnimationFrame(draw);
})();

/* card turn: scroll progress through the steps turns Red to Blue */
(() => {
  const t = $('#ticket'), steps = $$('#steps li'), box = $('#steps'); if (!t) return;
  const upd = () => {
    const r = box.getBoundingClientRect(), vh = innerHeight;
    const p = Math.max(0, Math.min(1, (vh * .62 - r.top) / r.height));
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((s, i) => s.classList.toggle('on', i <= idx));
    // hold red through step 4, turn during 5, blue at 6
    const turn = Math.max(0, Math.min(1, (p * steps.length - 4) / 1.1));
    const e = turn * turn * (3 - 2 * turn);
    t.style.setProperty('--ry', (-16 + e * 196) + 'deg');
    t.style.setProperty('--sheen', (120 - p * 140) + '%');
  };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
})();

/* excavator dig cycle */
(() => {
  const boom = $('#boom'), stick = $('#stick'), bucket = $('#bucket'), read = $('#read'); if (!boom) return;
  const P0 = [278, 238], J1 = [462, 238], J2 = [582, 238];
  // [boom, stick, bucket] degrees, then hold time
  const K = [[-30, 18, -10], [2, 50, 10], [-4, 84, 62], [-40, 78, 78], [-44, 26, -14], [-30, 18, -10]];
  const D = [1500, 1700, 1500, 1500, 1300];
  const total = D.reduce((a, b) => a + b, 0);
  const rot = (p, o, a) => { const r = a * Math.PI / 180, dx = p[0] - o[0], dy = p[1] - o[1]; return [o[0] + dx * Math.cos(r) - dy * Math.sin(r), o[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };
  const set = (el, a, b) => { el.setAttribute('x1', a[0]); el.setAttribute('y1', a[1]); el.setAttribute('x2', b[0]); el.setAttribute('y2', b[1]); };
  const mid = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const pad = n => String(Math.round(Math.abs(n))).padStart(3, '0');
  const pose = (a, b, c) => {
    boom.setAttribute('transform', `rotate(${a} ${P0})`);
    stick.setAttribute('transform', `rotate(${b} ${J1})`);
    bucket.setAttribute('transform', `rotate(${c} ${J2})`);
    const base = [296, 268], top = rot([360, 216], P0, a);            // boom ram: body to underside of boom
    set($('#cyl1a'), base, mid(base, top, .55)); set($('#cyl1b'), base, top);
    const s0 = [384, 196], s1 = rot([436, 224], J1, b);                // stick ram: boom knuckle to stick tail (boom space)
    set($('#cyl2a'), s0, mid(s0, s1, .55)); set($('#cyl2b'), s0, s1);
    read.innerHTML = `BOOM ${pad(a)}°<br>STICK ${pad(b)}°<br>BUCKET ${pad(c)}°`;
  };
  pose(...K[1]);
  if (RM) return;
  let vis = false; new IntersectionObserver(e => vis = e[0].isIntersecting).observe($('#exc'));
  const loop = t => {
    requestAnimationFrame(loop); if (!vis) return;
    let m = t % total, i = 0; while (m > D[i]) m -= D[i++];
    let p = m / D[i]; p = p * p * p * (p * (p * 6 - 15) + 10);       // smootherstep, like feathering the levers
    pose(...K[i].map((v, k) => v + (K[i + 1][k] - v) * p));
  };
  requestAnimationFrame(loop);
})();

/* fleet rail */
(() => { const r = $('#rail'); if (!r) return; const step = d => r.scrollBy({ left: d * Math.min(540, innerWidth * .8), behavior: RM ? 'auto' : 'smooth' }); $('#prev').onclick = () => step(-1); $('#next').onclick = () => step(1); })();

/* reviews (excerpts from the company's published reviews) */
(() => {
  if (!$('#wall')) return;
  const R = [
    ['Chris Homan', 'I sat my CPCS with James and I am over the moon with how welcoming and professional he was.', ''],
    ['Stephen Ward', 'Very professional, good training, staff and trainers are really knowledgeable.', '10/10'],
    ['Brian Joseph', 'Very professional and helpful. Great training provider.', ''],
    ['Felix Thuemmler', 'I had a great experience with MG training. From start to finish.', '10/10'],
    ['Mark Toye', 'Training was great, explained everything very well, very professional, no bother at all.', ''],
    ['Garry Hughes', 'If anyone is thinking about going for tickets in Scotland, well worth it.', ''],
    ['Colin Cameron', 'He was patient and informative.', ''],
    ['Mark Jack', 'He was amazing and couldn’t help me enough.', '']
  ];
  const card = r => `<figure class="q"><blockquote>${r[1]}</blockquote><footer>${r[0]}<span>${r[2]}</span></footer></figure>`;
  const lane = (rows, rev) => `<div class="lane${rev ? ' rev' : ''}">${(rows.map(card).join('')).repeat(2)}</div>`;
  $('#wall').innerHTML = lane(R.slice(0, 4)) + lane(R.slice(4), true);
  $$('#wall .lane').forEach(l => $$('.q', l).slice(4).forEach(q => q.setAttribute('aria-hidden', 'true')));
})();

/* category finder */
(() => {
  const CPCS = `A09|Forward Tipping Dumper
A09A|Forward Tipping Dumper, Wheeled
A09B|Forward Tipping Dumper, Tracked
A10|Excavator 180° below 5 tonnes
A12|Excavator 180° above 5 tonnes
A14|Rough Terrain Masted Forklift
A16|Industrial Forklift Truck
A17|Telescopic Handler
A17A|Telescopic Handler, Industrial Telescopic
A17B|Telescopic Handler, Up to 9 metres
A17C|Telescopic Handler, All sizes exc. 360 slew
A17D|Telescopic Handler, All sizes inc. 360 slew
A17E|Telescopic Handler, Suspended load (non-rough terrain)
A19|Grader
A21|Wheeled Loading Shovel
A23|Skid Steer Loader
A25|Mobile Elevating Work Platform, Scissor
A26|Mobile Elevating Work Platform, Boom
A26A|MEWP Boom, Vehicle Mounted
A26B|MEWP Boom, Self Propelled
A31|Ride on Roller
A32|Soil/Landfill Compactor
A33|Agricultural Tractor
A34|Crawler, Tractor/Dozer
A36|Lorry Loader
A36A|Lorry Loader, Hook
A36B|Lorry Loader, Clamshell Bucket
A36C|Lorry Loader, Hydraulic Clamp
A39|Skip Handler
A40|Slinger/Signaller
A40A|Slinger/Signaller, All Types, All Duties
A40B|Slinger/Signaller, All Types, Static Duties
A40C|Slinger/Signaller, Knuckle Boom, Static Duties Only
A40D|Slinger/Signaller, Excavator Only
A40E|Slinger/Signaller, Lift Truck Only
A41|Loader Compressor
A42|Crusher
A43|Screener
A56|Dump Truck, Articulated Chassis
A56A|Dump Truck, Articulated Chassis, Up to 15 tonnes
A56B|Dump Truck, Articulated Chassis, All sizes
A57|Dump Truck, Rigid Chassis
A57A|Dump Truck, Rigid Chassis, Up to 15 tonnes
A57B|Dump Truck, Rigid Chassis, Up to 50 tonnes
A57C|Dump Truck, Rigid Chassis, All sizes (wheeled)
A57D|Dump Truck, Rigid Chassis, Tracked
A58|Excavator 360° below 10 tonnes
A58A|Excavator 360° below 10 tonnes, Tracked
A58B|Excavator 360° below 10 tonnes, Wheeled
A58C|Excavator 360° below 10 tonnes, Lifting Operations
A59|Excavator 360° above 10 tonnes
A59A|Excavator 360° above 10 tonnes, Tracked
A59B|Excavator 360° above 10 tonnes, Wheeled
A59C|Excavator 360° above 10 tonnes, Lifting Operations
A60|Mobile Crane
A60A|Mobile Crane, Blocked Duties Only
A60B|Mobile Crane, Pick-and-Carry Duties Only
A60C|Mobile Crane, All Duties
A61|Appointed Person, Lifting Operations
A62|Crane/Lifting Operations Supervisor
A68|Plant Driving
A68A|Plant Driving, Tracked boom equipped, up to 10 tonnes, non-operational only
A68C|Plant Driving, Tracked boom equipped, up to 50 tonnes, non-operational only
A68G|Plant Driving, Tracked (blade/shovel), up to 20 tonnes, non-operational only
A68I|Plant Driving, Tracked (blade/shovel), All sizes, non-operational only
A68K|Plant Driving, Wheeled articulated chassis, up to 15 tonnes, non-operational only
A68M|Plant Driving, Wheeled articulated chassis, All sizes, non-operational only
A68O|Plant Driving, Wheeled rigid chassis, up to 15 tonnes, non-operational only
A68Q|Plant Driving, Wheeled rigid chassis, All sizes, non-operational only
A68S|Plant Driving, Non-operational Ride-on-Roller
A94|Suspended loads (Non-rough terrain)
A94E|Suspended loads (Non-rough terrain)
A95|Slinger/Signaller
A97|Excavator 360 below 10 tonnes, Lifting Operations
A97C|Excavator 360 below 10 tonnes, Lifting Operations
A98|Excavator 360 above 10 tonnes, Lifting Operations
A98C|Excavator 360 above 10 tonnes, Lifting Operations
Z68|Plant Driving`;
  const NPORS = {
    'Earth moving': 'N016|Micro Excavator (up to 1T);N201|Excavator 180°;N202|Excavator 360°;N204|Forward Tipping Dumper;N205|Rear Tipping Dumper;N209|Loading Shovel;N212|Skidsteer Loader;N215|Dozer;N240|Grader;N223|Scraper;N139|Mini Dumper (up to 1T);N203|Trencher',
    'Road and surfacing': 'N214|Road Roller;N216|Road Planer;N220|Paver;N217|Road Sweeper;N244|Chipping Spreader;N802|Gritter & Snowplough',
    'Telehandlers and lift trucks': 'N009|Rough Terrain Forklift;N010|Telescopic Handler;N013|Pivot Steer Forklift;N135|Multi Directional Lift Truck;N001|Counterbalance Forklift;N003|Reach Truck;N004|Lorry Mounted Forklift;N006|Sideloader;N008|Pallet Stacker;N011|Industrial Telescopic Handler;N012|Container Handler',
    'Agriculture, forestry and plant': 'N601|Agricultural Tractor;N602|Chainsaw;N603|Wood Chipper;N604|Grass Cutter / Mower;N605|Brush Cutter;N610|Hedge Trimmer;N017|Hand Held Cut Off Saw;N301|Abrasive Wheels;N302|Bench Saw;N303|Circular Saw',
    'Lifting and crane ops': 'N100|Excavator as a Crane;N101|Mobile Crane;N102|Tower Crane;N103|Crawler Crane;N107|Lorry Loader;N138|Telehandler Suspended Loads;N401|Appointed Person;N402|Slinger / Signaller;N405|Crane Supervisor;N104|Overhead Crane;N108|MEWP Boom;N109|MEWP Scissor Lift;N111|Hoist;N115|Remote Control Tower Crane;N140|Compact Crane;N046|Rigging & Fleeting Loads Planner;N047|Rigging & Fleeting Loads',
    'Transport and vehicle ops': 'N027|Excavation Marshal / Banksman;N120|Plant Loader & Securer;N210|Tow Tractor;N219|Skip Loader;N225|Hook Loader;N243|Shunter Vehicle;N607|4x4 Off Road;N608|ATV;N124|Load & Secure Excavator;N133|Plant Machinery Marshal;N403|Vehicle Marshal',
    'Health, safety and specialist': 'S001|Construction Safety Awareness;N031|Asbestos Awareness;N035|MEWP Supervisor Awareness;N036|Lift Truck Supervisor Awareness;N404|Safe Working at Height;N702|Confined Spaces;N704|Manual Handling;N711|Safe Use of Ladders;N714|Street Works Safety;N723|Harness & Fall Arrest;N726|Quick Hitch Awareness;N014|Marine Knuckle Boom Crane;N019|Thorough Examination of Small Lifting Equipment;N504|Rail Handler;N506|Generator;N106|Log Handler;N033|Puller Winch;N710|Cartridge Tool'
  };
  const all = CPCS.split('\n').map(l => { const [c, n] = l.split('|'); return { s: 'CPCS', c, n, g: 'CPCS' }; });
  for (const g in NPORS) NPORS[g].split(';').forEach(l => { const [c, n] = l.split('|'); all.push({ s: 'NPORS', c, n, g: 'NPORS · ' + g }); });
  const list = $('#flist'); if (!list) return;
  const count = $('#fcount'), q = $('#q'), preset = list.closest('.finder').dataset.scheme;
  let scheme = preset || 'ALL'; if (preset) $('.seg').hidden = true;
  const esc = s => s.replace(/&/g, '&amp;');
  const render = () => {
    const terms = q.value.toLowerCase().replace(/º/g, '°').split(/\s+/).filter(Boolean);
    const hits = all.filter(i => (scheme === 'ALL' || i.s === scheme) && terms.every(t => (i.c + ' ' + i.n + ' ' + i.g).toLowerCase().includes(t)));
    list.innerHTML = hits.length ? hits.map(i => `<div data-s="${i.s}"><b>${i.c}</b><span>${esc(i.n)}</span><small>${esc(i.g)}</small></div>`).join('')
      : `<p class="f-empty">Nothing matches “${q.value.replace(/[<>&]/g, '')}”. Try a machine name such as dumper or roller, or call 0141 771 0040 and ask.</p>`;
    count.textContent = hits.length + ' of ' + all.filter(i => scheme === 'ALL' || i.s === scheme).length + ' categories';
  };
  q.addEventListener('input', render);
  $$('.seg button').forEach(b => b.addEventListener('click', () => { scheme = b.dataset.s; $$('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b)); render(); }));
  render();
})();

/* enquiry: validates, then hands off to the visitor's email app */
$('#enquiry')?.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, fine = $('#f-fine');
  const bad = $$('[required]', f).find(i => !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
  if (bad) { fine.textContent = 'Please fill in ' + bad.labels[0].textContent.replace(' *', '').toLowerCase() + (bad.type === 'email' && bad.value ? ' with a valid address' : '') + '.'; fine.style.color = 'var(--yellow)'; bad.focus(); return; }
  const d = new FormData(f);
  const body = `Name: ${d.get('name')}\nCompany: ${d.get('company')}\nContact number: ${d.get('phone') || '-'}\nEmail: ${d.get('email')}\nInterested in: ${d.get('interest')}\n\n${d.get('comments') || ''}`;
  location.href = 'mailto:info@mgtrainingscotland.co.uk?subject=' + encodeURIComponent('Training enquiry: ' + d.get('interest')) + '&body=' + encodeURIComponent(body);
  fine.textContent = 'Your email app should now be open with the enquiry ready to send. If nothing opened, call 0141 771 0040.'; fine.style.color = 'var(--steel)';
});

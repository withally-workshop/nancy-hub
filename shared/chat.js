// ══════════════════════════════════════
// NANCY AI — Floating Chat Bubble
// Requires: GROQ_API_KEY + GROQ_MODEL (hub.js globals)
// ══════════════════════════════════════

(function() {

var nc = {
  open: false,
  messages: [],   // {role:'user'|'assistant', content:'...'}
  typing: false,
  unread: false
};

var NANCY_SYSTEM = 'You are Nancy, a sharp and friendly AI assistant inside the CareNBloom team hub. '
  + 'CareNBloom is the company behind Hello Nancy — a sexual wellness brand that makes pleasure products approachable, fun, and empowering.\n\n'
  + '## Hello Nancy Brand\n'
  + 'Mission: Make pleasure accessible, inclusive, and shame-free for everyone.\n'
  + 'Personality: Playful (not crude), empowering (not preachy), educational (not clinical), inclusive (not gendered), warm (not formal).\n'
  + 'Voice: Fun, punny, confident, sex-positive, never explicit. Think: a best friend who happens to know everything about wellness.\n\n'
  + '## Product Line\n'
  + '- Avo: Air-suction clitoral massager, 12 intensities, avocado-shaped\n'
  + '- Lem: Compact clitoral massager\n'
  + '- Lolly: Mini wand, pocket travel companion, 10 intensities\n'
  + '- Lumii: Suction toy, 7 intensities, rainbow glow, 1-button design\n'
  + '- Namii 2: 2-in-1 suction + vibration, 7 suction modes + 6 vibe modes, hands-free, charging base is a mood light\n'
  + '- Berri: Edging tapping massager, TapSphere™ Tech, 12 rhythmic patterns, builds sensation slowly\n'
  + '- Gii / Gii Glow: Internal + external vibrator, 9 vibe modes, 8 strength settings\n'
  + '- Pixie: Remote-controlled panty vibrator, magnetic, 10 settings, waterproof\n'
  + '- Kalii: Glass G-spot dildo, smooth curves + ribs, comes with vegan leather case\n'
  + '- Anii: Glass plug, borosilicate glass, vegan leather case\n'
  + '- Together: 180-card intimacy deck for couples\n'
  + '- Bundles: Tutti Frutti (Avo + Lem), Oh-Oh-Oh Triple (Uno + Lem + Lolly)\n\n'
  + '## Target Audience\n'
  + 'Primary: Women and vulva-owners aged 20–40 in Philippines and Hong Kong. Curious, open-minded, TikTok-savvy, value quality and discretion.\n'
  + 'Secondary: Couples exploring together.\n\n'
  + '## Content Pillars\n'
  + '1. Pleasure Education (how-to, tips, guides)\n'
  + '2. Product Spotlights (features, demos, unboxings)\n'
  + '3. Relatable Moments (lifestyle, humor, day-in-the-life)\n'
  + '4. Community & Relationships (intimacy tips, couples content)\n'
  + '5. Trending Formats (TikTok trends adapted to brand)\n\n'
  + '## Platform Notes\n'
  + 'TikTok: Hook in first 3 seconds, educational + entertaining, follow community guidelines (no explicit content).\n'
  + 'Instagram: Aesthetic grid, product highlights, Stories for engagement, Reels for reach.\n\n'
  + '## Vocabulary\n'
  + 'USE: pleasure, stimulation, sensation, explore, discover, feel, intimacy, wellness, self-care, empowering, fun, play, beginner-friendly\n'
  + 'AVOID: explicit/adult slang, clinical medical terms, shame language, gendered exclusionary terms\n\n'
  + '## Your Role\n'
  + 'You help the CareNBloom team with:\n'
  + '- Content strategy: TikTok/Instagram captions, hashtags, hooks, video scripts, campaign ideas aligned with the Hello Nancy brand\n'
  + '- Brainstorming: creative concepts, product ideas, content pillars, angles\n'
  + '- Writing: emails, SOPs, training docs, proposals, bios, replies — all in brand voice\n'
  + '- Brand guidance: what sounds on-brand vs off-brand, vocabulary, tone checks\n'
  + '- AI tools guidance: Claude, Groq, Midjourney, Perplexity, ChatGPT\n\n'
  + 'Personality: warm, direct, practical, and a little witty. '
  + 'Give clear actionable answers. Use bullet points for lists. '
  + 'Keep responses concise unless asked for detail. '
  + 'You are inside Nancy Hub, the internal marketing workspace for CareNBloom, based in Hong Kong.';

var STARTERS = [
  'What are Dione\'s pending tasks?',
  'Show me all top 3 priority tasks',
  'Pull recent messages from #general',
  'Who\'s on the team and what are their roles?',
  'Brainstorm content ideas for this week'
];

// ── STYLES ──────────────────────────────────────────

function injectStyles() {
  var s = document.createElement('style');
  s.textContent = [
    // ── Tiny magenta bot — no glow, black eyes, "Hi" label ──────────
    // Wrapper — row: "Hi" left, bot right
    '.nc-bubble{position:fixed;bottom:1.75rem;right:1.75rem;z-index:900;width:auto;height:auto;background:transparent;border:none;cursor:pointer;padding:0;display:flex;flex-direction:row;align-items:flex-end;gap:5px;transition:transform .2s ease;overflow:visible}',
    '.nc-bubble:hover{transform:translateY(-2px)}',
    '.nc-bubble.open{transform:none}',

    // "Hi" pill — always visible, no glow
    '.nc-bbl{display:flex;align-items:center;margin-bottom:6px}',
    '.nc-bbl-lbl{font-family:Inter,sans-serif;font-size:.68rem;font-weight:600;color:rgba(255,255,255,.75);letter-spacing:.02em;line-height:1;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:.25rem .55rem;white-space:nowrap}',

    // Unread dot
    '.nc-bubble-dot{position:absolute;top:0;right:0;width:6px;height:6px;background:#e53935;border-radius:50%;border:1.5px solid rgba(0,0,0,.5);display:none;z-index:10}',
    '.nc-bubble-dot.show{display:block}',

    // Bot column — floats
    '.nc-lemon{display:flex;flex-direction:column;align-items:center;flex-shrink:0;gap:0;animation:ncFloat 2.8s ease-in-out infinite}',
    '@keyframes ncFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',

    '.nc-lemon-leaf{display:none}',

    // HEAD — smaller, no glow
    '.nc-eve-head{width:24px;height:22px;background:linear-gradient(160deg,#fce4f6 0%,#f472b6 45%,#ec4899 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.2)}',

    // Eyes — tiny solid black dots, no glow
    '.nc-lemon-eyes{display:flex;gap:4px}',
    '.nc-lemon-eye{width:5px;height:5px;background:#111;border-radius:50%}',
    '.nc-lemon-eye::before{display:none}',

    // BODY — smaller, no glow
    '.nc-lemon-body{width:18px;height:16px;background:linear-gradient(160deg,#fce4f6 0%,#f472b6 45%,#ec4899 100%);border-radius:50% 50% 48% 48%/44% 44% 56% 56%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,.18);margin-top:-2px}',
    '.nc-lemon-body::after{display:none}',

    // Arms row
    '.nc-eve-row{display:flex;align-items:center;gap:1px}',

    // Arms — smaller, no glow
    '.nc-eve-arm{width:7px;height:13px;background:linear-gradient(160deg,#f472b6,#ec4899);border-radius:50%;box-shadow:none}',
    '.nc-eve-arm-l{transform:rotate(12deg);transform-origin:top center}',
    '.nc-eve-arm-r{transform-origin:top center;animation:ncWave 1.2s ease-in-out infinite}',
    '@keyframes ncWave{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(-34deg)}}',

    '.nc-lemon-smile,.nc-bot-neck,.nc-bot-shoulders{display:none}',
    // ── end bot ──────────────────────────────────────────────────────

    // Panel
    '.nc-panel{position:fixed;bottom:calc(1.75rem + 80px + .75rem);right:1.75rem;z-index:900;width:380px;max-height:560px;background:var(--card,#1a1a1a);border:1px solid var(--border2,rgba(255,255,255,.12));border-radius:20px;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.45);opacity:0;pointer-events:none;transform:translateY(12px) scale(.97);transition:opacity .22s ease,transform .25s cubic-bezier(.34,1.3,.64,1);overflow:hidden}',
    '.nc-panel.open{opacity:1;pointer-events:all;transform:translateY(0) scale(1)}',

    // Header
    '.nc-hdr{padding:.875rem 1rem .875rem 1.25rem;border-bottom:1px solid var(--border,rgba(255,255,255,.08));display:flex;align-items:center;gap:.75rem;flex-shrink:0}',
    '.nc-hdr-dot{width:8px;height:8px;border-radius:50%;background:#3bb273;box-shadow:0 0 6px rgba(59,178,115,.6);flex-shrink:0}',
    '.nc-hdr-info{flex:1}',
    '.nc-hdr-name{font-family:Fraunces,serif;font-size:.95rem;font-weight:600;color:var(--h2,#f0f0f0);letter-spacing:-.01em;line-height:1}',
    '.nc-hdr-sub{font-family:Inter,sans-serif;font-size:.65rem;color:var(--muted,#888);margin-top:2px}',
    '.nc-hdr-btns{display:flex;gap:.25rem}',
    '.nc-hdr-btn{background:none;border:1px solid var(--border,rgba(255,255,255,.08));border-radius:7px;padding:.28rem .5rem;color:var(--muted,#888);cursor:pointer;font-size:.68rem;font-family:Inter,sans-serif;font-weight:600;transition:all .15s;line-height:1}',
    '.nc-hdr-btn:hover{background:var(--bg2,rgba(255,255,255,.05));color:var(--body,#ccc)}',

    // Messages
    '.nc-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem;scroll-behavior:smooth}',
    '.nc-msgs::-webkit-scrollbar{width:4px}.nc-msgs::-webkit-scrollbar-track{background:transparent}.nc-msgs::-webkit-scrollbar-thumb{background:var(--border,rgba(255,255,255,.08));border-radius:4px}',

    // Info note
    '.nc-info{background:rgba(255,255,255,.03);border:1px solid var(--border,rgba(255,255,255,.08));border-radius:12px;padding:.65rem .85rem;margin-bottom:.6rem}',
    '.nc-info-row{display:flex;align-items:flex-start;gap:.45rem;font-family:Inter,sans-serif;font-size:.72rem;color:var(--muted,#888);line-height:1.45}',
    '.nc-info-row+.nc-info-row{margin-top:.3rem}',
    '.nc-info-icon{flex-shrink:0;margin-top:1px;opacity:.6}',
    '.nc-info-val{color:var(--body,#bbb)}',
    '.nc-info-val strong{color:var(--h2,#e0e0e0);font-weight:600}',

    // Starters
    '.nc-starters{padding:.25rem 0 .5rem;display:flex;flex-direction:column;gap:.4rem}',
    '.nc-starter-lbl{font-family:Inter,sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted,#888);margin-bottom:.2rem}',
    '.nc-starter{font-family:Inter,sans-serif;font-size:.8rem;color:var(--body,#ccc);background:var(--bg2,rgba(255,255,255,.04));border:1px solid var(--border,rgba(255,255,255,.08));border-radius:10px;padding:.45rem .75rem;cursor:pointer;text-align:left;transition:all .15s;line-height:1.35}',
    '.nc-starter:hover{border-color:rgba(255,48,204,.35);color:var(--h2,#f0f0f0);background:rgba(255,48,204,.06)}',

    // Bubbles
    '.nc-msg{display:flex;gap:.6rem;align-items:flex-start}',
    '.nc-msg.user{flex-direction:row-reverse}',
    '.nc-msg-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-size:.6rem;font-weight:700;flex-shrink:0;margin-top:2px}',
    '.nc-msg.ai .nc-msg-av{background:linear-gradient(135deg,#d946ab,#ff30cc);color:white}',
    '.nc-msg.user .nc-msg-av{background:var(--bg2,rgba(255,255,255,.08));color:var(--muted,#888)}',
    '.nc-bubble-txt{font-family:Inter,sans-serif;font-size:.84rem;line-height:1.65;padding:.6rem .85rem;border-radius:14px;max-width:88%;word-break:break-word}',
    '.nc-msg.ai .nc-bubble-txt{background:var(--bg2,rgba(255,255,255,.05));border:1px solid var(--border,rgba(255,255,255,.08));color:var(--body,#ccc);border-bottom-left-radius:4px}',
    '.nc-msg.user .nc-bubble-txt{background:linear-gradient(135deg,rgba(217,70,171,.2),rgba(255,48,204,.18));border:1px solid rgba(255,48,204,.25);color:var(--h2,#f0f0f0);border-bottom-right-radius:4px}',
    '.nc-bubble-txt ul{margin:.35rem 0;padding-left:1.1rem}',
    '.nc-bubble-txt li{margin:.15rem 0}',
    '.nc-bubble-txt strong{color:var(--h2,#f0f0f0);font-weight:600}',
    '.nc-bubble-txt p{margin:.3rem 0}',
    '.nc-bubble-txt p:first-child{margin-top:0}.nc-bubble-txt p:last-child{margin-bottom:0}',

    // Typing
    '.nc-typing{display:flex;align-items:center;gap:4px;padding:.5rem .85rem}',
    '.nc-typing span{width:6px;height:6px;border-radius:50%;background:var(--muted,#888);animation:ncBounce .9s ease-in-out infinite}',
    '.nc-typing span:nth-child(2){animation-delay:.15s}',
    '.nc-typing span:nth-child(3){animation-delay:.3s}',
    '@keyframes ncBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}',

    // Copy button
    '.nc-copy{font-family:Inter,sans-serif;font-size:.67rem;color:var(--muted,#888);background:none;border:none;cursor:pointer;padding:.1rem .3rem;opacity:0;transition:opacity .15s;margin-top:.2rem;display:block}',
    '.nc-msg:hover .nc-copy{opacity:1}',
    '.nc-copy:hover{color:var(--primary,#ff30cc)}',

    // Input area
    '.nc-foot{padding:.75rem 1rem;border-top:1px solid var(--border,rgba(255,255,255,.08));display:flex;gap:.5rem;align-items:flex-end;flex-shrink:0}',
    '.nc-input{flex:1;background:var(--bg2,rgba(255,255,255,.05));border:1.5px solid var(--border2,rgba(255,255,255,.12));border-radius:12px;padding:.55rem .85rem;font-family:Inter,sans-serif;font-size:.84rem;color:var(--h2,#f0f0f0);resize:none;outline:none;min-height:38px;max-height:120px;overflow-y:auto;transition:border-color .2s;line-height:1.5}',
    '.nc-input:focus{border-color:rgba(255,48,204,.45)}',
    '.nc-input::placeholder{color:var(--muted,#888)}',
    '.nc-send{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#d946ab,#ff30cc);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;transition:opacity .15s,transform .15s}',
    '.nc-send:hover{opacity:.88;transform:scale(1.06)}',
    '.nc-send:disabled{opacity:.4;cursor:not-allowed;transform:none}',

    // Mobile
    '@media(max-width:480px){',
    '.nc-panel{width:calc(100vw - 2rem);right:1rem;bottom:calc(1rem + 76px + .5rem)}',
    '.nc-bubble{bottom:1rem;right:1rem}',
    '}'
  ].join('');
  document.head.appendChild(s);
}

// ── HTML ─────────────────────────────────────────────

function injectHTML() {
  var userInitials = 'Me';
  if (typeof hubState !== 'undefined' && hubState.currentUser && hubState.currentUser.name) {
    var parts = hubState.currentUser.name.split(' ');
    userInitials = parts.map(function(p){ return p[0]; }).join('').toUpperCase().slice(0,2);
  }

  var wrap = document.createElement('div');
  wrap.id = 'nc-wrap';
  wrap.innerHTML = [
    // Panel
    '<div class="nc-panel" id="nc-panel">',
      '<div class="nc-hdr">',
        '<div class="nc-hdr-dot"></div>',
        '<div class="nc-hdr-info">',
          '<div class="nc-hdr-name">Nancy AI</div>',
          '<div class="nc-hdr-sub">Powered by Groq · llama-3.3-70b</div>',
        '</div>',
        '<div class="nc-hdr-btns">',
          '<button class="nc-hdr-btn" onclick="ncClearChat()" title="New conversation">New chat</button>',
          '<button class="nc-hdr-btn" onclick="ncToggle()" title="Close" style="padding:.28rem .45rem">',
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
          '</button>',
        '</div>',
      '</div>',
      '<div class="nc-msgs" id="nc-msgs">',
        ncRenderStarters(),
      '</div>',
      '<div class="nc-foot">',
        '<textarea class="nc-input" id="nc-input" placeholder="Ask anything..." rows="1" onkeydown="ncKeydown(event)" oninput="ncAutoResize(this)"></textarea>',
        '<button class="nc-send" id="nc-send" onclick="ncSend()" title="Send">',
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
        '</button>',
      '</div>',
    '</div>',

    // Lemon bubble button — bubble behind, lemon in front
    '<button class="nc-bubble" id="nc-bubble" onclick="ncToggle()" title="Chat with Nancy AI">',
      '<span class="nc-bubble-dot" id="nc-dot"></span>',
      // 1. Speech bubble shell (z-index:1, rendered first = behind)
      '<span class="nc-bbl">',
        '<span class="nc-bbl-lbl" id="nc-bubble-ico">Hi</span>',
      '</span>',
      // EVE character: leaf → head (eyes) → arms + body
      '<span class="nc-lemon">',
        '<span class="nc-lemon-leaf"></span>',
        '<span class="nc-eve-head">',
          '<span class="nc-lemon-eyes">',
            '<span class="nc-lemon-eye"></span>',
            '<span class="nc-lemon-eye"></span>',
          '</span>',
        '</span>',
        '<span class="nc-eve-row">',
          '<span class="nc-eve-arm nc-eve-arm-l"></span>',
          '<span class="nc-lemon-body"></span>',
          '<span class="nc-eve-arm nc-eve-arm-r"></span>',
        '</span>',
      '</span>',
    '</button>'
  ].join('');

  document.body.appendChild(wrap);
}

function ncRenderStarters() {
  var infoNote = [
    '<div class="nc-info">',
      '<div class="nc-info-row">',
        '<svg class="nc-info-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        '<span class="nc-info-val"><strong>Model:</strong> llama-3.3-70b via Groq &nbsp;·&nbsp; Knowledge cutoff: <strong>early 2024</strong></span>',
      '</div>',
      '<div class="nc-info-row">',
        '<svg class="nc-info-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
        '<span class="nc-info-val"><strong>Best for:</strong> brainstorming, content writing, strategy, AI guidance — not real-time news or live data</span>',
      '</div>',
    '</div>'
  ].join('');

  // Build starters with dynamic first item based on logged-in user
  var starters = STARTERS.slice(); // copy
  try {
    var cu = window.hubState && window.hubState.currentUser;
    if (cu && cu.name) {
      starters[0] = 'What are my pending tasks?';
    }
  } catch(e) {}

  var html = infoNote + '<div class="nc-starters"><div class="nc-starter-lbl">Try asking</div>';
  starters.forEach(function(s) {
    html += '<button class="nc-starter" onclick="ncUseStarter(this.textContent)">' + s + '</button>';
  });
  html += '</div>';
  return html;
}

// ── TOGGLE ───────────────────────────────────────────

function ncToggle() {
  nc.open = !nc.open;
  var panel = document.getElementById('nc-panel');
  var dot = document.getElementById('nc-dot');
  var ico = document.getElementById('nc-bubble-ico');
  var bubble = document.getElementById('nc-bubble');

  if (nc.open) {
    panel.classList.add('open');
    bubble.classList.add('open');
    dot.classList.remove('show');
    nc.unread = false;
    ico.textContent = '×';
    ico.style.fontSize = '1rem';
    setTimeout(function() {
      var input = document.getElementById('nc-input');
      if (input) input.focus();
      ncScrollBottom();
    }, 200);
  } else {
    panel.classList.remove('open');
    bubble.classList.remove('open');
    ico.textContent = 'Hi';
    ico.style.fontSize = '';
  }
}

function ncClearChat() {
  nc.messages = [];
  var msgsEl = document.getElementById('nc-msgs');
  if (msgsEl) msgsEl.innerHTML = ncRenderStarters();
}

// ── SEND ─────────────────────────────────────────────

function ncUseStarter(text) {
  var input = document.getElementById('nc-input');
  if (input) { input.value = text; ncAutoResize(input); input.focus(); }
}

function ncKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ncSend(); }
}

function ncAutoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ── TOOL DEFINITIONS ────────────────────────────────
var NC_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_tasks',
      description: 'Get tasks from the Nancy Hub task board. Can filter by person name, tier (priority), or completion status. Use this when asked about tasks, pending work, assignments, to-dos, or workload for any team member.',
      parameters: {
        type: 'object',
        properties: {
          assignee: { type: 'string', description: 'Name or partial name of the person to filter by (e.g. "Dione", "Nancy")' },
          tier: { type: 'string', enum: ['top3', 'important', 'someday', 'all'], description: 'Task priority tier' },
          completed: { type: 'boolean', description: 'true for done tasks, false for pending/active. Omit for all.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_team_members',
      description: 'Get a list of all team members in the hub — their names, roles, and emails.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_slack_messages',
      description: 'Pull recent messages from a Slack channel OR a direct message (DM) conversation. Use when asked about Slack activity, DMs, conversations with a specific person, or channel updates. For DMs, pass the person\'s name as channel_name.',
      parameters: {
        type: 'object',
        properties: {
          channel_name: { type: 'string', description: 'Channel name (e.g. "general") or person\'s name for DMs (e.g. "Crystal", "Crystal Lo")' },
          search_term: { type: 'string', description: 'Optional keyword or name to filter messages by' },
          limit: { type: 'number', description: 'How many recent messages to fetch (default 30, max 80)' }
        },
        required: ['channel_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_slack_channels',
      description: 'List all available Slack channels the bot can read from.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  }
];

// ── TOOL EXECUTORS ──────────────────────────────────
async function ncRunTool(name, args) {
  try {
    if (name === 'get_tasks') {
      if (typeof db === 'undefined') return { error: 'Database not available on this page.' };
      // Get all members first to map names → ids
      var members = [];
      try {
        var mRes = await db.from('boards').select('id,name,role');
        members = mRes.data || [];
      } catch(e) {}

      var ownerId = null;
      if (args.assignee) {
        var match = members.find(function(m) {
          return m.name && m.name.toLowerCase().includes(args.assignee.toLowerCase());
        });
        if (match) ownerId = match.id;
      }

      var q = db.from('tasks').select('title,description,tier,completed,due_date,owner_id,created_at');
      if (ownerId) q = q.eq('owner_id', ownerId);
      if (args.tier && args.tier !== 'all') q = q.eq('tier', args.tier);
      if (typeof args.completed === 'boolean') q = q.eq('completed', args.completed);
      q = q.order('task_order');

      var tRes = await q;
      var tasks = (tRes.data || []).map(function(t) {
        var owner = members.find(function(m){ return m.id === t.owner_id; });
        return {
          title: t.title,
          description: t.description || '',
          tier: t.tier,
          status: t.completed ? 'Done' : 'Pending',
          due_date: t.due_date || null,
          owner: owner ? owner.name : 'Unassigned'
        };
      });
      return { tasks: tasks, total: tasks.length };
    }

    if (name === 'get_team_members') {
      if (typeof db === 'undefined') return { error: 'Database not available.' };
      var res = await db.from('boards').select('name,email,role');
      return { members: res.data || [] };
    }

    if (name === 'get_slack_messages') {
      if (typeof slackAPI === 'undefined' || typeof slackState === 'undefined') {
        return { error: 'Slack is only available on the Task Hub page.' };
      }
      var token = slackState.ownToken;
      if (!token) return { error: 'Slack not connected. Please add your Slack token in the Task Hub settings.' };

      var query = (args.channel_name || '').toLowerCase();
      // Search regular channels first
      var ch = (slackState.channels || []).find(function(c) {
        return c.name && c.name.toLowerCase().includes(query);
      });
      // If not found, search DMs by display name stored in slackState.dmNames
      if (!ch) {
        var dmNames = slackState.dmNames || {};
        var dms = slackState.dms || [];
        var dmMatch = dms.find(function(d) {
          var n = (dmNames[d.id] || '').toLowerCase();
          return n && n.includes(query);
        });
        if (dmMatch) ch = { id: dmMatch.id, name: dmNames[dmMatch.id] || dmMatch.id, isDM: true };
      }
      if (!ch) return { error: 'No channel or DM matching "' + args.channel_name + '" found. Use get_slack_channels to see what\'s available.' };

      var data = await slackAPI(token, 'conversations.history', { channel: ch.id, limit: Math.min(args.limit || 30, 80) });
      if (!data.ok) return { error: 'Slack API error: ' + (data.error || 'unknown') };

      var msgs = (data.messages || []).filter(function(m){ return m.type === 'message' && !m.subtype && (m.text||'').trim(); });
      if (args.search_term) {
        var term = args.search_term.toLowerCase();
        msgs = msgs.filter(function(m){ return (m.text||'').toLowerCase().includes(term); });
      }

      // Resolve user names
      var uids = msgs.map(function(m){ return m.user; }).filter(function(v,i,a){ return v && a.indexOf(v)===i && !slackState.userCache[v]; });
      if (uids.length) { try { await resolveSlackUsers(token, uids); } catch(e){} }

      var results = msgs.slice(0, 20).map(function(m) {
        return {
          user: slackState.userCache[m.user] || m.user || 'Unknown',
          text: (m.text||'').replace(/<@([A-Z0-9]+)>/g, function(_,u){ return '@'+(slackState.userCache[u]||u); }).replace(/<[^>]+>/g,'').trim(),
          time: m.ts ? new Date(parseFloat(m.ts)*1000).toLocaleString() : ''
        };
      });
      return { channel: ch.name, messages: results, count: results.length };
    }

    if (name === 'get_slack_channels') {
      if (typeof slackState === 'undefined') return { error: 'Slack only available on Task Hub page.' };
      var chs = (slackState.channels || []).map(function(c){ return c.name; });
      var dmNames = slackState.dmNames || {};
      var dms = (slackState.dms || []).map(function(d){ return dmNames[d.id] || d.id; }).filter(Boolean);
      return { channels: chs, dms: dms };
    }

    return { error: 'Unknown tool: ' + name };
  } catch(e) {
    return { error: e.message || 'Tool execution failed' };
  }
}

// ── SEND ─────────────────────────────────────────────
async function ncSend() {
  var input = document.getElementById('nc-input');
  var text = (input.value || '').trim();
  if (!text || nc.typing) return;

  // Ensure Groq key is loaded
  var key = (typeof GROQ_API_KEY !== 'undefined') ? GROQ_API_KEY : '';
  if (!key) {
    try {
      var gkr = await db.from('settings').select('value').eq('key','groq_api_key').single();
      if (gkr.data && gkr.data.value) { GROQ_API_KEY = gkr.data.value; key = GROQ_API_KEY; }
    } catch(e) {}
  }
  if (!key) {
    ncAppendMsg('assistant', 'Nancy needs a Groq API key to work. Ask your admin to add it under **Admin → Settings → Groq API Key**. Get one free at groq.com 🔑');
    return;
  }

  input.value = '';
  input.style.height = 'auto';
  nc.messages.push({ role: 'user', content: text });

  var startersEl = document.querySelector('#nc-msgs .nc-starters');
  if (startersEl) startersEl.remove();

  ncAppendMsg('user', text);
  ncShowTyping();
  nc.typing = true;
  document.getElementById('nc-send').disabled = true;

  try {
    var model = (typeof GROQ_MODEL !== 'undefined') ? GROQ_MODEL : 'llama-3.3-70b-versatile';
    var msgs = [{ role: 'system', content: NANCY_SYSTEM }].concat(nc.messages.filter(function(m){ return m.role !== 'system'; }));

    // First call — include tools so Nancy can look up real data
    var resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model, messages: msgs, tools: NC_TOOLS, tool_choice: 'auto', max_tokens: 1200, temperature: 0.7 })
    });
    var rdata = await resp.json();
    if (!resp.ok) throw new Error(rdata.error && rdata.error.message ? rdata.error.message : 'API error ' + resp.status);

    var choice = rdata.choices && rdata.choices[0];
    var assistantMsg = choice && choice.message;
    var reply = '';

    if (assistantMsg && assistantMsg.tool_calls && assistantMsg.tool_calls.length) {
      // Model wants to call tools — execute them all
      msgs.push(assistantMsg); // assistant message with tool_calls must be in history

      for (var i = 0; i < assistantMsg.tool_calls.length; i++) {
        var tc = assistantMsg.tool_calls[i];
        var toolName = tc.function.name;
        var toolArgs = {};
        try { toolArgs = JSON.parse(tc.function.arguments || '{}'); } catch(e) {}

        ncUpdateTyping('Looking up ' + toolName.replace(/_/g,' ') + '…');
        var toolResult = await ncRunTool(toolName, toolArgs);

        msgs.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult)
        });
      }

      // Second call — send tool results back, get final answer
      ncUpdateTyping('Thinking…');
      var resp2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model, messages: msgs, max_tokens: 1200, temperature: 0.7 })
      });
      var rdata2 = await resp2.json();
      if (!resp2.ok) throw new Error(rdata2.error && rdata2.error.message ? rdata2.error.message : 'API error ' + resp2.status);
      reply = rdata2.choices && rdata2.choices[0] && rdata2.choices[0].message ? rdata2.choices[0].message.content : '';
    } else {
      // No tool calls — plain response
      reply = assistantMsg ? assistantMsg.content : '';
    }

    if (!reply) reply = 'I ran into an issue processing that. Please try again.';
    nc.messages.push({ role: 'assistant', content: reply });
    ncHideTyping();
    ncAppendMsg('assistant', reply);

    if (!nc.open) {
      nc.unread = true;
      var dot = document.getElementById('nc-dot');
      if (dot) dot.classList.add('show');
    }
  } catch(e) {
    ncHideTyping();
    ncAppendMsg('assistant', 'Something went wrong — ' + (e.message || 'please try again.'));
  }

  nc.typing = false;
  document.getElementById('nc-send').disabled = false;
  var inp = document.getElementById('nc-input');
  if (inp) inp.focus();
}

// ── RENDER ───────────────────────────────────────────

function ncAppendMsg(role, text) {
  var msgsEl = document.getElementById('nc-msgs');
  if (!msgsEl) return;

  var userInitials = 'Me';
  if (typeof hubState !== 'undefined' && hubState.currentUser && hubState.currentUser.name) {
    var parts = hubState.currentUser.name.split(' ');
    userInitials = parts.map(function(p){ return p[0]; }).join('').toUpperCase().slice(0,2);
  }

  var av = role === 'assistant'
    ? '<div class="nc-msg-av" style="font-size:.58rem">N</div>'
    : '<div class="nc-msg-av">' + userInitials + '</div>';

  var msgId = 'ncm-' + Date.now();
  var copyBtn = role === 'assistant'
    ? '<button class="nc-copy" onclick="ncCopy(\'' + msgId + '\',this)" title="Copy">Copy</button>'
    : '';

  var div = document.createElement('div');
  div.className = 'nc-msg ' + (role === 'assistant' ? 'ai' : 'user');
  div.innerHTML = av
    + '<div style="display:flex;flex-direction:column;min-width:0;flex:1">'
    + '<div class="nc-bubble-txt" id="' + msgId + '">' + ncRenderText(text) + '</div>'
    + copyBtn
    + '</div>';

  msgsEl.appendChild(div);
  ncScrollBottom();
}

function ncRenderText(text) {
  // Simple markdown-lite: bold, bullets, line breaks
  var escaped = String(text || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Bold **text**
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Split into paragraphs on double newline
  var parts = escaped.split(/\n{2,}/);
  var html = parts.map(function(para) {
    var lines = para.split('\n');
    // Check if looks like a list
    var isList = lines.every(function(l){ return /^[\-\•\*]\s/.test(l.trim()) || l.trim() === ''; });
    if (isList) {
      var items = lines.filter(function(l){ return l.trim(); })
        .map(function(l){ return '<li>' + l.replace(/^[\-\•\*]\s*/,'') + '</li>'; }).join('');
      return '<ul>' + items + '</ul>';
    }
    return '<p>' + lines.join('<br>') + '</p>';
  }).join('');

  return html;
}

function ncShowTyping() {
  var msgsEl = document.getElementById('nc-msgs');
  if (!msgsEl) return;
  var div = document.createElement('div');
  div.className = 'nc-msg ai';
  div.id = 'nc-typing-row';
  div.innerHTML = '<div class="nc-msg-av" style="font-size:.58rem">N</div>'
    + '<div style="display:flex;flex-direction:column;gap:.3rem;min-width:0">'
    + '<div class="nc-bubble-txt nc-typing" style="padding:.55rem .85rem"><span></span><span></span><span></span></div>'
    + '<div id="nc-tool-status" style="font-family:Inter,sans-serif;font-size:.68rem;color:var(--muted,#888);padding:0 .85rem;display:none"></div>'
    + '</div>';
  msgsEl.appendChild(div);
  ncScrollBottom();
}

function ncUpdateTyping(msg) {
  var el = document.getElementById('nc-tool-status');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  ncScrollBottom();
}

function ncHideTyping() {
  var el = document.getElementById('nc-typing-row');
  if (el) el.remove();
}

function ncScrollBottom() {
  var msgsEl = document.getElementById('nc-msgs');
  if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
}

function ncCopy(msgId, btn) {
  var el = document.getElementById(msgId);
  if (!el) return;
  var text = el.innerText || el.textContent || '';
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = 'Copied!';
    setTimeout(function(){ btn.textContent = 'Copy'; }, 1800);
  }).catch(function() {
    btn.textContent = 'Failed';
    setTimeout(function(){ btn.textContent = 'Copy'; }, 1800);
  });
}

// ── INIT ─────────────────────────────────────────────

function initNancyChat() {
  if (document.getElementById('nc-wrap')) return; // already mounted
  injectStyles();
  injectHTML();
}

// Expose globally
window.ncToggle = ncToggle;
window.ncSend = ncSend;
window.ncKeydown = ncKeydown;
window.ncAutoResize = ncAutoResize;
window.ncUseStarter = ncUseStarter;
window.ncClearChat = ncClearChat;
window.ncCopy = ncCopy;
window.ncRunTool = ncRunTool;
window.initNancyChat = initNancyChat;

})();

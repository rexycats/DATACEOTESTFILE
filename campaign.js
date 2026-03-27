// ── campaign.js ──
// Campaign mode: story-driven SQL quests with a continuous narrative.
// COMPLETELY SEPARATE from all other modes — own CSS, own state, own components.
// Depends on: datashop-engine.js (for runSQL, esc, sanitizeHTML, t, DB, G, UI, save, LANG)
//
// DEFENSIVE: All entry points are wrapped in try-catch so a campaign bug
// can never crash the core game.

"use strict";

// ══════════════════════════════════════════════════════════════════
//  CAMPAIGN CSS — Injected at runtime, fully isolated with camp- prefix
// ══════════════════════════════════════════════════════════════════
(function injectCampaignCSS() {
  if (document.getElementById('campaign-styles')) return;
  var style = document.createElement('style');
  style.id = 'campaign-styles';
  style.textContent = '\n\
/* ══════════════════════════════════════════════════════════════\n\
   CAMPAIGN MODE — Fully isolated stylesheet\n\
   All classes prefixed with camp- to avoid conflicts\n\
   ══════════════════════════════════════════════════════════════ */\n\
\n\
/* ── Campaign Panel Layout ─────────────────────────────────── */\n\
#panel-camp .camp-header {\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: space-between;\n\
  padding: 0 0 16px;\n\
  border-bottom: 1px solid var(--border);\n\
  margin-bottom: 20px;\n\
}\n\
#panel-camp .camp-header-left {\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 12px;\n\
}\n\
#panel-camp .camp-header-icon {\n\
  font-size: 1.6rem;\n\
  filter: drop-shadow(0 0 8px rgba(34,211,238,.3));\n\
}\n\
#panel-camp .camp-header-title {\n\
  font-family: var(--display);\n\
  font-weight: 800;\n\
  font-size: 1.3rem;\n\
  color: var(--t1);\n\
  letter-spacing: -0.3px;\n\
}\n\
#panel-camp .camp-header-sub {\n\
  font-family: var(--mono);\n\
  font-size: 10px;\n\
  color: var(--t3);\n\
  text-transform: uppercase;\n\
  letter-spacing: 2px;\n\
  margin-top: 2px;\n\
}\n\
#panel-camp .camp-xp-badge {\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 6px;\n\
  padding: 6px 14px;\n\
  border-radius: 10px;\n\
  background: rgba(251,191,36,.08);\n\
  border: 1px solid rgba(251,191,36,.25);\n\
  font-family: var(--mono);\n\
  font-size: 12px;\n\
  font-weight: 700;\n\
  color: var(--yellow);\n\
}\n\
\n\
/* ── Campaign Progress Bar ─────────────────────────────────── */\n\
#panel-camp .camp-progress-wrap {\n\
  margin-bottom: 24px;\n\
}\n\
#panel-camp .camp-progress-meta {\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: space-between;\n\
  margin-bottom: 8px;\n\
}\n\
#panel-camp .camp-progress-label {\n\
  font-family: var(--mono);\n\
  font-size: 10px;\n\
  letter-spacing: 2px;\n\
  text-transform: uppercase;\n\
  color: var(--t3);\n\
  font-weight: 600;\n\
}\n\
#panel-camp .camp-progress-val {\n\
  font-family: var(--mono);\n\
  font-size: 13px;\n\
  font-weight: 700;\n\
  color: var(--cyan);\n\
}\n\
#panel-camp .camp-progress-track {\n\
  position: relative;\n\
  height: 8px;\n\
  border-radius: 100px;\n\
  background: var(--panel);\n\
  border: 1px solid var(--border);\n\
  overflow: hidden;\n\
}\n\
#panel-camp .camp-progress-fill {\n\
  position: absolute;\n\
  inset: 0;\n\
  border-radius: 100px;\n\
  background: linear-gradient(90deg, var(--cyan), var(--cyan2), var(--green));\n\
  transition: width .7s cubic-bezier(.4,0,.2,1);\n\
  box-shadow: 0 0 12px rgba(34,211,238,.3);\n\
}\n\
#panel-camp .camp-progress-fill::after {\n\
  content: "";\n\
  position: absolute;\n\
  inset: 0;\n\
  width: 60px;\n\
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);\n\
  animation: camp-shine 2s ease-in-out infinite;\n\
}\n\
@keyframes camp-shine {\n\
  0% { transform: translateX(-100%); }\n\
  100% { transform: translateX(400%); }\n\
}\n\
\n\
/* ── Campaign Chapter ──────────────────────────────────────── */\n\
#panel-camp .camp-chapter {\n\
  margin-bottom: 32px;\n\
}\n\
#panel-camp .camp-chapter-header {\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 12px;\n\
  margin-bottom: 14px;\n\
}\n\
#panel-camp .camp-chapter-num {\n\
  width: 32px;\n\
  height: 32px;\n\
  border-radius: 10px;\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  font-family: var(--display);\n\
  font-weight: 900;\n\
  font-size: 14px;\n\
  background: rgba(167,139,250,.1);\n\
  color: var(--purple);\n\
  border: 1px solid rgba(167,139,250,.3);\n\
}\n\
#panel-camp .camp-chapter-num.done {\n\
  background: rgba(74,222,128,.1);\n\
  color: var(--green);\n\
  border-color: rgba(74,222,128,.3);\n\
}\n\
#panel-camp .camp-chapter-label {\n\
  font-family: var(--display);\n\
  font-weight: 700;\n\
  font-size: 15px;\n\
  color: var(--t1);\n\
}\n\
#panel-camp .camp-chapter-count {\n\
  font-family: var(--mono);\n\
  font-size: 10px;\n\
  color: var(--t3);\n\
  text-transform: uppercase;\n\
  letter-spacing: 1.5px;\n\
  margin-top: 1px;\n\
}\n\
#panel-camp .camp-chapter-dots {\n\
  display: flex;\n\
  gap: 4px;\n\
  margin-left: auto;\n\
}\n\
#panel-camp .camp-chapter-dot {\n\
  width: 8px;\n\
  height: 8px;\n\
  border-radius: 50%;\n\
  background: var(--border);\n\
  transition: background .3s;\n\
}\n\
#panel-camp .camp-chapter-dot.done { background: var(--green); }\n\
#panel-camp .camp-chapter-dot.unlocked { background: rgba(34,211,238,.4); }\n\
\n\
#panel-camp .camp-quest-list {\n\
  margin-left: 16px;\n\
  border-left: 2px solid var(--border);\n\
  padding-left: 20px;\n\
  display: flex;\n\
  flex-direction: column;\n\
  gap: 10px;\n\
}\n\
\n\
/* ── Campaign Quest Card ───────────────────────────────────── */\n\
#panel-camp .camp-quest {\n\
  border-radius: 12px;\n\
  border: 1px solid var(--border);\n\
  background: var(--panel);\n\
  transition: all .3s cubic-bezier(.4,0,.2,1);\n\
  overflow: hidden;\n\
}\n\
#panel-camp .camp-quest:hover:not(.camp-quest--done):not(.camp-quest--locked) {\n\
  border-color: var(--border2);\n\
  background: var(--panel2);\n\
}\n\
#panel-camp .camp-quest--done {\n\
  border-color: rgba(74,222,128,.3);\n\
  background: rgba(74,222,128,.04);\n\
}\n\
#panel-camp .camp-quest--locked {\n\
  border-color: rgba(30,42,66,.4);\n\
  background: var(--bg2);\n\
  opacity: .55;\n\
}\n\
#panel-camp .camp-quest--active {\n\
  border-color: rgba(34,211,238,.3);\n\
  box-shadow: 0 0 24px -8px rgba(34,211,238,.25), 0 4px 16px -4px rgba(0,0,0,.3);\n\
  animation: camp-glow 3s ease-in-out infinite;\n\
}\n\
@keyframes camp-glow {\n\
  0%, 100% { box-shadow: 0 0 20px -8px rgba(34,211,238,.2), 0 4px 16px -4px rgba(0,0,0,.3); }\n\
  50% { box-shadow: 0 0 32px -4px rgba(34,211,238,.35), 0 4px 20px -4px rgba(0,0,0,.3); }\n\
}\n\
\n\
/* Quest Header */\n\
#panel-camp .camp-quest-head {\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 12px;\n\
  padding: 14px 16px;\n\
  cursor: pointer;\n\
  user-select: none;\n\
}\n\
#panel-camp .camp-quest--locked .camp-quest-head {\n\
  cursor: not-allowed;\n\
}\n\
#panel-camp .camp-quest-icon {\n\
  font-size: 1.2rem;\n\
  flex-shrink: 0;\n\
  filter: drop-shadow(0 0 4px rgba(34,211,238,.2));\n\
}\n\
#panel-camp .camp-quest-info {\n\
  flex: 1;\n\
  min-width: 0;\n\
}\n\
#panel-camp .camp-quest-title {\n\
  font-family: var(--display);\n\
  font-weight: 700;\n\
  font-size: 14px;\n\
  color: var(--t1);\n\
  line-height: 1.3;\n\
  white-space: nowrap;\n\
  overflow: hidden;\n\
  text-overflow: ellipsis;\n\
}\n\
#panel-camp .camp-quest-tags {\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 8px;\n\
  margin-top: 4px;\n\
  flex-wrap: wrap;\n\
}\n\
#panel-camp .camp-tag {\n\
  display: inline-block;\n\
  padding: 2px 8px;\n\
  font-family: var(--mono);\n\
  font-size: 10px;\n\
  font-weight: 700;\n\
  text-transform: uppercase;\n\
  letter-spacing: .8px;\n\
  border-radius: 6px;\n\
  border: 1px solid;\n\
}\n\
#panel-camp .camp-tag--select  { background: rgba(34,211,238,.08);  color: var(--cyan);   border-color: rgba(34,211,238,.3); }\n\
#panel-camp .camp-tag--insert  { background: rgba(74,222,128,.08);  color: var(--green);  border-color: rgba(74,222,128,.3); }\n\
#panel-camp .camp-tag--update  { background: rgba(251,146,60,.08);  color: var(--orange); border-color: rgba(251,146,60,.3); }\n\
#panel-camp .camp-tag--delete  { background: rgba(248,113,113,.08); color: var(--red);    border-color: rgba(248,113,113,.3); }\n\
#panel-camp .camp-tag--xp {\n\
  background: transparent;\n\
  color: var(--yellow);\n\
  border-color: transparent;\n\
  font-weight: 800;\n\
}\n\
#panel-camp .camp-tag--time {\n\
  background: transparent;\n\
  color: var(--t3);\n\
  border-color: transparent;\n\
}\n\
#panel-camp .camp-quest-chevron {\n\
  color: var(--t3);\n\
  transition: transform .2s;\n\
  flex-shrink: 0;\n\
  font-size: 14px;\n\
}\n\
#panel-camp .camp-quest-chevron.open {\n\
  transform: rotate(90deg);\n\
}\n\
\n\
/* Quest Body */\n\
#panel-camp .camp-quest-body {\n\
  display: none;\n\
  border-top: 1px solid var(--border);\n\
  padding: 14px 16px 16px;\n\
}\n\
#panel-camp .camp-quest-body.open {\n\
  display: block;\n\
  animation: camp-body-in .3s ease-out;\n\
}\n\
@keyframes camp-body-in {\n\
  0% { opacity: 0; transform: translateY(-8px); }\n\
  100% { opacity: 1; transform: translateY(0); }\n\
}\n\
\n\
/* Story text */\n\
#panel-camp .camp-story {\n\
  font-size: 14px;\n\
  color: var(--t2);\n\
  line-height: 1.7;\n\
  margin-bottom: 12px;\n\
}\n\
#panel-camp .camp-story strong {\n\
  color: var(--t1);\n\
  font-weight: 700;\n\
}\n\
\n\
/* Objective */\n\
#panel-camp .camp-objective {\n\
  font-size: 12px;\n\
  color: var(--t3);\n\
  margin-bottom: 14px;\n\
}\n\
#panel-camp .camp-objective strong {\n\
  color: var(--t2);\n\
}\n\
#panel-camp .camp-objective code {\n\
  display: inline-block;\n\
  margin-top: 2px;\n\
  padding: 2px 8px;\n\
  background: var(--panel3, var(--panel2));\n\
  border-radius: 6px;\n\
  font-family: var(--mono);\n\
  font-size: 11px;\n\
  color: var(--purple);\n\
  border: 1px solid var(--border);\n\
}\n\
\n\
/* ── Campaign Timer ────────────────────────────────────────── */\n\
#panel-camp .camp-timer {\n\
  margin-bottom: 12px;\n\
}\n\
#panel-camp .camp-timer-track {\n\
  position: relative;\n\
  height: 6px;\n\
  border-radius: 100px;\n\
  background: var(--panel);\n\
  border: 1px solid var(--border);\n\
  overflow: hidden;\n\
}\n\
#panel-camp .camp-timer-fill {\n\
  position: absolute;\n\
  inset: 0;\n\
  left: 0;\n\
  border-radius: 100px;\n\
  background: var(--cyan);\n\
  transition: width .2s linear;\n\
}\n\
#panel-camp .camp-timer-fill.warn   { background: var(--orange); }\n\
#panel-camp .camp-timer-fill.danger { background: var(--red); }\n\
#panel-camp .camp-timer-num {\n\
  font-family: var(--mono);\n\
  font-size: 11px;\n\
  font-weight: 700;\n\
  color: var(--t3);\n\
  text-align: right;\n\
  margin-top: 4px;\n\
}\n\
#panel-camp .camp-timer-num.warn   { color: var(--orange); }\n\
#panel-camp .camp-timer-num.danger { color: var(--red); animation: camp-timer-pulse .5s ease-in-out infinite; }\n\
@keyframes camp-timer-pulse {\n\
  0%, 100% { opacity: 1; }\n\
  50% { opacity: .5; }\n\
}\n\
\n\
/* ── Campaign SQL Input ────────────────────────────────────── */\n\
#panel-camp .camp-sql-area {\n\
  margin-bottom: 10px;\n\
}\n\
#panel-camp .camp-sql-wrap {\n\
  position: relative;\n\
}\n\
#panel-camp .camp-sql-input {\n\
  width: 100%;\n\
  min-height: 80px;\n\
  max-height: 200px;\n\
  padding: 12px 14px;\n\
  padding-bottom: 28px;\n\
  background: var(--input-bg, var(--bg3));\n\
  border: 1px solid var(--border);\n\
  border-radius: 10px;\n\
  font-family: var(--mono);\n\
  font-size: 13px;\n\
  color: var(--t1);\n\
  resize: vertical;\n\
  outline: none;\n\
  transition: border-color .2s, box-shadow .2s;\n\
  line-height: 1.7;\n\
}\n\
#panel-camp .camp-sql-input:focus {\n\
  border-color: var(--cyan);\n\
  box-shadow: 0 0 0 3px rgba(34,211,238,.1);\n\
}\n\
#panel-camp .camp-sql-input::placeholder {\n\
  color: var(--t4);\n\
  font-weight: 500;\n\
}\n\
#panel-camp .camp-sql-hint {\n\
  position: absolute;\n\
  bottom: 8px;\n\
  right: 12px;\n\
  font-family: var(--mono);\n\
  font-size: 9px;\n\
  color: var(--t4);\n\
  pointer-events: none;\n\
}\n\
#panel-camp .camp-run-btn {\n\
  margin-top: 8px;\n\
  padding: 8px 20px;\n\
  border-radius: 10px;\n\
  font-family: var(--sans);\n\
  font-weight: 700;\n\
  font-size: 13px;\n\
  color: var(--bg);\n\
  background: var(--cyan);\n\
  border: none;\n\
  cursor: pointer;\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 6px;\n\
  transition: all .15s;\n\
}\n\
#panel-camp .camp-run-btn:hover {\n\
  filter: brightness(1.1);\n\
  transform: translateY(-1px);\n\
}\n\
#panel-camp .camp-run-btn:active {\n\
  transform: translateY(0);\n\
}\n\
#panel-camp .camp-run-btn:disabled {\n\
  opacity: .3;\n\
  cursor: not-allowed;\n\
  transform: none;\n\
}\n\
\n\
/* ── Campaign Feedback ─────────────────────────────────────── */\n\
#panel-camp .camp-fb {\n\
  margin-top: 12px;\n\
  padding: 10px 14px;\n\
  border-radius: 10px;\n\
  border-left: 4px solid;\n\
  font-size: 13px;\n\
  font-weight: 600;\n\
  line-height: 1.6;\n\
  animation: camp-body-in .25s ease-out;\n\
}\n\
#panel-camp .camp-fb--ok {\n\
  background: rgba(74,222,128,.06);\n\
  border-color: var(--green);\n\
  color: var(--green);\n\
}\n\
#panel-camp .camp-fb--err {\n\
  background: rgba(248,113,113,.06);\n\
  border-color: var(--red);\n\
  color: var(--red);\n\
}\n\
#panel-camp .camp-fb--hint {\n\
  background: rgba(251,191,36,.06);\n\
  border-color: var(--yellow);\n\
  color: var(--yellow);\n\
}\n\
#panel-camp .camp-fb--timeout {\n\
  background: rgba(251,146,60,.06);\n\
  border-color: var(--orange);\n\
  color: var(--orange);\n\
}\n\
#panel-camp .camp-fb strong {\n\
  font-weight: 800;\n\
}\n\
#panel-camp .camp-fb code {\n\
  padding: 1px 5px;\n\
  border-radius: 4px;\n\
  background: rgba(0,0,0,.15);\n\
  font-family: var(--mono);\n\
  font-size: 12px;\n\
}\n\
\n\
/* ── Campaign Completion Banner ────────────────────────────── */\n\
#panel-camp .camp-complete {\n\
  text-align: center;\n\
  padding: 28px 24px;\n\
  border-radius: 14px;\n\
  border: 1px solid rgba(74,222,128,.25);\n\
  background: rgba(74,222,128,.04);\n\
  margin-bottom: 24px;\n\
  animation: camp-body-in .4s ease-out;\n\
}\n\
#panel-camp .camp-complete-trophy {\n\
  font-size: 2.5rem;\n\
  margin-bottom: 8px;\n\
  filter: drop-shadow(0 0 12px rgba(251,191,36,.4));\n\
}\n\
#panel-camp .camp-complete-title {\n\
  font-family: var(--display);\n\
  font-weight: 900;\n\
  font-size: 1.3rem;\n\
  color: var(--t1);\n\
  margin-bottom: 4px;\n\
}\n\
#panel-camp .camp-complete-sub {\n\
  font-size: 13px;\n\
  color: var(--t2);\n\
}\n\
#panel-camp .camp-reset-btn {\n\
  margin-top: 14px;\n\
  padding: 6px 16px;\n\
  font-family: var(--mono);\n\
  font-size: 11px;\n\
  font-weight: 700;\n\
  color: var(--t3);\n\
  background: transparent;\n\
  border: 1px solid var(--border);\n\
  border-radius: 8px;\n\
  cursor: pointer;\n\
  transition: all .15s;\n\
}\n\
#panel-camp .camp-reset-btn:hover {\n\
  color: var(--t1);\n\
  border-color: var(--border2);\n\
}\n\
\n\
/* ── Campaign Empty State ──────────────────────────────────── */\n\
#panel-camp .camp-empty {\n\
  text-align: center;\n\
  padding: 32px 20px;\n\
  color: var(--t3);\n\
  font-size: 14px;\n\
}\n\
\n\
/* ── Light Mode Overrides ──────────────────────────────────── */\n\
body.light #panel-camp .camp-quest {\n\
  box-shadow: 0 1px 4px rgba(0,0,0,.06);\n\
}\n\
body.light #panel-camp .camp-quest:hover:not(.camp-quest--done):not(.camp-quest--locked) {\n\
  box-shadow: 0 3px 12px rgba(0,0,0,.1);\n\
}\n\
body.light #panel-camp .camp-quest--done {\n\
  background: rgba(58,96,32,.06);\n\
  border-color: var(--green);\n\
}\n\
body.light #panel-camp .camp-quest--locked {\n\
  background: var(--panel2);\n\
}\n\
body.light #panel-camp .camp-sql-input {\n\
  background: var(--panel);\n\
  border: 2px solid var(--border2);\n\
}\n\
body.light #panel-camp .camp-sql-input:focus {\n\
  border-color: var(--cyan);\n\
  box-shadow: 0 0 0 4px rgba(26,92,138,.1);\n\
}\n\
body.light #panel-camp .camp-run-btn {\n\
  background: var(--cyan);\n\
  color: #fff;\n\
}\n\
body.light #panel-camp .camp-fb--ok   { background: rgba(58,96,32,.08); }\n\
body.light #panel-camp .camp-fb--err  { background: rgba(138,26,26,.08); }\n\
body.light #panel-camp .camp-fb--hint { background: rgba(122,72,0,.08); }\n\
body.light #panel-camp .camp-fb--timeout { background: rgba(138,58,0,.08); }\n\
body.light #panel-camp .camp-progress-track {\n\
  background: var(--panel2);\n\
  border: 2px solid var(--border);\n\
}\n\
body.light #panel-camp .camp-story { font-size: 15px; font-weight: 600; }\n\
body.light #panel-camp .camp-quest-title { font-weight: 800; }\n\
body.light #panel-camp .camp-objective code { background: var(--panel3); border: 1px solid var(--border); font-weight: 700; }\n\
\n\
/* ── Dark Mode Enhancements ────────────────────────────────── */\n\
body:not(.light) #panel-camp .camp-story { font-size: 14px; font-weight: 500; }\n\
body:not(.light) #panel-camp .camp-fb { font-size: 14px; }\n\
body:not(.light) #panel-camp .camp-quest-title { color: var(--t1); }\n\
body:not(.light) #panel-camp .camp-quest-head:hover .camp-quest-title { color: var(--cyan); }\n\
\n\
/* ── Responsive ────────────────────────────────────────────── */\n\
@media (max-width: 640px) {\n\
  #panel-camp .camp-header { flex-direction: column; align-items: flex-start; gap: 10px; }\n\
  #panel-camp .camp-quest-list { margin-left: 8px; padding-left: 14px; }\n\
  #panel-camp .camp-quest-head { padding: 12px 14px; }\n\
  #panel-camp .camp-quest-body { padding: 12px 14px 14px; }\n\
}\n\
';
  document.head.appendChild(style);
})();


// ══════════════════════════════════════════════════════════════════
//  CAMPAIGN DATA
// ══════════════════════════════════════════════════════════════════
var CAMPAIGN_QUESTS = [
  {
    id: 'camp_1',
    chapter: 1,
    title: { nl: 'De Eerste Klant', en: 'The First Customer' },
    story: {
      nl: 'Je webshop is net gelanceerd. <strong>Emma De Vries</strong> uit <strong>Brussel</strong> wil zich registreren. Haar email is <strong>emma@mail.be</strong>. Voeg haar toe als actieve klant!',
      en: 'Your webshop just launched. <strong>Emma De Vries</strong> from <strong>Brussels</strong> wants to register. Her email is <strong>emma@mail.be</strong>. Add her as an active customer!'
    },
    objective: {
      nl: "INSERT INTO klant (naam, email, stad, actief) VALUES ('Emma De Vries', 'emma@mail.be', 'Brussel', 1)",
      en: "INSERT INTO klant (naam, email, stad, actief) VALUES ('Emma De Vries', 'emma@mail.be', 'Brussel', 1)"
    },
    sqlType: 'insert',
    check: 'INSERT INTO klant',
    mustContain: ['insert into klant', 'emma@mail.be', 'emma de vries'],
    xp: 15,
    unlock: 0,
    time: 120,
  },
  {
    id: 'camp_2',
    chapter: 1,
    title: { nl: 'Inventaris Controle', en: 'Inventory Check' },
    story: {
      nl: 'De eerste orders stromen binnen! Voordat je verder gaat, moet je weten welke producten je verkoopt. <strong>Toon alle producten</strong> met hun naam en prijs.',
      en: 'First orders are coming in! Before continuing, check which products you sell. <strong>Show all products</strong> with their name and price.'
    },
    objective: { nl: 'SELECT naam, prijs FROM product', en: 'SELECT naam, prijs FROM product' },
    sqlType: 'select',
    check: 'SELECT',
    xp: 10,
    unlock: 1,
    time: 90,
  },
  {
    id: 'camp_3',
    chapter: 1,
    title: { nl: 'Prijzenslag', en: 'Price War' },
    story: {
      nl: 'Een concurrent verlaagt zijn prijzen! Je moet de prijs van het product met <strong>product_id = 3</strong> verlagen naar <strong>€19.99</strong> om competitief te blijven.',
      en: 'A competitor is cutting prices! You need to lower the price of the product with <strong>product_id = 3</strong> to <strong>€19.99</strong> to stay competitive.'
    },
    objective: {
      nl: 'UPDATE product SET prijs = 19.99 WHERE product_id = 3',
      en: 'UPDATE product SET prijs = 19.99 WHERE product_id = 3'
    },
    sqlType: 'update',
    check: 'UPDATE product SET',
    mustContain: ['update product', 'prijs', '19.99', 'product_id'],
    xp: 20,
    unlock: 2,
    time: 90,
  },
  {
    id: 'camp_4',
    chapter: 2,
    title: { nl: 'Klantanalyse', en: 'Customer Analysis' },
    story: {
      nl: 'Het marketingteam wil weten hoeveel klanten er per stad zijn. <strong>Groepeer de klanten op stad</strong> en tel ze.',
      en: 'The marketing team wants to know how many customers there are per city. <strong>Group customers by city</strong> and count them.'
    },
    objective: {
      nl: 'SELECT stad, COUNT(*) FROM klant GROUP BY stad',
      en: 'SELECT stad, COUNT(*) FROM klant GROUP BY stad'
    },
    sqlType: 'select',
    check: 'GROUP BY',
    xp: 25,
    unlock: 3,
    time: 120,
  },
  {
    id: 'camp_5',
    chapter: 2,
    title: { nl: 'Bestellingen Koppelen', en: 'Linking Orders' },
    story: {
      nl: 'De CEO wil een overzicht: welke <strong>klant</strong> heeft welke <strong>bestelling</strong> geplaatst? Gebruik een <strong>JOIN</strong> om klant- en bestellingtabellen te koppelen.',
      en: 'The CEO wants an overview: which <strong>customer</strong> placed which <strong>order</strong>? Use a <strong>JOIN</strong> to link the customer and order tables.'
    },
    objective: {
      nl: 'SELECT k.naam, b.bestelling_id FROM klant k JOIN bestelling b ON k.klant_id = b.klant_id',
      en: 'SELECT k.naam, b.bestelling_id FROM klant k JOIN bestelling b ON k.klant_id = b.klant_id'
    },
    sqlType: 'select',
    check: 'JOIN',
    xp: 30,
    unlock: 4,
    time: 150,
  },
];

// Campaign quests are registered into the global SC_BY_* indexes inside
// CAMP.init() so that LANG is already set to the stored preference by then.
// (Previously this ran as a top-level IIFE, which always used the default
// 'nl' language regardless of what the user had stored in localStorage.)


// ══════════════════════════════════════════════════════════════════
//  CAMPAIGN STATE
// ══════════════════════════════════════════════════════════════════
var CAMP = {
  doneQuests: new Set(),
  _timers: {},
  _timerRemaining: {},
  _timerPaused: {},
  _TIMER_LS_KEY: 'datashop_camp_timer',
  _questsRegistered: false,   // guard against double-registration on repeated init() calls
  _registeredLang: null,      // LANG value at last registration — triggers re-register on lang switch

  // ─── REGISTER INTO GLOBAL INDEXES ─────────────────────────────
  // Called once from init(), after LANG has been restored from localStorage
  // by init-lang.js.  Running this at parse time (as the old IIFE did) always
  // used the default 'nl' language, so English users got Dutch titles indexed.
  // Re-runs automatically if the user switches language mid-session.
  _registerQuests: function() {
    var lang = (typeof LANG !== 'undefined') ? LANG : 'nl';
    // Skip if already registered for this language
    if (this._questsRegistered && this._registeredLang === lang) return;
    if (typeof indexScenario !== 'function') return;
    CAMPAIGN_QUESTS.forEach(function(q) {
      indexScenario({
        id:      q.id,
        ch:      q.chapter,
        title:   (q.title && (q.title[lang] || q.title.nl)) || q.id,
        sqlType: q.sqlType || 'select',
        xp:      q.xp || 0,
        time:    q.time || null,
        _isCampaignQuest: true
      });
    });
    this._questsRegistered = true;
    this._registeredLang = lang;
  },

  // ─── PERSIST TIMER STATE ───────────────────────────────────────
  // Mirrors the datashop-ui.js pattern so a full tab close + reopen
  // restores the remaining time instead of silently losing it.
  _saveTimerState: function() {
    try {
      localStorage.setItem(this._TIMER_LS_KEY, JSON.stringify(this._timerPaused));
    } catch(e) {}
  },

  _restoreTimerState: function() {
    try {
      var raw = localStorage.getItem(this._TIMER_LS_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      var self = this;
      Object.keys(saved).forEach(function(id) {
        var left = saved[id];
        if (typeof left === 'number' && left > 0) self._timerPaused[id] = left;
      });
      localStorage.removeItem(this._TIMER_LS_KEY);
    } catch(e) {}
  },

  init: function() {
    try {
      var saved = localStorage.getItem('datashop_campaign');
      if (saved) {
        var data = JSON.parse(saved);
        if (data && data.done && Array.isArray(data.done)) {
          this.doneQuests = new Set(data.done);
        }
      }
    } catch (e) {
      console.warn('Campaign: could not load saved progress', e);
    }
    // Register quest titles into SC_BY_* indexes using the now-correct LANG value.
    this._registerQuests();
    // Restore any timer state that was persisted when the tab was closed.
    // Timers will resume when the quest is next opened (toggleQuest checks
    // _timerPaused and calls _startTimer with the remaining seconds).
    this._restoreTimerState();
  },

  save: function() {
    try {
      localStorage.setItem('datashop_campaign', JSON.stringify({
        done: Array.from(this.doneQuests)
      }));
    } catch (e) { /* ignore */ }
  },

  isUnlocked: function(quest) {
    if (!quest) return false;
    return this.doneQuests.size >= quest.unlock;
  },

  // ─── RENDER ────────────────────────────────────────────────────
  render: function() {
    try { this._renderInner(); }
    catch (e) { console.warn('Campaign render error:', e); }
  },

  _renderInner: function() {
    var content = document.getElementById('camp-content');
    if (!content) return;

    var lang = (typeof LANG !== 'undefined') ? LANG : 'nl';
    var done = this.doneQuests.size;
    var total = CAMPAIGN_QUESTS.length;
    var pct = total ? Math.round(done / total * 100) : 0;
    var self = this;
    var escFn = (typeof esc === 'function') ? esc : function(s) { return String(s || ''); };
    var sanitizeFn = (typeof sanitizeHTML === 'function') ? sanitizeHTML : function(s) { return String(s || ''); };

    var html = '';

    // ── Header
    html += '<div class="camp-header">';
    html += '<div class="camp-header-left">';
    html += '<span class="camp-header-icon">⚔️</span>';
    html += '<div>';
    html += '<div class="camp-header-title">Campaign</div>';
    html += '<div class="camp-header-sub">DataShop CEO · Story Quests</div>';
    html += '</div></div>';
    html += '<div class="camp-xp-badge">⭐ ' + (typeof G !== 'undefined' && G ? (G.xp || 0) : 0) + ' XP</div>';
    html += '</div>';

    // ── Progress bar
    html += '<div class="camp-progress-wrap">';
    html += '<div class="camp-progress-meta">';
    html += '<span class="camp-progress-label">' + (typeof t === 'function' ? t('js_camp_progress_label') || 'Campaign Voortgang' : 'Campaign Voortgang') + '</span>';
    html += '<span class="camp-progress-val">' + done + '/' + total + ' · ' + pct + '%</span>';
    html += '</div>';
    html += '<div class="camp-progress-track">';
    html += '<div class="camp-progress-fill" style="width:' + pct + '%"></div>';
    html += '</div></div>';

    // ── All done banner
    if (done === total && total > 0) {
      html += '<div class="camp-complete">';
      html += '<div class="camp-complete-trophy">🏆</div>';
      html += '<div class="camp-complete-title">' + (lang === 'nl' ? 'Campaign Voltooid!' : 'Campaign Complete!') + '</div>';
      html += '<div class="camp-complete-sub">' + (lang === 'nl'
        ? 'Je hebt alle ' + total + ' quests afgerond!'
        : 'You completed all ' + total + ' quests!') + '</div>';
      html += '<button class="camp-reset-btn" data-action="camp-reset">↻ ' + (lang === 'nl' ? 'Opnieuw beginnen' : 'Start Over') + '</button>';
      html += '</div>';
    }

    // ── No quests
    if (!CAMPAIGN_QUESTS.length) {
      html += '<div class="camp-empty">' + (typeof t === 'function' ? t('camp_no_quests') : 'Geen quests beschikbaar.') + '</div>';
      content.innerHTML = html;
      return;
    }

    // ── Group by chapter
    var chapters = {};
    CAMPAIGN_QUESTS.forEach(function(q) {
      if (!chapters[q.chapter]) chapters[q.chapter] = [];
      chapters[q.chapter].push(q);
    });

    // ── Render chapters
    Object.entries(chapters).forEach(function(entry) {
      var ch = entry[0];
      var quests = entry[1];
      var chDone = quests.filter(function(q) { return self.doneQuests.has(q.id); }).length;
      var allChDone = chDone === quests.length;

      html += '<div class="camp-chapter">';

      // Chapter header
      html += '<div class="camp-chapter-header">';
      html += '<div class="camp-chapter-num' + (allChDone ? ' done' : '') + '">' + ch + '</div>';
      html += '<div>';
      html += '<div class="camp-chapter-label">' + (lang === 'nl' ? 'Hoofdstuk' : 'Chapter') + ' ' + ch + '</div>';
      html += '<div class="camp-chapter-count">' + chDone + '/' + quests.length + ' ' + (lang === 'nl' ? 'voltooid' : 'completed') + (allChDone ? ' ✓' : '') + '</div>';
      html += '</div>';
      html += '<div class="camp-chapter-dots">';
      quests.forEach(function(q) {
        var dotClass = self.doneQuests.has(q.id) ? 'done' : self.isUnlocked(q) ? 'unlocked' : '';
        html += '<div class="camp-chapter-dot ' + dotClass + '"></div>';
      });
      html += '</div></div>';

      // Quest list
      html += '<div class="camp-quest-list">';
      quests.forEach(function(q) {
        var isDone = self.doneQuests.has(q.id);
        var unlocked = self.isUnlocked(q);
        var title = (q.title && q.title[lang]) || (q.title && q.title.nl) || q.id;
        var story = (q.story && q.story[lang]) || (q.story && q.story.nl) || '';
        var obj = (q.objective && q.objective[lang]) || (q.objective && q.objective.nl) || '';

        var questClass = 'camp-quest';
        if (isDone) questClass += ' camp-quest--done';
        else if (!unlocked) questClass += ' camp-quest--locked';

        html += '<div class="' + questClass + '" id="camp-' + q.id + '">';

        // Header
        html += '<div class="camp-quest-head" data-action="toggle-camp-quest" data-quest="' + q.id + '">';
        html += '<span class="camp-quest-icon">' + (isDone ? '✅' : unlocked ? '⚔️' : '🔒') + '</span>';
        html += '<div class="camp-quest-info">';
        html += '<div class="camp-quest-title">' + escFn(title) + '</div>';
        html += '<div class="camp-quest-tags">';
        html += '<span class="camp-tag camp-tag--' + q.sqlType + '">' + q.sqlType.toUpperCase() + '</span>';
        html += '<span class="camp-tag camp-tag--xp">+' + q.xp + ' XP</span>';
        if (q.time) html += '<span class="camp-tag camp-tag--time">⏱ ' + q.time + 's</span>';
        html += '</div></div>';
        html += '<span class="camp-quest-chevron" id="camp-chev-' + q.id + '">▸</span>';
        html += '</div>';

        // Body
        html += '<div class="camp-quest-body" id="camp-body-' + q.id + '">';
        html += '<div class="camp-story">' + sanitizeFn(story) + '</div>';
        html += '<div class="camp-objective"><strong>' + (lang === 'nl' ? 'Doel:' : 'Goal:') + '</strong> <code>' + escFn(obj) + '</code></div>';

        if (!isDone && unlocked) {
          // Timer
          html += '<div class="camp-timer" id="camp-timer-' + q.id + '">';
          html += '<div class="camp-timer-track"><div class="camp-timer-fill" id="camp-tb-' + q.id + '"></div></div>';
          html += '<div class="camp-timer-num" id="camp-tn-' + q.id + '"></div>';
          html += '</div>';
          // SQL input
          html += '<div class="camp-sql-area">';
          html += '<div class="camp-sql-wrap">';
          html += '<textarea class="camp-sql-input" id="camp-sql-' + q.id + '" placeholder="' + (lang === 'nl' ? 'Schrijf je SQL hier...' : 'Write your SQL here...') + '" spellcheck="false"></textarea>';
          html += '<div class="camp-sql-hint">Ctrl+Enter</div>';
          html += '</div>';
          html += '<button class="camp-run-btn" data-action="camp-run" data-quest="' + q.id + '">▶ Run</button>';
          html += '</div>';
          // Feedback area
          html += '<div id="camp-fb-' + q.id + '"></div>';
        } else if (isDone) {
          html += '<div class="camp-fb camp-fb--ok">✅ ' + (lang === 'nl' ? 'Quest voltooid!' : 'Quest completed!') + ' +' + q.xp + ' XP</div>';
        } else {
          html += '<div class="camp-fb camp-fb--hint">🔒 ' + (lang === 'nl' ? 'Voltooi eerdere quests om te ontgrendelen.' : 'Complete previous quests to unlock.') + '</div>';
        }

        html += '</div>'; // body
        html += '</div>'; // quest
      });
      html += '</div>'; // quest-list
      html += '</div>'; // chapter
    });

    content.innerHTML = html;

    // Attach Ctrl+Enter handlers to textareas
    CAMPAIGN_QUESTS.forEach(function(q) {
      var ta = document.getElementById('camp-sql-' + q.id);
      if (ta) {
        ta.addEventListener('keydown', function(e) {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            self.runQuest(q.id);
          }
        });
      }
    });
  },

  // ─── TOGGLE QUEST ──────────────────────────────────────────────
  toggleQuest: function(id) {
    try { this._toggleQuestInner(id); }
    catch (e) { console.warn('Campaign toggleQuest error:', e); }
  },

  _toggleQuestInner: function(id) {
    var body = document.getElementById('camp-body-' + id);
    var chev = document.getElementById('camp-chev-' + id);
    var card = document.getElementById('camp-' + id);
    if (!body) return;
    var wasOpen = body.classList.contains('open');

    // Close all
    var campContent = document.getElementById('camp-content');
    if (campContent) {
      campContent.querySelectorAll('.camp-quest-body').forEach(function(b) { b.classList.remove('open'); });
      campContent.querySelectorAll('.camp-quest-chevron').forEach(function(c) { c.classList.remove('open'); });
      campContent.querySelectorAll('.camp-quest').forEach(function(q) { q.classList.remove('camp-quest--active'); });
    }

    // Clear timer
    this._clearTimer(id);

    if (!wasOpen) {
      body.classList.add('open');
      if (chev) chev.classList.add('open');
      if (card) card.classList.add('camp-quest--active');

      var quest = CAMPAIGN_QUESTS.find(function(q) { return q.id === id; });
      if (quest && quest.time && !this.doneQuests.has(id) && this.isUnlocked(quest)) {
        // Use persisted remaining time if available (restored from localStorage after
        // a tab close), otherwise start from the quest's full time allocation.
        var resumeSecs = (this._timerPaused && this._timerPaused[id]) || quest.time;
        if (this._timerPaused) delete this._timerPaused[id];
        this._startTimer(id, resumeSecs);
      }
    }
  },

  // ─── TIMER ─────────────────────────────────────────────────────
  _clearTimer: function(id) {
    if (this._timers[id]) {
      cancelAnimationFrame(this._timers[id]);
      delete this._timers[id];
    }
    if (this._timerRemaining) delete this._timerRemaining[id];
  },

  _startTimer: function(id, secs) {
    this._clearTimer(id);
    var self = this;
    self._timerRemaining[id] = secs;
    var end = Date.now() + secs * 1000;

    function tick() {
      var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      self._timerRemaining[id] = left;
      var numEl = document.getElementById('camp-tn-' + id);
      var barEl = document.getElementById('camp-tb-' + id);
      if (numEl) {
        numEl.textContent = left + 's';
        numEl.className = 'camp-timer-num' + (left <= 10 ? ' danger' : left <= 20 ? ' warn' : '');
      }
      if (barEl) {
        barEl.style.width = (left / secs * 100) + '%';
        barEl.className = 'camp-timer-fill' + (left <= 10 ? ' danger' : left <= 20 ? ' warn' : '');
      }
      if (left <= 0) {
        self._clearTimer(id);
        var fb = document.getElementById('camp-fb-' + id);
        if (fb) {
          fb.className = 'camp-fb camp-fb--timeout';
          fb.innerHTML = '⏰ <strong>' + (typeof t === 'function' ? t('js_camp_timeout') || 'Tijd voorbij!' : 'Tijd voorbij!') + '</strong> ' +
            (typeof t === 'function' ? t('js_camp_timeout_retry') || 'Probeer opnieuw.' : 'Probeer opnieuw.');
        }
        return;
      }
      self._timers[id] = requestAnimationFrame(tick);
    }
    self._timers[id] = requestAnimationFrame(tick);
  },

  // ─── RUN QUEST ─────────────────────────────────────────────────
  runQuest: function(id) {
    try { this._runQuestInner(id); }
    catch (e) {
      console.warn('Campaign runQuest error:', e);
      var fb = document.getElementById('camp-fb-' + id);
      if (fb) {
        fb.className = 'camp-fb camp-fb--err';
        fb.innerHTML = '⚠️ Er ging iets mis. Probeer opnieuw.';
      }
    }
  },

  _runQuestInner: function(id) {
    var quest = CAMPAIGN_QUESTS.find(function(q) { return q.id === id; });
    if (!quest || this.doneQuests.has(id) || !this.isUnlocked(quest)) return;

    var ta = document.getElementById('camp-sql-' + id);
    var fb = document.getElementById('camp-fb-' + id);
    if (!ta || !fb) return;

    var sql = ta.value.trim();
    if (!sql) {
      fb.className = 'camp-fb camp-fb--err';
      fb.innerHTML = '⚠️ ' + (typeof t === 'function' ? t('js_camp_enter_sql') || 'Voer een SQL-query in.' : 'Voer een SQL-query in.');
      return;
    }

    if (typeof runSQL !== 'function') {
      fb.className = 'camp-fb camp-fb--err';
      fb.innerHTML = '⚠️ SQL engine niet beschikbaar.';
      return;
    }

    var res = runSQL(sql);
    if (!res || !res.ok) {
      fb.className = 'camp-fb camp-fb--err';
      var escFn = (typeof esc === 'function') ? esc : function(s) { return String(s || ''); };
      fb.innerHTML = '❌ ' + escFn((res && res.msg) || 'SQL fout.');
      return;
    }

    // Validate result
    var validated = this._validateQuestResult(quest, sql, res);
    if (!validated) {
      fb.className = 'camp-fb camp-fb--hint';
      fb.innerHTML = '🤔 ' + (typeof t === 'function' ? t('js_camp_close_but_wrong') || 'Bijna goed! Controleer je waarden.' : 'Bijna goed! Controleer je waarden.');
      return;
    }

    // Keyword check — single required string (legacy)
    var normalSql = sql.toLowerCase().replace(/\s+/g, ' ');
    var checkStr = (quest.check || '').toLowerCase();
    if (checkStr && !normalSql.includes(checkStr)) {
      fb.className = 'camp-fb camp-fb--hint';
      fb.innerHTML = '🤔 ' + (typeof t === 'function' ? t('js_camp_wrong_query') || 'Dit is niet wat de opdracht vraagt.' : 'Dit is niet wat de opdracht vraagt.');
      return;
    }

    // mustContain check — array of required SQL fragments (e.g. ['INSERT INTO klant', 'emma@mail.be'])
    // Allows quest authors to verify both the operation AND specific values without relying
    // solely on DB-state inspection, which can be satisfied by unintended mutations.
    if (Array.isArray(quest.mustContain)) {
      var missingFragment = null;
      for (var mi = 0; mi < quest.mustContain.length; mi++) {
        if (!normalSql.includes(quest.mustContain[mi].toLowerCase())) {
          missingFragment = quest.mustContain[mi];
          break;
        }
      }
      if (missingFragment) {
        fb.className = 'camp-fb camp-fb--hint';
        fb.innerHTML = '🤔 ' + (typeof t === 'function' ? t('js_camp_wrong_query') || 'Dit is niet wat de opdracht vraagt.' : 'Dit is niet wat de opdracht vraagt.');
        return;
      }
    }

    // ── Success! ──
    this.doneQuests.add(id);
    this.save();
    this._clearTimer(id);

    if (typeof G !== 'undefined' && G !== null) {
      G.xp = (G.xp || 0) + (quest.xp || 0);
      if (typeof UI !== 'undefined' && UI !== null) {
        if (typeof UI.updateXP === 'function') {
          try { UI.updateXP(); } catch(e) { console.warn('Campaign: UI.updateXP error', e); }
        }
        if (typeof UI.xpPop === 'function') {
          try { UI.xpPop('+' + (quest.xp || 0) + ' XP'); } catch(e) { /* ignore */ }
        }
        if (typeof UI.addEvent === 'function') {
          try {
            var escFn2 = (typeof esc === 'function') ? esc : function(s) { return String(s || ''); };
            var lang = (typeof LANG !== 'undefined') ? LANG : 'nl';
            var titleStr = (quest.title && quest.title[lang]) || (quest.title && quest.title.nl) || quest.id;
            UI.addEvent('ok', '⚔️ Campaign quest voltooid: <strong>' + escFn2(titleStr) + '</strong>', true);
          } catch(e) { /* ignore */ }
        }
      }
      if (typeof save === 'function') {
        try { save(); } catch(e) { /* ignore */ }
      }
    }

    fb.className = 'camp-fb camp-fb--ok';
    fb.innerHTML = '✅ ' + (typeof t === 'function' ? t('js_camp_quest_done') || 'Quest voltooid!' : 'Quest voltooid!') + ' +' + (quest.xp || 0) + ' XP';

    // Re-render after delay
    var self = this;
    setTimeout(function() {
      try { self.render(); } catch(e) { /* ignore */ }
    }, 1500);
  },

  // ─── RESULT VALIDATION ─────────────────────────────────────────
  _validateQuestResult: function(quest, sql, res) {
    var lang = (typeof LANG !== 'undefined') ? LANG : 'nl';
    var objective = (quest.objective && quest.objective[lang]) || (quest.objective && quest.objective.nl) || '';
    if (!objective) return true;

    var normalObj = objective.toLowerCase().replace(/\s+/g, ' ').trim();

    switch (quest.sqlType) {
      case 'insert': {
        var insertM = normalObj.match(/insert\s+into\s+(\w+)\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
        if (!insertM) return true;
        var tbl = insertM[1].toLowerCase();
        var cols = insertM[2].split(',').map(function(c) { return c.trim(); });
        var vals = insertM[3].split(',').map(function(v) { return v.trim().replace(/^'|'$/g, ''); });
        if (typeof DB === 'undefined' || !DB[tbl]) return true;
        return DB[tbl].rows.some(function(row) {
          return cols.every(function(col, i) {
            var expected = vals[i];
            var actual = row[col];
            if (actual == null) return false;
            if (!isNaN(Number(expected)) && !isNaN(Number(actual))) return Number(actual) === Number(expected);
            return String(actual).toLowerCase() === expected.toLowerCase();
          });
        });
      }
      case 'update': {
        var updateM = normalObj.match(/update\s+(\w+)\s+set\s+(.*?)\s+where\s+(.*)/i);
        if (!updateM) return true;
        var tbl2 = updateM[1].toLowerCase();
        if (typeof DB === 'undefined' || !DB[tbl2]) return true;
        var assignments = {};
        var setRe = /(\w+)\s*=\s*('(?:[^']*)'|[\d.]+)/g;
        var sm;
        while ((sm = setRe.exec(updateM[2])) !== null) {
          assignments[sm[1]] = sm[2].replace(/^'|'$/g, '');
        }
        return DB[tbl2].rows.some(function(row) {
          return Object.keys(assignments).every(function(col) {
            var expected = assignments[col];
            var actual = row[col];
            if (actual == null) return false;
            if (!isNaN(Number(expected)) && !isNaN(Number(actual))) return Number(actual) === Number(expected);
            return String(actual).toLowerCase() === expected.toLowerCase();
          });
        });
      }
      case 'delete': {
        var deleteM = normalObj.match(/delete\s+from\s+(\w+)\s+where\s+(.*)/i);
        if (!deleteM) return true;
        var tbl3 = deleteM[1].toLowerCase();
        if (typeof DB === 'undefined' || !DB[tbl3]) return true;
        var whereCol = deleteM[2].match(/(\w+)\s*=\s*('(?:[^']*)'|[\d.]+)/);
        if (!whereCol) return true;
        var col3 = whereCol[1];
        var val3 = whereCol[2].replace(/^'|'$/g, '');
        return !DB[tbl3].rows.some(function(row) {
          var actual = row[col3];
          if (!isNaN(Number(val3))) return Number(actual) === Number(val3);
          return String(actual || '').toLowerCase() === val3.toLowerCase();
        });
      }
      case 'select': {
        if (typeof runSQL !== 'function') return true;
        try {
          // Snapshot the expected result the first time this quest is validated.
          // Re-running the objective SQL on every attempt means the expected set
          // drifts when earlier quests have mutated the DB (e.g. camp_1 INSERTs
          // a new klant row, which changes COUNT(*) results for later SELECTs).
          // Storing the snapshot on the quest object is safe because CAMPAIGN_QUESTS
          // is module-private and the snapshot is deterministic for the initial DB.
          if (!quest._expectedRows) {
            var snapRes = runSQL(objective);  // objective is already lang-resolved above
            if (!snapRes || !snapRes.ok || !snapRes.rows) return true;
            quest._expectedRows = snapRes.rows;
          }
          var expectedRows = quest._expectedRows;
          if (!res || !res.ok || !res.rows) return true;
          if (expectedRows.length !== res.rows.length) return false;
          if (expectedRows.length > 0 && res.rows.length > 0) {
            var expectedCols = Object.keys(expectedRows[0]).sort();
            var actualCols = Object.keys(res.rows[0]).sort();
            if (expectedCols.join(',') !== actualCols.join(',')) return false;
            for (var i = 0; i < expectedRows.length; i++) {
              for (var j = 0; j < expectedCols.length; j++) {
                var ek = expectedCols[j];
                if (String(expectedRows[i][ek]) !== String(res.rows[i][ek])) return false;
              }
            }
          }
          return true;
        } catch (e) { return true; }
      }
      default: return true;
    }
  },

  // ─── RESET ─────────────────────────────────────────────────────
  reset: function() {
    this.doneQuests = new Set();
    // Clear SELECT snapshots so they are re-taken against the freshly reset DB.
    CAMPAIGN_QUESTS.forEach(function(q) { delete q._expectedRows; });
    // Force re-registration so quest index is rebuilt cleanly after reset.
    this._questsRegistered = false;
    this._registeredLang = null;
    this.save();
    this.render();
  },
};


// ══════════════════════════════════════════════════════════════════
//  TIMER PAUSE ON TAB SWITCH
//  On hide: cancel RAF loops and persist remaining time to localStorage
//  so a full tab close + reopen can still resume the correct countdown.
//  On show: restore from localStorage (if any) then restart timers.
// ══════════════════════════════════════════════════════════════════
document.addEventListener('visibilitychange', function() {
  if (!CAMP._timers) return;
  if (document.hidden) {
    if (!CAMP._timerPaused) CAMP._timerPaused = {};
    Object.keys(CAMP._timers).forEach(function(id) {
      var remaining = (CAMP._timerRemaining && CAMP._timerRemaining[id]) || 0;
      CAMP._timerPaused[id] = remaining;
      cancelAnimationFrame(CAMP._timers[id]);
      delete CAMP._timers[id];
    });
    CAMP._saveTimerState();   // persist — survives a full tab close
  } else {
    CAMP._restoreTimerState();  // pick up state from a previous session if needed
    if (!CAMP._timerPaused) return;
    Object.keys(CAMP._timerPaused).forEach(function(id) {
      var left = CAMP._timerPaused[id];
      delete CAMP._timerPaused[id];
      if (left > 0) CAMP._startTimer(id, left);
    });
    CAMP._saveTimerState();   // clear persisted state now that timers are running again
  }
});


// ══════════════════════════════════════════════════════════════════
//  EVENT DELEGATION — Campaign only
// ══════════════════════════════════════════════════════════════════
document.addEventListener('click', function(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;

  if (action === 'toggle-camp-quest') {
    CAMP.toggleQuest(el.dataset.quest);
    return;
  }
  if (action === 'camp-run') {
    CAMP.runQuest(el.dataset.quest);
    return;
  }
  if (action === 'camp-reset') {
    CAMP.reset();
    return;
  }
});


// ══════════════════════════════════════════════════════════════════
//  HOOK INTO PANEL SHOW
//  Listen for the 'datashop:panelshow' custom event dispatched by
//  UI.showPanel() in datashop-ui.js.  This decouples campaign.js
//  from UI internals — no monkey-patching needed and the module
//  keeps working regardless of load order or future UI refactors.
// ══════════════════════════════════════════════════════════════════
document.addEventListener('datashop:panelshow', function(e) {
  if (!e.detail || e.detail.panel !== 'camp') return;
  try {
    CAMP.init();
    CAMP.render();
  } catch (err) {
    console.warn('Campaign: render error on panel show', err);
  }
});

// Initialize on load
try { CAMP.init(); } catch (e) { console.warn('Campaign init error', e); }

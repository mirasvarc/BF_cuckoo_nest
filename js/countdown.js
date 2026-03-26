// ── i18n ────────────────────────────────────────────────────
const i18n = {
  cs: {
    headerDefault: 'Čas do lobotomie pacientů',
    placeholder: 'Zadej text...',
    setTextLabel: 'Nastavit text na:',
    quickSet: 'Rychlé nastavení:',
    pause: 'Pozastavit',
    texts: [
      'Nouzový východ otevřen',
      'Čas do lobotomie pacientů',
      'Čas do příchodu lékaře',
      'Zákrok odložen',
    ],
  },
  en: {
    headerDefault: 'Time until patient lobotomy',
    placeholder: 'Enter text...',
    setTextLabel: 'Set text to:',
    quickSet: 'Quick set:',
    pause: 'Pause',
    texts: [
      'Emergency exit opened',
      'Time until patient lobotomy',
      'Time until doctor\'s arrival',
      'Surgery postponed',
    ],
  },
};

let currentLang = 'cs';
function t() { return i18n[currentLang]; }

// ── DOM refs ─────────────────────────────────────────────────
const DEFAULT_TIME = '01:15:00';

const timeEl             = document.getElementById('time');
const timeInputWrapper   = document.getElementById('time-input');
const timeInput          = timeInputWrapper.querySelector('input');
const headerTextEl       = document.querySelector('.h1-text');
const headerInputWrapper = document.querySelector('.h1-input');
const headerInput        = headerInputWrapper.querySelector('input');
const startBtn           = document.getElementById('start-btn');
const stopBtn            = document.getElementById('stop-btn');
const resetBtn           = document.getElementById('reset-btn');
const definedTextItems   = document.querySelectorAll('.defined-texts-item');
const setTextLabel       = document.querySelector('.defined-texts .title');
const quickSetLabel      = document.querySelector('.preset-label');
const timePresetBtns     = document.querySelectorAll('.time-preset');
const langCsBtn          = document.getElementById('lang-cs');
const langEnBtn          = document.getElementById('lang-en');
const versionEl          = document.getElementById('version');
const timeEditHint       = document.getElementById('time-edit-hint');

// ── State ────────────────────────────────────────────────────
const state = {
  totalSeconds: 0,
  isRunning: false,
  isOvertime: false,
  intervalId: null,
  activeTextIndex: 1,
  startTime: null,      // wall-clock ms when current run segment started
  startSeconds: null,   // signed seconds at segment start (negative = overtime)
};

// ── Version ──────────────────────────────────────────────────
window.electronAPI.getVersion().then((v) => {
  versionEl.textContent = `v${v}`;
});

// ── Timer logic ──────────────────────────────────────────────
function formatTime(totalSeconds) {
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function parseTime(str) {
  const clean = str.replace(/^-/, '');
  if (!/^\d{1,2}:\d{2}:\d{2}$/.test(clean)) return null;
  const [h, m, s] = clean.split(':').map(Number);
  if (m >= 60 || s >= 60) return null;
  return h * 3600 + m * 60 + s;
}

function sendTimeUpdate(formatted) {
  window.electronAPI.sendUpdate({ type: 'time', value: formatted, overtime: state.isOvertime });
}

function sendTextUpdate(text) {
  window.electronAPI.sendUpdate({ type: 'text', value: text });
}

function tick() {
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const signedRemaining = state.startSeconds - elapsed;

  state.isOvertime = signedRemaining < 0;
  state.totalSeconds = Math.abs(signedRemaining);

  const formatted = formatTime(state.totalSeconds);
  const display = state.isOvertime ? `-${formatted}` : formatted;
  timeEl.textContent = display;
  timeEl.classList.toggle('overtime', state.isOvertime);
  sendTimeUpdate(display);
}

function startTimer() {
  if (state.isRunning) return;
  const parsed = parseTime(timeEl.textContent);
  if (parsed === null) return;
  state.totalSeconds = parsed;
  // startSeconds is negative when resuming from overtime
  state.startSeconds = state.isOvertime ? -parsed : parsed;
  state.startTime = Date.now();
  state.isRunning = true;
  startBtn.disabled = true;
  timePresetBtns.forEach(b => b.disabled = true);
  timeEditHint.classList.add('hidden');
  state.intervalId = setInterval(tick, 1000);
}

function pauseTimer() {
  if (!state.isRunning) return;
  clearInterval(state.intervalId);
  state.intervalId = null;
  state.isRunning = false;
  startBtn.disabled = false;
  timePresetBtns.forEach(b => b.disabled = false);
  timeEditHint.classList.remove('hidden');
}

function resetTimer() {
  pauseTimer();
  state.isOvertime = false;
  state.totalSeconds = 0;
  timeEl.textContent = DEFAULT_TIME;
  timeEl.classList.remove('overtime');
  sendTimeUpdate(DEFAULT_TIME);
}

// ── Header text editing ──────────────────────────────────────
document.getElementById('header-text').addEventListener('click', () => {
  headerTextEl.classList.add('hidden');
  headerInputWrapper.classList.remove('hidden');
  headerInput.value = headerTextEl.textContent;
  headerInput.focus();
});

headerInput.addEventListener('focusout', () => {
  headerTextEl.classList.remove('hidden');
  headerInputWrapper.classList.add('hidden');
  const val = headerInput.value.trim() || t().placeholder;
  headerTextEl.textContent = val;
  state.activeTextIndex = null;
  sendTextUpdate(val);
});

// ── Time editing ─────────────────────────────────────────────
document.getElementById('countdown').addEventListener('click', () => {
  if (state.isRunning) return;
  timeEl.classList.add('hidden');
  timeInputWrapper.classList.remove('hidden');
  timeInput.value = timeEl.textContent;
  timeInput.focus();
});

timeInput.addEventListener('focusout', () => {
  const val = timeInput.value.trim();
  if (parseTime(val) === null) {
    // Invalid — shake, then revert to whatever was showing before
    timeInput.classList.add('invalid');
    timeInput.addEventListener('animationend', () => {
      timeInput.classList.remove('invalid');
    }, { once: true });
    // Let focus leave naturally; revert to current display value
    timeEl.classList.remove('hidden');
    timeInputWrapper.classList.add('hidden');
    return;
  }
  timeEl.classList.remove('hidden');
  timeInputWrapper.classList.add('hidden');
  timeEl.textContent = val;
  sendTimeUpdate(val);
});

// ── Control buttons ──────────────────────────────────────────
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', () => {
  if (window.confirm('Reset the timer?')) resetTimer();
});

// ── Time presets ─────────────────────────────────────────────
timePresetBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (state.isRunning) return;
    const t = btn.dataset.time;
    timeEl.textContent = t;
    sendTimeUpdate(t);
  });
});

// ── Quick-set text buttons ───────────────────────────────────
definedTextItems.forEach((item, i) => {
  item.addEventListener('click', () => {
    const text = item.textContent;
    headerTextEl.textContent = text;
    state.activeTextIndex = i;
    sendTextUpdate(text);
  });
});

// ── Language switcher ────────────────────────────────────────
function applyLanguage(lang) {
  const strings = i18n[lang];
  currentLang = lang;

  definedTextItems.forEach((item, i) => {
    item.textContent = strings.texts[i];
  });

  setTextLabel.textContent = strings.setTextLabel;
  quickSetLabel.textContent = strings.quickSet;
  stopBtn.textContent = strings.pause;

  if (state.activeTextIndex !== null) {
    const newText = strings.texts[state.activeTextIndex];
    headerTextEl.textContent = newText;
    sendTextUpdate(newText);
  }

  langCsBtn.classList.toggle('active', lang === 'cs');
  langEnBtn.classList.toggle('active', lang === 'en');
}

langCsBtn.addEventListener('click', () => applyLanguage('cs'));
langEnBtn.addEventListener('click', () => applyLanguage('en'));

// Apply default language on startup
applyLanguage(currentLang);

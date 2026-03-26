const timeEl = document.getElementById('cuckoo-time');
const textEl = document.getElementById('cuckoo-text');

// ── Digit animation ──────────────────────────────────────────
function renderTime(el, value) {
  const chars = [...value];
  const spans = el.querySelectorAll('.digit');

  if (spans.length !== chars.length) {
    el.textContent = '';
    chars.forEach(c => {
      const span = document.createElement('span');
      span.className = 'digit';
      span.textContent = c;
      el.appendChild(span);
    });
    return;
  }

  spans.forEach((span, i) => {
    if (span.textContent !== chars[i]) {
      span.textContent = chars[i];
      // Only animate actual digit changes, not colons or minus
      if (chars[i] !== ':' && chars[i] !== '-') {
        span.classList.remove('digit-changed');
        span.getBoundingClientRect(); // force reflow to restart animation
        span.classList.add('digit-changed');
      }
    }
  });
}

// Initialise spans on load, then tell main we are ready to receive state
renderTime(timeEl, timeEl.textContent);
window.electronAPI.notifyReady();

// ── IPC updates ──────────────────────────────────────────────
window.electronAPI.onUpdate((data) => {
  if (data.type === 'time') {
    renderTime(timeEl, data.value);
    timeEl.classList.toggle('overtime', data.overtime);
  } else if (data.type === 'text') {
    textEl.textContent = data.value;
  }
});

// ── Auto-hide cursor ─────────────────────────────────────────
let cursorTimeout;

function showCursor() {
  document.body.style.cursor = '';
  clearTimeout(cursorTimeout);
  cursorTimeout = setTimeout(() => {
    document.body.style.cursor = 'none';
  }, 2000);
}

document.addEventListener('mousemove', showCursor);
// Hide immediately on load
document.body.style.cursor = 'none';

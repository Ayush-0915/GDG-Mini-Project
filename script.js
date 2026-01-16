// Simple interactivity: modal, register, countdown, theme
const modal = document.getElementById('modal');
const registerBtn = document.getElementById('registerBtn');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const regForm = document.getElementById('regForm');
const regMessage = document.getElementById('regMessage');
const themeToggle = document.getElementById('themeToggle');
const countdownEl = document.getElementById('countdown');
const regCountdownEl = document.getElementById('regCountdown');

// Event datetimes
const eventDate = new Date('2026-03-01T09:00:00');
const regCloseDate = new Date('2026-02-25T23:59:59');

// Ensure dark/light preference restored
(function initTheme(){
  try{
    const saved = localStorage.getItem('gdg-theme');
    const isDark = saved ? saved === 'dark' : document.body.classList.contains('dark');
    applyTheme(isDark);
  }catch(e){
    applyTheme(document.body.classList.contains('dark'));
  }

  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const nowDark = document.body.classList.toggle('dark');
      applyTheme(nowDark);
      try{ localStorage.setItem('gdg-theme', nowDark ? 'dark' : 'light'); }catch(e){}
    });
  }

  function applyTheme(dark){
    if(themeToggle){
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.textContent = dark ? '☀️ Light' : '🌙 Dark';
    }
  }
})();

// Utility
function qs(id){ return document.getElementById(id); }
function pad(n){ return String(n).padStart(2,'0'); }

// Modal control: open, close, focus first input
function openModal(){
  if(!modal) return;
  modal.setAttribute('aria-hidden','false');
  // slight delay to allow transition then focus first input
  setTimeout(()=>{
    const first = modal.querySelector('input,select,textarea,button');
    if(first) first.focus();
  }, 160);
}
function closeModalFn(){
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
  // restore form for next open
  if(regMessage) regMessage.hidden = true;
  if(regForm) { regForm.hidden = false; regForm.reset(); }
}

// Close handlers
if(closeModal) closeModal.addEventListener('click', closeModalFn);
if(cancelModal) cancelModal.addEventListener('click', closeModalFn);
if(modal){
  modal.addEventListener('click', e => { if(e.target === modal) closeModalFn(); });
  window.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });
}

// Confetti + pop then open modal
if(registerBtn){
  registerBtn.addEventListener('click', (e)=>{
    if(registerBtn.hasAttribute('disabled')) return;
    // small pop animation
    registerBtn.classList.add('pop');
    setTimeout(()=> registerBtn.classList.remove('pop'), 350);

    // confetti burst under modal (kept z-index lower than modal)
    const colors = ['#FF7AA2','#6EA8FF','#9B6AFF','#FFD166','#4ADE80'];
    const rect = registerBtn.getBoundingClientRect();
    for(let i=0;i<10;i++){
      const dot = document.createElement('div');
      dot.className = 'confetti-dot';
      dot.style.background = colors[Math.floor(Math.random()*colors.length)];
      const startX = rect.left + rect.width/2;
      const startY = rect.top + rect.height/2;
      dot.style.left = startX + 'px';
      dot.style.top = startY + 'px';
      document.body.appendChild(dot);
      const angle = (Math.random()*Math.PI*2);
      const dist = 60 + Math.random()*80;
      const dx = Math.cos(angle)*dist;
      const dy = Math.sin(angle)*dist - (20 + Math.random()*30);
      requestAnimationFrame(()=>{
        dot.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random()*360}deg)`;
        dot.style.opacity = '0';
      });
      setTimeout(()=> dot.remove(), 900);
    }

    // open modal after short delay
    setTimeout(openModal, 220);
  });
}

// Register form submit (fake)
if(regForm){
  regForm.addEventListener('submit', e=>{
    e.preventDefault();
    const fm = new FormData(regForm);
    const name = fm.get('name') || 'there';
    if(regForm) regForm.hidden = true;
    if(regMessage){
      regMessage.hidden = false;
      regMessage.textContent = `Thanks, ${name} — your registration is received (fake).`;
    }
    // close modal after brief pause
    setTimeout(closeModalFn, 1600);
  });
}

// Countdown rendering & register disable logic
function renderTimer(el, diff, emptyLabel){
  if(!el) return;
  if(diff <= 0){
    el.innerHTML = `<div class="countdown-box"><div class="time-part"><div class="num">00</div><div class="label">Days</div></div><div class="time-part"><div class="num">00</div><div class="label">Hrs</div></div><div class="time-part"><div class="num">00</div><div class="label">Mins</div></div><div class="time-part seconds"><div class="num">00</div><div class="label">Secs</div></div></div><div class="note">${emptyLabel}</div>`;
    return;
  }
  const days = Math.floor(diff / (24*60*60*1000));
  const hrs = Math.floor(diff % (24*60*60*1000) / (60*60*1000));
  const mins = Math.floor(diff % (60*60*1000) / (60*1000));
  const secs = Math.floor(diff % (60*1000) / 1000);
  el.innerHTML = `
    <div class="countdown-box" role="status" aria-live="polite">
      <div class="time-part"><div class="num">${pad(days)}</div><div class="label">Days</div></div>
      <div class="time-part"><div class="num">${pad(hrs)}</div><div class="label">Hrs</div></div>
      <div class="time-part"><div class="num">${pad(mins)}</div><div class="label">Mins</div></div>
      <div class="time-part seconds"><div class="num">${pad(secs)}</div><div class="label">Secs</div></div>
    </div>
  `;
}

function updateTimers(){
  const now = new Date();
  const diffEvent = Math.max(0, eventDate - now);
  const diffReg = Math.max(0, regCloseDate - now);
  renderTimer(countdownEl, diffEvent, 'Event started');
  renderTimer(regCountdownEl, diffReg, 'Registration closed');

  // disable register if registration closed
  if(registerBtn){
    if(diffReg <= 0){
      registerBtn.setAttribute('disabled','true');
      registerBtn.classList.add('disabled');
      registerBtn.setAttribute('aria-disabled','true');
      const txt = registerBtn.querySelector('.cr-text');
      if(txt) txt.textContent = 'Registration closed';
    } else {
      registerBtn.removeAttribute('disabled');
      registerBtn.classList.remove('disabled');
      registerBtn.setAttribute('aria-disabled','false');
      const txt = registerBtn.querySelector('.cr-text');
      if(txt && txt.textContent !== 'Register') txt.textContent = 'Register';
    }
  }
}
updateTimers();
setInterval(updateTimers,1000);

// safety: ensure modal and inputs are clickable/focusable when open
// (ensures pointer-events and z-index are respected by CSS)
if(modal){
  modal.addEventListener('transitionend', ()=> {
    if(modal.getAttribute('aria-hidden') === 'false'){
      const first = modal.querySelector('input,select,textarea,button');
      if(first) first.tabIndex = 0;
    }
  });
}

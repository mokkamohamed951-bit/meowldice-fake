// عناصر DOM
const app = document.getElementById("app");
const leftPanel = document.getElementById("leftPanel");
const toggleLeftBtn = document.getElementById("toggleLeftBtn");
const moveLeftBtn = document.getElementById("moveLeftBtn");

const diceRow   = document.getElementById("diceRow");
const rollBtn   = document.getElementById("rollBtn");
const diceCount = document.getElementById("diceCount");
const checks    = document.querySelectorAll(".color-check");
const colorBtns = document.querySelectorAll(".color-btn");
const fancyBtns  = document.querySelectorAll(".fancy-btn");
const rollList  = document.getElementById("rollList");
const undoBtn   = document.getElementById("undoBtn");
const clearBtn  = document.getElementById("clearBtn");
const eraseStorageBtn = document.getElementById("eraseStorageBtn");
const soundEl   = document.getElementById("diceSound");
const soundToggle = document.getElementById("soundToggle");

let history = [];
let allowedColors = ["red","orange","yellow","green","blue","purple"];

// --- localStorage للحفظ ---
const STORAGE_KEY = "diceHistory_v1";
function saveHistory() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch(e){ console.warn(e); }
}
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch(e){ console.warn(e); return []; }
}

// مزامنة الأزرار مع الـ checkboxes عند التحميل
function syncButtonsWithChecks(){
  fancyBtns.forEach(btn=>{
    const color = btn.dataset.color;
    const checked = Array.from(checks).some(c=>c.value===color && c.checked);
    btn.classList.toggle("active", checked);
    btn.classList.toggle("dim", !checked);
    btn.setAttribute("aria-pressed", checked ? "true" : "false");
  });
}
syncButtonsWithChecks();

// تفعيل/تعطيل لون من الأزرار (الفانسي)
fancyBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const color = btn.dataset.color;
    const ch = Array.from(checks).find(c=>c.value===color);
    if(ch){
      ch.checked = !ch.checked;
      updateAllowedColorsFromChecks();
      syncButtonsWithChecks();
      if(ch.checked){
        btn.animate([{ transform: "scale(1.04)" }, { transform: "scale(1)" }], { duration: 140 });
      }
    }
  });
});

// لو غيرت الـ checkboxes ينعكس على الأزرار
checks.forEach(ch=>{
  ch.addEventListener("change", ()=>{
    updateAllowedColorsFromChecks();
    syncButtonsWithChecks();
  });
});

function updateAllowedColorsFromChecks(){
  const active = [];
  checks.forEach(ch=>{
    if(ch.checked) active.push(ch.value);
  });
  allowedColors = active.length ? active : ["red","orange","yellow","green","blue","purple"];
}

// دالة الرول الأساسية
function rollDice(){
  const count = Math.max(1, Math.min(12, parseInt(diceCount.value) || 4));
  diceCount.value = count;

  const colors = allowedColors.length ? allowedColors : ["red","orange","yellow","green","blue","purple"];

  diceRow.innerHTML = "";
  const rollColors = [];

  for(let i=0;i<count;i++){
    const c = colors[Math.floor(Math.random()*colors.length)];
    rollColors.push(c);

    const d = document.createElement("div");
    d.className = "dice " + c + " roll";
    const dot = document.createElement("div");
    dot.className = "dot";
    d.appendChild(dot);
    diceRow.appendChild(d);

    setTimeout(()=> d.classList.remove("roll"), 300);
  }

  if(soundToggle.checked){
    try{
      soundEl.currentTime = 0;
      soundEl.play().catch(()=>{});
    }catch(e){}
  }

  history.push(rollColors);
  saveHistory();
  renderHistory();
}

// عرض التاريخ في اليمين
function renderHistory(){
  rollList.innerHTML = "";
  if(history.length === 0){
    rollList.innerHTML = "<div style='color:#666;font-size:13px'>No rolls yet</div>";
    return;
  }
  history.slice().reverse().forEach((r, idx)=>{
    const div = document.createElement("div");
    div.textContent = `${history.length - idx}: ${r.join(", ")}`;
    rollList.appendChild(div);
  });
}

// UNDO
undoBtn.addEventListener("click", ()=>{
  if(history.length) history.pop();
  saveHistory();
  renderHistory();
});

// CLEAR
clearBtn.addEventListener("click", ()=>{
  history = [];
  saveHistory();
  renderHistory();
});

// زر لمسح التخزين نهائياً
eraseStorageBtn.addEventListener("click", ()=>{
  if(!confirm("تأكيد: تبي تمسح كل تاريخ الرميات نهائياً؟")) return;
  history = [];
  saveHistory();
  renderHistory();
});

// ربط زر الرول
rollBtn.addEventListener("click", rollDice);

// دعم زر Enter على حقل عدد الدايس
diceCount.addEventListener("keydown", (e)=>{
  if(e.key === "Enter") rollDice();
});

// تحميل التاريخ عند التشغيل
history = loadHistory();
renderHistory();

// -----------------
// Hide / Move left panel controls
// -----------------

// Toggle hide/show left panel
toggleLeftBtn.addEventListener("click", ()=>{
  app.classList.remove("left-bottom");
  const hidden = app.classList.toggle("left-hidden");
  toggleLeftBtn.textContent = hidden ? " color " : "no color ";
  if(hidden){
    moveLeftBtn.textContent = "color  ";
  }
});

// Move left panel under center/right
moveLeftBtn.addEventListener("click", ()=>{
  app.classList.remove("left-hidden");
  const moved = app.classList.toggle("left-bottom");
  moveLeftBtn.textContent = moved ? "color " : "no color";
  toggleLeftBtn.textContent = "color ";
});

// تهيئة واجهة الأزرار والحالة
(function initUI(){
  syncButtonsWithChecks();
  updateAllowedColorsFromChecks();
  toggleLeftBtn.textContent = app.classList.contains("left-hidden") ? " color" : "no color ";
  moveLeftBtn.textContent = app.classList.contains("left-bottom") ? "color" : "no color";
})();

// رمية أولى تلقائية
rollDice();
document.getElementById("rollBtn").addEventListener("click", () => {
 document.getElementById("rollSound").play();
});


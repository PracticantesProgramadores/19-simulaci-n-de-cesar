const levels = [
  { word: "CARGA", hint: "Propiedad eléctrica de la materia.", explanation: "Cantidad de electricidad que posee un cuerpo.", level: 1 },
  { word: "IMÁN", hint: "Atrae metales sin tocarlos.", explanation: "Cuerpo que genera campo magnético y atrae materiales ferromagnéticos.", level: 1 },
  { word: "ÁTOMO", hint: "Unidad básica de la materia.", explanation: "Entidad con núcleo y electrones; base de toda materia.", level: 1 },
  { word: "FROTA", hint: "Acción que causa electrización por frotamiento.", explanation: "Al frotar, se transfieren electrones entre cuerpos.", level: 1 },

  { word: "CONTACTO", hint: "Forma de electrizar tocando.", explanation: "Un cuerpo cargado transfiere carga al tocar otro.", level: 2 },
  { word: "ATRACCIÓN", hint: "Lo que ocurre entre cargas diferentes.", explanation: "Cargas de signo opuesto se atraen entre sí.", level: 2 },
  { word: "REPULSIÓN", hint: "Lo que ocurre entre cargas iguales.", explanation: "Cargas del mismo signo se repelen.", level: 2 },
  { word: "ELECTRONES", hint: "Partículas con carga negativa.", explanation: "Partículas subatómicas con carga eléctrica negativa.", level: 2 },

  { word: "CULOMBIO", hint: "Unidad de la carga eléctrica.", explanation: "Unidad SI de carga; equivale a ~6.24×10^18 electrones.", level: 3 },
  { word: "ELECTROSTÁTICA", hint: "Estudia las cargas en reposo.", explanation: "Rama que analiza fuerzas y fenómenos con cargas en reposo.", level: 3 },
  { word: "INDUCCIÓN", hint: "Forma de electrizar sin tocar.", explanation: "Un cuerpo cargado separa cargas en otro sin contacto.", level: 3 },
  { word: "CONSERVACIÓN", hint: "La carga no se crea ni se destruye.", explanation: "La carga total se mantiene; solo se transfiere.", level: 3 },
  { word: "MAGNETISMO", hint: "Fenómeno relacionado con imanes.", explanation: "Interacciones debidas a campos magnéticos y materiales imantados.", level: 3 },
];

const hintEl = document.getElementById("hint");
const slotsEl = document.getElementById("slots");
const lettersEl = document.getElementById("letters");
const levelEl = document.getElementById("level");
const attemptsEl = document.getElementById("attempts");
const messageEl = document.getElementById("message");
const explanationEl = document.getElementById("explanation");
const clearBtn = document.getElementById("clearBtn");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");
let finalEl = document.getElementById("final");
let restartBtn = document.getElementById("restartBtn");
let confettiEl = document.getElementById("confetti");
let restartBound = false;
const introEl = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const gameEl = document.querySelector(".game");

function ensureFinalOverlay() {
  let existing = document.getElementById("final");
  if (!existing) {
    const wrapper = document.createElement("div");
    wrapper.id = "final";
    wrapper.className = "final hidden";
    wrapper.innerHTML = `
      <div class="final-card">
        <h2>¡Felicitaciones!</h2>
        <p>Has completado ElectroWord. ¡Excelente trabajo, estudiantes!</p>
        <div class="final-actions">
          <button id="restartBtn">Volver a jugar</button>
        </div>
        <div class="confetti" id="confetti"></div>
      </div>`;
    document.body.appendChild(wrapper);
    existing = wrapper;
  }
  finalEl = existing;
  restartBtn = document.getElementById("restartBtn");
  confettiEl = document.getElementById("confetti");
  if (restartBtn && !restartBound) {
    restartBtn.addEventListener("click", () => {
      finalEl.classList.add("hidden");
      idx = 0;
      attempts = 5;
      finished = false;
      render();
    });
    restartBound = true;
  }
}

let idx = 0;
let attempts = 5;
let currentWord = "";
let currentLevel = 1;
let slots = [];
let tiles = [];
let finished = false;

function normalize(s) { return s; }

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDistractors(word, count) {
  const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑ".split("");
  const set = new Set([...word]);
  const pool = base.filter(c => !set.has(c));
  shuffle(pool);
  return pool.slice(0, count);
}

function buildLetters(word, level) {
  const letters = [...word];
  let distractors = [];
  if (level >= 3) distractors = makeDistractors(word, Math.random() < 0.5 ? 1 : 2);
  const all = shuffle([...letters, ...distractors]);
  return all;
}

function render() {
  const item = levels[idx];
  currentWord = normalize(item.word);
  currentLevel = item.level;
  hintEl.textContent = item.hint;
  levelEl.textContent = `Nivel ${item.level}`;
  attemptsEl.textContent = `Intentos: ${attempts}`;
  messageEl.textContent = "";
  messageEl.className = "message";
  explanationEl.textContent = "";
  nextBtn.classList.add("hidden");

  slots = new Array(currentWord.length).fill(null);
  slotsEl.innerHTML = "";
  for (let i = 0; i < currentWord.length; i++) {
    const d = document.createElement("div");
    d.className = "slot";
    d.dataset.index = String(i);
    d.addEventListener("click", () => onSlotClick(i));
    slotsEl.appendChild(d);
  }

  tiles = buildLetters(currentWord, currentLevel).map((ch, i) => ({ id: `t${i}-${ch}`, ch, used: false }));
  lettersEl.innerHTML = "";
  tiles.forEach(t => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tile";
    b.textContent = t.ch;
    b.dataset.id = t.id;
    b.addEventListener("click", () => onTileClick(t.id));
    lettersEl.appendChild(b);
  });

  clearBtn.disabled = false;
  checkBtn.disabled = false;
}

function firstEmptySlot() {
  for (let i = 0; i < slots.length; i++) if (!slots[i]) return i;
  return -1;
}

function onTileClick(tileId) {
  const tile = tiles.find(x => x.id === tileId);
  if (!tile || tile.used) return;
  const pos = firstEmptySlot();
  if (pos === -1) return;
  slots[pos] = tile.ch;
  tile.used = true;
  const btn = lettersEl.querySelector(`[data-id="${tile.id}"]`);
  if (btn) btn.classList.add("used");
  updateSlotsUI();
  evaluateColors();
}

function onSlotClick(i) {
  if (!slots[i]) return;
  const ch = slots[i];
  slots[i] = null;
  const tile = tiles.find(x => x.ch === ch && x.used);
  if (tile) {
    tile.used = false;
    const btn = lettersEl.querySelector(`[data-id="${tile.id}"]`);
    if (btn) btn.classList.remove("used");
  }
  updateSlotsUI();
  evaluateColors();
}

function updateSlotsUI() {
  const children = [...slotsEl.children];
  children.forEach((d, i) => {
    d.textContent = slots[i] || "";
    d.classList.toggle("filled", !!slots[i]);
    d.classList.remove("correct", "present", "absent");
  });
}

function evaluateColors() {
  const target = [...currentWord];
  const guess = [...slots];
  const states = new Array(target.length).fill("absent");
  const used = new Array(target.length).fill(false);

  for (let i = 0; i < target.length; i++) {
    if (guess[i] && guess[i] === target[i]) {
      states[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < target.length; i++) {
    if (!guess[i] || states[i] === "correct") continue;
    for (let j = 0; j < target.length; j++) {
      if (!used[j] && guess[i] === target[j]) {
        states[i] = "present";
        used[j] = true;
        break;
      }
    }
  }

  const children = [...slotsEl.children];
  children.forEach((d, i) => {
    d.classList.remove("correct", "present", "absent");
    if (!guess[i]) return;
    d.classList.add(states[i]);
  });
}

function isComplete() { return slots.every(ch => !!ch); }
function asWord(a) { return a.join(""); }

function check() {
  if (!isComplete()) return failShake();
  const guess = asWord(slots);
  if (guess === currentWord) return success();
  attempts--;
  attemptsEl.textContent = `Intentos: ${attempts}`;
  if (attempts <= 0) return revealFail();
  failShake();
}

function success() {
  checkBtn.disabled = true;
  clearBtn.disabled = true;
  messageEl.textContent = `¡Correcto! La palabra es ${currentWord}`;
  messageEl.className = "message success";
  explanationEl.textContent = getExplanation();
  nextBtn.classList.remove("hidden");
}

function failShake() {
  slotsEl.classList.remove("shake");
  void slotsEl.offsetWidth;
  slotsEl.classList.add("shake");
  messageEl.textContent = "Intenta de nuevo";
  messageEl.className = "message fail";
}

function revealFail() {
  slots = [...currentWord];
  updateSlotsUI();
  evaluateColors();
  checkBtn.disabled = true;
  clearBtn.disabled = true;
  messageEl.textContent = `Sin intentos. La palabra era ${currentWord}`;
  messageEl.className = "message fail";
  explanationEl.textContent = getExplanation();
  nextBtn.classList.remove("hidden");
}

function getExplanation() { return levels[idx].explanation; }

function clearAll() {
  slots = new Array(currentWord.length).fill(null);
  tiles.forEach(t => {
    t.used = false;
    const btn = lettersEl.querySelector(`[data-id="${t.id}"]`);
    if (btn) btn.classList.remove("used");
  });
  updateSlotsUI();
  evaluateColors();
}

function next() {
  idx++;
  if (idx >= levels.length) return endGame();
  attempts = 5;
  render();
}

function endGame() {
  finished = true;
  hintEl.textContent = "";
  slotsEl.innerHTML = "";
  lettersEl.innerHTML = "";
  levelEl.textContent = "";
  attemptsEl.textContent = "";
  messageEl.textContent = "";
  explanationEl.textContent = "";
  clearBtn.disabled = true;
  checkBtn.disabled = true;
  nextBtn.classList.add("hidden");
  ensureFinalOverlay();
  showFinal();
}

function showFinal() {
  ensureFinalOverlay();
  if (finalEl) finalEl.classList.remove("hidden");
  spawnConfetti();
}

function spawnConfetti() {
  ensureFinalOverlay();
  if (!confettiEl) return;
  confettiEl.innerHTML = "";
  const colors = ["#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];
  const count = 80;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    const left = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const size = 8 + Math.random() * 8;
    s.style.left = left + "%";
    s.style.background = colors[Math.floor(Math.random() * colors.length)];
    s.style.animationDelay = delay + "s";
    s.style.width = size + "px";
    s.style.height = size * 1.6 + "px";
    confettiEl.appendChild(s);
  }
}

clearBtn.addEventListener("click", clearAll);
checkBtn.addEventListener("click", check);
nextBtn.addEventListener("click", next);
ensureFinalOverlay();

function showIntro() {
  if (introEl) introEl.classList.remove("hidden");
  if (gameEl) gameEl.classList.add("hidden");
  if (startBtn) {
    startBtn.onclick = startGame;
  }
}

function startGame() {
  if (introEl) introEl.classList.add("hidden");
  if (gameEl) gameEl.classList.remove("hidden");
  idx = 0;
  attempts = 5;
  finished = false;
  render();
}

if (introEl && startBtn && gameEl) {
  showIntro();
} else {
  render();
}

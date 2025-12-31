const editor = document.getElementById("editor");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const darkToggle = document.getElementById("darkToggle");

const copyBtn = document.getElementById("copyBtn");
const boldBtn = document.getElementById("boldBtn");
const italicBtn = document.getElementById("italicBtn");
const underlineBtn = document.getElementById("underlineBtn");
const resetFormatBtn = document.getElementById("resetFormatBtn");
const upperBtn = document.getElementById("upperBtn");
const lowerBtn = document.getElementById("lowerBtn");
const capWordsBtn = document.getElementById("capWordsBtn");
const capSentenceBtn = document.getElementById("capSentenceBtn");
const saveDocBtn = document.getElementById("saveDocBtn");
const pdfBtn = document.getElementById("pdfBtn");

const fontUpBtn = document.getElementById("fontUp");
const fontDownBtn = document.getElementById("fontDown");
const fontSizeLabel = document.getElementById("fontSizeLabel");

const STORAGE_KEY = "duvofs_text_makeover";
const DARK_KEY = "duvofs_dark_mode";
const FONT_SIZE_KEY = "duvofs_font_size";

const MIN_FONT = 10;
const MAX_FONT = 24;

/* =========================
   LOAD SAVED CONTENT FIRST
========================= */
editor.innerHTML = localStorage.getItem(STORAGE_KEY) || "";

/* =========================
   FONT SIZE CONTROLS
========================= */
let fontSize =
  parseInt(localStorage.getItem(FONT_SIZE_KEY), 10) ||
  parseInt(window.getComputedStyle(editor).fontSize, 10);

fontSize = Math.min(Math.max(fontSize, MIN_FONT), MAX_FONT);
applyFontSize();

fontUpBtn.onclick = () => {
  if (fontSize < MAX_FONT) {
    fontSize++;
    applyFontSize();
  }
};

fontDownBtn.onclick = () => {
  if (fontSize > MIN_FONT) {
    fontSize--;
    applyFontSize();
  }
};

function applyFontSize() {
  editor.style.fontSize = fontSize + "px";
  fontSizeLabel.textContent = fontSize + "px";
  localStorage.setItem(FONT_SIZE_KEY, fontSize);
}

/* =========================
   COUNT + AUTOSAVE
========================= */
function updateCounts() {
  const text = editor.innerText;
  charCount.textContent = text.length;
  wordCount.textContent = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;
  localStorage.setItem(STORAGE_KEY, editor.innerHTML);
}

editor.addEventListener("input", updateCounts);
updateCounts();

/* =========================
   COPY TEXT
========================= */
copyBtn.onclick = () => {
  navigator.clipboard.writeText(editor.innerText);
};

/* =========================
   FORMAT (SELECTION OR ALL)
========================= */
function applyFormat(command) {
  const selection = window.getSelection();

  if (selection && selection.toString()) {
    document.execCommand(command);
  } else {
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand(command);
    selection.removeAllRanges();
  }

  editor.focus();
}

boldBtn.onclick = () => applyFormat("bold");
italicBtn.onclick = () => applyFormat("italic");
underlineBtn.onclick = () => applyFormat("underline");

/* =========================
   RESET FORMAT
========================= */
resetFormatBtn.onclick = () => {
  const selection = window.getSelection();
  if (selection && selection.toString()) {
    document.execCommand("removeFormat");
  } else {
    editor.innerText = editor.innerText;
  }
  updateCounts();
};

/* =========================
   TEXT TRANSFORM
========================= */
function transformText(fn) {
  const selection = window.getSelection();
  if (selection && selection.toString()) {
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.textContent = fn(selection.toString());
    range.deleteContents();
    range.insertNode(span);
  } else {
    editor.innerText = fn(editor.innerText);
  }
  updateCounts();
}

upperBtn.onclick = () => transformText(t => t.toUpperCase());
lowerBtn.onclick = () => transformText(t => t.toLowerCase());
capWordsBtn.onclick = () =>
  transformText(t => t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));
capSentenceBtn.onclick = () =>
  transformText(t =>
    t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
  );

/* =========================
   EXPORTS
========================= */
saveDocBtn.onclick = () => {
  const html = `<html><body>${editor.innerHTML}</body></html>`;
  const blob = window.htmlDocx.asBlob(html);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `duvofs-notepad-${Date.now()}.docx`;
  a.click();
};

pdfBtn.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(doc.splitTextToSize(editor.innerText || " ", 180), 10, 10);
  doc.save(`duvofs-notepad-${Date.now()}.pdf`);
};

/* =========================
   DARK MODE
========================= */
if (localStorage.getItem(DARK_KEY) === "on") {
  document.documentElement.classList.add("dark");
  darkToggle.textContent = "☀️";
}

darkToggle.onclick = () => {
  document.documentElement.classList.toggle("dark");
  const on = document.documentElement.classList.contains("dark");
  localStorage.setItem(DARK_KEY, on ? "on" : "off");
  darkToggle.textContent = on ? "☀️" : "🌙";
};

/* =========================
   SHORTCUTS
========================= */
document.addEventListener("keydown", e => {
  if (!e.ctrlKey) return;
  if (e.key === "b") { e.preventDefault(); applyFormat("bold"); }
  if (e.key === "i") { e.preventDefault(); applyFormat("italic"); }
  if (e.key === "u") { e.preventDefault(); applyFormat("underline"); }
});

/* =========================
   SERVICE WORKER
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

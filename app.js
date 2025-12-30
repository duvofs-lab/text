const editor = document.getElementById("editor");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const darkToggle = document.getElementById("darkToggle");

const STORAGE_KEY = "duvofs_text_makeover";
const DARK_KEY = "duvofs_dark_mode";

/* =========================
   LOAD SAVED CONTENT
========================= */
editor.innerHTML = localStorage.getItem(STORAGE_KEY) || "";

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

  if (selection && selection.toString().length > 0) {
    document.execCommand(command);
    editor.focus();
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(editor);
  selection.removeAllRanges();
  selection.addRange(range);

  document.execCommand(command);

  selection.removeAllRanges();
  editor.focus();
}

boldBtn.onclick = () => applyFormat("bold");
italicBtn.onclick = () => applyFormat("italic");
underlineBtn.onclick = () => applyFormat("underline");

/* =========================
   RESET FORMATTING
========================= */
resetFormatBtn.onclick = () => {
  const selection = window.getSelection();

  if (selection && selection.toString().length > 0) {
    document.execCommand("removeFormat");
  } else {
    editor.innerText = editor.innerText;
  }

  updateCounts();
  editor.focus();
};

/* =========================
   TEXT TRANSFORM (FIXED)
========================= */
function transformText(fn) {
  const selection = window.getSelection();

  if (selection && selection.toString().length > 0) {
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

/* UPPER / LOWER */
upperBtn.onclick = () =>
  transformText(t => t.toUpperCase());

lowerBtn.onclick = () =>
  transformText(t => t.toLowerCase());

/* CAPITALIZE WORDS (ALWAYS WORKS) */
capWordsBtn.onclick = () =>
  transformText(t =>
    t
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
  );

/* CAPITALIZE SENTENCES (ALWAYS WORKS) */
capSentenceBtn.onclick = () =>
  transformText(t => {
    t = t.toLowerCase();
    return t.replace(
      /(^\s*\w|[.!?]\s*\w)/g,
      c => c.toUpperCase()
    );
  });

/* =========================
   DOCX EXPORT (TRUE DOCX)
========================= */
saveDocBtn.onclick = () => {
  const html = `<html><body>${editor.innerHTML}</body></html>`;
  const blob = window.htmlDocx.asBlob(html);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `duvofs-notepad-${Date.now()}.docx`;
  a.click();
};

/* =========================
   PDF EXPORT
========================= */
pdfBtn.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = editor.innerText || " ";
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 10);
  doc.save(`duvofs-notepad-${Date.now()}.pdf`);
};

/* =========================
   DARK MODE (PERSISTENT)
========================= */
if (localStorage.getItem(DARK_KEY) === "on") {
  document.documentElement.classList.add("dark");
  darkToggle.textContent = "☀️";
}

darkToggle.onclick = () => {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem(DARK_KEY, isDark ? "on" : "off");
  darkToggle.textContent = isDark ? "☀️" : "🌙";
};

/* =========================
   KEYBOARD SHORTCUTS
========================= */
document.addEventListener("keydown", e => {
  if (!e.ctrlKey) return;

  switch (e.key.toLowerCase()) {
    case "b":
      e.preventDefault();
      applyFormat("bold");
      break;
    case "i":
      e.preventDefault();
      applyFormat("italic");
      break;
    case "u":
      e.preventDefault();
      applyFormat("underline");
      break;
  }
});

/* =========================
   SERVICE WORKER
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

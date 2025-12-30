const editor = document.getElementById("editor");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");

const STORAGE_KEY = "duvofs_text_makeover";

/* LOAD */
editor.innerHTML = localStorage.getItem(STORAGE_KEY) || "";

/* COUNT + SAVE */
function updateCounts() {
  const text = editor.innerText;
  charCount.textContent = text.length;
  wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
  localStorage.setItem(STORAGE_KEY, editor.innerHTML);
}

editor.addEventListener("input", updateCounts);
updateCounts();

/* COPY */
document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(editor.innerText);
};

/* FORMAT HELPERS */
function applyCommand(cmd) {
  document.execCommand(cmd, false, null);
  editor.focus();
}

/* STYLE TOGGLES */
document.getElementById("boldBtn").onclick = () => applyCommand("bold");
document.getElementById("italicBtn").onclick = () => applyCommand("italic");
document.getElementById("underlineBtn").onclick = () => applyCommand("underline");

document.getElementById("resetFormatBtn").onclick = () => {
  editor.innerText = editor.innerText;
  updateCounts();
};

/* TEXT TRANSFORM */
function transformText(fn) {
  const sel = window.getSelection();
  if (sel.toString()) {
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.textContent = fn(sel.toString());
    range.deleteContents();
    range.insertNode(span);
  } else {
    editor.innerText = fn(editor.innerText);
  }
  updateCounts();
}

document.getElementById("upperBtn").onclick = () =>
  transformText(t => t.toUpperCase());

document.getElementById("lowerBtn").onclick = () =>
  transformText(t => t.toLowerCase());

document.getElementById("capWordsBtn").onclick = () =>
  transformText(t =>
    t.replace(/\b\w/g, c => c.toUpperCase())
  );

document.getElementById("capSentenceBtn").onclick = () =>
  transformText(t =>
    t.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
  );

/* SAVE AS DOCX */
document.getElementById("saveDocBtn").onclick = () => {
  const html = `
  <html><body>${editor.innerHTML}</body></html>`;
  const blob = new Blob([html], {
    type: "application/msword"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `duvofs-notepad-${Date.now()}.doc`;
  link.click();
};

/* PDF */
document.getElementById("pdfBtn").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = editor.innerText || " ";
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 10);
  doc.save(`duvofs-notepad-${Date.now()}.pdf`);
};

/* SERVICE WORKER */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}


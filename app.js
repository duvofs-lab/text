const editor = document.getElementById("editor");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const darkToggle = document.getElementById("darkToggle");

const STORAGE_KEY = "duvofs_text_makeover";
const DARK_KEY = "duvofs_dark_mode";

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
document.getElementById("copyBtn").onclick = () =>
  navigator.clipboard.writeText(editor.innerText);

/* FORMAT */
function applyFormat(command) {
  const selection = window.getSelection();

  // If text is selected → normal behavior
  if (selection && selection.toString().length > 0) {
    document.execCommand(command);
    editor.focus();
    return;
  }

  // If no selection → apply to ALL content
  const range = document.createRange();
  range.selectNodeContents(editor);

  selection.removeAllRanges();
  selection.addRange(range);

  document.execCommand(command);

  // Clear selection and place cursor at end
  selection.removeAllRanges();
  editor.focus();
}

};

/* TRANSFORM */
function transform(fn) {
  const sel = window.getSelection();
  if (sel.toString()) {
    const r = sel.getRangeAt(0);
    const s = document.createElement("span");
    s.textContent = fn(sel.toString());
    r.deleteContents(); r.insertNode(s);
  } else editor.innerText = fn(editor.innerText);
  updateCounts();
}
upperBtn.onclick = () => transform(t => t.toUpperCase());
lowerBtn.onclick = () => transform(t => t.toLowerCase());
capWordsBtn.onclick = () => transform(t => t.replace(/\b\w/g, c => c.toUpperCase()));
capSentenceBtn.onclick = () => transform(t => t.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()));

/* DOCX */
saveDocBtn.onclick = () => {
  const html = `<html><body>${editor.innerHTML}</body></html>`;
  const blob = window.htmlDocx.asBlob(html);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `duvofs-notepad-${Date.now()}.docx`;
  a.click();
};

/* PDF */
pdfBtn.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(doc.splitTextToSize(editor.innerText || " ", 180), 10, 10);
  doc.save(`duvofs-notepad-${Date.now()}.pdf`);
};

/* DARK MODE */
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

/* SHORTCUTS */
document.addEventListener("keydown", e => {
  if (!e.ctrlKey) return;
boldBtn.onclick = () => applyFormat("bold");
italicBtn.onclick = () => applyFormat("italic");
underlineBtn.onclick = () => applyFormat("underline");
});

/* SERVICE WORKER */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");

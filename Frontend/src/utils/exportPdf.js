import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// jsPDF's built-in fonts only support WinAnsi/Latin-1 glyphs. Locale-aware
// number formatting (e.g. toLocaleString) can insert Unicode spaces (narrow
// no-break space, thin space, etc.) as thousands separators that these fonts
// can't render - autoTable then mis-measures the text and wraps it one
// character at a time. Swap any of those for a plain space before rendering.
const EXOTIC_WHITESPACE = new RegExp(
  "[\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000]",
  "g"
);

function sanitizeForPdf(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(EXOTIC_WHITESPACE, " ");
}

export function exportTableToPDF({ title, columns, rows, filename }) {
  const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait" });

  const safeColumns = columns.map(sanitizeForPdf);
  const safeRows = rows.map(row => row.map(sanitizeForPdf));

  doc.setFontSize(14);
  doc.text(sanitizeForPdf(title), 14, 15);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("fr-FR"), 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [safeColumns],
    body: safeRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [34, 53, 31] },
  });

  doc.save(`${filename || "export"}.pdf`);
}

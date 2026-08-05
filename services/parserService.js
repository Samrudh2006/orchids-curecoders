import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import mammoth from "mammoth";
import ExcelJS from "exceljs";

// NOTE: `pdf-parse` is intentionally NOT imported at module load time.
// It has top-level side effects: when loaded in Node.js it calls
// require("@napi-rs/canvas") (a native module unavailable on Vercel's
// serverless environment) and polyfills globalThis.DOMMatrix / ImageData /
// Path2D. Because api/index.js -> server.js -> routes/upload.js ->
// parserService.js, an eager import would crash EVERY serverless function
// at startup, even routes that never touch PDFs. By lazy-loading inside the
// PDF branch, pdf-parse only runs when a PDF is actually parsed.

export const parseDocument = async (filePath, mimeType, filename) => {
  let extractedText = "";

  try {
    if (mimeType === "application/pdf" || filename.endsWith(".pdf")) {
      // Lazy-load pdf-parse only when a PDF is being parsed.
      // Wrapped in try/catch so a missing native dependency on the
      // serverless runtime degrades gracefully instead of crashing.
      const dataBuffer = fs.readFileSync(filePath);
      let data = null;
      try {
        const pdfParse = require("pdf-parse");
        data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } catch (pdfError) {
        console.warn(
          "pdf-parse unavailable, falling back to pure-JS PDF text extraction:",
          pdfError.message,
        );
        extractedText = extractPdfTextFallback(dataBuffer);
      }
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      filename.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      filename.endsWith(".xlsx") ||
      filename.endsWith(".csv")
    ) {
      const workbook = new ExcelJS.Workbook();
      if (filename.endsWith(".csv")) {
        await workbook.csv.readFile(filePath);
      } else {
        await workbook.xlsx.readFile(filePath);
      }

      workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row) => {
          extractedText += row.values.slice(1).join(" ") + "\n";
        });
      });
    } else if (mimeType === "text/plain" || filename.endsWith(".txt")) {
      extractedText = fs.readFileSync(filePath, "utf-8");
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      filename.endsWith(".pptx")
    ) {
      // For MVP PPTX, we could just say "Parsing not fully implemented, please convert to PDF"
      // since pptx-parser wasn't installed properly or there isn't a robust one like mammoth
      extractedText = `[PPTX Parsing limited. Filename: ${filename}]`;
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Clean up extracted text
    return extractedText.replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error("Error parsing document:", error);
    throw error;
  }
};

/**
 * Pure-JavaScript PDF text extraction fallback.
 *
 * Used when `pdf-parse` cannot be loaded (e.g. its dependency
 * `@napi-rs/canvas` is not available on the serverless runtime).
 * This does NOT render the PDF — it only extracts text from the PDF's
 * content streams by decoding the relevant operators (Tj, TJ, ' and ").
 * It preserves the existing PDF parsing feature so uploads still succeed
 * even when the native dependency is absent.
 */
function extractPdfTextFallback(dataBuffer) {
  const raw =
    dataBuffer instanceof Uint8Array
      ? Buffer.from(dataBuffer).toString("binary")
      : dataBuffer.toString("binary");

  // Gather all stream objects (they hold the page content).
  const streams = [];
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamRe.exec(raw)) !== null) {
    streams.push(match[1]);
  }

  const textPieces = [];
  for (const stream of streams) {
    // Decode FlateDecode (zlib) streams if present.
    let content = stream;
    try {
      const zlib = require("zlib");
      const decoded = zlib.inflateSync(Buffer.from(stream, "binary"));
      content = decoded.toString("binary");
    } catch (e) {
      content = stream; // leave as-is if not flate-encoded
    }

    // Extract text from PDF text-showing operators.
    // Tj: (string) Tj
    // TJ: [ (a) 3 (b) ] TJ
    // '  : (string) '
    // "  : (string) ... "
    content = content.replace(/\\\(/g, "(").replace(/\\\)/g, ")");
    const pieces = [];
    const tjRe =
      /\(([^)]*)\)\s*Tj|\[((?:\([^)]*\)\s*[-+]?[\d.]+)*)\]\s*TJ|\(([^)]*)\)\s*['"]/g;
    let m;
    while ((m = tjRe.exec(content)) !== null) {
      if (m[1] !== undefined) {
        pieces.push(decodePdfString(m[1]));
      } else if (m[3] !== undefined) {
        pieces.push(decodePdfString(m[3]));
      } else if (m[2] !== undefined) {
        // TJ array: extract all parenthesized strings.
        const strRe = /\(([^)]*)\)/g;
        let sm;
        while ((sm = strRe.exec(m[2])) !== null) {
          pieces.push(decodePdfString(sm[1]));
        }
      }
    }
    if (pieces.length > 0) {
      textPieces.push(pieces.join(" "));
    }
  }

  let text = textPieces.join("\n");
  // Clean up common PDF escape sequences and control characters.
  text = text
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/[^\x20-\x7E\n\r\t]/g, "");
  return text;
}

/**
 * Decode a PDF literal string, handling octal escape sequences
 * that PDFs use for non-ASCII characters.
 */
function decodePdfString(str) {
  return str.replace(/\\(\d{1,3})/g, (full, octal) => {
    const code = parseInt(octal, 8);
    return String.fromCharCode(code);
  });
}

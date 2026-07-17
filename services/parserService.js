import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';

export const parseDocument = async (filePath, mimeType, filename) => {
    let extractedText = '';

    try {
        if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filename.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            filename.endsWith('.xlsx') || 
            filename.endsWith('.csv')
        ) {
            const workbook = new ExcelJS.Workbook();
            if (filename.endsWith('.csv')) {
                await workbook.csv.readFile(filePath);
            } else {
                await workbook.xlsx.readFile(filePath);
            }
            
            workbook.eachSheet((worksheet) => {
                worksheet.eachRow((row) => {
                    extractedText += row.values.slice(1).join(' ') + '\n';
                });
            });
        } else if (mimeType === 'text/plain' || filename.endsWith('.txt')) {
            extractedText = fs.readFileSync(filePath, 'utf-8');
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || filename.endsWith('.pptx')) {
            // For MVP PPTX, we could just say "Parsing not fully implemented, please convert to PDF" 
            // since pptx-parser wasn't installed properly or there isn't a robust one like mammoth
            extractedText = `[PPTX Parsing limited. Filename: ${filename}]`;
        } else {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }

        // Clean up extracted text
        return extractedText.replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error("Error parsing document:", error);
        throw error;
    }
};

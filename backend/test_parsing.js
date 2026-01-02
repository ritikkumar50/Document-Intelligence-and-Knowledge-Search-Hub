const pdfLib = require('pdf-parse');
const pdf = pdfLib.default || pdfLib;
const fs = require('fs');

async function test() {
    console.log("Imported pdf-parse:", pdf);
    console.log("Type of pdf-parse:", typeof pdf);

    // Minimal valid PDF binary structure
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 21 >>
stream
BT /F1 12 Tf 10 700 Td (Hello World) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000137 00000 n 
0000000219 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
289
%%EOF`;

    const buffer = Buffer.from(pdfContent);

    try {
        const data = await pdf(buffer);
        console.log("Success! Extracted text:", data.text.trim());
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();

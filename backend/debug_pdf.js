const pdfLib = require('pdf-parse');
console.log('Keys:', Object.keys(pdfLib));
console.log('Type:', typeof pdfLib);
if (pdfLib.default) {
    console.log('Default type:', typeof pdfLib.default);
}

try {
    console.log('Trying to call it directly...');
    pdfLib(Buffer.from('test'));
} catch (e) {
    console.log('Direct call failed:', e.message);
}

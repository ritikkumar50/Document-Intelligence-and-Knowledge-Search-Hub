const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const { extractText, chunkText } = require('../utils/textExtractor');

const uploadDocument = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        // 1. Create Document Entry
        const doc = await Document.create({
            userId: req.user._id,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            status: 'PROCESSING'
        });

        // 2. Process Text (In a real app, use a queue. Here, await it.)
        const text = await extractText(req.file.buffer, req.file.mimetype);

        // 3. Chunk Text
        const textChunks = chunkText(text);

        // 4. Save Chunks
        const chunkDocs = textChunks.map((chunk, index) => ({
            documentId: doc._id,
            text: chunk,
            index
        }));
        await Chunk.insertMany(chunkDocs);

        // 5. Update Status
        doc.status = 'READY';
        await doc.save();

        res.status(201).json(doc);

    } catch (error) {
        console.error(error);
        const fs = require('fs');
        fs.writeFileSync('error_log.txt', JSON.stringify({ message: error.message, stack: error.stack }, null, 2));
        res.status(500).json({ message: 'File processing failed', error: error.message });
    }
};

const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ userId: req.user._id }).sort({ uploadDate: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadDocument, getDocuments };

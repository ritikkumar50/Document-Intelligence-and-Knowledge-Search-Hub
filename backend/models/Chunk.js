const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    text: { type: String, required: true },
    index: { type: Number, required: true }
});

// Create a text index for search
chunkSchema.index({ text: 'text' });

module.exports = mongoose.model('Chunk', chunkSchema);

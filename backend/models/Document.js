const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    status: { type: String, enum: ['UPLOADING', 'PROCESSING', 'READY', 'ERROR'], default: 'UPLOADING' },
    uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);

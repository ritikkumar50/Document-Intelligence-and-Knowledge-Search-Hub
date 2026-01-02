const ChatHistory = require('../models/ChatHistory');
const Chunk = require('../models/Chunk');
const Document = require('../models/Document');
const { generateAnswer } = require('../utils/aiClient');

const chatWithDocs = async (req, res) => {
    const { question } = req.body;

    if (!question) return res.status(400).json({ message: 'Question required' });

    try {
        const userDocs = await Document.find({ userId: req.user._id }).select('_id');
        const userDocIds = userDocs.map(d => d._id);

        if (userDocIds.length === 0) {
            return res.json({ answer: "You haven't uploaded any documents yet.", references: [] });
        }

        const results = await Chunk.find({
            documentId: { $in: userDocIds },
            $text: { $search: question }
        }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .limit(5)
            .populate('documentId', 'originalName');

        const context = results.map(r => r.text).join('\n\n');

        // If no context found found via keywords, we might get empty context. 
        // AI will handle it via prompt instructions ("answer not in context").

        const answer = await generateAnswer(question, context);

        const references = results.map(r => ({
            docName: r.documentId.originalName,
            excerpt: r.text.substring(0, 100) + '...',
            score: r.score
        }));

        await ChatHistory.create({
            userId: req.user._id,
            role: 'user',
            content: question
        });

        await ChatHistory.create({
            userId: req.user._id,
            role: 'assistant',
            content: answer,
            references: references
        });

        res.json({ answer, references });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Chat failed' });
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await ChatHistory.find({ userId: req.user._id }).sort({ timestamp: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { chatWithDocs, getHistory };

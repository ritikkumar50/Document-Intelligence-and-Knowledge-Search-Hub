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

        // Support for Frontend AI (Puter.js)
        if (req.body.mode === 'context_only') {
            const references = results.map(r => ({
                docName: r.documentId.originalName,
                excerpt: r.text.substring(0, 100) + '...',
                score: r.score
            }));

            // Return context so frontend can call AI
            return res.json({
                context,
                references,
                systemPrompt: `Role: You are a helpful AI assistant.
Constraint: Answer the question strictly using ONLY the provided Context below. If the answer is not in the context, state "I cannot find this information in the uploaded documents." Do not use outside knowledge.

Context:
${context}

Question: ${question}`
            });
        }

        // If no context found found via keywords, we might get empty context. 
        // AI will handle it via prompt instructions ("answer not in context").

        const answer = await generateAnswer(question, context);

        let finalAnswer = answer;
        if (finalAnswer === 'BACKEND_NO_KEY') {
            finalAnswer = "Backend AI key missing. Please use the frontend flow (Puter.js) or set PUTER_API_KEY in backend.";
        }

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
            content: finalAnswer,
            references: references
        });

        res.json({ answer: finalAnswer, references });

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

import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const ChatInterface = () => {
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/chat/history');
            setHistory(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const question = input;
        setInput('');
        setLoading(true);

        // Optimistic UI update
        setHistory(prev => [...prev, { role: 'user', content: question, timestamp: new Date() }]);

        try {
            // 1. Get Context from Backend
            const { data } = await api.post('/chat', {
                question,
                mode: 'context_only' // Tell backend to return context, not answer
            });

            let answer = '';

            // 2. Generate Answer (Frontend Puter or Backend Fallback)
            if (window.puter) {
                try {
                    // Use Frontend Puter (Free, no API key needed if logged in)
                    const puterResp = await window.puter.ai.chat(data.systemPrompt);
                    answer = typeof puterResp === 'object' ? puterResp.message.content : puterResp;
                } catch (puterErr) {
                    console.error("Frontend Puter Error:", puterErr);
                    answer = "Error using Puter.js in browser. Falling back to backend...";
                    // Fallback to backend generation if frontend fails
                    const fallback = await api.post('/chat', { question });
                    answer = fallback.data.answer;
                }
            } else {
                // Fallback if script not loaded
                const fallback = await api.post('/chat', { question });
                answer = fallback.data.answer;
            }

            setHistory(prev => [...prev, { role: 'assistant', content: answer, references: data.references, timestamp: new Date() }]);

            // Optional: Save history to backend (not implemented in this step to keep it simple, but recommended)

        } catch (err) {
            console.error(err);
            setHistory(prev => [...prev, { role: 'assistant', content: "Error: Could not retrieve answer.", timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
                {history.map((msg, idx) => (
                    <div key={idx} style={{
                        marginBottom: '1.5rem',
                        textAlign: msg.role === 'user' ? 'right' : 'left',
                    }}>
                        <div style={{
                            display: 'inline-block',
                            maxWidth: '80%',
                            padding: '1rem',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: 'white',
                            textAlign: 'left'
                        }}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                            {msg.references && msg.references.length > 0 && (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sources:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {msg.references.map((ref, i) => (
                                            <div key={i} title={ref.excerpt} style={{
                                                fontSize: '0.75rem',
                                                background: 'rgba(0,0,0,0.3)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                cursor: 'help'
                                            }}>
                                                {ref.docName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px'
                        }}>
                            Writing answer...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    className="input"
                    style={{ marginBottom: 0 }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    disabled={loading}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;

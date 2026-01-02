import { useState, useEffect } from 'react';
import api from '../api/axios';

const DocumentList = () => {
    const [docs, setDocs] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchDocs = async () => {
        try {
            const { data } = await api.get('/documents');
            setDocs(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDocs();
        const interval = setInterval(fetchDocs, 5000); // Poll every 5s for status updates
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchDocs();
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'READY': return 'var(--success)';
            case 'ERROR': return 'var(--error)';
            default: return 'var(--primary)'; // Processing
        }
    };

    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Documents</h2>
                <label className="btn btn-primary" style={{ display: 'inline-block', cursor: uploading ? 'wait' : 'pointer' }}>
                    {uploading ? 'Uploading...' : 'Upload Document'}
                    <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} accept=".pdf,.txt,.md" />
                </label>
            </div>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {docs.map(doc => (
                    <div key={doc._id} style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.originalName}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span>{(doc.size / 1024).toFixed(1)} KB</span>
                            <span style={{
                                color: getStatusColor(doc.status),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                border: `1px solid ${getStatusColor(doc.status)}`,
                                padding: '2px 6px',
                                borderRadius: '4px'
                            }}>
                                {doc.status}
                            </span>
                        </div>
                    </div>
                ))}
                {docs.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No documents uploaded yet.</div>}
            </div>
        </div>
    );
};

export default DocumentList;

import Navbar from '../components/Navbar';
import DocumentList from '../components/DocumentList';
import ChatInterface from '../components/ChatInterface';

const Dashboard = () => {
    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <Navbar />
            <div className="container animate-fade-in">
                <div style={{ margin: '2rem 0' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 300 }}>Knowledge Base</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Upload documents and ask questions grounded in your data.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
                    <DocumentList />
                    <ChatInterface />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

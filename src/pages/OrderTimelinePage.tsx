import { useState } from 'react';
import { orderApi } from '../api';
import type { OrderTimelineResponseDTO } from '../api/types';
import '../components/Layout.css';

const OrderTimelinePage: React.FC = () => {
  const [leadId, setLeadId] = useState('');
  const [timeline, setTimeline] = useState<OrderTimelineResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;

    setLoading(true);
    setError(null);
    setTimeline(null);
    try {
      const response = await orderApi.getTimeline(leadId);
      setTimeline(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found or failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="order-timeline-page">
      <header className="page-header">
        <h2>Order Timeline Analysis</h2>
        <p>Track lead stage transitions and identify SLA bottlenecks.</p>
      </header>

      <div className="card" style={{ maxWidth: '600px', marginBottom: '40px' }}>
        <form onSubmit={fetchTimeline} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Enter Lead ID (e.g., 1234567)"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            style={{
              flexGrow: 1,
              padding: '12px',
              border: '1px solid #e1e4e8',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={!leadId || loading}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              padding: '0 24px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Searching...' : 'Analyze'}
          </button>
        </form>
        {error && <p style={{ color: '#e53e3e', marginTop: '12px', fontSize: '0.9rem' }}>{error}</p>}
      </div>

      {timeline && (
        <div className="timeline-container">
          <div style={{ marginBottom: '24px' }}>
            <strong>Pipeline:</strong> {timeline.pipeline} | 
            <strong> Period:</strong> {timeline.period.from} - {timeline.period.to}
          </div>
          
          <div className="timeline">
            {timeline.data.map((step, index) => (
              <div key={index} className="timeline-item" style={{ display: 'flex', marginBottom: '32px', position: 'relative' }}>
                <div className="timeline-dot-container" style={{ width: '40px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <div 
                    className="timeline-dot" 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%', 
                      backgroundColor: step.slaViolated ? '#fc8181' : '#68d391',
                      zIndex: 2,
                      marginTop: '4px'
                    }} 
                  />
                  {index < timeline.data.length - 1 && (
                    <div 
                      className="timeline-line" 
                      style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        width: '2px', 
                        height: '100%', 
                        backgroundColor: '#e2e8f0' 
                      }} 
                    />
                  )}
                </div>
                <div className="timeline-content card" style={{ flexGrow: 1, padding: '16px', marginTop: '-4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#2d3748' }}>{step.stage}</h4>
                    {step.slaViolated && (
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '4px', border: '1px solid #feb2b2', fontWeight: 700 }}>
                        SLA BREACHED ({step.slaThreshold})
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', fontSize: '0.85rem', color: '#4a5568' }}>
                    <div>
                      <div style={{ color: '#a0aec0', marginBottom: '4px' }}>START</div>
                      <div>{formatDate(step.startTime)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#a0aec0', marginBottom: '4px' }}>END</div>
                      <div>{formatDate(step.endTime)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#a0aec0', marginBottom: '4px' }}>DURATION</div>
                      <div>{step.durationDays > 0 ? `${step.durationDays.toFixed(1)} days` : `${step.durationMinutes} mins`}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimelinePage;

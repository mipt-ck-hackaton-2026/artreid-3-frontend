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
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)'
            }}
          />
          <button
            type="submit"
            disabled={!leadId || loading}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-text)',
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
        {error && <p style={{ color: 'var(--status-error-text)', marginTop: '12px', fontSize: '0.9rem' }}>{error}</p>}
      </div>

      {timeline && (
        <div className="timeline-container">
          <div style={{ marginBottom: '24px', color: 'var(--text-main)' }}>
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
                      backgroundColor: step.slaViolated ? 'var(--chart-error)' : 'var(--chart-success)',
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
                        backgroundColor: 'var(--border-color)' 
                      }} 
                    />
                  )}
                </div>
                <div className="timeline-content card" style={{ flexGrow: 1, padding: '16px', marginTop: '-4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{step.stage}</h4>
                    {step.slaViolated && (
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: '4px', border: '1px solid var(--status-error-border)', fontWeight: 700 }}>
                        SLA BREACHED ({step.slaThreshold})
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', fontSize: '0.85rem', color: 'var(--text-link)' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>START</div>
                      <div>{formatDate(step.startTime)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>END</div>
                      <div>{formatDate(step.endTime)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>DURATION</div>
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

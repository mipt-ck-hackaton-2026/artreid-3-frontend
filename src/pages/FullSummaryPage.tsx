import { useEffect, useState } from 'react';
import { slaApi } from '../api';
import type { FullSummaryResponseDTO } from '../api/types';
import { MetricCard, BreachDistributionChart } from '../components/DashboardComponents';

const FullSummaryPage: React.FC = () => {
  const [data, setData] = useState<FullSummaryResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await slaApi.getFullSummary();
        setData(response.data);
      } catch (err) {
        setError('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-header"><h2>Full Summary</h2><p>Loading analytics...</p></div>;
  if (error) return <div className="page-header"><h2>Full Summary</h2><p style={{ color: 'var(--status-error-text)' }}>{error}</p></div>;
  if (!data) return null;

  return (
    <div className="full-summary-page">
      <header className="page-header">
        <h2>Overall SLA Performance</h2>
        <p>Analyzing period from {data.period.from} to {data.period.to} for pipeline "{data.pipeline}"</p>
      </header>

      <div className="metrics-grid">
        <MetricCard title="FULL CYCLE SLA" metrics={data.metrics.full_total} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <BreachDistributionChart metrics={data.metrics.full_total} />
      </div>
    </div>
  );
};

export default FullSummaryPage;

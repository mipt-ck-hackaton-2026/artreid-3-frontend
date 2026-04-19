import { useEffect, useState } from 'react';
import { slaApi } from '../api';
import type { FullSummaryResponseDTO } from '../api/types';
import { MetricCard, BreachDistributionChart } from '../components/DashboardComponents';

const FullSummaryPage: React.FC = () => {
  const [data, setData] = useState<FullSummaryResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await slaApi.getFullSummary(filters.dateFrom || undefined, filters.dateTo || undefined);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load summary data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (loading && !data) return <div className="page-header"><h2>Full Summary</h2><p>Loading analytics...</p></div>;

  return (
    <div className="full-summary-page">
      <header className="page-header">
        <h2>Overall SLA Performance</h2>
      </header>

      <form className="filter-bar" onSubmit={handleApplyFilters}>
        <div className="filter-group">
          <label>Date From</label>
          <input 
            type="date" 
            value={filters.dateFrom} 
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} 
          />
        </div>
        <div className="filter-group">
          <label>Date To</label>
          <input 
            type="date" 
            value={filters.dateTo} 
            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} 
          />
        </div>
        <button type="submit" className="btn-apply" disabled={loading}>
          {loading ? 'Loading...' : 'Apply'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--status-error-text)', marginBottom: '20px' }}>{error}</p>}

      {data && (
        <>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Analyzing period from {data.period.from} to {data.period.to} for pipeline "{data.pipeline}"
          </p>

          <div className="metrics-grid">
            <MetricCard title="FULL CYCLE SLA" metrics={data.metrics.full_total} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <BreachDistributionChart metrics={data.metrics.full_total} />
          </div>
        </>
      )}
    </div>
  );
};

export default FullSummaryPage;

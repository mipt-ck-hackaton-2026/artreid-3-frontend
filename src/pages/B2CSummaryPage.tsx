import { useEffect, useState, useCallback } from 'react';
import { slaApi } from '../api';
import type { B2CSummaryResponseDTO, ManagerB2CSlaResponseDTO } from '../api/types';
import { MetricCard, ComparisonChart } from '../components/DashboardComponents';

const B2CSummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<B2CSummaryResponseDTO | null>(null);
  const [managers, setManagers] = useState<ManagerB2CSlaResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    managerId: '',
    qualification: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        managerId: filters.managerId || undefined,
        qualification: filters.qualification || undefined
      };
      const [sumRes, mgrRes] = await Promise.all([
        slaApi.getB2CSummary(params),
        slaApi.getB2CByManager(params)
      ]);
      setSummary(sumRes.data);
      setManagers(mgrRes.data);
      setError(null);
    } catch {
      setError('Failed to load B2C metrics');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (loading && !summary) return <div className="page-header"><h2>B2C Metrics</h2><p>Loading analytics...</p></div>;

  const managerData = managers?.data.map(m => ({
    name: m.manager_id,
    value: m.metrics.b2c_total.met_percent
  })) || [];

  return (
    <div className="b2c-summary-page">
      <header className="page-header">
        <h2>B2C Pipeline Performance</h2>
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
        <div className="filter-group">
          <label>Manager ID</label>
          <input 
            type="text" 
            placeholder="e.g. 12345"
            value={filters.managerId} 
            onChange={e => setFilters(f => ({ ...f, managerId: e.target.value }))} 
          />
        </div>
        <div className="filter-group">
          <label>Qualification</label>
          <input 
            type="text" 
            placeholder="e.g. High"
            value={filters.qualification} 
            onChange={e => setFilters(f => ({ ...f, qualification: e.target.value }))} 
          />
        </div>
        <button type="submit" className="btn-apply" disabled={loading}>
          {loading ? 'Loading...' : 'Apply'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--status-error-text)', marginBottom: '20px' }}>{error}</p>}

      {summary && (
        <>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Analyzing period from {summary.period.from} to {summary.period.to}
          </p>

          <div className="metrics-grid">
            <MetricCard title="REACTION (SLA1)" metrics={summary.metrics.sla1_reaction} />
            <MetricCard title="TO ASSEMBLY (SLA2)" metrics={summary.metrics.sla2_to_assembly} />
            <MetricCard title="TO DELIVERY (SLA3)" metrics={summary.metrics.sla3_to_delivery} />
            <MetricCard title="B2C TOTAL" metrics={summary.metrics.b2c_total} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <ComparisonChart title="TOTAL B2C SLA BY MANAGER (%)" data={managerData} />
          </div>
        </>
      )}
    </div>
  );
};

export default B2CSummaryPage;

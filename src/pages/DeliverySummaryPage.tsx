import { useEffect, useState, useCallback } from 'react';
import { slaApi } from '../api';
import type { DeliverySummaryResponseDTO, ManagerDeliverySlaResponseDTO } from '../api/types';
import { MetricCard, ComparisonChart } from '../components/DashboardComponents';

const DeliverySummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<DeliverySummaryResponseDTO | null>(null);
  const [managers, setManagers] = useState<ManagerDeliverySlaResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    managerId: '',
    qualification: '',
    deliveryService: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString() : undefined,
        managerId: filters.managerId || undefined,
        qualification: filters.qualification || undefined,
        deliveryService: filters.deliveryService || undefined
      };
      const [sumRes, mgrRes] = await Promise.all([
        slaApi.getDeliverySummary(params),
        slaApi.getDeliveryByManager(params)
      ]);
      setSummary(sumRes.data);
      setManagers(mgrRes.data);
      setError(null);
    } catch {
      setError('Failed to load delivery metrics');
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

  if (loading && !summary) return <div className="page-header"><h2>Delivery Metrics</h2><p>Loading analytics...</p></div>;

  const managerData = managers?.data.map(m => ({
    name: m.manager_id,
    value: m.metrics.delivery_total.met_percent
  })) || [];

  return (
    <div className="delivery-summary-page">
      <header className="page-header">
        <h2>Delivery Performance</h2>
      </header>

      <form className="filter-bar" onSubmit={handleApplyFilters}>
        <div className="filter-group">
          <label>Date From</label>
          <input 
            type="datetime-local" 
            value={filters.dateFrom} 
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} 
          />
        </div>
        <div className="filter-group">
          <label>Date To</label>
          <input 
            type="datetime-local" 
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
        <div className="filter-group">
          <label>Delivery Service</label>
          <input 
            type="text" 
            placeholder="e.g. SDEK"
            value={filters.deliveryService} 
            onChange={e => setFilters(f => ({ ...f, deliveryService: e.target.value }))} 
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
            <MetricCard title="TO PVZ (SLA4)" metrics={summary.metrics.sla4_to_pvz} />
            <MetricCard title="AT PVZ (SLA5)" metrics={summary.metrics.sla5_at_pvz} />
            <MetricCard title="DELIVERY TOTAL" metrics={summary.metrics.delivery_total} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <ComparisonChart title="TOTAL DELIVERY SLA BY MANAGER (%)" data={managerData} />
          </div>
        </>
      )}
    </div>
  );
};

export default DeliverySummaryPage;

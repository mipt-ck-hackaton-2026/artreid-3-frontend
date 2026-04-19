import { useEffect, useState } from 'react';
import { slaApi, autocompleteApi } from '../api';
import type { DeliverySummaryResponseDTO, ManagerDeliverySlaResponseDTO } from '../api/types';
import { MetricCard, ComparisonChart } from '../components/DashboardComponents';
import AutocompleteInput from '../components/AutocompleteInput';

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
  const [activeFilters, setActiveFilters] = useState(filters);

  useEffect(() => {
    let ignore = false;
    const params = {
      dateFrom: activeFilters.dateFrom ? new Date(activeFilters.dateFrom).toISOString() : undefined,
      dateTo: activeFilters.dateTo ? new Date(activeFilters.dateTo).toISOString() : undefined,
      managerId: activeFilters.managerId || undefined,
      qualification: activeFilters.qualification || undefined,
      deliveryService: activeFilters.deliveryService || undefined
    };

    Promise.all([
      slaApi.getDeliverySummary(params),
      slaApi.getDeliveryByManager(params)
    ]).then(([sumRes, mgrRes]) => {
      if (!ignore) {
        setSummary(sumRes.data);
        setManagers(mgrRes.data);
        setError(null);
        setLoading(false);
      }
    }).catch(() => {
      if (!ignore) {
        setError('Failed to load delivery metrics');
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [activeFilters]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setActiveFilters({ ...filters });
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
        <AutocompleteInput 
          label="Manager ID"
          placeholder="Search manager..."
          value={filters.managerId}
          onChange={val => setFilters(f => ({ ...f, managerId: val }))}
          fetchOptions={(q, signal) => autocompleteApi.getDeliveryManagers(q, 10, signal)}
        />
        <AutocompleteInput 
          label="Qualification"
          placeholder="Search qualification..."
          value={filters.qualification}
          onChange={val => setFilters(f => ({ ...f, qualification: val }))}
          fetchOptions={(q, signal) => autocompleteApi.getQualifications(q, 10, signal)}
        />
        <AutocompleteInput 
          label="Delivery Service"
          placeholder="Search service..."
          value={filters.deliveryService}
          onChange={val => setFilters(f => ({ ...f, deliveryService: val }))}
          fetchOptions={(q, signal) => autocompleteApi.getDeliveryServices(q, 10, signal)}
        />
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

import { useEffect, useState } from 'react';
import { slaApi, autocompleteApi } from '../api';
import type { FullSummaryResponseDTO } from '../api/types';
import { MetricCard, BreachDistributionChart } from '../components/DashboardComponents';
import AutocompleteInput from '../components/AutocompleteInput';

const FullSummaryPage: React.FC = () => {
  const [data, setData] = useState<FullSummaryResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    managerId: '',
    qualification: ''
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  useEffect(() => {
    let ignore = false;

    slaApi.getFullSummary({
      dateFrom: activeFilters.dateFrom || undefined,
      dateTo: activeFilters.dateTo || undefined,
      managerId: activeFilters.managerId || undefined,
      qualification: activeFilters.qualification || undefined
    })
      .then(response => {
        if (!ignore) {
          setData(response.data);
          setError(null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Failed to load summary data');
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
        <AutocompleteInput 
          label="Manager ID"
          placeholder="Search manager..."
          value={filters.managerId}
          onChange={val => setFilters(f => ({ ...f, managerId: val }))}
          fetchOptions={(q, signal) => autocompleteApi.getManagers(q, 10, signal)}
        />
        <AutocompleteInput 
          label="Qualification"
          placeholder="Search qualification..."
          value={filters.qualification}
          onChange={val => setFilters(f => ({ ...f, qualification: val }))}
          fetchOptions={(q, signal) => autocompleteApi.getQualifications(q, 10, signal)}
        />
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

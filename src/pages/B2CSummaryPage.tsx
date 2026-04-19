import { useEffect, useState } from 'react';
import { slaApi } from '../api';
import type { B2CSummaryResponseDTO, ManagerB2CSlaResponseDTO } from '../api/types';
import { MetricCard, ComparisonChart } from '../components/DashboardComponents';

const B2CSummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<B2CSummaryResponseDTO | null>(null);
  const [managers, setManagers] = useState<ManagerB2CSlaResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, mgrRes] = await Promise.all([
          slaApi.getB2CSummary({}),
          slaApi.getB2CByManager({})
        ]);
        setSummary(sumRes.data);
        setManagers(mgrRes.data);
      } catch (err) {
        setError('Failed to load B2C metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-header"><h2>B2C Metrics</h2><p>Loading analytics...</p></div>;
  if (error) return <div className="page-header"><h2>B2C Metrics</h2><p style={{ color: 'red' }}>{error}</p></div>;
  if (!summary) return null;

  const managerData = managers?.data.map(m => ({
    name: m.manager_id,
    value: m.metrics.b2c_total.met_percent
  })) || [];

  return (
    <div className="b2c-summary-page">
      <header className="page-header">
        <h2>B2C Pipeline Performance</h2>
        <p>Analyzing period from {summary.period.from} to {summary.period.to}</p>
      </header>

      <div className="metrics-grid">
        <MetricCard title="REACTION (SLA1)" metrics={summary.metrics.sla1_reaction} />
        <MetricCard title="TO ASSEMBLY (SLA2)" metrics={summary.metrics.sla2_to_assembly} />
        <MetricCard title="TO DELIVERY (SLA3)" metrics={summary.metrics.sla3_to_delivery} />
        <MetricCard title="B2C TOTAL" metrics={summary.metrics.b2c_total} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <ComparisonChart title="TOTAL B2C SLA BY MANAGER (%)" data={managerData} />
      </div>
    </div>
  );
};

export default B2CSummaryPage;

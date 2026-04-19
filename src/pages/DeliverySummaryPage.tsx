import { useEffect, useState } from 'react';
import { slaApi } from '../api';
import type { DeliverySummaryResponseDTO, ManagerDeliverySlaResponseDTO } from '../api/types';
import { MetricCard, ComparisonChart } from '../components/DashboardComponents';

const DeliverySummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<DeliverySummaryResponseDTO | null>(null);
  const [managers, setManagers] = useState<ManagerDeliverySlaResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, mgrRes] = await Promise.all([
          slaApi.getDeliverySummary({}),
          slaApi.getDeliveryByManager({})
        ]);
        setSummary(sumRes.data);
        setManagers(mgrRes.data);
      } catch (err) {
        setError('Failed to load delivery metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-header"><h2>Delivery Metrics</h2><p>Loading analytics...</p></div>;
  if (error) return <div className="page-header"><h2>Delivery Metrics</h2><p style={{ color: 'red' }}>{error}</p></div>;
  if (!summary) return null;

  const managerData = managers?.data.map(m => ({
    name: m.manager_id,
    value: m.metrics.delivery_total.met_percent
  })) || [];

  return (
    <div className="delivery-summary-page">
      <header className="page-header">
        <h2>Delivery Performance</h2>
        <p>Analyzing period from {summary.period.from} to {summary.period.to}</p>
      </header>

      <div className="metrics-grid">
        <MetricCard title="TO PVZ (SLA4)" metrics={summary.metrics.sla4_to_pvz} />
        <MetricCard title="AT PVZ (SLA5)" metrics={summary.metrics.sla5_at_pvz} />
        <MetricCard title="DELIVERY TOTAL" metrics={summary.metrics.delivery_total} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <ComparisonChart title="TOTAL DELIVERY SLA BY MANAGER (%)" data={managerData} />
      </div>
    </div>
  );
};

export default DeliverySummaryPage;

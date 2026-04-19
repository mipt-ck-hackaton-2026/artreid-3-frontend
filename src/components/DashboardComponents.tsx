import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../hooks/useTheme';
import type { MetricDetails } from '../api/types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const getChartColors = (theme: 'light' | 'dark') => {
  const isDark = theme === 'dark';
  return {
    text: isDark ? '#f7fafc' : '#1a1a1a',
    muted: isDark ? '#a0aec0' : '#718096',
    border: isDark ? '#4a5568' : '#e1e4e8',
    tooltipBg: isDark ? '#2d3748' : '#ffffff',
    tooltipBorder: isDark ? '#4a5568' : '#e2e8f0',
  };
};

export const MetricCard: React.FC<{ title: string; metrics: MetricDetails }> = ({ title, metrics }) => {
  const metPercent = metrics.met_percent.toFixed(1);
  const isHealthy = metrics.met_percent >= 80;

  return (
    <div className="card metric-card">
      <h3>{title}</h3>
      <div className="metric-value">{metPercent}%</div>
      <div className="metric-subtext">
        {metrics.met_count} of {metrics.total_orders} orders met SLA
      </div>
      <div style={{ marginTop: '16px', height: '8px', background: 'var(--hover-bg)', borderRadius: '4px', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${metrics.met_percent}%`, 
            height: '100%', 
            background: isHealthy ? 'var(--chart-success)' : 'var(--chart-warning)',
            transition: 'width 0.5s ease-out'
          }} 
        />
      </div>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Avg:</span> 
          <span style={{ fontWeight: 600, marginLeft: '4px' }}>{metrics.avg_minutes.toFixed(1)}m</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>P90:</span> 
          <span style={{ fontWeight: 600, marginLeft: '4px' }}>{metrics.p90_minutes.toFixed(1)}m</span>
        </div>
      </div>
    </div>
  );
};

export const BreachDistributionChart: React.FC<{ metrics: MetricDetails }> = ({ metrics }) => {
  const { theme } = useTheme();
  const colors = getChartColors(theme);
  
  const labels = metrics.breach_distribution.items.map(item => 
    item.max_bound === 2147483647 ? `>${item.min_bound}` : `${item.min_bound}-${item.max_bound}`
  );
  
  const counts = metrics.breach_distribution.items.map(item => item.count);

  if (labels.length === 0) return null;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: counts,
        backgroundColor: 'rgba(252, 129, 129, 0.7)',
        borderColor: 'rgb(252, 129, 129)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: colors.border,
        },
        ticks: {
          color: colors.muted,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: colors.muted,
        },
      },
    },
  };

  return (
    <div className="card" style={{ height: '300px' }}>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        BREACH DISTRIBUTION ({metrics.breach_distribution.metadata.unit})
      </h3>
      <div style={{ height: 'calc(100% - 32px)' }}>
        <Bar key={theme} data={chartData} options={options} />
      </div>
    </div>
  );
};

export const ComparisonChart: React.FC<{ title: string; data: { name: string; value: number }[] }> = ({ title, data }) => {
  const { theme } = useTheme();
  const colors = getChartColors(theme);
  const labels = data.map(d => d.name);
  const values = data.map(d => d.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'SLA Met (%)',
        data: values,
        backgroundColor: data.map(d => d.value >= 80 ? 'rgba(72, 187, 120, 0.7)' : 'rgba(246, 224, 94, 0.7)'),
        borderColor: data.map(d => d.value >= 80 ? 'rgb(72, 187, 120)' : 'rgb(246, 224, 94)'),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const val = context.parsed.x;
            return val !== null ? `${val.toFixed(1)}%` : '';
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: colors.border,
        },
        ticks: {
          color: colors.muted,
          callback: (value: string | number) => `${value}%`,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: colors.muted,
        },
      },
    },
  };

  return (
    <div className="card" style={{ height: '400px' }}>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{title}</h3>
      <div style={{ height: 'calc(100% - 40px)' }}>
        <Bar key={theme} data={chartData} options={options} />
      </div>
    </div>
  );
};

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MetricDetails } from '../api/types';

export const MetricCard: React.FC<{ title: string; metrics: MetricDetails }> = ({ title, metrics }) => {
  const metPercent = metrics.met_percent.toFixed(1);
  const isHealthy = metrics.met_percent >= 80; // Example threshold

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
  const data = metrics.breach_distribution.items.map(item => ({
    name: item.max_bound === 2147483647 ? `>${item.min_bound}` : `${item.min_bound}-${item.max_bound}`,
    count: item.count,
    ratio: item.ratio * 100
  }));

  if (data.length === 0) return null;

  return (
    <div className="card" style={{ height: '300px' }}>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>BREACH DISTRIBUTION ({metrics.breach_distribution.metadata.unit})</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis dataKey="name" fontSize={12} stroke="var(--chart-axis)" />
          <YAxis fontSize={12} stroke="var(--chart-axis)" />
          <Tooltip 
            formatter={(value: any) => [`${value} orders`, 'Count']}
            contentStyle={{ 
              backgroundColor: 'var(--chart-tooltip-bg)', 
              borderColor: 'var(--chart-tooltip-border)', 
              borderRadius: '8px', 
              color: 'var(--text-main)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
            itemStyle={{ color: 'var(--text-main)' }}
          />
          <Bar dataKey="count" fill="var(--chart-error)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ComparisonChart: React.FC<{ title: string; data: { name: string; value: number }[] }> = ({ title, data }) => {
  return (
    <div className="card" style={{ height: '400px' }}>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
          <XAxis type="number" unit="%" hide />
          <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="var(--chart-axis)" />
          <Tooltip 
            formatter={(value: any) => [`${value.toFixed(1)}%`, 'SLA Met']}
            contentStyle={{ 
              backgroundColor: 'var(--chart-tooltip-bg)', 
              borderColor: 'var(--chart-tooltip-border)', 
              borderRadius: '8px', 
              color: 'var(--text-main)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
            itemStyle={{ color: 'var(--text-main)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value >= 80 ? 'var(--chart-success)' : 'var(--chart-warning)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

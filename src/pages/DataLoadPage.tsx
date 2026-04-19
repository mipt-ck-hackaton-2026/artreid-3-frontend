import { useState } from 'react';
import { dataApi } from '../api';
import type { DataLoadResponseDTO } from '../api/types';
import '../components/Layout.css';

const DataLoadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DataLoadResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const response = await dataApi.load(file);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-load-page">
      <header className="page-header">
        <h2>Data Upload</h2>
        <p>Import CRM data export in CSV format to synchronize lead events and SLA timestamps.</p>
      </header>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Select CSV File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            style={{
              backgroundColor: !file || loading ? 'var(--text-muted)' : 'var(--primary)',
              color: 'var(--primary-text)',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: !file || loading ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? 'Uploading...' : 'Start Upload'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: '8px', border: '1px solid var(--status-error-border)' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Upload Summary</h4>
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div className="card" style={{ padding: '16px', background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--status-success-text)' }}>LOADED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{result.loaded}</div>
              </div>
              <div className="card" style={{ padding: '16px', background: 'var(--status-info-bg)', border: '1px solid var(--status-info-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--status-info-text)' }}>UPDATED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{result.updated}</div>
              </div>
              <div className="card" style={{ padding: '16px', background: 'var(--status-warning-bg)', border: '1px solid var(--status-warning-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--status-warning-text)' }}>SKIPPED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{result.skipped}</div>
              </div>
              <div className="card" style={{ padding: '16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--status-error-text)' }}>ERRORS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{result.errors}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataLoadPage;

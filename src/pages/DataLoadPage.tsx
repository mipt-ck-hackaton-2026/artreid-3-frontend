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
                border: '2px dashed #e1e4e8',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            style={{
              backgroundColor: !file || loading ? '#cbd5e0' : '#3182ce',
              color: 'white',
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
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '8px', border: '1px solid #feb2b2' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ marginBottom: '16px' }}>Upload Summary</h4>
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div className="card" style={{ padding: '16px', background: '#f0fff4', border: '1px solid #c6f6d5' }}>
                <div style={{ fontSize: '0.8rem', color: '#2f855a' }}>LOADED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.loaded}</div>
              </div>
              <div className="card" style={{ padding: '16px', background: '#ebf8ff', border: '1px solid #bee3f8' }}>
                <div style={{ fontSize: '0.8rem', color: '#2b6cb0' }}>UPDATED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.updated}</div>
              </div>
              <div className="card" style={{ padding: '16px', background: '#fffaf0', border: '1px solid #feebc8' }}>
                <div style={{ fontSize: '0.8rem', color: '#c05621' }}>SKIPPED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.skipped}</div>
              </div>
              <div className="card" style={{ padding: '16px', background: '#fff5f5', border: '1px solid #feb2b2' }}>
                <div style={{ fontSize: '0.8rem', color: '#c53030' }}>ERRORS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.errors}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataLoadPage;

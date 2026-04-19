import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FullSummaryPage from '../pages/FullSummaryPage'
import { slaApi } from '../api'
import { ThemeProvider } from '../context/ThemeProvider'
import type { AxiosResponse } from 'axios'
import type { FullSummaryResponseDTO } from '../api/types'

vi.mock('../api', () => ({
  slaApi: {
    getFullSummary: vi.fn(),
  },
}))

// Mock Chart.js to avoid canvas errors
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />
}))

describe('FullSummaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    vi.mocked(slaApi.getFullSummary).mockReturnValue(new Promise(() => {}))
    render(
      <ThemeProvider>
        <FullSummaryPage />
      </ThemeProvider>
    )
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })

  it('should render data when API succeeds', async () => {
    const mockData: Partial<AxiosResponse<FullSummaryResponseDTO>> = {
      data: {
        period: { from: '2023-01-01', to: '2023-01-31' },
        pipeline: 'B2C',
        metrics: {
          full_total: {
            met_percent: 85.5,
            met_count: 85,
            total_orders: 100,
            avg_minutes: 120,
            p90_minutes: 200,
            breach_distribution: {
              metadata: { unit: 'MINUTES', total_count: 15 },
              items: []
            },
            threshold_minutes: 0,
            breach_count: 0,
            breach_percent: 0,
            median_minutes: 0
          }
        }
      }
    }
    vi.mocked(slaApi.getFullSummary).mockResolvedValue(mockData as AxiosResponse<FullSummaryResponseDTO>)

    render(
      <ThemeProvider>
        <FullSummaryPage />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Overall SLA Performance')).toBeInTheDocument()
      expect(screen.getByText('85.5%')).toBeInTheDocument()
      expect(screen.getByText('85 of 100 orders met SLA')).toBeInTheDocument()
    })
  })

  it('should show error message when API fails', async () => {
    vi.mocked(slaApi.getFullSummary).mockRejectedValue(new Error('API Error'))

    render(
      <ThemeProvider>
        <FullSummaryPage />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load summary data')).toBeInTheDocument()
    })
  })
})

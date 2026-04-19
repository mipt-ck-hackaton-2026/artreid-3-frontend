import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import B2CSummaryPage from '../pages/B2CSummaryPage'
import { slaApi } from '../api'
import { ThemeProvider } from '../context/ThemeProvider'

vi.mock('../api', () => ({
  slaApi: {
    getB2CSummary: vi.fn(),
    getB2CByManager: vi.fn(),
  },
}))

vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />
}))

describe('B2CSummaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render metrics when API succeeds', async () => {
    const mockSummary = {
      data: {
        period: { from: '2023-01-01', to: '2023-01-31' },
        metrics: {
          sla1_reaction: { met_percent: 90, met_count: 9, total_orders: 10, avg_minutes: 5, p90_minutes: 10, breach_distribution: { items: [], metadata: { unit: 'm', total_count: 1 } } },
          sla2_to_assembly: { met_percent: 80, met_count: 8, total_orders: 10, avg_minutes: 60, p90_minutes: 120, breach_distribution: { items: [], metadata: { unit: 'm', total_count: 2 } } },
          sla3_to_delivery: { met_percent: 70, met_count: 7, total_orders: 10, avg_minutes: 300, p90_minutes: 500, breach_distribution: { items: [], metadata: { unit: 'm', total_count: 3 } } },
          b2c_total: { met_percent: 85, met_count: 85, total_orders: 100, avg_minutes: 500, p90_minutes: 1000, breach_distribution: { items: [], metadata: { unit: 'm', total_count: 15 } } }
        }
      }
    }
    const mockManagers = { data: { data: [] } }

    vi.mocked(slaApi.getB2CSummary).mockResolvedValue(mockSummary as any)
    vi.mocked(slaApi.getB2CByManager).mockResolvedValue(mockManagers as any)

    render(
      <ThemeProvider>
        <B2CSummaryPage />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('B2C Pipeline Performance')).toBeInTheDocument()
      expect(screen.getByText('REACTION (SLA1)')).toBeInTheDocument()
      expect(screen.getByText('90.0%')).toBeInTheDocument()
      expect(screen.getByText('80.0%')).toBeInTheDocument()
      expect(screen.getByText('70.0%')).toBeInTheDocument()
    })
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DeliverySummaryPage from '../pages/DeliverySummaryPage'
import { slaApi } from '../api'
import { ThemeProvider } from '../context/ThemeProvider'

vi.mock('../api', () => ({
  slaApi: {
    getDeliverySummary: vi.fn(),
    getDeliveryByManager: vi.fn(),
  },
}))

vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />
}))

describe('DeliverySummaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render metrics when API succeeds', async () => {
    const mockSummary = {
      data: {
        period: { from: '2023-01-01', to: '2023-01-31' },
        metrics: {
          sla4_to_pvz: { met_percent: 92, met_count: 92, total_orders: 100, avg_minutes: 1440, p90_minutes: 2880, breach_distribution: { items: [], metadata: { unit: 'd', total_count: 8 } } },
          sla5_at_pvz: { met_percent: 88, met_count: 88, total_orders: 100, avg_minutes: 720, p90_minutes: 1440, breach_distribution: { items: [], metadata: { unit: 'd', total_count: 12 } } },
          delivery_total: { met_percent: 90, met_count: 90, total_orders: 100, avg_minutes: 2160, p90_minutes: 4320, breach_distribution: { items: [], metadata: { unit: 'd', total_count: 10 } } }
        }
      }
    }
    const mockManagers = { data: { data: [] } }

    vi.mocked(slaApi.getDeliverySummary).mockResolvedValue(mockSummary as any)
    vi.mocked(slaApi.getDeliveryByManager).mockResolvedValue(mockManagers as any)

    render(
      <ThemeProvider>
        <DeliverySummaryPage />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Delivery Performance')).toBeInTheDocument()
      expect(screen.getByText('TO PVZ (SLA4)')).toBeInTheDocument()
      expect(screen.getByText('92.0%')).toBeInTheDocument()
      expect(screen.getByText('88.0%')).toBeInTheDocument()
    })
  })
})

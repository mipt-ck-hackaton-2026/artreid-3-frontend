import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import B2CSummaryPage from '../pages/B2CSummaryPage'
import { slaApi } from '../api'
import { ThemeProvider } from '../context/ThemeProvider'
import type { AxiosResponse } from 'axios'
import type { B2CSummaryResponseDTO, ManagerB2CSlaResponseDTO } from '../api/types'

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
    const mockSummary: Partial<AxiosResponse<B2CSummaryResponseDTO>> = {
      data: {
        period: { from: '2023-01-01', to: '2023-01-31' },
        pipeline: 'B2C',
        metrics: {
          sla1_reaction: { met_percent: 90, met_count: 9, total_orders: 10, avg_minutes: 5, p90_minutes: 10, breach_distribution: { items: [], metadata: { unit: 'm', total_count: 1 } }, threshold_minutes: 0, breach_count: 0, breach_percent: 0, median_minutes: 0 },
          sla2_to_assembly: { met_percent: 80, met_count: 8, total_orders: 10, avg_minutes: 60, p90_minutes: 120, breach_distribution: { items: [], metadata: { unit: 'm', total_count: 2 } }, threshold_minutes: 0, breach_count: 0, breach_percent: 0, median_minutes: 0 },
          sla3_to_delivery: { met_percent: 70, met_count: 7, total_orders: 10, avg_minutes: 300, p90_minutes: 500, breach_distribution: { items: [], metadata: { unit: 'm', total_count: 3 } }, threshold_minutes: 0, breach_count: 0, breach_percent: 0, median_minutes: 0 },
          b2c_total: { met_percent: 85, met_count: 85, total_orders: 100, avg_minutes: 500, p90_minutes: 1000, breach_distribution: { items: [], metadata: { unit: 'm', total_count: 15 } }, threshold_minutes: 0, breach_count: 0, breach_percent: 0, median_minutes: 0 }
        }
      }
    }
    const mockManagers: Partial<AxiosResponse<ManagerB2CSlaResponseDTO>> = { 
      data: { 
        data: [],
        period: { from: '2023-01-01', to: '2023-01-31' },
        pipeline: 'B2C'
      } 
    }

    vi.mocked(slaApi.getB2CSummary).mockResolvedValue(mockSummary as AxiosResponse<B2CSummaryResponseDTO>)
    vi.mocked(slaApi.getB2CByManager).mockResolvedValue(mockManagers as AxiosResponse<ManagerB2CSlaResponseDTO>)

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

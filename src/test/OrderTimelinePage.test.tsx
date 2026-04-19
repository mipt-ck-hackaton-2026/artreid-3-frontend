import axios from 'axios'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import OrderTimelinePage from '../pages/OrderTimelinePage'
import { orderApi } from '../api'

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    default: {
      ...actual.default,
      isAxiosError: vi.fn().mockReturnValue(true),
    },
    isAxiosError: vi.fn().mockReturnValue(true),
  }
})

vi.mock('../api', () => ({
  orderApi: {
    getTimeline: vi.fn(),
  },
}))

describe('OrderTimelinePage', () => {
  it('should render search form', () => {
    render(<OrderTimelinePage />)
    expect(screen.getByPlaceholderText('Enter Lead ID (e.g., 1234567)')).toBeInTheDocument()
    expect(screen.getByText('Analyze')).toBeInTheDocument()
  })

  it('should show timeline when lead ID is analyzed', async () => {
    const mockData = {
      data: {
        pipeline: 'B2C',
        period: { from: '2023-01-01', to: '2023-01-31' },
        data: [
          {
            stage: 'CREATED',
            startTime: '2023-01-01T10:00:00',
            endTime: '2023-01-01T10:05:00',
            durationMinutes: 5,
            durationDays: 0,
            slaViolated: false,
            slaThreshold: '10m'
          },
          {
            stage: 'TO_ASSEMBLY',
            startTime: '2023-01-01T10:05:00',
            endTime: '2023-01-02T10:05:00',
            durationMinutes: 1440,
            durationDays: 1,
            slaViolated: true,
            slaThreshold: '4h'
          }
        ]
      }
    }
    vi.mocked(orderApi.getTimeline).mockResolvedValue(mockData as any)

    render(<OrderTimelinePage />)
    const input = screen.getByPlaceholderText('Enter Lead ID (e.g., 1234567)')
    fireEvent.change(input, { target: { value: '123456' } })
    fireEvent.click(screen.getByText('Analyze'))

    await waitFor(() => {
      expect(screen.getByText('CREATED')).toBeInTheDocument()
      expect(screen.getByText('TO_ASSEMBLY')).toBeInTheDocument()
      expect(screen.getByText('SLA BREACHED (4h)')).toBeInTheDocument()
      expect(screen.getByText('1.0 days')).toBeInTheDocument()
    })
  })

  it('should show error when order not found', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Order not found'
        }
      }
    }
    vi.mocked(orderApi.getTimeline).mockRejectedValue(mockError)

    render(<OrderTimelinePage />)
    const input = screen.getByPlaceholderText('Enter Lead ID (e.g., 1234567)')
    fireEvent.change(input, { target: { value: '999999' } })
    fireEvent.click(screen.getByText('Analyze'))

    await waitFor(() => {
      expect(screen.getByText('Order not found')).toBeInTheDocument()
    })
  })
})

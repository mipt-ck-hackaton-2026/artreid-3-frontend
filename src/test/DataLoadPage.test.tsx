import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DataLoadPage from '../pages/DataLoadPage'
import { dataApi } from '../api'
import type { AxiosResponse } from 'axios'
import type { DataLoadResponseDTO } from '../api/types'

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    default: {
      ...(actual.default as Record<string, unknown>),
      isAxiosError: vi.fn().mockReturnValue(true),
    },
    isAxiosError: vi.fn().mockReturnValue(true),
  }
})

vi.mock('../api', () => ({
  dataApi: {
    load: vi.fn(),
  },
}))

describe('DataLoadPage', () => {
  it('should render upload form', () => {
    render(<DataLoadPage />)
    expect(screen.getByText('Data Upload')).toBeInTheDocument()
    expect(screen.getByLabelText('Select CSV File')).toBeInTheDocument()
    expect(screen.getByText('Start Upload')).toBeDisabled()
  })

  it('should enable button when file is selected', async () => {
    render(<DataLoadPage />)
    const fileInput = screen.getByLabelText('Select CSV File') as HTMLInputElement
    const file = new File(['test'], 'test.csv', { type: 'text/csv' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    expect(screen.getByText('Start Upload')).toBeEnabled()
  })

  it('should show success message on successful upload', async () => {
    const mockResponse: Partial<AxiosResponse<DataLoadResponseDTO>> = {
      data: {
        loaded: 10,
        updated: 5,
        skipped: 2,
        errors: 0
      }
    }
    vi.mocked(dataApi.load).mockResolvedValue(mockResponse as AxiosResponse<DataLoadResponseDTO>)

    render(<DataLoadPage />)
    const fileInput = screen.getByLabelText('Select CSV File')
    const file = new File(['test'], 'test.csv', { type: 'text/csv' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText('Start Upload'))

    await waitFor(() => {
      expect(screen.getByText('Upload Summary')).toBeInTheDocument()
      expect(screen.getByText('LOADED')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('should show error message on failed upload', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Invalid file format'
        }
      }
    }
    vi.mocked(dataApi.load).mockRejectedValue(mockError)

    render(<DataLoadPage />)
    const fileInput = screen.getByLabelText('Select CSV File')
    const file = new File(['test'], 'test.csv', { type: 'text/csv' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText('Start Upload'))

    await waitFor(() => {
      expect(screen.getByText('Invalid file format')).toBeInTheDocument()
    })
  })
})

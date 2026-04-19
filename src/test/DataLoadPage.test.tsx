import axios from 'axios'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DataLoadPage from '../pages/DataLoadPage'
import { dataApi } from '../api'

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
    const mockResponse = {
      data: {
        loaded: 10,
        updated: 5,
        skipped: 2,
        errors: 0
      }
    }
    vi.mocked(dataApi.load).mockResolvedValue(mockResponse as any)

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

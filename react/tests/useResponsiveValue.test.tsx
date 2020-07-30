import { renderHook } from '@testing-library/react-hooks'
import { useDevice } from 'vtex.device-detector'

import {
  useResponsiveValue,
  useResponsiveValues,
} from '../hooks/useResponsiveValue'
import { mockMatchMedia } from './utils'

const devices = ['desktop', 'tablet', 'phone']

jest.mock('vtex.device-detector', () => {
  return { useDevice: jest.fn() }
})

function switchDevice(device: string) {
  return (useDevice as jest.Mock).mockImplementation(() => ({ device }))
}

describe('useResponsiveValue', () => {
  devices.forEach((device) => {
    it(`returns a single value for the current device: ${device}`, () => {
      switchDevice(device)

      const input = {
        desktop: 1,
        phone: 2,
        tablet: 3,
      }

      const { result } = renderHook(() => useResponsiveValue(input))

      expect(result.current).toBe(input[device as keyof typeof input])
    })

    it('returns a single value if the input is also a single value', () => {
      switchDevice(device)

      const input = 1

      const { result } = renderHook(() => useResponsiveValue(input))

      expect(result.current).toBe(input)
    })
  })

  it(`returns a single value matching a specific media query`, () => {
    mockMatchMedia({ matchedQueries: ['(max-width: 1000px)'] })
    switchDevice('desktop')

    const input = {
      desktop: 1,
      '(max-width: 1000px)': 2,
    }

    const { result } = renderHook(() => useResponsiveValue(input))

    expect(result.current).toBe(2)
  })
})

describe('useResponsiveValues', () => {
  it('returns the correct values for different keys', () => {
    switchDevice('desktop')

    const input = {
      first: { desktop: 1, mobile: 2 },
      second: { desktop: 3, mobile: 4 },
      third: { desktop: 1, '(max-width: 1000px)': 2 },
    }

    const { result } = renderHook(() => useResponsiveValues(input))

    expect(result.current.first).toBe(1)
    expect(result.current.second).toBe(3)
    expect(result.current.third).toBe(2)
  })
})

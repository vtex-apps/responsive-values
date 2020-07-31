import {
  isResponsiveInput,
  normalizeResponsiveInput,
} from '../hooks/normalizeResponsiveInput'

jest.spyOn(console, 'warn').mockImplementation()

afterEach(() => {
  jest.clearAllMocks()
})

describe('isResponsiveInput', () => {
  it('returns false if passed null', () => {
    const value = null

    expect(isResponsiveInput(value)).toBe(false)
  })

  it('returns false if passed a non-object', () => {
    const value = 2

    expect(isResponsiveInput(value)).toBe(false)
  })

  it('returns true if passed an object with a single device', () => {
    const value = {
      desktop: 1,
    }

    expect(isResponsiveInput(value)).toBe(true)
  })

  it('returns true if passed an object with all devices', () => {
    const value = {
      desktop: 1,
      mobile: 1,
      tablet: 1,
      phone: 1,
    }

    expect(isResponsiveInput(value)).toBe(true)
  })

  it('returns true if media queries are passed (wrapped between parenthesis)', () => {
    const value = {
      tablet: 1,
      '(max-width: 100px)': 1,
      '(max-width: 300px)': 2,
    }

    expect(isResponsiveInput(value)).toBe(true)
  })

  it('returns false if passed an object with an extraneous key', () => {
    const value = {
      desktop: 1,
      mobile: 1,
      tablet: 1,
      phone: 1,
      oops: 0,
      'max-width: 300px': 0,
    }

    expect(isResponsiveInput(value)).toBe(false)
  })
})

describe('responsiveValue', () => {
  it('complains if "mobile" is defined along with "tablet"', () => {
    const value = {
      tablet: 1,
      phone: 1,
      mobile: 2,
      desktop: 3,
    }

    const result = normalizeResponsiveInput(value)

    expect(console.warn).toBeCalled()

    expect(result).toStrictEqual({
      devices: { phone: 1, tablet: 1, desktop: 3 },
      queries: {},
    })
  })

  it('returns an object with equal keys if the input has all the parameters', () => {
    const value = {
      desktop: 1,
      tablet: 2,
      phone: 3,
    }

    expect(normalizeResponsiveInput(value)).toStrictEqual({
      devices: { desktop: 1, tablet: 2, phone: 3 },
      queries: {},
    })
  })

  describe('single values should populate the device object', () => {
    it('works with straight values', () => {
      const value = 1

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 1, tablet: 1, phone: 1 },
        queries: {},
      })
    })

    it('works with "desktop"', () => {
      const value = { desktop: 1 }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 1, tablet: 1, phone: 1 },
        queries: {},
      })
    })

    it('works with "mobile"', () => {
      const value = { mobile: 1 }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 1, tablet: 1, phone: 1 },
        queries: {},
      })
    })

    it('works with "tablet"', () => {
      const value = { tablet: 1 }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 1, tablet: 1, phone: 1 },
        queries: {},
      })
    })

    it('works with "phone"', () => {
      const value = {
        phone: 1,
      }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 1, tablet: 1, phone: 1 },
        queries: {},
      })
    })
  })

  describe('fallbacks', () => {
    it('tablet fallbacks to desktop instead of phone, when both are defined', () => {
      const value = {
        desktop: 1,
        phone: 2,
      }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 1, tablet: 1, phone: 2 },
        queries: {},
      })
    })

    it('desktop fallbacks to tablet instead of phone, when both are defined', () => {
      const value = {
        tablet: 1,
        phone: 2,
      }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 1, tablet: 1, phone: 2 },
        queries: {},
      })
    })

    it('phone fallbacks to tablet instead of desktop, when both are defined', () => {
      const value = {
        tablet: 1,
        desktop: 2,
      }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 2, tablet: 1, phone: 1 },
        queries: {},
      })
    })

    it('tablet fallbacks to mobile, ', () => {
      const value = {
        phone: 1,
        mobile: 2,
        desktop: 3,
      }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 3, tablet: 2, phone: 1 },
        queries: {},
      })
    })

    it('phone and tablet should override mobile', () => {
      const value = {
        phone: 1,
        mobile: 2,
        tablet: 3,
        desktop: 4,
      }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: {
          phone: 1,
          tablet: 3,
          desktop: 4,
        },
        queries: {},
      })
    })
  })

  describe('generic media queries', () => {
    it('adds media query values to queries dictionary', () => {
      const value = {
        '(max-width: 800px)': 1,
        '(max-width: 1200px)': 2,
      }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: undefined, tablet: undefined, phone: undefined },
        queries: {
          '(max-width: 800px)': 1,
          '(max-width: 1200px)': 2,
        },
      })
    })

    it('works together with devices', () => {
      const value = {
        phone: 3,
        '(max-width: 800px)': 1,
        '(max-width: 1200px)': 2,
      }

      expect(normalizeResponsiveInput(value)).toStrictEqual({
        devices: { desktop: 3, tablet: 3, phone: 3 },
        queries: {
          '(max-width: 800px)': 1,
          '(max-width: 1200px)': 2,
        },
      })
    })
  })
})

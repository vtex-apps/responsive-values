type MockMatchMedia = {
  matchedQueries?: string[]
}

export function mockMatchMedia({ matchedQueries = [] }: MockMatchMedia = {}) {
  const mqls: Array<{ mql: MediaQueryList; listeners: any[] }> = []

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((media: string) => {
      let _listeners: any[] = []

      const mql = {
        media,
        get matches() {
          return matchedQueries.includes(media)
        },
        onchange: () => {},
        addListener: jest.fn((fn) => _listeners.push(fn)),
        addEventListener: jest.fn((fn: any) => _listeners.push(fn)),
        removeListener: jest.fn(
          (fn) => (_listeners = _listeners.filter((f) => f !== fn))
        ),
        removeEventListener: jest.fn(
          (fn: any) => (_listeners = _listeners.filter((f) => f !== fn))
        ),
        dispatchEvent: (_: Event) => true,
      }

      mqls.push({
        mql,
        get listeners() {
          return _listeners
        },
      })

      return mql
    }),
  })

  return ({
    matchedQueries: newMatchedQueries,
  }: {
    matchedQueries: string[]
  }) => {
    matchedQueries = newMatchedQueries

    mqls.forEach(({ mql, listeners }) =>
      listeners.forEach((fn) => fn({ matches: mql.matches }))
    )
  }
}

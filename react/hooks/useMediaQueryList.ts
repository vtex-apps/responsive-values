import { useLayoutEffect, useState } from 'react'

const BreakpointMatchers: Record<string, MediaQueryList> = {}

export const useMediaQueryList = (queries: string[]) => {
  const [matches, setMatches] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}

    queries.forEach((query) => {
      let mql = BreakpointMatchers[query]

      if (!mql) {
        // ugly side-effect（＞д＜）
        mql = window.matchMedia(query)
        BreakpointMatchers[query] = mql
      }

      initial[query] = Boolean(mql.matches)
    })

    return initial
  })

  useLayoutEffect(() => {
    if (typeof window?.matchMedia !== 'function' || queries.length === 0) {
      return
    }

    const cancels = queries.map((query) => {
      let mounted = true
      const mql = BreakpointMatchers[query]

      const listener = (e: MediaQueryListEvent) => {
        if (!mounted) return
        setMatches((curMatches) => ({ ...curMatches, [query]: e.matches }))
      }

      mql.addListener(listener)

      return () => {
        mounted = false
        mql.removeListener(listener)
      }
    })

    return () => {
      cancels.forEach((cancel) => cancel())
    }
    // We disable this rule because it doesn't treat `JSON.stringify(queries)`
    // as an explicit dependency of `queries`.
    // We're also doing a JSON.stringify because we need to guarantee that it won't
    // re-run if the reference was changed but its content didn't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queries), setMatches])

  return {
    mediaQueries: Object.entries(matches),
  }
}

export const findFirstMatchingQuery = (
  queryMatches: Array<[string, boolean]>
): undefined | string => {
  const matchedBreakpoint = queryMatches.find(([, matches]) => matches)

  if (!matchedBreakpoint) {
    return
  }

  const [query] = matchedBreakpoint

  return query
}

import { useLayoutEffect, useState } from 'react'

const BreakpointMatchers: Record<string, MediaQueryList> = {}

export function clearMatchersCache() {
  Object.keys(BreakpointMatchers).forEach(
    (key) => delete BreakpointMatchers[key]
  )
}

function getBreakpointMatcher(query: string): MediaQueryList | undefined {
  if (!BreakpointMatchers[query] && typeof window?.matchMedia === 'function') {
    // ugly side-effect to get a up-to-date initial value（＞д＜）
    BreakpointMatchers[query] = window.matchMedia(query)
  }

  return BreakpointMatchers[query]
}

export function useMediaQueryList(queries: string[]) {
  const [matches, setMatches] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}

    queries.forEach((query) => {
      initial[query] = Boolean(getBreakpointMatcher(query)?.matches)
    })

    return initial
  })

  useLayoutEffect(
    function updateQueryListeners() {
      if (typeof window?.matchMedia !== 'function' || queries.length === 0) {
        return
      }

      const cancels = queries.map((query) => {
        let mounted = true
        const mediaQueryList = getBreakpointMatcher(query)

        if (matches[query] === undefined || matches[query] === null) {
          setMatches((curMatches) => ({
            ...curMatches,
            [query]: Boolean(mediaQueryList?.matches),
          }))
        }

        const listener = (e: MediaQueryListEvent) => {
          if (!mounted) return
          setMatches((curMatches) => ({ ...curMatches, [query]: e.matches }))
        }

        mediaQueryList?.addListener(listener)

        return () => {
          mounted = false
          mediaQueryList?.removeListener(listener)
        }
      })

      return () => {
        cancels.forEach((cancel) => cancel())
      }
    },
    // We disable this rule because it doesn't treat `JSON.stringify(queries)`
    // as an explicit dependency of `queries`.
    // We're also doing a JSON.stringify because we need to guarantee that it won't
    // re-run if the reference was changed but its content didn't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(queries), setMatches]
  )

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

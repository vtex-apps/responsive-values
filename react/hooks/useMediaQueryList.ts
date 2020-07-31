import { useLayoutEffect, useState } from 'react'

const BreakpointMatchers: Record<string, MediaQueryList> = {}

export function clearMatchersCache() {
  Object.keys(BreakpointMatchers).forEach(
    (key) => delete BreakpointMatchers[key]
  )
}

export function useMediaQueryList(queries: string[]) {
  const [matches, setMatches] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}

    queries.forEach((query) => {
      let mediaQueryList = BreakpointMatchers[query]

      if (!mediaQueryList) {
        // ugly side-effect to get a up-to-date initial value（＞д＜）
        mediaQueryList = window.matchMedia(query)
        BreakpointMatchers[query] = mediaQueryList
      }

      initial[query] = Boolean(mediaQueryList.matches)
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
        const mediaQueryList = BreakpointMatchers[query]

        const listener = (e: MediaQueryListEvent) => {
          if (!mounted) return
          setMatches((curMatches) => ({ ...curMatches, [query]: e.matches }))
        }

        mediaQueryList.addListener(listener)

        return () => {
          mounted = false
          mediaQueryList.removeListener(listener)
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

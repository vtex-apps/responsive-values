import { useDevice } from 'vtex.device-detector'

import type { ResponsiveValue } from './ResponsiveValuesTypes'
import { normalizeResponsiveInput } from './modules/normalizeResponsiveInput'
import {
  useMediaQueryList,
  findFirstMatchingQuery,
} from './hooks/useMediaQueryList'

const useResponsiveValue = <T>(input: ResponsiveValue<T>): T => {
  const { device } = useDevice()
  const { devices, queries } = normalizeResponsiveInput(input)
  const queryList = Object.keys(queries)
  const { mediaQueries } = useMediaQueryList(queryList)

  if (queryList.length > 0) {
    const matched = findFirstMatchingQuery(mediaQueries)

    if (matched) {
      return queries[matched]
    }
  }

  return devices[device]
}

export default useResponsiveValue

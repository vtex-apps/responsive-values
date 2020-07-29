import { useDevice } from 'vtex.device-detector'

import {
  normalizeResponsiveInput,
  MaybeResponsiveInput,
  normalizeResponsiveInputs,
} from './normalizeResponsiveInput'
import { useMediaQueryList, findFirstMatchingQuery } from './useMediaQueryList'

const useResponsiveValue = <T>(input: MaybeResponsiveInput<T>): T => {
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

const useResponsiveValues = (
  input: Record<string, unknown>
): Record<string, unknown> => {
  const { device } = useDevice()

  const { inputList, queryList } = normalizeResponsiveInputs(input)
  const { mediaQueries } = useMediaQueryList(queryList)

  const result: Record<string, unknown> = {}

  inputList.forEach(([key, values]) => {
    if (Object.keys(values.queries).length > 0) {
      const matched = findFirstMatchingQuery(mediaQueries)

      if (matched) {
        result[key] = values.queries[matched]

        return
      }
    }

    result[key] = values.devices[device]
  })

  return result
}

export { useResponsiveValue, useResponsiveValues }

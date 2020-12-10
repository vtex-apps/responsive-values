import { useDevice } from 'vtex.device-detector'

import type {
  GetResponsiveValueType,
  ResponsiveValues,
} from './ResponsiveValuesTypes'
import { normalizeResponsiveInputs } from './modules/normalizeResponsiveInput'
import {
  useMediaQueryList,
  findFirstMatchingQuery,
} from './hooks/useMediaQueryList'

type UsedResponsiveValues<Input> = {
  [key in keyof Input]: GetResponsiveValueType<Input[key]>
}

const useResponsiveValues = <Input extends ResponsiveValues>(
  input: Input
): UsedResponsiveValues<Input> => {
  const { device } = useDevice()

  const { inputList, queryList } = normalizeResponsiveInputs(input)
  const { mediaQueries } = useMediaQueryList(queryList)

  const result = {} as UsedResponsiveValues<Input>

  inputList.forEach(([key, values]) => {
    if (Object.keys(values.queries).length > 0) {
      const matched = findFirstMatchingQuery(mediaQueries)

      if (matched) {
        result[key] = values.queries[matched] as GetResponsiveValueType<
          Input[typeof key]
        >

        return
      }
    }

    result[key] = values.devices[device] as GetResponsiveValueType<
      Input[typeof key]
    >
  })

  return result
}

export default useResponsiveValues

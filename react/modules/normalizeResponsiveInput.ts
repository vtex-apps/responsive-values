/** The user is able to input `mobile` as a device (as opposed to `desktop`),
 * but the output will be converted to `phone` and `tablet` */

import type { InputDevice, OutputDevice } from '../ResponsiveValuesTypes'

const InputDevicesMap: Record<InputDevice, InputDevice> = {
  mobile: 'mobile',
  phone: 'phone',
  tablet: 'tablet',
  desktop: 'desktop',
}

export type ResponsiveInput<T> = Record<InputDevice | string, T>
export type MaybeResponsiveInput<T> = T | ResponsiveInput<T>

export type NormalizedInput<T> = {
  devices: Record<OutputDevice, T>
  queries: Record<string, T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUndefined = (value: any) => typeof value === 'undefined'

/** Returns the first value of the input that is not undefined,
 * given a sorted array of keys */
const fallbackOrder = <T>(
  input: ResponsiveInput<T>,
  devices: Array<keyof ResponsiveInput<T>>
) => devices.map((key) => input[key]).find((value) => !isUndefined(value)) as T

/** Checks if the input value is a ResponsiveInput type (an object with
 * one or more keys of Device type--e.g. `desktop`, `mobile`) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isResponsiveInput = <T>(value: any): value is ResponsiveInput<T> =>
  Boolean(
    value &&
      typeof value === 'object' &&
      Object.keys(value).every((key) => {
        return (
          key in InputDevicesMap ||
          (key.charAt(0) === '(' && key.charAt(key.length - 1) === ')')
        )
      })
  )

const showWarnings = <T>(value: ResponsiveInput<T>) => {
  if (isUndefined(value.mobile)) {
    return
  }

  const devices: string[] = []

  if (!isUndefined(value.phone)) {
    devices.push('"phone"')
  }

  if (!isUndefined(value.tablet)) {
    devices.push('"tablet"')
  }

  if (devices.length === 0) {
    return
  }

  const devicesLabel = devices.join(' and ')

  console.warn(
    `You are defining a "mobile" value along with ${devicesLabel} ${
      devices.length > 1 ? 'values' : 'value'
    } in the props of a component. Please use "phone" and "tablet" in this case.`
  )
}

/** Takes an input that might be a responsive object or not
 * (i.e. either "prop: {mobile: 1, desktop:2}" or just "prop: 2")
 * and returns an object of the values broken down into devices
 * (i.e. {phone: 1, tablet: 1, desktop: 2})
 *
 * TODO: this can return undefined if only media queries are defined
 * should we add undefined to the return type of our hooks?
 * it would make it a bit annoying to use, but probably safer
 */
export const normalizeResponsiveInput = <T>(
  input: MaybeResponsiveInput<T>
): NormalizedInput<T> => {
  if (!isResponsiveInput(input)) {
    return {
      devices: { phone: input, tablet: input, desktop: input },
      queries: {},
    }
  }

  const { phone, tablet, mobile, desktop, ...queries } = input

  showWarnings(input)

  return {
    devices: {
      phone: fallbackOrder(input, ['phone', 'mobile', 'tablet', 'desktop']),
      tablet: fallbackOrder(input, ['tablet', 'mobile', 'desktop', 'phone']),
      desktop: fallbackOrder(input, ['desktop', 'tablet', 'phone', 'mobile']),
    },
    queries,
  }
}

export const normalizeResponsiveInputs = <
  Input extends Record<string, MaybeResponsiveInput<unknown>>
>(
  input: Input
) => {
  const normalizedInputs: Array<[keyof Input, NormalizedInput<unknown>]> = []
  const queryList: Set<string> = new Set()

  Object.keys(input).forEach((key) => {
    const normalizedInput = normalizeResponsiveInput(input[key])

    Object.keys(normalizedInput.queries).forEach((query) =>
      queryList.add(query)
    )

    normalizedInputs.push([key as keyof Input, normalizedInput])
  })

  return {
    inputList: normalizedInputs,
    queryList: [...queryList],
  }
}

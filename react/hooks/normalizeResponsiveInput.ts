/** The user is able to input `mobile` as a device (as opposed to `desktop`),
 * but the output will be converted to `phone` and `tablet` */
type Device = 'mobile' | 'phone' | 'tablet' | 'desktop'

const InputDevices: Record<Device, Device> = {
  mobile: 'mobile',
  phone: 'phone',
  tablet: 'tablet',
  desktop: 'desktop',
}

type OutputDevices = 'phone' | 'tablet' | 'desktop'

export type ResponsiveInput<T> = Record<keyof typeof InputDevices | string, T>
export type MaybeResponsiveInput<T> = T | ResponsiveInput<T>

export type NormalizedInput<T> = {
  devices: Record<OutputDevices, T>
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
          key in InputDevices ||
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

export const normalizeResponsiveInputs = <T>(
  input: Record<string, MaybeResponsiveInput<T>>
) => {
  const normalizedInputs: Array<[string, NormalizedInput<T>]> = []
  const queryList: Set<string> = new Set()

  Object.keys(input).forEach((key) => {
    const normalizedInput = normalizeResponsiveInput(input[key])

    Object.keys(normalizedInput.queries).forEach((query) =>
      queryList.add(query)
    )

    normalizedInputs.push([key, normalizedInput])
  })

  return {
    inputList: normalizedInputs,
    queryList: [...queryList],
  }
}

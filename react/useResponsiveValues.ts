import { useDevice } from 'vtex.device-detector'

enum Devices {
  /** Mobile is both tablet and phone, but it's more a class of
   * devices with touchscreen than a screensize.
   */
  mobile = 'mobile',
  phone = 'phone',
  tablet = 'tablet',
  desktop = 'desktop',
}

interface ResponsiveValue<T> {
  [Devices.mobile]: T
  [Devices.phone]: T
  [Devices.tablet]: T
  [Devices.desktop]: T
}

type ResponsiveInput<T> = Partial<ResponsiveValue<T>>
type MaybeResponsiveInput<T> = T | ResponsiveInput<T>

/** Returns the first argument that is not undefined */
const firstDefinedValue = <T>(...values: T[]): T | undefined =>
  values.find(value => typeof value !== 'undefined')

const fallbackOrder = <T>(
  value: ResponsiveInput<T>,
  devices: (keyof ResponsiveInput<T>)[]
) => firstDefinedValue(...devices.map(key => value[key]))

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const isResponsiveValue = <T>(value: any): value is ResponsiveInput<T> =>
  value &&
  Object.values(Devices).some(device => typeof value[device] !== 'undefined')

type Parser<T, U> = (value?: T) => U

const parseResponsiveValue = <T, U>(
  value: MaybeResponsiveInput<T>,
  parseValue?: Parser<T, U>
): ResponsiveValue<U> => {
  const parse = (parseValue || ((v: unknown) => v as U)) as Parser<T, U>

  if (isResponsiveValue(value)) {
    const parseWithFallback = (devices: (keyof ResponsiveInput<T>)[]) =>
      parse(fallbackOrder(value, devices))

    const { mobile, tablet, phone, desktop } = Devices

    return {
      mobile: parseWithFallback([mobile, tablet, phone, desktop]),
      phone: parseWithFallback([phone, mobile, tablet, desktop]),
      tablet: parseWithFallback([tablet, mobile, desktop, phone]),
      desktop: parseWithFallback([desktop, tablet, phone, mobile]),
    }
  }

  const parsedValue = parse(value)

  return {
    mobile: parsedValue,
    phone: parsedValue,
    tablet: parsedValue,
    desktop: parsedValue,
  }
}

const useResponsiveValue = <T, U>(
  input: T,
  parseValue?: (value?: T) => U
): U => {
  const { device }: { device: Devices } = useDevice()

  const parsedValue = parseResponsiveValue(input, parseValue)

  return parsedValue[device]
}

export default useResponsiveValue

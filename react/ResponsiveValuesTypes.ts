/** The user is able to input `mobile` as a device (as opposed to `desktop`),
 * but the output will be converted to `phone` and `tablet` */

export type InputDevice = 'mobile' | 'phone' | 'tablet' | 'desktop'
export type OutputDevice = 'phone' | 'tablet' | 'desktop'

// TODO: replace that `| string` with `MediaQueryString` when IO supports TS 4.1+
// type MinMax = 'min' | 'max'
// type Dimensions = 'width' | 'height'
// type Units = 'rem' | 'px' | 'px' | '%'
// type MediaQueryProperty = `${MinMax}-${Dimensions}`
// export type MediaQueryString = `(${MediaQueryProperty}:${number}${Units})`
export type ResponsiveInput<T> = Record<InputDevice | string, T>

export type ResponsiveValue<T> = T | ResponsiveInput<T>

// We can't know the values types beforehand, so we default them to unknown
export type ResponsiveValues = Record<string, ResponsiveValue<unknown>>

// Gets the type of a value wrapped in ResponsiveValues
export type GetResponsiveValueType<
  T extends ResponsiveValue<unknown>
> = T extends ResponsiveValue<infer U> ? U : never

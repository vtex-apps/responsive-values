# vtex.responsive-values

Utility for using props that accept different values for different devices.

For example, a given prop could accept both just a number...

```js
props: {
  quantity: 1,
}
```

...or different values depending on the device:

```js
props: {
  quantity: {
    mobile: 1,
    desktop: 2
  }
}
```

...and the component, in turn, would use it like this:

```js
import { useResponsiveValue } from 'vtex.responsive-values'

const MyComponent = ({ quantity }) => {
  const quantity = useResponsiveValue(quantity)

  return <span>{quantity}</span>
}

<MyComponent quantity={1}> {/* always returns 1 */}

<MyComponent quantity={{
  desktop: 2,
  mobile: 1,
}}> {/* returns 1 on mobile devices, 2 on desktop */}
```

## API

Props that use this hook accept either a value by itself, or an object with the following options: `phone` and `tablet` separately, or just `mobile` for both, and `desktop`. If there is any missing device, it will fallback to the next largest one—i.e. if only the values of `phone` and `desktop` are passed, `tablet` devices will receive the value from `desktop`.

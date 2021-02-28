# How can I do custom validation extension

```typescript
import { StringValidationBuilder } from "object-validation-pattern"
import isURL from 'validator/lib/isURL'

declare module "object-validation-pattern" {
    interface StringValidationBuilder<T, K> {
        isUrl(message?: string): StringValidationBuilder<T, K>
    }
}

StringValidationBuilder.prototype.isUrl = function<T, K>(message?: string): StringValidationBuilder<T,K> {
    const builder = this as StringValidationBuilder<T, K>
    return builder.check((_, __, value) => isURL(value), message || "$name: $value isn't an url")
}
```

The function isURL in the example used a library [validator.js](https://www.npmjs.com/package/validator)
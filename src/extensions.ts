import { StringValidationBuilder, NumberValidationBuilder } from './validation-builder'

declare module './validation-builder' {
  interface StringValidationBuilder<T, K> {
    isEmail(): StringValidationBuilder<T, K>
  }

  interface NumberValidationBuilder<T, K> {
    isPositive(): NumberValidationBuilder<T, K>
    isNegative(): NumberValidationBuilder<T, K>
    isZero(): NumberValidationBuilder<T, K>
    isInteger(): NumberValidationBuilder<T, K>
  }
}

StringValidationBuilder.prototype.isEmail = function <T, K extends keyof T>(): StringValidationBuilder<T, K> {
  const builder = this as StringValidationBuilder<T, K>
  return builder.check(
    (_, __, value) =>
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
        String(value),
      ),
    "$name: $value isn't email",
  )
}

NumberValidationBuilder.prototype.isPositive = function <T, K extends keyof T>(): NumberValidationBuilder<T, K> {
  const builder = this as NumberValidationBuilder<T, K>
  return builder.check((_, __, value) => Number(value) > 0, "$name: $value isn't positive")
}

NumberValidationBuilder.prototype.isNegative = function <T, K extends keyof T>(): NumberValidationBuilder<T, K> {
  const builder = this as NumberValidationBuilder<T, K>
  return builder.check((_, __, value) => Number(value) < 0, "$name: $value isn't negative")
}

NumberValidationBuilder.prototype.isZero = function <T, K extends keyof T>(): NumberValidationBuilder<T, K> {
  const builder = this as NumberValidationBuilder<T, K>
  return builder.check((_, __, value) => Number(value) === 0, "$name: $value isn't zero")
}

NumberValidationBuilder.prototype.isInteger = function <T, K extends keyof T>(): NumberValidationBuilder<T, K> {
  const builder = this as NumberValidationBuilder<T, K>
  return builder.check((_, __, value) => Number.isInteger(value), "value isn't positive")
}

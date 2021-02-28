import { StringFieldValidationBuilder, NumberFieldValidationBuilder } from "./index"

declare module "./index" {
    interface StringFieldValidationBuilder<T, K> {
        isEmail(): StringFieldValidationBuilder<T, K>
    }

    interface NumberFieldValidationBuilder<T, K> {
        isPositive(): NumberFieldValidationBuilder<T, K>
        isNegative(): NumberFieldValidationBuilder<T, K>
        isZero(): NumberFieldValidationBuilder<T, K>
        isInteger(): NumberFieldValidationBuilder<T, K>
    }
}

StringFieldValidationBuilder.prototype.isEmail = function<T, K>(): StringFieldValidationBuilder<T,K> {
   const builder = this as StringFieldValidationBuilder<T, K>
   return builder.check((_, __, value) =>
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
    .test(String(value)), "$name: $value isn't email")
}

NumberFieldValidationBuilder.prototype.isPositive = function<T, K>(): NumberFieldValidationBuilder<T, K> {
    const builder = this as NumberFieldValidationBuilder<T, K>
    return builder.check((_, __, value) => Number(value) > 0, "$name: $value isn't positive")
}

NumberFieldValidationBuilder.prototype.isNegative = function<T, K>(): NumberFieldValidationBuilder<T, K> {
    const builder = this as NumberFieldValidationBuilder<T, K>
    return builder.check((_, __, value) => Number(value) < 0, "$name: $value isn't negative")
}

NumberFieldValidationBuilder.prototype.isZero = function<T, K>(): NumberFieldValidationBuilder<T, K> {
    const builder = this as NumberFieldValidationBuilder<T, K>
    return builder.check((_, __, value) => Number(value) === 0, "$name: $value isn't zero")
}

NumberFieldValidationBuilder.prototype.isInteger = function<T, K>(): NumberFieldValidationBuilder<T, K> {
    const builder = this as NumberFieldValidationBuilder<T, K>
    return builder.check((_, __, value) => Number.isInteger(value), "value isn't positive")
}
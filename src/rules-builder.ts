import {
  ArrayValidationBuilder,
  DateTimeValidationBuilder,
  EntityValidationBuilder,
  NumberValidationBuilder,
  StringValidationBuilder,
} from './validation-builder'
import { StateItem } from './state-model'
import { ValidationState } from './validation-state'

export class RulesBuilder<T> {
  private validationState: ValidationState<T>
  constructor(validationState: ValidationState<T>) {
    this.validationState = validationState
  }

  add<K extends keyof T>(fieldName: K): TypeResolver<T, K> {
    return new TypeResolver<T, K>(fieldName, this.validationState)
  }
}

export class TypeResolver<T, K extends keyof T> {
  private readonly field: K
  private validationState: ValidationState<T>
  constructor(field: K, validator: ValidationState<T>) {
    this.field = field
    this.validationState = validator
    this.validationState.stateModel.setValue(field.toString(), new StateItem())
  }

  isString(): StringValidationBuilder<T, K> {
    return new StringValidationBuilder<T, K>(this.field, this.validationState)
  }

  isNumber(): NumberValidationBuilder<T, K> {
    return new NumberValidationBuilder<T, K>(this.field, this.validationState)
  }

  isArray(): ArrayValidationBuilder<T, K> {
    return new ArrayValidationBuilder<T, K>(this.field, this.validationState)
  }

  isEntity(): EntityValidationBuilder<T, K> {
    return new EntityValidationBuilder<T, K>(this.field, this.validationState)
  }

  isDateTime(): DateTimeValidationBuilder<T, K> {
    return new DateTimeValidationBuilder<T, K>(this.field, this.validationState)
  }
}

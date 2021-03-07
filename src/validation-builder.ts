import { TypeResolver } from './rules-builder'
import { BlockQueueItem, RuleQueueItem } from './validation-queue'
import { ValidationState } from './validation-state'

export type ValidationCallback<T, K extends keyof T> = (obj: T, key: K, value: T[K]) => boolean
export type ValidationCallbackAsync<T, K extends keyof T> = (obj: T, key: K, value: T[K]) => Promise<boolean>

abstract class ValidationBuilder<T, K extends keyof T> {
  protected readonly fieldName: K
  protected readonly validationState: ValidationState<T>

  fieldNameString(): string {
    return this.fieldName.toString()
  }

  constructor(field: K, validationState: ValidationState<T>) {
    this.fieldName = field
    this.validationState = validationState
  }

  check(action: ValidationCallback<T, K>, message: string): this {
    this.validationState.queue.push(
      new RuleQueueItem(
        this.fieldNameString(),
        () => {
          const target = this.validationState.target
          const value = target[this.fieldName]
          return action(target, this.fieldName, value)
        },
        message,
      ),
    )
    return this
  }

  checkAsync(action: ValidationCallbackAsync<T, K>, message: string): this {
    this.validationState.queue.push(
      new RuleQueueItem(
        this.fieldNameString(),
        async () => {
          const target = this.validationState.target
          const value = target[this.fieldName]
          return await action(target, this.fieldName, value)
        },
        message,
      ),
    )
    return this
  }

  compareWithField<K2 extends keyof T>(fieldName: K2, comparer: CompareType, message: string) {
    return this.check((obj, _, value) => compare(value, obj[fieldName], comparer), message)
  }

  fieldIs<K2 extends keyof T>(fieldName: K2, comparer: CompareType, value?: T[K2], message?: string) {
    return this.check((obj) => compare(value, obj[fieldName], comparer), message)
  }

  break(): this {
    this.validationState.queue.push(new BlockQueueItem(this.fieldNameString(), true))
    return this
  }

  breakChain(): this {
    this.validationState.queue.push(new BlockQueueItem(this.fieldNameString(), false))
    return this
  }
}

export class StringValidationBuilder<T, K extends keyof T> extends ValidationBuilder<T, K> {
  constructor(field: K, validationState: ValidationState<T>) {
    super(field, validationState)
  }

  notEmpty(message?: string): this {
    return this.check((_, __, value) => !!value, message || '$name: is empty')
  }

  empty(message?: string): this {
    return this.check((_, __, value) => !value, message || "$name: isn't empty")
  }

  maxLength(num: number, message?: string): this {
    return this.check((_, __, value) => String(value).length <= num, message || `$name: max length is ${num}`)
  }

  minLength(num: number, message?: string): this {
    return this.check((_, __, value) => String(value).length >= num, message || `$name: isn't empty`)
  }
}

export class NumberValidationBuilder<T, K extends keyof T> extends ValidationBuilder<T, K> {
  constructor(field: K, validationState: ValidationState<T>) {
    super(field, validationState)
  }

  range(start: number, end: number, message?: string): this {
    this.check((_, __, value) => Number(value) >= start && Number(value) <= end, message)
    return this
  }
}

export type ForElementCallback<T, K extends keyof T> = (caseTypes: TypeResolver<T, K>) => void
export class ArrayValidationBuilder<T, K extends keyof T> extends ValidationBuilder<T, K> {
  constructor(field: K, validationState: ValidationState<T>) {
    super(field, validationState)
  }

  forElement(callback: ForElementCallback<T, K>): this {
    callback(new TypeResolver<T, K>(this.fieldName, this.validationState))
    return this
  }
}

export class EntityValidationBuilder<T, K extends keyof T> extends ValidationBuilder<T, K> {
  constructor(field: K, validationState: ValidationState<T>) {
    super(field, validationState)
  }

  // use<TValidator extends ObjectValidator<T>>(type: new (state: StateObject) => TValidator): this {
  //   // const state = new StateObject()
  //   // new type(state).validate(this.validatorState.item as T)
  //   return this
  // }
}

export class DateTimeValidationBuilder<T, K extends keyof T> extends ValidationBuilder<T, K> {
  constructor(field: K, validationState: ValidationState<T>) {
    super(field, validationState)
  }

  // use<TValidator extends ObjectValidator<T>>(type: new (state: StateObject) => TValidator): this {
  //   // const state = new StateObject()
  //   // new type(state).validate(this.validatorState.item as T)
  //   return this
  // }
}

const operationNames = ['equals', 'notEquals', 'weakEquals', 'more', 'less', 'moreOrEquals', 'lessOrEquals'] as const
export type CompareType = typeof operationNames[number]
const compare = (obj1: unknown, obj2: unknown, type: CompareType): boolean => {
  const operationList = [
    () => obj1 === obj2,
    () => obj1 !== obj2,
    () => obj1 == obj2, // eslint-disable-line eqeqeq
    () => obj1 > obj2,
    () => obj1 < obj2,
    () => obj1 >= obj2,
    () => obj1 <= obj2,
  ]
  const index = operationNames.indexOf(type)
  if (index === -1) throw new Error("Compare. operation isn't found")
  return operationList[index]()
}

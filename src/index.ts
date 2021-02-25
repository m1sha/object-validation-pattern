interface StackItem {
  readonly key: string
}

class RuleStack {
  readonly items: StackItem[]

  constructor() {
    this.items = []
  }

  push(item: StackItem) {
    this.items.push(item)
  }
}

interface ValidatorState {
  readonly item: unknown
  readonly stack: RuleStack
  readonly state: StateObject
}

type RuleStackOperationCallback = () => boolean

class RuleStackItem implements StackItem {
  private done?: boolean
  private callback: RuleStackOperationCallback
  readonly key: string
  readonly message: string

  constructor(key: string, callback: RuleStackOperationCallback, message: string) {
    this.key = key
    this.callback = callback
    this.message = message
  }

  get result(): boolean {
    if (this.done === undefined || typeof this.done === 'undefined') {
      this.done = this.callback()
    }

    return this.done
  }
}

class BlockStackItem implements StackItem {
  readonly isBlock: boolean
  readonly key: string

  constructor(key: string, block: boolean) {
    this.key = key
    this.isBlock = block
  }
}

export abstract class ObjectValidator<T> {
  constructor(state: StateObject){
    this.state = state
  }

  protected abstract setRules(rules: RulesBuilder<T>): void
  readonly state: StateObject

  validate(item: T): void {
    return this.internalValidate(item)
  }

  validateField<K extends keyof T>(item: T, fieldName: K): void {
    this.internalValidate(item, (p) => p === fieldName)
  }

  private internalValidate(item: T, callback?: ValidateFieldCallback): void {
    const stack = new RuleStack()
    const builder = new RulesBuilder<T>({item, stack, state: this.state })
    this.setRules(builder)

    let key = null
    for (let index = 0; index < stack.items.length; index++) {
      const current = stack.items[index]
      if (callback && !callback(current.key)) {
        continue
      }

      if (key && current.key === key) {
        continue
      }

      if (current instanceof RuleStackItem) {
        const text = current.result ? '' : current.message
        const si = this.state.getValue(current.key)
        if (si) si.setValue(!text, text || '')
      }

      if (current instanceof BlockStackItem) {
        const rule = stack.items[index - 1] as RuleStackItem
        if (rule && !rule.result && current.isBlock) {
          break
        }

        if (rule && !rule.result && !current.isBlock) {
          key = rule.key
        }
      }
    }
  }
}

type ValidateFieldCallback = (fieldName: string) => boolean

export class ValidationResult {
  readonly items: Record<string, StateItem>
  constructor(){
    this.items = {}
  }
}

export class StateItem {
  valid?: boolean
  text: string

  constructor() {
    this.valid = undefined
    this.text = ''
  }

  setValue(valid: boolean, text: string): void {
    this.valid = valid
    this.text = text
  }
}

export class StateObject {
  readonly items: Record<string, StateItem>
  constructor(){
    this.items = {}
  }

  clear(): void {
    for (const key in this) {
      if ({}.hasOwnProperty.call(this, key)) {
        const item = this[key]
        if (item instanceof StateItem) {
          item.valid = undefined
          item.text = ''
        }
      }
    }
  }

  get isValid(): boolean {
    for (const [, value] of Object.entries(this.items)) {
      if (value instanceof StateItem && value.valid === false) return false
    }
    return true
  }

  getValue(name: string): StateItem | null {
    return this.items[name]
  }

  setValue(name: string, item: StateItem): void {
    let current = this.items[name]
    if (!current) {
      current = this.items[name] = new StateItem()
    }

    current.valid = item.valid
    current.valid = item.valid
  }

  // static create<R>(type: new () => R): StateObject {
  //   const result = new StateObject()
  //   for (const [key] of Object.entries(new type())){
  //     result.items[key] = new StateItem()
  //   }
  //   return result
  // }
}

export type FieldValidationCallback<T> = (obj: T) => boolean
abstract class FieldValidationBuilder<T, K> {
  protected readonly fieldName: K
  protected readonly validatorState: ValidatorState
  get fieldNameString(): string {
    if (typeof this.fieldName === 'string')
      return this.fieldName
    throw new Error(`${typeof this.fieldName}`)
  }

  constructor(field: K, validator: ValidatorState) {
    this.fieldName = field
    this.validatorState = validator
  }

  check(action: FieldValidationCallback<T>, message: string): this {
    const { item, stack } = this.validatorState
    stack.push(new RuleStackItem(this.fieldNameString, () => action(item as T), message))
    return this
  }

  // compareWithField<K extends keyof T>(fieldName: K, comparer: CompareType) {
  //   return this
  // }

  // null(message?: string): this {
  //   return this
  // }

  breakIf(): this {
    return this
  }

  break(): this {
    this.validatorState.stack.items.push(new BlockStackItem(this.fieldNameString, true))
    return this
  }

  breakChain(): this {
    this.validatorState.stack.items.push(new BlockStackItem(this.fieldNameString, false))
    return this
  }
}

class StringFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
  constructor(field: K, validator: ValidatorState) {
    super(field, validator)
  }

  notEmpty(message?: string): this {
    return this.check(obj=> !!obj[this.fieldNameString], message || `${this.fieldNameString}: is empty`)
  }

  maxLength(num: number, message?: string): this {
    const { item, stack } = this.validatorState
    const value = item[this.fieldNameString] as string
    stack.push(
      new RuleStackItem(
        this.fieldNameString,
        () => value.length < num,
        message || `${this.fieldNameString}: max length is ${num}`,
      ),
    )
    return this
  }
}

class NumberFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
  constructor(field: K, validator: ValidatorState) {
    super(field, validator)
  }

  range(start: number, end: number, message?: string): this {
    const { item, stack } = this.validatorState
    const value = item[this.fieldNameString] as number
    stack.push(
      new RuleStackItem(
        this.fieldNameString,
        () => value >= start && value <= end,
        message || `${this.fieldNameString}: out of range (${start}:${end})`,
      ),
    )
    return this
  }
}

export type ForElementCallback<T, K> = (caseTypes: CaseTypes<T, K>) => void
class ArrayFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
  constructor(field: K, validator: ValidatorState) {
    super(field, validator)
  }

  forElement(callback: ForElementCallback<T, K>) {
    callback(new CaseTypes<T, K>(this.fieldName, this.validatorState))
  }
}

class EntityFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
  constructor(field: K, validator: ValidatorState) {
    super(field, validator)
  }

  use<TValidator extends ObjectValidator<T>>(type: new () => TValidator): this {
    new type().validate(this.validatorState.item as T)
    return this
  }
}

export class CaseTypes<T, K> {
  private readonly field: K
  private validatorState: ValidatorState
  constructor(field: K, validator: ValidatorState) {
    this.field = field
    this.validatorState = validator
    this.validatorState.state.setValue(field.toString(), new StateItem())
  }

  isString(): StringFieldValidationBuilder<T, K> {
    return new StringFieldValidationBuilder<T, K>(this.field, this.validatorState)
  }

  isNumber(): NumberFieldValidationBuilder<T, K> {
    return new NumberFieldValidationBuilder<T, K>(this.field, this.validatorState)
  }

  isArray(): ArrayFieldValidationBuilder<T, K> {
    return new ArrayFieldValidationBuilder<T, K>(this.field, this.validatorState)
  }

  isEntity(): EntityFieldValidationBuilder<T, K> {
    return new EntityFieldValidationBuilder<T, K>(this.field, this.validatorState)
  }
}

export class RulesBuilder<T> {
  private validatorState: ValidatorState
  constructor(validatorState: ValidatorState) {
    this.validatorState = validatorState
  }

  add<K extends keyof T>(fieldName: K): CaseTypes<T, K> {
    return new CaseTypes<T, K>(fieldName, this.validatorState)
  }
}

// type CompareType = 'equal' | 'more' | 'less'

// function ddd(a: CompareType) {}
// ddd('equal')

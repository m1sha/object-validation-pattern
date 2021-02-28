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
type RuleStackOperationCallbackAsync = () => Promise<boolean>
class RuleStackItem implements StackItem {
  private done?: boolean
  private callback: RuleStackOperationCallback | RuleStackOperationCallbackAsync
  readonly key: string
  readonly message: string

  constructor(key: string, callback: RuleStackOperationCallback | RuleStackOperationCallbackAsync, message: string) {
    this.key = key
    this.callback = callback
    this.message = message
  }

  async result(): Promise<boolean> {
    if (this.done === undefined || typeof this.done === 'undefined') {
      const result = this.callback()
      if (result instanceof Promise){
        this.done = await result
      }

      if (typeof result === "boolean"){
        this.done = result
      }
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

type ValidateFieldCallback = (fieldName: string) => boolean
export abstract class ObjectValidator<T> {
  constructor(state: StateObject) {
    this.state = state
  }

  protected abstract setRules(rules: RulesBuilder<T>): void
  readonly state: StateObject

  validate(item: T): Promise<void> {
    return this.internalValidate(item)
  }

  validateField<K extends keyof T>(item: T, fieldName: K): Promise<void> {
    return this.internalValidate(item, (p) => p === fieldName)
  }

  private async internalValidate(item: T, callback?: ValidateFieldCallback): Promise<void> {
    const stack = new RuleStack()
    const builder = new RulesBuilder<T>({ item, stack, state: this.state })
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
        const valid = await current.result()
        const text =  valid ? "" : format(current.message, item, current.key, item[current.key])
        this.state.getValue(current.key).setValue(valid, text)
      }

      if (current instanceof BlockStackItem) {
        const rule = stack.items[index - 1] as RuleStackItem
        const value = await rule.result()
        if (rule && !value && !current.isBlock) {
          key = rule.key
        }

        if (rule && !value && current.isBlock) {
          break
        }
      }
    }
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

export class StateObject { // TODO StateObject<T>
  readonly items: Record<string, StateItem>
  constructor() {
    this.items = {}
  }

  clear(): void {
    for (const key in this.items) {
      if ({}.hasOwnProperty.call(this.items, key)){
        const item = this.items[key]
        item.valid = undefined
        item.text = ''
      }
    }
  }

  isValid(): boolean {
    for (const [, value] of Object.entries(this.items)) {
      if (value instanceof StateItem && value.valid === false) return false
    }
    return true
  }

  // TODO StateObject<T>.getValue<K extends keyof T>(name: K): StateItem (Not nullable)
  getValue(name: string): StateItem | null {
    return this.items[name]
  }

  /** @internal */
  setValue(name: string, item: StateItem): void {
    let current = this.items[name]
    if (!current) {
      current = this.items[name] = new StateItem()
    }

    current.valid = item.valid
    current.valid = item.valid
  }
}

export type FieldValidationCallback<T, K, V> = (obj: T, key: K, value: V) => boolean
export type FieldValidationCallbackAsync<T, K, V> = (obj: T, key: K, value: V) => Promise<boolean>
abstract class FieldValidationBuilder<T, K> {
  protected readonly fieldName: K
  protected readonly validatorState: ValidatorState
  fieldNameString(): string {
    return this.fieldName.toString()
  }

  constructor(field: K, validator: ValidatorState) {
    this.fieldName = field
    this.validatorState = validator
  }

  check<V>(action: FieldValidationCallback<T, K, V>, message: string): this {
    const { item, stack } = this.validatorState
    const value = item[this.fieldName] as V
    stack.push(new RuleStackItem(this.fieldNameString(), () => action(item as T, this.fieldName, value), message))
    return this
  }

  checkAsync<V>(action: FieldValidationCallbackAsync<T, K, V>, message: string): this {
    const { item, stack } = this.validatorState
    const value = item[this.fieldName] as V
    stack.push(new RuleStackItem(this.fieldNameString(), async () => await action(item as T, this.fieldName, value), message))
    return this
  }

  compareWithField<K2 extends keyof T>(fieldName: K2, comparer: CompareType, message: string) {
    return this.check((obj, _, value) => compare(value, obj[fieldName], comparer), message)
  }

  fieldIs<K2 extends keyof T, V>(fieldName: K2, comparer: CompareType, value?: V, message?: string) {
    return this.check(obj => compare(value, obj[fieldName], comparer), message)
  }

  // null(message?: string): this {
  //   return this
  // }

  // breakIf(): this {
  //   return this
  // }

  break(): this {
    this.validatorState.stack.items.push(new BlockStackItem(this.fieldNameString(), true))
    return this
  }

  breakChain(): this {
    this.validatorState.stack.items.push(new BlockStackItem(this.fieldNameString(), false))
    return this
  }
}

export class StringFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
  constructor(field: K, validator: ValidatorState) {
    super(field, validator)
  }

  notEmpty(message?: string): this {
    return this.check((_, __, value) => !!value, message || "$name: is empty")
  }

  empty(message?: string): this {
    return this.check((_, __, value) => !value, message || "$name: isn't empty")
  }

  maxLength(num: number, message?: string): this {
    return this.check((_, __, value) => String(value).length <= num , message || `$name: isn't empty`)
  }

  minLength(num: number, message?: string): this {
    return this.check((_, __, value) => String(value).length >= num , message || `$name: isn't empty`)
  }
}

export class NumberFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
  constructor(field: K, validator: ValidatorState) {
    super(field, validator)
  }

  range(start: number, end: number, message?: string): this {
    const { item, stack } = this.validatorState
    const value = item[this.fieldNameString()] as number
    stack.push(
      new RuleStackItem(
        this.fieldNameString(),
        () => value >= start && value <= end,
        message || `$name: out of range (${start}:${end})`,
      ),
    )
    return this
  }
}

export type ForElementCallback<T, K> = (caseTypes: CaseTypes<T, K>) => void
export class ArrayFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
  constructor(field: K, validator: ValidatorState) {
    super(field, validator)
  }

  forElement(callback: ForElementCallback<T, K>): this {
    callback(new CaseTypes<T, K>(this.fieldName, this.validatorState))
    return this
  }
}

export class EntityFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
  constructor(field: K, validator: ValidatorState) {
    super(field, validator)
  }

  // use<TValidator extends ObjectValidator<T>>(type: new (state: StateObject) => TValidator): this {
  //   // const state = new StateObject()
  //   // new type(state).validate(this.validatorState.item as T)
  //   return this
  // }
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

const operationNames = ["equals", "notEquals", "weakEquals", "more", "less", "moreOrEquals", "lessOrEquals" ] as const
export type CompareType = typeof operationNames[number]
const compare = (obj1: unknown, obj2: unknown, type: CompareType): boolean => {
  const operationList = [
    ()=> obj1 === obj2,
    ()=> obj1 !== obj2,
    ()=> obj1 ==  obj2, // eslint-disable-line eqeqeq
    ()=> obj1 >   obj2,
    ()=> obj1 <   obj2,
    ()=> obj1 >=  obj2,
    ()=> obj1 <=  obj2
  ]
  const index = operationNames.indexOf(type)
  if (index === -1) throw new Error("Compare. operation isn't found")
  return operationList[index]()
}

const format = <T>(message: string, obj:T, key: string, value: unknown): string =>{
  return message
    .replace(/\$name/, key)
    .replace(/\$value/, value ? value.toString(): "undefined")
}
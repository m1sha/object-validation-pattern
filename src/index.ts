interface IValidator {
    readonly item: unknown
    readonly stack: RuleStack
}

class RuleStack {
    readonly items: IStackItem[]

    constructor(){
        this.items = []
    }

    push(item: IStackItem){
        this.items.push(item)
    }
}

interface IStackItem {
    readonly key: string
}

type RuleStackOperationCallback = () => boolean

class RuleStackItem implements IStackItem {
    private _result?: boolean
    private callback: RuleStackOperationCallback
    readonly key: string
    readonly message: string

    constructor(key: string, callback: RuleStackOperationCallback, message: string){
        this.key = key
        this.callback = callback
        this.message = message
    }

    get result(): boolean{
        if (this._result === undefined || typeof this._result === "undefined"){
            this._result = this.callback()
        }
        return this._result
    }
}

class BlockStackItem implements IStackItem {
    readonly isBlock: boolean
    readonly key: string
    constructor(key: string, block: boolean){
        this.key = key
        this.isBlock = block
    }
}
  
export abstract class ObjectValidator<T> {
    //readonly state: StateObject
  
    constructor(){
       // this.state = this.createState()
    }

    protected abstract setRules(rules: RulesBuilder<T>): void
    protected abstract createState(): StateObject
    
    validate(item: T): StateObject {
       return this._validate(item)
    }
  
    validateField<K extends keyof T>(item: T, fieldName: K){
        this._validate(item, p => p === fieldName)
    }
  
    // protected addState(itemName: string){
    //     StateReflector.createProperty(this.state, itemName)
    // }

    private _validate(item: T, callback?: ValidateFieldCallback): StateObject{
        const state = this.createState()
        
        const stack = new RuleStack()
        const builder = new RulesBuilder<T>({item, stack})
        this.setRules(builder)
        
        let key = null
        for (let index = 0; index < stack.items.length; index++) {
            const item = stack.items[index]
            if (callback && !callback(item.key)){
                continue
            }

            if (key && item.key === key){
                continue
            }

            if (item instanceof RuleStackItem){
                const rule = item as RuleStackItem
                const text = rule.result ? "": rule.message
                state[rule.key].setValue(!text, text || '')
            }

            if (item instanceof BlockStackItem){
                const block = item as BlockStackItem
                const rule = stack.items[index - 1] as RuleStackItem
                if (rule && !rule.result && block.isBlock){
                    break
                }

                if (rule && !rule.result && !block.isBlock){
                    key = rule.key
                }
            }
        }

        return state
    }
}

type ValidateFieldCallback = (fieldName: string) => boolean
  
export class ValidationState{
    static create(obj: any): StateObject{
        const result = new StateObject()
        for (const key in obj) {
            StateReflector.createProperty(result, key)
        }
  
        return result
    }
  
    static formType<T>(type: {new(): T;}): StateObject{
        return this.create(new type())
    }
}
  
class StateReflector {
    static createProperty(state: StateObject, key: string){
      const value = new StateItem()
      Object.defineProperty(state, key, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
}
  
export class StateItem{
    valid: Boolean;
    text: string;
  
    constructor(){
      this.valid = false;
      this.text = '';
    }
  
    setValue(valid: Boolean, text: string){
      this.valid = valid;
      this.text = text;
    }
}
  
export class StateObject{
    clear(){
      for (const key in this){
        const item = this[key];
        if (!(item as Object).hasOwnProperty("valid"))
          continue;
        item["valid"] = undefined;
        item["text"] = '';
      }
    }
    
    get isValid(): boolean{
      for (const key in this){
        const item = this[key]
        if (!(item as Object).hasOwnProperty("valid"))
          continue
        if (item["valid"] === false) return false
      }
      return true
    }
    
    static create<T>(type: {new(): T;}): StateObject{
        return ValidationState.formType(type)
    }
}

abstract class FieldValidationBuilder<K> {
    protected readonly field:  K
    protected readonly validator: IValidator

    constructor(field: K, validator: IValidator){
        this.field = field
        this.validator = validator
    }

    null(message?: string): this{
        return this
    }

    breakIf(): this {
        return this
    }

    break(): this {
        this.validator.stack.items.push(new BlockStackItem(this.field.toString(), true))
        return this
    }

    breakChain(): this {
        this.validator.stack.items.push(new BlockStackItem(this.field.toString(), false))
        return this
    }
}


class StringFieldValidationBuilder<K> extends FieldValidationBuilder<K> {
    constructor(field: K, validator: IValidator){
       super(field, validator)
    }

    notEmpty(message?: string): this{
        const { item, stack } = this.validator
        const value = item[ this.field ]
        stack.push(new RuleStackItem(this.field.toString(), () => !!value, message|| `${this.field}: is empty`))
        return this
    }

    maxLength(num: number,message?: string): this {
        const { item, stack } = this.validator
        const value = item[ this.field ] as string
        stack.push(new RuleStackItem(this.field.toString(), () => value.length < num, message || `${this.field}: max length is ${num}`))
        return this
    }

}

class NumberFieldValidationBuilder<K> extends FieldValidationBuilder<K> {
    constructor(field: K, validator: IValidator){
        super(field, validator)
    }

    range(start: number, end: number, message?: string): this{
        const { item, stack } = this.validator
        const value = item[ this.field ] as number
        stack.push(new RuleStackItem(this.field.toString(), () => value >= start  && value <= end, message || `${this.field}: out of range (${start}:${end})`))
        return this
    }
}

export type ForElementCallback<K> = (caseTypes: CaseTypes<K>) => void
class ArrayFieldValidationBuilder<K> extends FieldValidationBuilder<K> {
    constructor(field: K, validator: IValidator){
        super(field, validator)
    }

    forElement(callback: ForElementCallback<K>){
        callback(new CaseTypes<K>(this.field, this.validator))
    }
}

class EntityFieldValidationBuilder<K> extends FieldValidationBuilder<K> {
    constructor(field: K, validator: IValidator){
        super(field, validator)
    }

    use<T>(type: {new(): T;}): this{
        return this
    }
}


export class CaseTypes<K> {
    private readonly field:  K
    private validator: IValidator
    constructor(field: K, validator: IValidator){
        this.field = field
        this.validator = validator
    }

    string(){
        return new StringFieldValidationBuilder(this.field, this.validator)
    }

    number(){
        return new NumberFieldValidationBuilder(this.field, this.validator)
    }

    array() {
        return new ArrayFieldValidationBuilder(this.field, this.validator)
    }

    entity(){
        return new EntityFieldValidationBuilder(this.field, this.validator)
    }
}

export class RulesBuilder<T>{
    private validator: IValidator
    constructor(validator: IValidator){
        this.validator = validator
    }

    add<K extends keyof T>(fieldName: K): CaseTypes<K>{
        return new CaseTypes<K>(fieldName, this.validator)
    }

}
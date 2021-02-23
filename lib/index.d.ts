interface IStackItem {
    readonly key: string;
}
declare class RuleStack {
    readonly items: IStackItem[];
    constructor();
    push(item: IStackItem): void;
}
interface IValidator {
    readonly item: unknown;
    readonly stack: RuleStack;
}
export declare abstract class ObjectValidator<T> {
    protected abstract setRules(rules: RulesBuilder<T>): void;
    protected abstract createState(): StateObject;
    validate(item: T): StateObject;
    validateField<K extends keyof T>(item: T, fieldName: K): StateObject;
    private _validate;
}
export declare class ValidationState {
    static create(obj: any): StateObject;
    static formType<T>(type: {
        new (): T;
    }): StateObject;
}
export declare class StateItem {
    valid: Boolean;
    text: string;
    constructor();
    setValue(valid: Boolean, text: string): void;
}
export declare class StateObject {
    clear(): void;
    get isValid(): boolean;
    static create<T>(type: {
        new (): T;
    }): StateObject;
}
export declare type FieldValidationCallback<T> = (obj: T) => boolean;
declare abstract class FieldValidationBuilder<K> {
    protected readonly field: K;
    protected readonly validator: IValidator;
    constructor(field: K, validator: IValidator);
    check<T>(action: FieldValidationCallback<T>, message: string): this;
    null(message?: string): this;
    breakIf(): this;
    break(): this;
    breakChain(): this;
}
declare class StringFieldValidationBuilder<K> extends FieldValidationBuilder<K> {
    constructor(field: K, validator: IValidator);
    notEmpty(message?: string): this;
    maxLength(num: number, message?: string): this;
}
declare class NumberFieldValidationBuilder<K> extends FieldValidationBuilder<K> {
    constructor(field: K, validator: IValidator);
    range(start: number, end: number, message?: string): this;
}
export declare type ForElementCallback<K> = (caseTypes: CaseTypes<K>) => void;
declare class ArrayFieldValidationBuilder<K> extends FieldValidationBuilder<K> {
    constructor(field: K, validator: IValidator);
    forElement(callback: ForElementCallback<K>): void;
}
declare class EntityFieldValidationBuilder<K> extends FieldValidationBuilder<K> {
    constructor(field: K, validator: IValidator);
    use<T>(type: {
        new (): T;
    }): this;
}
export declare class CaseTypes<K> {
    private readonly field;
    private validator;
    constructor(field: K, validator: IValidator);
    string(): StringFieldValidationBuilder<K>;
    number(): NumberFieldValidationBuilder<K>;
    array(): ArrayFieldValidationBuilder<K>;
    entity(): EntityFieldValidationBuilder<K>;
}
export declare class RulesBuilder<T> {
    private validator;
    constructor(validator: IValidator);
    add<K extends keyof T>(fieldName: K): CaseTypes<K>;
}
export {};

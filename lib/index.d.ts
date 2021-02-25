interface StackItem {
    readonly key: string;
}
declare class RuleStack {
    readonly items: StackItem[];
    constructor();
    push(item: StackItem): void;
}
interface ValidatorState {
    readonly item: unknown;
    readonly stack: RuleStack;
    readonly state: StateObject;
}
export declare abstract class ObjectValidator<T> {
    constructor(state: StateObject);
    protected abstract setRules(rules: RulesBuilder<T>): void;
    readonly state: StateObject;
    validate(item: T): void;
    validateField<K extends keyof T>(item: T, fieldName: K): void;
    private internalValidate;
}
export declare class ValidationResult {
    readonly items: Record<string, StateItem>;
    constructor();
}
export declare class StateItem {
    valid?: boolean;
    text: string;
    constructor();
    setValue(valid: boolean, text: string): void;
}
export declare class StateObject {
    readonly items: Record<string, StateItem>;
    constructor();
    clear(): void;
    get isValid(): boolean;
    getValue(name: string): StateItem | null;
    setValue(name: string, item: StateItem): void;
}
export declare type FieldValidationCallback<T> = (obj: T) => boolean;
declare abstract class FieldValidationBuilder<T, K> {
    protected readonly fieldName: K;
    protected readonly validatorState: ValidatorState;
    get fieldNameString(): string;
    constructor(field: K, validator: ValidatorState);
    check(action: FieldValidationCallback<T>, message: string): this;
    breakIf(): this;
    break(): this;
    breakChain(): this;
}
declare class StringFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
    constructor(field: K, validator: ValidatorState);
    notEmpty(message?: string): this;
    maxLength(num: number, message?: string): this;
}
declare class NumberFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
    constructor(field: K, validator: ValidatorState);
    range(start: number, end: number, message?: string): this;
}
export declare type ForElementCallback<T, K> = (caseTypes: CaseTypes<T, K>) => void;
declare class ArrayFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
    constructor(field: K, validator: ValidatorState);
    forElement(callback: ForElementCallback<T, K>): void;
}
declare class EntityFieldValidationBuilder<T, K> extends FieldValidationBuilder<T, K> {
    constructor(field: K, validator: ValidatorState);
    use<TValidator extends ObjectValidator<T>>(type: new () => TValidator): this;
}
export declare class CaseTypes<T, K> {
    private readonly field;
    private validatorState;
    constructor(field: K, validator: ValidatorState);
    isString(): StringFieldValidationBuilder<T, K>;
    isNumber(): NumberFieldValidationBuilder<T, K>;
    isArray(): ArrayFieldValidationBuilder<T, K>;
    isEntity(): EntityFieldValidationBuilder<T, K>;
}
export declare class RulesBuilder<T> {
    private validatorState;
    constructor(validatorState: ValidatorState);
    add<K extends keyof T>(fieldName: K): CaseTypes<T, K>;
}
export {};

import { ObjectValidator, RulesBuilder, StateObject } from '../src/index'

interface TestDTO {
    name: string
    value: number
    // values: string[]
    // inner: TestDTO
}

class TestObjectValidator extends ObjectValidator<TestDTO> {
    constructor(state: StateObject){
        super(state)
    }

    protected setRules(rules: RulesBuilder<TestDTO>): void {
        rules
            .add("name")
            .isString()
            .notEmpty().breakChain()
            // .maxLength(10)
            .check(p=> p.name.length < 50, "length")

        rules
            .add("value")
            .isNumber()
            .range(5, 10)

        // rules
        //     .add("values")
        //     .array()
        //     .forElement(p => p.string().maxLength(12))

        // rules
        //     .add("inner")
        //     .entity()
        //     .use(TestObjectValidator)
    }
}

test("validator test", () => {
    const entity = {
        name:  "",
        value:  5
    }

    const state = new StateObject()
    const validator = new TestObjectValidator(state)
    validator.validate(entity)
    expect(state.getValue("name")).toEqual({ valid: false, text: "name: is empty" })
    expect(state.getValue("value")).toEqual({ valid: true, text: "" })
    expect(state.isValid).toBeFalsy()
})

test("validator test good", () => {
    const entity = {
        name:  "dd222",
        value:  5
    }

    const state = new StateObject()
    const validator = new TestObjectValidator(state)
    validator.validate(entity)
    expect(state.isValid).toBeTruthy()
})
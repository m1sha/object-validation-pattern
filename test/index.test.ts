import { ObjectValidator, RulesBuilder, StateObject } from '../src/index'

class TestDTO {
    name: string
    value: number
    // values: string[]
    // inner: TestDTO

    constructor() {
        this.name = ""
        this.value = 0
        //  this.values = []
        // this.inner = null
    }
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
    const entity = new TestDTO()
    entity.name = ""
    entity.value = 5
    const state = StateObject.create(TestDTO)
    const validator = new TestObjectValidator(state)
    validator.validate(entity)
    expect(state.getValue("name")).toEqual({ valid: false, text: "name: is empty" })
    expect(state.getValue("value")).toEqual({ valid: true, text: "" })
    expect(state.isValid).toBeFalsy()
})

test("validator test good", () => {
    const entity = new TestDTO()
    entity.name = "dd222"
    entity.value = 5
    const state = StateObject.create(TestDTO)
    const validator = new TestObjectValidator(state)
    validator.validate(entity)
    expect(state.isValid).toBeTruthy()
})
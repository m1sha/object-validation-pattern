import { ObjectValidator, RulesBuilder, StateObject } from "../src/index"

class TestDTO {
    name: string
    value: number
    values: string[]
    inner: TestDTO

    constructor(){
        this.name = ""
        this.value = 0
        this.values = []
        this.inner = null
    }
}

class TestObjectValidator extends ObjectValidator<TestDTO> {
    protected setRules(rules: RulesBuilder<TestDTO>): void {
        rules
            .add("name")
            .string()
            .notEmpty()
            .breakChain()
            .maxLength(10)

        rules
            .add("value")
            .number()            
            .range(5, 10)
        
        // rules
        //     .add("values")
        //     .array()
        //     .forElement(p => p.string().maxLength(12))

        rules
            .add("inner")
            .entity()
            .use(TestObjectValidator)
    }

    protected createState(): StateObject {
        return StateObject.create(TestDTO)
    }
}

test("validator test", () => {
    const entity = new TestDTO()
    entity.name = null
    entity.value = 5
    const validator = new TestObjectValidator()
    var result = validator.validate(entity)
    expect(result["name"]).toEqual({ valid: false, text: "name: is empty" })
    expect(result["value"]).toEqual({ valid: true, text: "" })
    expect(result.isValid).toBeFalsy()
})
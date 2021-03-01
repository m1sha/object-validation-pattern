import { ObjectValidator, RulesBuilder, StateObject, } from '../src/index'

interface TestSubObject {
    name: string
    value: number
}

interface TestData {
    value: TestSubObject
}

class TestValidator extends ObjectValidator<TestData> {
    protected setRules(rules: RulesBuilder<TestData>): void {
        rules.add("value").isEntity()
    }
}

test("array member test", async () => {
    const stateModal = new StateObject<TestData>()
    const validator = new TestValidator(stateModal)
    await validator.validate({value: {name: "name", value: 1}})
    expect(true).toBeTruthy()
});
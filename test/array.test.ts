import { ObjectValidator, RulesBuilder, StateObject, } from '../src/index'

interface TestData {
    value: number[]
}

class TestValidator extends ObjectValidator<TestData> {
    protected setRules(rules: RulesBuilder<TestData>): void {
        rules.add("value").isArray().forElement(p=>{
            p.isNumber()// .isPositive() // FIXME .forElement(p => p.isNumber().isPositive())
        })
    }
}

test("array member test", async () => {
    const stateModal = new StateObject()
    const validator = new TestValidator(stateModal)
    await validator.validate({value: [1, 2, 4]})
    expect(true).toBeTruthy()
});
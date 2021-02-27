import { ObjectValidator, RulesBuilder, StateObject } from '../src/index'
import "../src/extensions"

interface TestData{
    value: number
}

class TestDataValidator extends ObjectValidator<TestData>{
    protected setRules(rules: RulesBuilder<TestData>): void {
        rules.add("value").isNumber().isInteger().isNegative()
    }
}

test("value should be integer & negative", async ()=>{
    const stateModel = new StateObject()
    const validator = new TestDataValidator(stateModel)
    await validator.validate({value: -1})
    expect(stateModel.isValid()).toBeTruthy()
})

test("value should be not integer & negative", async ()=>{
    const stateModel = new StateObject()
    const validator = new TestDataValidator(stateModel)
    await validator.validate({value: .1})
    expect(stateModel.isValid()).toBeFalsy()
})
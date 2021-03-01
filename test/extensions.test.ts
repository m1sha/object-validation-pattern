import { ObjectValidator, RulesBuilder, StateObject } from '../src/index'
import "../src/extensions"

interface TestData{
    negative: number
    positive: number
    zero: number
}

class TestDataValidator extends ObjectValidator<TestData>{
    protected setRules(rules: RulesBuilder<TestData>): void {
        rules.add("negative").isNumber().isInteger().isNegative()
        rules.add("positive").isNumber().isInteger().isPositive()
        rules.add("zero").isNumber().isInteger().isZero()
    }
}

test("value should be valid", async ()=>{
    const stateModel = new StateObject<TestData>()
    const validator = new TestDataValidator(stateModel)
    await validator.validate({negative: -1, positive: 1, zero: 0})
    expect(stateModel.isValid()).toBeTruthy()
})

test("value should be not valid", async ()=>{
    const stateModel = new StateObject<TestData>()
    const validator = new TestDataValidator(stateModel)
    await validator.validate({negative: .1, positive: -1, zero: 2})
    expect(stateModel.isValid()).toBeFalsy()
})
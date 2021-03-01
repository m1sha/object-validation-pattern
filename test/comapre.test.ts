import { ObjectValidator, RulesBuilder, StateObject, } from '../src/index'
import type {CompareType} from '../src/index'

interface TestData {
    value: number
    name: string
}

class TestObjectValidator extends ObjectValidator<TestData> {
    private comparer: CompareType
    constructor(state: StateObject<TestData>, comparer: CompareType){
        super(state)
        this.comparer = comparer
    }

    protected setRules(rules: RulesBuilder<TestData>): void {
        rules
            .add("name")
            .isString()
            .fieldIs("value", this.comparer, 0, "some error")
    }
}

test("compare test", async ()=>{
    const stateModal = new StateObject<TestData>()
    let validator = new TestObjectValidator(stateModal, "equals")
    await validator.validateField({name: "", value: 0}, "name")
    expect(stateModal.getValue("name").valid).toBeTruthy()

    stateModal.clear()
    validator = new TestObjectValidator(stateModal, "weakEquals")
    await validator.validateField({name: "", value: 0}, "name")
    expect(stateModal.getValue("name").valid).toBeTruthy()

    stateModal.clear()
    validator = new TestObjectValidator(stateModal, "moreOrEquals")
    await validator.validateField({name: "", value: 0}, "name")
    expect(stateModal.getValue("name").valid).toBeTruthy()

    stateModal.clear()
    validator = new TestObjectValidator(stateModal, "lessOrEquals")
    await validator.validateField({name: "", value: 0}, "name")
    expect(stateModal.getValue("name").valid).toBeTruthy()

    stateModal.clear()
    validator = new TestObjectValidator(stateModal, "less")
    await validator.validateField({name: "", value: 0}, "name")
    expect(stateModal.getValue("name").valid).toBeFalsy()

    stateModal.clear()
    validator = new TestObjectValidator(stateModal, "more")
    await validator.validateField({name: "", value: 0}, "name")
    expect(stateModal.getValue("name").valid).toBeFalsy()

    stateModal.clear()
    validator = new TestObjectValidator(stateModal, "notEquals")
    await validator.validateField({name: "", value: 0}, "name")
    expect(stateModal.getValue("name").valid).toBeFalsy()

    try{
        stateModal.clear()
        const operationName = "foo"
        validator = new TestObjectValidator(stateModal, operationName as CompareType)
        await validator.validateField({name: "", value: 0}, "name")
    }
    catch(e){
        if (e instanceof Error) expect(e.message).toEqual("Compare. operation isn't found")
    }
})
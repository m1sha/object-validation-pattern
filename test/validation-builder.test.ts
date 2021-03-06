import { StateModel } from "../src/state-model"
import { StringValidationBuilder, NumberValidationBuilder, DateTimeValidationBuilder } from "../src/validation-builder"
import { ValidationQueue } from "../src/validation-queue"
import "../src/extensions"

test("builder", ()=>{
    const target = {
        name: "",
        value: 0,
        date: new Date()
    }
    const validationState = {
        queue: new ValidationQueue(),
        stateModel: new StateModel<typeof target>(),
        target
    }
    new StringValidationBuilder("name", validationState).notEmpty().maxLength(1)
    new NumberValidationBuilder("value", validationState).isPositive()
    new DateTimeValidationBuilder("date", validationState).fieldIs("date", "equals", new Date())

    let result = validationState.queue.pop()
    expect(result.items.length).toEqual(2)

    result = validationState.queue.pop()
    expect(result.items.length).toEqual(1)

    result = validationState.queue.pop()
    expect(result.items.length).toEqual(1)

    result = validationState.queue.pop()
    expect(result).toEqual(undefined)
})
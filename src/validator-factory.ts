import { ObjectValidator } from './object-validator'
import { RulesBuilder } from './rules-builder'
import { StateModel } from './state-model'

export type RulesSetterCallback<T> = (rules: RulesBuilder<T>)=>void
class CustomObjectValidator<T> extends ObjectValidator<T> {
    private readonly setter: RulesSetterCallback<T>
    constructor(state: StateModel<T>, setter: RulesSetterCallback<T>) {
      super(state)
      this.setter = setter
    }

    protected setRules(rules: RulesBuilder<T>): void {
        this.setter(rules)
    }
}

const validatorFactory = <T>(state: StateModel<T>, setter: RulesSetterCallback<T>) : ObjectValidator<T> =>
new CustomObjectValidator<T>(state, setter)

export default validatorFactory
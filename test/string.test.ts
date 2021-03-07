import { ObjectValidator } from '../src/object-validator'
import { RulesBuilder } from '../src/rules-builder'
import { StateModel } from '../src/state-model'

interface StringData {
  name: string
}

class StringDataValidator extends ObjectValidator<StringData> {
  protected setRules(rules: RulesBuilder<StringData>) {
    rules.add('name').isString().notEmpty().maxLength(5)
  }
}

test('empty value', async () => {
  const stateModel = new StateModel<StringData>()
  const validator = new StringDataValidator(stateModel)

  await validator.validate({ name: '' })
  expect(stateModel.isValid()).toBeFalsy()
})

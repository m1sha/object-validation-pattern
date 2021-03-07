import { ObjectValidator } from '../src/object-validator'
import { RulesBuilder } from '../src/rules-builder'
import { StateModel } from '../src/state-model'

interface TestData {
  name: string
  empty: string
  value: number
  values: string[]
  date: Date
  // inner: TestDTO
}

class TestObjectValidator extends ObjectValidator<TestData> {
  constructor(state: StateModel<TestData>) {
    super(state)
  }

  protected setRules(rules: RulesBuilder<TestData>): void {
    rules.add('name').isString().notEmpty().breakChain().minLength(1).maxLength(10).break()

    rules.add('value').isNumber().range(5, 10)

    rules.add('empty').isString().empty()

    rules.add('date').isDateTime()
  }
}

test('validator test', async () => {
  const entity = {
    name: '',
    value: 5,
    values: [],
    empty: '',
    date: new Date(),
  }

  const state = new StateModel<TestData>()
  const validator = new TestObjectValidator(state)
  await validator.validate(entity)
  expect(state.getItem('name')).toEqual({ valid: false, text: 'name: is empty' })
  expect(state.getItem('value')).toEqual({ valid: true, text: '' })
  expect(state.isValid()).toBeFalsy()
})

test('validator test good', async () => {
  const entity = {
    name: 'dd222',
    empty: '',
    value: 5,
    values: [],
    date: new Date(),
  }

  const state = new StateModel<TestData>()
  const validator = new TestObjectValidator(state)
  await validator.validate(entity)
  expect(state.isValid()).toBeTruthy()
})

test('validatorField test', async () => {
  const entity = {
    name: 'name',
    empty: '',
    value: 500,
    values: [],
    date: new Date(),
  }

  const state = new StateModel<TestData>()
  const validator = new TestObjectValidator(state)
  await validator.validateField(entity, 'name')
  expect(state.getItem('name').valid).toBeTruthy()
})

test('validatorField test 2', async () => {
  const entity = {
    name: 'nameNameName',
    empty: '',
    value: 500,
    values: [],
    date: new Date(),
  }

  const state = new StateModel<TestData>()
  const validator = new TestObjectValidator(state)
  await validator.validateField(entity, 'name')
  expect(state.getItem('name').valid).toBeFalsy()
})

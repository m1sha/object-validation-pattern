import { StateModel } from '../src/state-model'
import validatorFactory from '../src/validator-factory'

test('empty value', async () => {
  const model = { name: '' }
  const stateModel = new StateModel<typeof model>()
  const validator = validatorFactory(stateModel, rules =>{
    rules.add('name').isString().notEmpty().maxLength(5)
  })

  await validator.validate(model)
  expect(stateModel.isValid()).toBeFalsy()
  expect(stateModel.getItem("name").text).toEqual("name: is empty")

  model.name = "name"
  await validator.validate(model)
  expect(stateModel.isValid()).toBeTruthy()
  expect(stateModel.getItem("name").text).toEqual("")

  model.name = "123456"
  await validator.validate(model)
  expect(stateModel.isValid()).toBeFalsy()
  expect(stateModel.getItem("name").text).toEqual("name: max length is 5")
})
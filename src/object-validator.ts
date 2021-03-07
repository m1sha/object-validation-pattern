import { ValidationQueue, RuleQueueItem } from './validation-queue'
import { StateModel } from './state-model'
import { ValidationState } from './validation-state'
import { RulesBuilder } from './rules-builder'

type ValidateFieldCallback = (fieldName: string) => boolean

export abstract class ObjectValidator<T> {
  private validationState: ValidationState<T>
  private isInit: boolean

  constructor(stateModel: StateModel<T>) {
    this.validationState = {
      stateModel,
      queue: new ValidationQueue(),
      target: undefined,
    }
    this.isInit = false
  }

  validate(item: T): Promise<void> {
    return this.checkValid(item)
  }

  validateField<K extends keyof T>(item: T, fieldName: K): Promise<void> {
    return this.checkValid(item, (p) => p === fieldName)
  }

  protected abstract setRules(rules: RulesBuilder<T>): void

  protected init(): void {
    const builder = new RulesBuilder<T>(this.validationState)
    this.setRules(builder)
    this.isInit = true
  }

  private async checkValid(obj: T, callback?: ValidateFieldCallback): Promise<void> {
    if (!this.isInit) this.init()
    this.validationState.target = obj
    this.validationState.queue.reset()
    while (true) {
      const result = this.validationState.queue.pop()
      if (!result) {
        break
      }

      const { ruleName, items } = result
      if (callback && !callback(ruleName)) {
        continue
      }

      for (const item of items) {
        if (item instanceof RuleQueueItem) {
          const valid = await this.validateRule(item)
          if (!valid) {
            break
          }
        }
      }
    }
  }

  private async validateRule(item: RuleQueueItem): Promise<boolean> {
    const valid = await item.result()
    const target = this.validationState.target
    const text = valid ? '' : format(item.message, target, item.key, target[item.key])
    this.validationState.stateModel.getValueInternal(item.key).setValue(valid, text)
    return valid
  }
}

const format = <T>(message: string, obj: T, key: string, value: unknown): string => {
  return message.replace(/\$name/, key).replace(/\$value/, value ? value.toString() : 'undefined')
}

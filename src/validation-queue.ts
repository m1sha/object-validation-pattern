export interface QueueItem {
  readonly key: string
}

export class ValidationQueue {
  private readonly items: Record<string, QueueItem[]>
  private index: number

  private names: string[]

  constructor() {
    this.items = {}
    this.index = 0
    this.names = []
  }

  enqueue(item: QueueItem): void {
    if (!this.items[item.key]) this.items[item.key] = []
    this.items[item.key].push(item)
    if (this.names.indexOf(item.key) === -1) this.names.push(item.key)
  }

  dequeue(): { ruleName: string; items: QueueItem[] } {
    if (this.index >= Object.keys(this.items).length) {
      return undefined
    }

    return {
      ruleName: this.names[this.index],
      items: this.items[this.names[this.index++]],
    }
  }

  reset(): void {
    this.index = 0
  }
}

export class BlockQueueItem implements QueueItem {
  readonly isBlock: boolean
  readonly key: string

  constructor(key: string, block: boolean) {
    this.key = key
    this.isBlock = block
  }
}

type RuleQueueOperationCallback = () => boolean
type RuleQueueOperationCallbackAsync = () => Promise<boolean>
export class RuleQueueItem implements QueueItem {
  private done?: boolean
  private callback: RuleQueueOperationCallback | RuleQueueOperationCallbackAsync
  readonly key: string
  readonly message: string

  constructor(key: string, callback: RuleQueueOperationCallback | RuleQueueOperationCallbackAsync, message: string) {
    this.key = key
    this.callback = callback
    this.message = message
  }

  async result(): Promise<boolean> {
    const result = this.callback()
    if (result instanceof Promise) {
      this.done = await result
    }
    if (typeof result === 'boolean') {
      this.done = result
    }

    return this.done
  }
}

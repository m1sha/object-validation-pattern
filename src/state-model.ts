export class StateItem {
  valid?: boolean
  text: string

  constructor() {
    this.valid = undefined
    this.text = ''
  }

  setValue(valid: boolean, text: string): void {
    this.valid = valid
    this.text = text
  }
}

export class StateModel<T> {
  readonly items: Record<string, StateItem>
  constructor() {
    this.items = {}
  }

  clear(): void {
    const keys = Object.keys(this.items)
    for (const key of keys) {
        const item = this.items[key]
        item.valid = undefined
        item.text = ''
    }
  }

  isValid(): boolean {
    for (const [, value] of Object.entries(this.items)) {
      if (value instanceof StateItem && value.valid === false) return false
    }
    return true
  }

  getItem<K extends keyof T>(name: K): StateItem | null {
    return this.items[name as string]
  }

  /** @internal */
  getValueInternal(name: string): StateItem | null {
    return this.items[name]
  }

  /** @internal */
  setValue(name: string, item: StateItem): void {
    let current = this.items[name]
    if (!current) {
      current = this.items[name] = new StateItem()
    }

    current.valid = item.valid
    current.valid = item.valid
  }
}

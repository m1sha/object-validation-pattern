import { ValidationQueue, RuleQueueItem } from '../src/validation-queue'
test('queue good', async () => {
  const queue = new ValidationQueue()
  queue.enqueue(new RuleQueueItem('name', () => true, 'must be true'))
  const rule = queue.dequeue().items[0] as RuleQueueItem
  const r = await rule.result()
  expect(r).toBeTruthy()
  expect(rule.message).toEqual('must be true')
})

test('queue bad', async () => {
  const queue = new ValidationQueue()
  queue.enqueue(new RuleQueueItem('name', () => false, 'must be false'))
  const rule = queue.dequeue().items[0] as RuleQueueItem
  const r = await rule.result()
  expect(r).toBeFalsy()
  expect(rule.message).toEqual('must be false')
})

test('queue reset', () => {
  const queue = new ValidationQueue()
  queue.enqueue(new RuleQueueItem('rule1', () => true, 'rule 1'))
  queue.enqueue(new RuleQueueItem('rule2', () => true, 'rule 2'))

  expect(queue.dequeue()).toBeDefined()
  expect(queue.dequeue()).toBeDefined()
  expect(queue.dequeue()).toBeUndefined()

  queue.reset()
  expect(queue.dequeue()).toBeDefined()
  expect(queue.dequeue()).toBeDefined()
  expect(queue.dequeue()).toBeUndefined()

  expect(queue.dequeue()).toBeUndefined()
})

test('queue many cases on one rule', () => {
  const queue = new ValidationQueue()
  queue.enqueue(new RuleQueueItem('rule1', () => true, 'rule 1 case 1'))
  queue.enqueue(new RuleQueueItem('rule1', () => true, 'rule 1 case 2'))
  queue.enqueue(new RuleQueueItem('rule2', () => true, 'rule 2 case 1'))

  expect(queue.dequeue().items.length).toEqual(2)
  expect(queue.dequeue().items.length).toEqual(1)
  expect(queue.dequeue()).toBeUndefined()
})
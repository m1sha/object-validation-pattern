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

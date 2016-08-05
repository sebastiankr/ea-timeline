const tape = require('tape')
const ea = require('../')

const t = ea.timeline()

tape('Testing output', (test) => {
  test.plan(1)
  test.equal(t, 'timeline-2')
  test.end()
})

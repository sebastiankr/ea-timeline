const tape = require('tape')
const ea = require('../')
require('jsdom-global')()

const t = ea.timeline()

tape('Testing output', (test) => {
  test.plan(1)
  test.equal(t, 'timeline-2')
  test.end()
})

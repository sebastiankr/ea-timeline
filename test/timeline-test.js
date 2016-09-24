const tape = require('tape')
const moment = require('moment')
const ea = require('../build/ea-timeline.js')
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>test</title>
  </head>
  <body>
    <div id="ea-timeline"></div>
    <div id="ea-timeline-1"></div>
  </body>
</html>`
require('jsdom-global')(html)

let data = [
  {
    key: 'Process 1',
    values: [
      {
        startTime: moment().subtract(4, 'hours'),
        endTime: moment().subtract(3, 'hours')
      }
    ]
  }
]

tape('Should throw if DOM element not found', (test) => {
  test.plan(1)
  test.throws(() => {
    ea.timeline({elementSelector: '#does-not-exist'})
  }, Error, 'DOM element not found')
  test.end()
})

tape('Should not throw if DOM element is found', (test) => {
  test.plan(1)
  test.doesNotThrow(() => {
    ea.timeline({elementSelector: '#ea-timeline'})
  }, Error)
  test.end()
})

tape('Should not display top axis', (test) => {
  test.plan(1)
  test.doesNotThrow(() => {
    let t = ea.timeline({
      elementSelector: '#ea-timeline-1',
      data: data,
      showAxis: { top: false, right: true, bottom: true, left: true }
    })
    t.resize()
  }, Error)
  test.end()
})

tape('Should not display right axis', (test) => {
  test.plan(1)
  test.doesNotThrow(() => {
    let t = ea.timeline({
      elementSelector: '#ea-timeline-1',
      data: data,
      showAxis: { top: true, right: false, bottom: true, left: true }
    })
    t.resize()
  }, Error)
  test.end()
})

tape('Should not display bottom axis', (test) => {
  test.plan(1)
  test.doesNotThrow(() => {
    let t = ea.timeline({
      elementSelector: '#ea-timeline-1',
      data: data,
      showAxis: { top: true, right: true, bottom: false, left: true }
    })
    t.resize()
  }, Error)
  test.end()
})

tape('Should not display left axis', (test) => {
  test.plan(1)
  test.doesNotThrow(() => {
    let t = ea.timeline({
      elementSelector: '#ea-timeline-1',
      data: data,
      showAxis: { top: true, right: true, bottom: true, left: false }
    })
    t.resize()
  }, Error)
  test.end()
})


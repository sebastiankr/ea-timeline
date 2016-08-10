const tape = require('tape')
const ea = require('../build/ea-timeline.js')
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>test</title>
  </head>
  <body>
    <div id="ea-timeline"></div>
  </body>
</html>`
require('jsdom-global')(html)

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
    ea.timeline()
    ea.timeline({elementSelector: '#ea-timeline'})
  }, Error)
  test.end()
})


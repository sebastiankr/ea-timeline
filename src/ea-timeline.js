import * as d3 from 'd3'
import moment from 'moment'

// export default function timeline () {
//   console.log('timeline')

//   return 'timeline' + min([0, -2, 9])
// }

export default function timeline (spec) {
  let element = spec.element
  let data = spec.data
  let spacing = 2
  let focusMargin = 35
  let _mainBarHeight = 40
  let blinkAnimationDuration = 1000

  let focusExtent = [d3.time.hour.offset(new Date(), -1 * 24), d3.time.hour.offset(new Date(), 0)]
  let contextExtent = [d3.time.day.offset(new Date(), -5), new Date()]

  let margin = { top: 30, right: 20, bottom: 30, left: 100 }
  let width = parseInt(element.style('width'), 10) - margin.left - margin.right
  if (!width) {
    width = 100
  }
  let height = 200 // placeholder
  let contextHeight = spec.config.contextHeight; // original value = 100
  let contextVisibility = spec.config.contextVisibility
  // var barHeight = 40

  let percent = d3.format('%')

  // scales and axes
  let x = d3.time.scale()
    .clamp(true)
    .domain(focusExtent)
    .range([0, width])

  let xBrush = d3.time.scale()
    .clamp(true)
    .domain(contextExtent)
    .range([0, width])

  let brush = d3.svg.brush()
    .x(xBrush)
    .extent(focusExtent)
    .on('brush', () => {
      if (!brush.empty()) {
        var extent = brush.extent()
        var now = new Date()
        if (extent[1] > now) {
          extent[1] = now
        }
        focusExtent = extent
        x.domain(extent)
        moveTimescale()
      }
    })

  let y = d3.scale.ordinal()
  let yAxis = d3.svg.axis()

  let xAxis = d3.svg.axis()
    .scale(x)

  let xAxis2 = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.hours, 8)
  // .tickFormat(d3.time.format("%H:%M"))
  let xAxisBrush = d3.svg.axis()
    .scale(xBrush)

  // render the chart
  // create the chart
  let svg = element.append('svg')
    .style('width', (width + margin.left + margin.right) + 'px')

  // add the focus to the svg
  let chart = svg.append('g')
    .attr('class', 'focus')
    .attr('transform', 'translate(' + [margin.left, margin.top] + ')')
  // add top and bottom axes
  chart.append('g')
    .attr('class', 'x axis top')

  chart.append('g')
    .attr('class', 'x axis bottom')
    .attr('transform', 'translate(0,' + height + ')')

  // add y axes
  chart.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + (-1 * spacing) + ',' + spacing + ')')

  let resizeHandlePath = function resizeHandlePath (d) {
    var e = +(d === 'e'),
      x = e ? 1 : -1,
      y = contextHeight / 3
    return 'M' + (.5 * x) + ',' + y
      + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6)
      + 'V' + (2 * y - 6)
      + 'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y)
      + 'Z'
      + 'M' + (2.5 * x) + ',' + (y + 8)
      + 'V' + (2 * y - 8)
      + 'M' + (4.5 * x) + ',' + (y + 8)
      + 'V' + (2 * y - 8)
  }

  // add the context to the svg
  // render the brush
  // add top and bottom axes
  let context = svg.append('g')
    .attr('class', 'context')
    .attr('transform', 'translate(' + [margin.left, 0] + ')')
    .attr('style', 'visibility:' + contextVisibility + ';')

  context.append('g')
    .attr('class', 'x axis context bottom')
    .attr('transform', 'translate(0,' + height + ')')

  context.append('g')
    .attr('class', 'x brush')
    .call(brush)
    .selectAll('rect')
    .attr('y', -6)
    .attr('height', contextHeight + 5)

  context.select('.resize.e').append('path').attr('d', resizeHandlePath)
  context.select('.resize.w').append('path').attr('d', resizeHandlePath)

  let tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
      var tooltip = '<strong class="value">' + d.name
        // + '</strong><br> <span>' + moment(d.startTime).calendar() + ' &ndash; ' + moment(d.endTime).calendar() + '</span>'
        + '</span><br> <span>' + moment(d.startTime).format('h:mm:ss a') + ' &ndash; ' + moment(d.endTime).format('h:mm:ss a')
        + '<br> (' + moment.duration(moment(d.endTime).diff(d.startTime)).format('d[d] h [hrs], m [min], s [sec]') + ')</span>'
      return tooltip
    })

  chart.call(tip)
  var calculateWidth = function (d, xa) {
    var width = 0
    if (!d.endTime) {
      width = xa(new Date()) - xa(d.startTime)
    } else if (d.startTime) {
      width = xa(d.endTime) - xa(d.startTime)
    } if (width > 0 && width < 1) {
      width = 1
    }
    return width
  }

  // UPDATE
  var update = function (d) {
    let data = d
    var height

    y.domain(data.map(function (d) { return d.key; }))
      .rangeBands([0, data.length * _mainBarHeight])
    yAxis.scale(y)
    chart.select('.y.axis').call(yAxis.orient('left'))
    // TODO xAxisi missing
    // set height based on data
    height = y.rangeExtent()[1]
    d3.select(chart.node().parentNode)
      .style('height', (height + margin.top + focusMargin + contextHeight + margin.bottom) + 'px')

    svg.select('.context').attr('transform', () => {
      return 'translate(' + [margin.left, height + margin.top + focusMargin] + ')'
    })

    chart.select('.x.axis.bottom').attr('transform', () => {
      return 'translate(0,' + (height + 2 * spacing) + ')'
    })

    context.select('.x.axis.context.bottom').attr('transform', () => {
      return 'translate(0,' + contextHeight + ')'
    })

    let bars = chart.selectAll('.bar')
      .data(data, (d) => {
        return d.key;})

    bars.enter()
      .append('g')
      .attr('class', 'bar')
      .append('rect')
      .attr('class', 'background')
      .attr('height', y.rangeBand())
      .attr('width', width)

    bars.attr('transform', (d, i) => {
      let index = d3.map(data, (d) => {
        return d.key;}).keys().indexOf(d.key)
      return 'translate(0,' + (index * _mainBarHeight + spacing) + ')'
    })

    let funct = bars.selectAll('rect.function')
      .data((d) => {
        return (d.values) ? d.values : []
      })

    funct.enter().append('rect')
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .on('contextmenu', d3.contextMenu(function (data) {
        let menu = []
        if (data.docLink) {
          menu.push({
            title: '<core-icon icon="help" self-center></core-icon>Documentation',
            action: function (elm, d, i) {
              console.log('Item #1 clicked!')
              window.location.href = d.docLink
            }
          })
        }
        return menu
      }))

    funct.attr('transform', (d) => {
      return 'translate(' + x(d.startTime) + ',0)'
    })
      .attr('class', (d) => {
        let cls = 'function'
        if (!d.endTime) {
          cls += ' running'
        }
        if (d.status) {
          cls += ' status' + d.status
        }

        return cls
      })
      .attr('height', y.rangeBand())
      .attr('width', function (d) {
        return calculateWidth(d, x)
      })

    funct.exit().remove()

    bars.exit().remove()

    let contextbars = context.selectAll('.bar')
      .data(data, (d) => {
        return d.key;})

    contextbars.enter()
      .insert('g', ':first-child')
      .attr('class', 'bar')
    contextbars.attr('transform', (d, i) => {
      let barHeight = contextHeight / data.length
      return 'translate(0,' + i * barHeight + ')'
    })

    let contextFunct = contextbars.selectAll('rect.function')
      .data((d) => {
        return (d.values) ? d.values : []
      })

    contextFunct.enter().append('rect')

    contextFunct.attr('transform', (d) => {
      return 'translate(' + xBrush(d.startTime) + ',0)'
    })
      .attr('class', (d) => {
        let cls = 'function'
        if (!d.endTime) {
          cls += ' running'
        }
        if (d.status) {
          cls += ' status' + d.status
        }
        return cls
      })
      .attr('height', contextHeight / data.length)
      .attr('width', (d) => {
        return calculateWidth(d, xBrush)
      })

    contextbars.exit().remove()
    contextFunct.exit().remove()
  }

  update(data)

  var moveTimescale = function moveTimescale () {
    // prevent moving into the future
    let moveByInMilli = (new Date()).getTime() - contextExtent[1].getTime()
    focusExtent[0] = new Date(focusExtent[0].getTime() + moveByInMilli)
    focusExtent[1] = new Date(focusExtent[1].getTime() + moveByInMilli)
    contextExtent[0] = new Date(contextExtent[0].getTime() + moveByInMilli)
    contextExtent[1] = new Date(contextExtent[1].getTime() + moveByInMilli)

    x.domain(focusExtent)
    xBrush.domain(contextExtent)

    chart.selectAll('rect.function')
      .attr('transform', (d) => {
        return 'translate(' + x(d.startTime) + ',0)';})
      .attr('width', (d) => {
        return calculateWidth(d, x)
      })

    context.selectAll('rect.function')
      .attr('transform', (d) => {
        return 'translate(' + xBrush(d.startTime) + ',0)';})
      .attr('width', (d) => {
        return calculateWidth(d, xBrush)
      })

    drawAxes()
  }

  function drawAxes () {
    chart.select('.x.axis.top').call(xAxis.orient('top'))
    chart.select('.x.axis.bottom').call(xAxis2.orient('bottom'))
    context.select('.x.axis.context.bottom').call(xAxisBrush.orient('bottom'))
    context.select('.x.brush').call(brush.extent(focusExtent))
  }

  function animateBlink (duration) {
    let runningTasks = d3.selectAll('.running')
    if (!runningTasks.empty()) {
      runningTasks.transition().duration(blinkAnimationDuration).delay(0)
        .style('opacity', runningTasks.style('opacity') === '0.9' ? '.1' : '0.9')
    }
  }

  // update x axes
  drawAxes()

  let resize = function resize () {
    // update width
    width = parseInt(element.style('width'), 10)
    width = width - margin.left - margin.right

    // resize the chart
    x.range([0, width])
    xBrush.range([0, width])
    // this.brush.clear()

    d3.select(chart.node().parentNode)
      // .style('height', (this.y.rangeExtent()[1] + this.margin.top + this.margin.bottom + 300) + 'px')
      .style('width', (width + margin.left + margin.right) + 'px')

    chart.selectAll('rect.background')
      .attr('width', width)

    chart.selectAll('rect.function')
      .attr('transform', (d) => {
        return 'translate(' + x(d.startTime) + ',0)';})
      .attr('width', (d) => {
        return calculateWidth(d, x)
      })

    context.selectAll('rect.function')
      .attr('transform', (d) => {
        return 'translate(' + xBrush(d.startTime) + ',0)';})
      .attr('width', (d) => {
        return calculateWidth(d, xBrush)
      })
    // update axes
    chart.select('.x.axis.top').call(xAxis.orient('top'))
    chart.select('.x.axis.bottom').call(xAxis2.orient('bottom'))
    context.select('.x.axis.context.bottom').call(xAxisBrush.orient('bottom'))
    context.select('.x.brush').call(brush.extent(focusExtent))
  }

  var intervalID = window.setInterval(() => {
    moveTimescale();}, 1000)

  var intervalID2 = window.setInterval(() => {
    animateBlink(blinkAnimationDuration);}, blinkAnimationDuration)

  return Object.freeze({
    resize,
  update})
}

import * as d3 from 'd3'

export default function timeline ({ elementSelector = '#ea-timeline', data = [], marginLeft = 120, marginRight = 10, marginTop = 20, marginBottom = 18, timelineHeight = 18, spacing = 2, paddingOuter = 0, paddingInner = 0 } = {}) {
  const element = d3.select(elementSelector)

  if (element.empty()) {
    throw new Error('DOM element not found')
  }

  let focusExtent = [d3.timeHour.offset(new Date(), -1 * 24), d3.timeHour.offset(new Date(), 0)]
  let width = parseInt(element.style('width'), 10) || 600

  let x = d3.scaleTime()
    .domain(focusExtent)
    .range([0, width - marginLeft - marginRight])
  const xAxisTop = d3.axisTop(x)
  const xAxisBottom = d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M'))

  let svg = element.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')

  let timelines = svg.append('g')
    .attr('transform', 'translate(' + [marginLeft, marginTop] + ')')

  timelines.append('g').attr('class', 'x axis top')
    .call(xAxisTop)

  timelines.append('g')
    .attr('class', 'x axis bottom')
    .call(xAxisBottom)

  timelines.append('g')
    .attr('class', 'y axis')
    // .attr('transform', 'translate(' + [marginLeft, marginTop] + ')')

  // UPDATE
  const update = (data) => {
    const y = d3.scaleBand()
      .paddingOuter(paddingOuter)
      .paddingInner(paddingInner)
      .domain(data.map((d) => d.key))
      .range([0, data.length * timelineHeight])
      .round(true)

    const yAxis = d3.axisLeft()
    yAxis.scale(y)
    timelines.select('.y.axis')
      .call(yAxis)
      .selectAll('.tick text')

    const height = y.range()[1]
    svg.attr('height', (height + marginTop + marginBottom) + 'px')

    timelines.select('.x.axis.bottom').attr('transform', () => {
      return 'translate(' + [0, height] + ')'
    })

    const bars = timelines.selectAll('g.bar')
      .data(data)

    const g = bars.enter()
      .append('g')
      .attr('transform', (d, i) => {
        return 'translate(' + [0, y(d.key)] + ')'
      })
      .attr('class', 'bar')
    g
      .append('rect')
      .attr('class', 'timeline-background')
      .attr('height', y.bandwidth())
      .attr('width', width - marginLeft - marginRight)

    // bars.attr('transform', (d) => 'translate(' + [0, y(d.key)] + ')')

    var funct = g.selectAll('rect.function')
      .data(function (d, i, j) { console.log('Data: ' + JSON.stringify(d), '\nIndex: ' + JSON.stringify(i), '\nNode: ' + JSON.stringify(j)); return d.values})

      .enter()
      .append('rect')
      .attr('class', 'function')

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
      .attr('height', y.bandwidth())
      .attr('width', function (d) {
        return calculateWidth(d, x)
      })

    funct.exit().remove()

    bars.exit().remove()
  }

  update(data)

  return Object.freeze({update})
}
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

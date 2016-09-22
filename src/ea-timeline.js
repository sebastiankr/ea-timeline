import * as d3 from 'd3'

export default function timeline ({
  elementSelector = '#ea-timeline',
  data = [],
  margin = { top: 18, right: 125, bottom: 18, left: 125 },
  innerMargin = { top: 0, right: 0, bottom: 0, left: 0 },
  showAxis = { top: true, right: true, bottom: true, left: true },
  timelineHeight = 30,
  spacing = 2,
  paddingOuter = 0,
  paddingInner = 0
} = {}) {
  const element = d3.select(elementSelector)
  let funct
  let backgroundSelection
  if (element.empty()) {
    throw new Error('DOM element not found')
  }

  const focusExtent = [d3.timeHour.offset(new Date(), -1 * 24), d3.timeHour.offset(new Date(), 0)]
  let width = parseInt(element.style('width'), 10) || 600

  const x = d3.scaleTime()
    .domain(focusExtent)
    .range([0, width - margin.left - innerMargin.left - margin.right - innerMargin.right])
    .clamp(true)

  const xAxisTop = d3.axisTop(x)
  const xAxisBottom = d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M'))

  const svg = element.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')

  const marginGroup = svg.append('g')
    .attr('transform', 'translate(' + [margin.left, margin.top] + ')')

  const timelines = marginGroup.append('g')
  const scales = marginGroup.append('g')
  
  if (showAxis.top) {
    scales.append('g')
      .attr('class', 'x axis top')
       .attr('transform', 'translate(' + [innerMargin.left, 0] + ')')
      .call(xAxisTop)
  }

  if (showAxis.bottom) {
    scales.append('g')
      .attr('class', 'x axis bottom')
      .call(xAxisBottom)
  }
  if (showAxis.left) {
    scales.append('g')
      .attr('class', 'y axis left')
      .attr('transform', 'translate(' + [0, innerMargin.top] + ')')
  }

  if (showAxis.right) {
    scales.append('g')
      .attr('class', 'y axis right')
      .attr('transform', 'translate(' + [width - margin.left - margin.right + innerMargin.right, innerMargin.top] + ')')
  }
  // UPDATE
  const update = data => {
    const y = d3.scaleBand()
      .paddingOuter(paddingOuter)
      .paddingInner(paddingInner)
      .domain(data.map(d => d.key))
      .range([0, data.length * timelineHeight])
      .round(true)

    const yAxisLeft = d3.axisLeft()
    yAxisLeft.scale(y)
    scales.select('.y.axis.left')
      .call(yAxisLeft)
      .selectAll('.tick text')

    const yAxisRight = d3.axisRight()
    yAxisRight.scale(y)
    scales.select('.y.axis.right')
      .call(yAxisRight)
      .selectAll('.tick text')

    const height = y.range()[1]
    svg.attr('height', (height + margin.top + innerMargin.top + margin.bottom + innerMargin.bottom) + 'px')

    scales.select('.x.axis.bottom')
      .attr('transform', 'translate(' + [innerMargin.left, height + innerMargin.top + innerMargin.bottom] + ')')

    const bars = timelines.selectAll('g.bar')
      .data(data)

    const g = bars.enter()
      .append('g')
      .attr('transform', d => 'translate(' + [innerMargin.left, y(d.key) + innerMargin.top] + ')')
      .attr('class', 'bar')
    backgroundSelection = g
      .append('rect')
      .attr('class', 'timeline-background')
      .attr('height', y.bandwidth())
      .attr('width', width - margin.left - innerMargin.left - margin.right)

    // bars.attr('transform', (d) => 'translate(' + [0, y(d.key)] + ')')

    funct = g.selectAll('rect.function')
      .data(d => d.values)

      .enter()
      .append('rect')
      .attr('class', 'function')

    funct.attr('transform', d => 'translate(' + x(d.startTime) + ',0)')
      .attr('class', d => {
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
      .attr('width', d => calculateWidth(d, x))

    funct.exit().remove()

    bars.exit().remove()
  }

  const resize = function resize () {
    // update width
    width = parseInt(element.style('width'), 10)
    // width = width - margin.left - margin.right

    // resize the chart
    x.range([0, width - margin.left - innerMargin.left - margin.right - innerMargin.right])
    // xBrush.range([0, width])
    // this.brush.clear()

    // d3.select(chart.node().parentNode)
    //   // .style('height', (this.y.rangeExtent()[1] + this.margin.top + this.margin.bottom + 300) + 'px')
    //   .style('width', (width + margin.left + margin.right) + 'px')

    backgroundSelection.attr('width', width - margin.left - innerMargin.left - margin.right - innerMargin.right)

    //svg.selectAll('rect.function')
    funct
      .attr('transform', d => 'translate(' + x(d.startTime) + ',0)')
      .attr('width', d => calculateWidth(d, x))

    // svg.selectAll('rect.function')
    //   .attr('transform', (d) => {
    //     return 'translate(' + xBrush(d.startTime) + ',0)';})
    //   .attr('width', (d) => {
    //     return calculateWidth(d, xBrush)
    //   })
    // update axes
    scales.select('.x.axis.top').call(xAxisTop)
    scales.select('.x.axis.bottom').call(xAxisBottom)
  // context.select('.x.axis.context.bottom').call(xAxisBrush.orient('bottom'))
  // context.select('.x.brush').call(brush.extent(focusExtent))
  }

  update(data)

  return Object.freeze({update, resize})
}
var calculateWidth = (d, x) => {
  let width = 0
  if (!d.endTime) {
    width = x(new Date()) - x(d.startTime)
  } else if (d.startTime) {
    width = x(d.endTime) - x(d.startTime)
  } if (width > 0 && width < 1) {
    width = 1
  }
  return width
}

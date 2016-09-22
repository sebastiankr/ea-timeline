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
  let xAxisTopGroup
  let xAxisBottomGroup
  let yAxisLeftGroup
  let yAxisRightGroup

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
    xAxisTopGroup = scales.append('g')
      .attr('class', 'x axis top')
       .attr('transform', 'translate(' + [innerMargin.left, 0] + ')')
      .call(xAxisTop)
  }

  if (showAxis.bottom) {
    xAxisBottomGroup = scales.append('g')
      .attr('class', 'x axis bottom')
      .call(xAxisBottom)
  }
  if (showAxis.left) {
    yAxisLeftGroup = scales.append('g')
      .attr('class', 'y axis left')
      .attr('transform', 'translate(' + [0, innerMargin.top] + ')')
  }

  if (showAxis.right) {
    yAxisRightGroup = scales.append('g')
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

    const yAxisLeft = d3.axisLeft().scale(y)
    yAxisLeftGroup
      .call(yAxisLeft)
      .selectAll('.tick text')

    const yAxisRight = d3.axisRight().scale(y)
    yAxisRightGroup
      .call(yAxisRight)
      .selectAll('.tick text')

    const height = y.range()[1]
    svg.attr('height', (height + margin.top + innerMargin.top + margin.bottom + innerMargin.bottom) + 'px')

    xAxisBottomGroup
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

    funct
      .attr('transform', d => 'translate(' + x(d.startTime) + ',0)')
      .attr('width', d => calculateWidth(d, x))

    // update axes
    xAxisTopGroup.call(xAxisTop)
    xAxisBottomGroup.call(xAxisBottom)
    yAxisRightGroup
      .attr('transform', 'translate(' + [width - margin.left - margin.right + innerMargin.right, innerMargin.top] + ')')
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

import * as d3 from 'd3'
import { legend, dateFormats } from '@rawgraphs/rawgraphs-core'
import * as d3Gridding from 'd3-gridding'
import '../d3-styles.js'

export function render(
  svgNode,
  data,
  visualOptions,
  mapping,
  originalData,
  styles
) {
  const {
    // artboard options
    width,
    height,
    background,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    // chart options
    innerDiameter,
    stacksOrder,
    stacksPadding,
    SortXAxisBy,
    // series options
    columnsNumber,
    useSameScale,
    sortSeriesBy,
    showSeriesLabels,
    repeatAxesLabels,
    showGrid = true,
    // color options
    colorScale,
    // legend
    showLegend,
    legendWidth,
  } = visualOptions

  const margin = {
    top: marginTop,
    right: marginRight,
    bottom: marginBottom,
    left: marginLeft,
  }

  const innerRadius = innerDiameter / 2


  function describeRadialBar(angle, value, v0) {
    // Define radii for different points
    var closeR = innerRadius;
    var midR = innerRadius + v0;
    var farR = innerRadius + value;
    // Define radii for different points
    var midR = v0;
    var farR = value;

    // Calculate coordinates for the close side
    var angleInRadians = ((-angle / 2) - 90) * Math.PI / 180.0;
    var closeX = closeR * Math.cos(angleInRadians);
    var closeY = closeR * Math.sin(angleInRadians);

    // Calculate angles for mid and far sides
    var farX = closeX,
      midX = closeX;
    var farA = -Math.acos(farX / farR);
    var midA = -Math.acos(midX / midR);

    // Calculate y coordinates for mid and far sides
    var farY = farR * Math.sin(farA);
    var midY = midR * Math.sin(midA);

    // Construct the SVG path for the radial bar
    var d = ["M", midX, midY, "A", midR, midR, 0, 0, 1, -midX, midY, "V", -farX, farY, "A", farR, farR, 0, 0, 0, farX, farY, "V", midX, midY, "z"].join(" ");

    return d;
  }

  //check if there are negative values, in case throw error
  data.forEach((d) => {
    if (d.size < 0) {
      throw new Error('Values cannot be negative')
    }
  })

  // parse eventual dates
  if (mapping.stacks.dataType.type === 'date') {
    // set date format  from input data
    const timeFormat = d3.timeFormat(
      dateFormats[mapping.stacks.dataType.dateFormat]
    )
    // use it to format date
    data.forEach((d) => {
      d.stacks = timeFormat(Date.parse(d.stacks))
    })
  }

  // create nest structure
  const nestedData = d3
    .rollups(
      data,
      (v) => v,
      (d) => d.series
    )
    .map((d) => ({ data: d, totalSize: d3.sum(d[1], (d) => d.size) }))

  // sort series
  nestedData.sort((a, b) => {
    return {
      valueDescending: d3.descending(a.totalSize, b.totalSize),
      valueAscending: d3.ascending(a.totalSize, b.totalSize),
      name: d3.ascending(a.data[0], b.data[0]),
    }[sortSeriesBy]
  })

  // add background
  d3.select(svgNode)
    .append('rect')
    .attr('width', showLegend ? width + legendWidth : width)
    .attr('height', height)
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', background)
    .attr('id', 'background')

  // set up grid
  const gridding = d3Gridding
    .gridding()
    .size([width, height])
    .mode('grid')
    .padding(0) // no padding, margins will be applied inside
    .cols(columnsNumber)

  const griddingData = gridding(nestedData)

  const svg = d3.select(svgNode).append('g').attr('id', 'viz')
  const series = svg
    .selectAll('g')
    .data(griddingData)
    .join('g')
    .attr('id', (d) => d[0])
    .attr('transform', (d) => 'translate(' + (d.x + d.width / 2) + ',' + (d.y + d.height / 2) + ')')

  // domains
  // sum all values for each serie / stack
  const scaleRollup = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.size),
      (d) => d.stacks + '_' + d.series
    )
    .map((d) => d[1])

  let sizeDomain = [0, d3.max(scaleRollup)]

  // stacks (x axis) sorting functions
  const stacksSortings = {
    'Total value (descending)': function (a, b) {
      return d3.descending(a[1], b[1])
    },
    'Total value (ascending)': function (a, b) {
      return d3.ascending(a[1], b[1])
    },
    Name: function (a, b) {
      return d3.ascending(a[0], b[0])
    },
    Original: function (a, b) {
      return true
    },
  }
  // stacks (x axis) domain
  const stacksDomain = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.size),
      (d) => d.stacks
    )
    .sort(stacksSortings[SortXAxisBy])
    .map((d) => d[0])

  const barsDomain = [...new Set(data.map((d) => d.bars))]

  // add grid
  if (showGrid) {
    svg
      .append('g')
      .attr('id', 'grid')
      .selectAll('rect')
      .data(griddingData)
      .enter()
      .append('rect')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
  }

  series.each(function (d, serieIndex) {
    // make a local selection for each serie
    const selection = d3
      .select(this)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


    // compute each serie width and height
    const serieWidth = d.width - margin.right - margin.left
    const serieHeight = d.height - margin.top - margin.bottom


    const smallerDimension = (serieHeight < serieWidth) ? serieHeight : serieWidth;
    const serieLength = (smallerDimension / 2) - innerRadius;



    const outerRadius = serieLength;

    const axesGrid = d3
      .scaleLinear()
      .domain(useSameScale ? [sizeDomain[1], sizeDomain[0]] : [localDomain[1], localDomain[0]])
      .nice(4)
      .rangeRound([innerRadius, outerRadius])


    const axesScale = d3
      .scaleLinear()
      .domain(useSameScale ? [sizeDomain[1], sizeDomain[0]] : [localDomain[1], localDomain[0]])
      .nice(4)
      .rangeRound([innerRadius, outerRadius])



    let axesLayer = selection.append('g').attr('id', 'axes')

    let axisFunction = d3.axisLeft(axesGrid).ticks(4)

    // add a circle for each tick on the axis
    axesLayer
      .selectAll('.grid')
      .data(axisFunction.scale().ticks(4))
      .enter()
      .append('circle')
      .attr('r', (d) => { return axesScale(d) })
      .attr('fill', 'none')
      .attr('stroke', 'LightGray')
      .attr('class', 'grid')
      .attr('id', (d) => { return "r" + d })


    //draw scale for first axis
    axesLayer
      .append('g')
      .attr('id', 'y axis')
      .call(axisFunction)
      .attr('transform', `translate(${0}, ${-outerRadius - innerRadius})`)







    //prepare data for stack
    let localStack = Array.from(
      d3.rollup(
        d.data[1],
        ([e]) => e,
        (e) => e.stacks,
        (e) => e.bars
      )
    )

    // creaet an object with ordering methods
    const orderings = {
      Earliest: 'stackOrderAppearance',
      Ascending: 'stackOrderAscending',
      Descending: 'stackOrderDescending',
      'Inside out': 'stackOrderInsideOut',
      None: 'stackOrderNone',
      Reverse: 'stackOrderReverse',
    }

    // create the stack
    // define the funciton to retrieve the value
    // inspired by https://observablehq.com/@stevndegwa/stack-chart
    let stack = d3
      .stack()
      .keys(barsDomain)
      .value((data, key) => (data[1].has(key) ? data[1].get(key).size : 0))
      .order(d3[orderings[stacksOrder]])

    let stackedData = stack(localStack)

    // check if padding is too high and leave no space for bars
    if (stacksPadding * stacksDomain.length > serieWidth) {
      throw new Error(
        'Padding is too high, decrase it in the panel "chart" > "Padding"'
      )
    }

    // scales
    const stacksScale = d3
      .scaleBand()
      .range([0, serieWidth])
      .domain(stacksDomain)
      .padding(
        stacksPadding / (serieWidth / stacksDomain.length) //convert padding from px to percentage
      )

    let localDomain = [
      0,
      d3.max(
        d3
          .rollups(
            d.data[1],
            (v) => d3.sum(v, (d) => d.size),
            (d) => d.stacks
          )
          .map((d) => d[1])
      ),
    ]


    // const sizeScale = d3
    // .scaleLinear()
    // .domain(useSameScale ? sizeDomain : localDomain)
    // .nice()
    // .range([serieLength, 0])






    const barScale = d3
      .scaleLinear()
      .domain(useSameScale ? [sizeDomain[0], sizeDomain[1]] : [localDomain[0], localDomain[1]])
      .nice(4)
      .rangeRound([innerRadius, outerRadius])

    const bars = selection
      .selectAll('.values')
      .data(stackedData)
      .join('g')
      .attr('id', (d) => d.key)
      .attr('fill', (d) => colorScale(d.key))
      .selectAll('path')
      .data((d) => d)
      .join('path')
      .attr('d', (d) => {
        let angle = 360 / stacksScale.domain().length;
        let v0 = barScale(d[0]);
        let v1 = barScale(d[1]);
        return describeRadialBar(angle, v1, v0)
      })
      .attr('transform', (d, i) => {
        let seriescount = stacksScale.domain().length
        let angle = (i + 0.5) * 360 / seriescount
        return 'rotate(' + angle + ')'
      })
    //.attr('transform', (d) => 'translate('+stacksScale(d.data[0])+','+ sizeScale(d[1])+')')
    // .join('rect') // HIER GEEN RECT MAAR EEN PATH
    // .attr('x', (d) => stacksScale(d.data[0]))
    // .attr('y', (d) => sizeScale(d[1]))
    // .attr('width', stacksScale.bandwidth())
    // .attr('height', (d) => serieHeight - sizeScale(d[1] - d[0]))

    // const xAxis = selection
    //   .append('g')
    //   .attr('id', 'xAxis')
    //   .attr('transform', 'translate(0,' + sizeScale(0) + ')')
    //   .call(d3.axisBottom(stacksScale).tickSizeOuter(0))

    // const yAxis = selection
    //   .append('g')
    //   .attr('id', 'yAxis')
    //   .call(d3.axisLeft(sizeScale).tickSizeOuter(0))

    // if (showSeriesLabels) {
    //   d3.select(this)
    //     .append('text')
    //     .attr('x', 4)
    //     .attr('y', 4)
    //     .text((d) => d.data[0])
    //     .styles(styles.seriesLabel)
    // }

    // // add the x axis titles
    // selection
    //   .append('text')
    //   .attr('y', serieHeight - 4)
    //   .attr('x', serieWidth)
    //   .attr('text-anchor', 'end')
    //   .attr('display', serieIndex == 0 || repeatAxesLabels ? null : 'none')
    //   .text(mapping.stacks.value)
    //   .styles(styles.axisLabel)
  })

  // add legend
  if (showLegend) {
    const legendLayer = d3
      .select(svgNode)
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${width},${marginTop})`)

    const chartLegend = legend().legendWidth(legendWidth)

    chartLegend.addColor('Colors', colorScale)

    legendLayer.call(chartLegend)
  }
}

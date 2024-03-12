export const visualOptions = {
  // one object for each visual option
  // example option
  // optionID: {                // unique id, used in the render.js
  //   type: 'number',          // type of input. Can be: number, text, boolean, colorScale
  //   label: 'Option label',   // the label displayed in the interface
  //   default: 20,             // default value
  //   group: 'Panel name',        // in which panel of the interface the option will be displayed
  // },

    marginTop: {
      type: 'number',
      label: 'Margin (top)',
      default: 20,
      group: 'artboard',
    },
  
    marginRight: {
      type: 'number',
      label: 'Margin (right)',
      default: 10,
      group: 'artboard',
    },
  
    marginBottom: {
      type: 'number',
      label: 'Margin (bottom)',
      default: 20,
      group: 'artboard',
    },
  
    marginLeft: {
      type: 'number',
      label: 'Margin (left)',
      default: 50,
      group: 'artboard',
    },
  
    showLegend: {
      type: 'boolean',
      label: 'Show legend',
      default: false,
      group: 'artboard',
    },
  
    legendWidth: {
      type: 'number',
      label: 'Legend width',
      default: 200,
      group: 'artboard',
      disabled: {
        showLegend: false,
      },
      container: 'width',
      containerCondition: {
        showLegend: true,
      },
    },
  
    stacksPadding: {
      type: 'number',
      label: 'Padding',
      default: 1,
      group: 'chart',
    },
  
    stacksOrder: {
      type: 'text',
      label: 'Sort stacks by',
      group: 'chart',
      options: ['Earliest', 'Ascending', 'Descending', 'None', 'Reverse'],
      default: 'None',
    },
  
    SortXAxisBy: {
      type: 'text',
      label: 'Sort X axis by',
      group: 'chart',
      options: [
        'Total value (descending)',
        'Total value (ascending)',
        'Name',
        'Original',
      ],
      default: 'Name',
    },
  
    useSameScale: {
      type: 'boolean',
      label: 'Use same scale',
      default: true,
      group: 'series',
    },
  
    columnsNumber: {
      type: 'number',
      label: 'Number of columns',
      default: 0,
      group: 'series',
    },
  
    sortSeriesBy: {
      type: 'text',
      label: 'Sort series by',
      group: 'series',
      options: [
        { label: 'Total value (descending)', value: 'valueDescending' },
        { label: 'Total value (ascending)', value: 'valueAscending' },
        { label: 'Name', value: 'name' },
        { label: 'Original', value: 'none' },
      ],
      default: 'valueDescending',
    },
  
    showSeriesLabels: {
      type: 'boolean',
      label: 'Show series titles',
      default: true,
      group: 'series',
    },
  
    repeatAxesLabels: {
      type: 'boolean',
      label: 'Repeat axis labels for each series',
      default: false,
      group: 'series',
    },
  
    showGrid: {
      type: 'boolean',
      label: 'Show series grid',
      default: true,
      group: 'series',
    },
  
    colorScale: {
      type: 'colorScale',
      label: 'Color scale',
      dimension: 'bars',
      default: {
        scaleType: 'ordinal',
        interpolator: 'interpolateSpectral',
      },
      group: 'colors',
    },
  }
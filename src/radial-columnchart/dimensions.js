export const dimensions = [
  // list here the available visual variables.
  // example visual variable:
  //
  // {
  //   id: 'dimensionName',                       // the dimension id, used in the cod. It must be unique.
  //   name: 'dimension Name',                    // the name shown in the interface
  //   validTypes: ['number', 'date', 'string'],  // accepted data types. Can be 'number', 'date', 'string'
  //   required: true,                            // if it is comulsory or not. by default is false
  //   aggregation: true,                         // if is possible to aggregate it or not
  //   multiple: true,                            // if is possible to map more than one data dimension
  //   aggregationDefault: {                      // if is possible to aggregate it, define the
  //     number: 'sum',                           // default aggregation for each data type
  //     string: 'csvDistinct',                   // listed in the "validTypes" property.
  //     date: 'csvDistinct',                     // Possible aggregations: csv, csvDistinct, sum, mean, max, min
  //   },
  //   operation: 'get',
  // },

  //example dimension
    {
      id: 'stacks',
      name: 'X Axis',
      validTypes: ['number', 'string', 'date'],
      required: true,
      operation: 'get',
    },
  
    {
      id: 'bars',
      name: 'Size',
      validTypes: ['number'],
      required: true,
      multiple: true,
      operation: 'get',
      aggregation: true,
      aggregationDefault: {
        number: 'sum',
      },
    },
  
    {
      id: 'series',
      name: 'Series',
      validTypes: ['number', 'string', 'date'],
      required: false,
      operation: 'get',
    },
  ]
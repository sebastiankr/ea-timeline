# ea-timeline
[![npm (scoped)](https://img.shields.io/npm/v/ea-timeline.svg)](https://github.com/sebastiankr/ea-timeline/releases)
[![Dependency Status](https://david-dm.org/sebastiankr/ea-timeline/status.svg)](https://david-dm.org/sebastiankr/ea-timeline)
[![devDependency Status](https://david-dm.org/sebastiankr/ea-timeline/dev-status.svg)](https://david-dm.org/sebastiankr/ea-timeline#info=devDependencies)
[![Build Status](https://img.shields.io/travis/sebastiankr/ea-timeline/master.svg?style=flat)](https://travis-ci.org/sebastiankr/ea-timeline)

Reactive timeline/gantt chart using D3 v4.


## Features

- Easy to update with new data
- Automatically scrolls with time
- Resizes horizontally

## Getting started

In your website
```shell
npm install ea-timeline
```

```html
<!DOCTYPE html>
<html>
<head>
  ...
  <script src="node_modules/build/ea-timeline.min.js "></script>
  ...
</head>
<body>
    ...
    <div id="ea-timeline"></div>
    ...
   <script>
   var data = [
    {
      key: 'Process 1',
      values: [
        {
          startTime: moment().subtract(4, 'hours'),
          endTime: moment().subtract(3, 'hours')
        }
      ]
    }
  ];
  var timeline = ea.timeline({elementSelector: '#ea-timeline', data: data});
   </script>
```

For development
```shell
git clone https://github.com/sebastiankr/ea-timeline.git
cd ea-timeline
npm install
npm start
```


![alt tag](https://raw.githubusercontent.com/sebastiankr/ea-timeline-ts/master/preview.gif)

## TODO


## Credits

_Inspired by_

> - https://github.com/jiahuang/d3-timeline 
> - https://gist.github.com/eyeseast/6407300 
> - http://bl.ocks.org/dk8996/5538271 

## License

MIT

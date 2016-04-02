# Wigy's Neat Dump

This is simple multi-purpose tool to display values to the browser console or to the Node terminal.

## In the browser

For example, in your HTML-page, simply use it like

```html
<html>
  <head>
    <script src="neat-dump.js"></script>
  </head>
    <body>
    See the console...
    <script>
      var obj = {name: "Some Name", value: 1.23};
      d("Obj value is", obj);
    </script>
  </body>
</html>
```

![alt text](https://raw.githubusercontent.com/wigy/neat-dump/master/pics/screen-shot.png "Screen shot from console.")

TODO: Update sample output.

You can use it in the middle of the expression to dump values, since it returns the value of
the last argument
```js
   result = some_function(d(a * a + b * b), c);
```

TODO: Sample output here

## As a Node module

You can load it as a Node-module and use it to display values on the terminal running the
Node-application:
```js
    var conf = {/* Some configuration defintion here */};
    var d = require('node_modules/neat-dump/neat-dump.js');

    d("Our application is starting with the configuration", conf);
```

TODO: Sample output here

## It can be used in unit-testing

TODO: Document

## It has different message levels

TODO: Document

## Configuring

TODO: Document

## Using different channels

TODO: Document

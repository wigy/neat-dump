# Wigy's Neat Dump

This is simple multi-purpose tool to display values on a browser console or Node terminal.

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

TODO: Sample output here

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

## It is Configurable

TODO: Document

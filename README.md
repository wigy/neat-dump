# Wigy's Neat Dump

This is a tool to display logging messages and debugging values to the browser console or to the Node terminal.

## Installing

Add it to the project
```html
npm install neat-dump --save
```

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
      d("Obj value is", obj, "and value of PI is", Math.PI);
    </script>
  </body>
</html>
```

![alt text](https://raw.githubusercontent.com/wigy/neat-dump/master/pics/test-browser-basics.png "Screen shot from console.")

You can use it in the middle of the expression to dump values, since it returns the value of
the last argument
```js
   var a = 2, b = 3;
   result = Math.sqrt(d(a * a + b * b));
```

![alt text](https://raw.githubusercontent.com/wigy/neat-dump/master/pics/test-browser-expressions.png "Screen shot from console.")

## As a Node module

You can load it as a Node-module and use it to display values on the terminal running the
Node-application:
```js
    var d = require('node_modules/neat-dump/neat-dump.js');

    var conf = {port: 2000, mode: "debug"};
    d("Our application is starting with the configuration", conf);
```

![alt text](https://raw.githubusercontent.com/wigy/neat-dump/master/pics/test-node.png "Screen shot from console.")

## It has different message levels

TODO: Document

## It can be used in unit-testing

TODO: Document

## Configuring and turning it off in production

TODO: Document

## Using different channels

TODO: Document


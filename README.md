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

## It has different message levels

By default the message is debug message. However also other levels of messages are supported.
```js
    d("Value of the PI is", Math.PI);
    d("Dumping configuration is", d.config);
    d.info("This is an informative message.");
    d.warning("This is a warning message.");
    d.error("This is an error message.");
```
![alt text](https://raw.githubusercontent.com/wigy/neat-dump/master/pics/test-browser-levels.png "Screen shot from console.")

In addition, one can use `d.fatal()` to throw an exception in addition to showing the message.

## Works in Node

You can load it as a Node-module and use it to display values on the terminal running the
Node-application:
```js
    var d = require('node_modules/neat-dump/neat-dump.js');

    var conf = {port: 2000, mode: "debug"};
    d("Our application is starting with the configuration", conf);
```

```shell
 12:17:04 DEBUG:  ------------- /home/wigy/neat-dump/test-node.js:6:1 -------------
 12:17:04 DEBUG:  Our application is starting with the configuration {mode: "debug", port: 2000}
```

## Configuring and turning it off in production

The utility is configurable. You can mute it completely for the production use for example:
```js
    d.config.beQuiet = true;
```
The configuration has also some auto-detected flags. The `d.config` has

* `hasNode` - Set if we are in the Node environment.
* `hasBrowser` - Set if we are in the browser environment.
* `beQuiet` - When set, we don't output anything.
* `showSourceLine` - When set, show the line, which has called dumping.
* `showStackTrace` - When set, show also full stack trace when values are dumped.
* `showTimestamp` - When set, include the time stamp in every line displayed.
* `showErrorLevel` - When set, include error level every line displayed.
* `showFunctions` - When set, show also functions.
* `displayFunction` - A function handling the actual showing of the message.

## Using different channels

You can define different channels that can be turned on and off independently. This is useful for
adding debuggin information for some particular module. To define channels you call `d.channels()`
and give channel names mapped to flags if they are turned on or off. To use channels, you add the
name of the string as the first parameter to the `d()` call. If the first parameter does not match
any defined channels, then channel `GENERIC` is used. It can also be turned off when setting
channels just like any other channel.

```js
    d.channels({
        NETWORK: true,
        CORE: true
    });
    d.config.showSourceLine = false;
    d("CORE", "Launching the application.");
    d("NETWORK", "Connecting to the server...");
    d("NETWORK", "We are connected.");
```

```shell
 13:46:11 DEBUG: [CORE] Launching the application.
 13:46:11 DEBUG: [NETWORK] Connecting to the server...
 13:46:11 DEBUG: [NETWORK] We are connected.
 13:46:11 DEBUG: [GENERAL] Something else.
```

## It can be used in unit-testing

TODO: Document

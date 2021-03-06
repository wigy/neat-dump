var d = (function(){

    /**
     * Definition of message levels.
     */
    var level = {
        DEBUG: "DEBUG",
        INFO: "INFO",
        WARNING: "WARNING",
        ERROR: "ERROR",
        FATAL: "FATAL",

        RED: "RED",
        GREEN: "GREEN",
        BLUE: "BLUE",
        YELLOW: "YELLOW",
        PURPLE: "PURPLE",
        CYAN: "CYAN",
        WHITE: "WHITE",
        ORANGE: "ORANGE"
    };

    /**
     * A mapping from channel names to flags telling if output is turned on.
     */
    var channels = {
    };

    /**
     * Dump configration with auto-detection.
     */
    function DumpConfig() {

        // Set if we are in the Node environment.
        this.hasNode = true;
        // Set if we are in the browser environment.
        this.hasBrowser = true;
        // Set if we are in the Jasmine unit-testing environment.
        this.hasJasmine = true;
        // When set, we don't output anything.
        this.beQuiet = false;
        // When set, show the line, which has called dumping.
        this.showSourceLine = true;
        // When set, show also full stack trace when values are dumped.
        this.showStackTrace = false;
        // When set, include the time stamp in every line displayed.
        this.showTimestamp = false;
        // When set, include error level every line displayed.
        this.showErrorLevel = false;
        // When set, show also functions.
        this.showFunctions = false;
        // If set, display messages during the call to d.except() in unit-testing.
        this.debugTesting = false;
        // A function handling the actual showing of the message.
        this.displayFunction = displayEngine;

        try {
            var test2 = module.id;
        } catch(e) {
            this.hasNode = false;
        }

        try {
            var test3 = window.jasmine.Env;
        } catch(e) {
            this.hasJasmine = false;
        }

        // At the moment browser implementation does not require anything special.
        this.hasBrowser = !this.hasNode;

        if (this.hasJasmine) {
        } else if (this.hasBrowser) {
            this.displayFunction = displayEngineBrowser;
        } else if (this.hasNode) {
            this.displayFunction = displayEngineNode;
            this.showTimestamp = true;
            this.showErrorLevel = true;
            this.showSourceLine = false;
        }
    }

    // Storage for checking recursion.
    var seen = [];
    // Helper to check if an object has been seen.
    function hasSeen(arg) {
        for (var s = 0; s < seen.length; s++) {
            if (arg === seen[s]) {
                return true;
            }
        }
        seen.push(arg);
        return false;
    }

    /**
     * Convert anything to reasonable string presentation.
     */
    function argToString(arg, depth) {
        // On the first call, reset list of seen objects.
        depth = depth || 0;
        if (!depth) {
            seen = [];
        }
        var m;
        var msg = '';
        if (arg instanceof Error) {
            return arg.stack;
        // TODO: What if a = [1, 2, 3]; a[1] = a
        } else if (arg instanceof Array) {
            if (hasSeen(arg)) {
                return '*recursion*';
            }
            msg += '[';
            for (m = 0; m < arg.length; m++) {
                if (msg !== '[') {
                    msg += ', ';
                }
                msg += argToString(arg[m], depth + 1);
            }
            msg += ']';
        } else if (arg instanceof Function) {
            if (Dump.config.showFunctions) {
                msg = 'function ' + arg.name + '(){...}';
            } else {
                msg = '';
            }
        } else if (arg instanceof Object) {
            // Avoid recursion by checking items we have already printed.
            if (hasSeen(arg)) {
                return '*recursion*';
            }
            // If object has its own implementation, let's use it.
            if (arg.toString !== ({}).toString) {
                msg += arg.toString();
            } else {
                msg += '{';
                var members = Object.getOwnPropertyNames(arg).sort();
                for (m = 0; m < members.length; m++) {
                    if (arg[members[m]] instanceof Function) {
                        continue;
                    }
                    if (msg !== '{') {
                        msg += ', ';
                    }
                    msg += members[m] + ': ';
                    msg += argToString(arg[members[m]], depth + 1);
                }
                msg += '}';
            }
        } else {
            msg += JSON.stringify(arg);
        }
        return msg;
    }

    /**
     * Convert any argument to string removing quotes, if they are outermost.
     */
    function argToUnquotedString(arg) {
        arg = argToString(arg);
        arg = arg.replace(/^"(.*)"$/, '$1');
        arg = arg.replace(/^'(.*)'$/, '$1');
        return arg;
    }

    /**
     * Construct a timestamp string.
     */
    function timestamp() {
        return (new Date()).toJSON().substr(11, 8);
    }

    /**
     * Convert an array of arguments to the space separated string.
     */
    function argsToString(args) {
        var msg = '';
        for (var i = 0; i < args.length; i++) {
            if (i) {
                msg += ' ';
            }
            msg += argToUnquotedString(args[i]);
        }
        return msg;
    }

    /**
     * A class wrapping one line of a message to be displayed.
     *
     * level - The message level.
     * channel - Name of the message category.
     * type - Type of the message ('message', 'line', 'stack')
     * prefix - Text to be added before the message.
     * args - Actual arguments to the dump function call.
     * text - Text presentation of the message.
     */
    function DumpMessage(level, channel, type, prefix, args) {
        this.level = level;
        this.channel = channel;
        this.type = type;
        this.prefix = prefix;
        this.args = args;
        this.text = argsToString(args);
    }

    /**
     * Default implementation of actual dumping.
     */
    function displayEngine(msg) {
        var text = msg.prefix;
        if (msg.channel !== null) {
            text += ' [' + msg.channel + '] ';
        }
        text += msg.text;
        console.log(text);
    }

    /**
     * Dumping implementation for browsers.
     */
    function displayEngineBrowser(msg) {
        var args = msg.args;

        if (msg.channel !== null) {
            args.unshift('[' + msg.channel + ']');
        }

        if (msg.prefix !== '') {
            args.unshift(msg.prefix.trim());
        }

        switch (msg.level) {
            case level.DEBUG:
                console.debug.apply(console, args);
                break;
            case level.INFO:
                console.info.apply(console, args);
                break;
            case level.WARNING:
                console.warn.apply(console, args);
                break;
            case level.ERROR:
            case level.FATAL:
                console.error.apply(console, args);
                break;
            default:
                console.log.apply(console, args);
                break;
        }
    }

    /**
     * Dumping implementation for Node.
     */
    function displayEngineNode(msg) {
        var text = msg.text;
        var prefix = msg.prefix;
        var color = '';
        var end = '';
        prefix = prefix.trim();
        if (msg.channel !== null) {
            prefix += ' [' + msg.channel + ']';
        }
        switch (msg.level) {
            case level.DEBUG:
                color = '\u001b[32m';
                end = '\u001b[0m';
                break;
            case level.INFO:
            case level.GREEN:
                color = '\u001b[32m';
                end = '\u001b[0m';
                break;
            case level.WARNING:
            case level.PURPLE:
                color = '\u001b[35m';
                end = '\u001b[0m';
                break;
            case level.ERROR:
            case level.FATAL:
            case level.RED:
                color = '\u001b[31m';
                end = '\u001b[0m';
                break;
            case level.BLUE:
                color = '\u001b[34m';
                end = '\u001b[0m';
                break;
            case level.YELLOW:
                color = '\u001b[33;1m';
                end = '\u001b[0m';
                break;
            case level.CYAN:
                color = '\u001b[36m';
                end = '\u001b[0m';
                break;
            case level.WHITE:
                color = '\u001b[37m';
                end = '\u001b[0m';
                break;
            case level.ORANGE:
                color = '\u001b[33m';
                end = '\u001b[0m';
                break;
            default:
                break;
        }
        if (msg.type == 'line') {
                color = '\u001b[1;30m';
                end = '\u001b[0m';
        }
        console.log(color + prefix + text, end);
    }

    /**
     * Special handlers for various frameworks.
     */
    var special = {
        ember: {
            check: function(obj) {
                try {
                    if (!Ember) {
                        return false;
                    }
                } catch(err) {
                    return false;
                }
                if (!obj) {
                    return false;
                }
                return !!obj.__ember_meta__;
            },
            convert: function(obj) {
                if (obj.eachAttribute) {
                    var ret = new (function EmberObject(){});
                    ret.id = obj.get('id');
                    ret.class = obj.get('constructor.modelName');
                    ret.data = {};
                    obj.eachAttribute(function(name, meta) {
                        ret.data[name] = obj.get(name);
                    });
                    return ret;
                }
                if (obj.objectAt) {
                    ret = [];
                    for (var i=0; i < obj.length; i++) {
                        ret.push(special.ember.convert(obj.objectAt(i)));
                    }
                    return ret;
                }
                return {EmberObject: "Unidentified by neat-dump."};
            }
        }
    };

    /**
     * Actual display handler for dumping values.
     */
    function display(level, args) {

        if (args.length === 0) {
            return;
        }

        if (Dump.config.displayFunction && !Dump.config.beQuiet) {

            var msg;

            // Get the stack trace and calculate caller.
            var caller, stack;

            var err = new Error('Stack trace');

            if (err.stack) {
                stack = err.stack.split("\n");
                stack.splice(0,3);

                var line = /\((.*)\)/.exec(stack[0]);
                if (line) {
                    caller = line[1];
                } else {
                    line = /^\s+at\s+(.*)/.exec(stack[0]);
                    if (line) {
                        caller = line[1];
                    } else {
                        caller = stack[0].trim();
                    }
                }
            } else {
                caller ='unknown';
            }

            // Resolve the channel and check if it is turned on.
            var channel = null;

            if (Object.keys(channels).length > 0) {
                if (args[0] in channels) {
                    if (!channels[args[0]]) {
                        return args[args.length - 1];
                    }
                    channel = args[0];
                    args = args.splice(1);
                } else {
                    channel = 'GENERAL';
                    if (channel in channels && !channels[channel]) {
                        return args[args.length - 1];
                    }
                }
            }

            // Calculate prefix.
            var prefix = '';
            if (Dump.config.showTimestamp) {
                prefix += timestamp() + ' ';
            }
            if (Dump.config.showErrorLevel) {
                prefix += level + ': ';
            }

            // Show the stack trace, if configured.
            if (Dump.config.showStackTrace) {
                msg = new DumpMessage(level, channel, 'stack', prefix, ['________________________________________________________________________________________']);
                Dump.config.displayFunction(msg);
                for (var i = 0; i < stack.length; i++) {
                    msg = new DumpMessage(level, channel, 'stack', prefix, [stack[i]]);
                    Dump.config.displayFunction(msg);
                }
            }

            // Show the source line, if configured and not showing full stack trace.
            else if (Dump.config.showSourceLine) {
                msg = new DumpMessage(level, channel, 'line', prefix, ['==', caller, '==']);
                Dump.config.displayFunction(msg);
            }

            // Check if there are special implementations for this object and use it.
            var supported = Object.keys(special);
            for (var n = 0; n < args.length; n++) {
                var arg = args[n];
                for (var k = 0; k < supported.length; k++) {
                    if (special[supported[k]].check(arg)) {
                        args[n] = special[supported[k]].convert(arg);
                        break;
                    }
                }
            }

            // Construct a message and display it.
            msg = new DumpMessage(level, channel, 'message', prefix, args);
            Dump.config.displayFunction(msg);
        }

        return args[args.length - 1];
    }

    /**
     * Exception classes for the utilty.
     */
    function DumpError(msg) {
        this.message = msg;
    }
    DumpError.prototype = Object.create(Error.prototype);
    DumpError.prototype.name = "DumpError";
    DumpError.prototype.constructor = DumpError;

    function DumpExceptionError(msg) {
        this.message = msg;
        this.stack = (new Error()).stack;
    }
    DumpExceptionError.prototype = Object.create(Error.prototype);
    DumpExceptionError.prototype.name = "DumpExceptionError";
    DumpExceptionError.prototype.constructor = DumpExceptionError;

    /**
     * Unit-testing helpers for dump tool.
     */
    function runTest(callback) {

        /**
         * An expectation class.
         */
        function DumpExpectation(messages, negated) {

            if (!negated) {
                this.not = new DumpExpectation(messages, true);
            }

            // Helper to raise expectation.
            function passOrRaise(flag, message, actual) {

                // Make Jasmine happy in case that this is only test inside a case.
                try {
                    if (jasmine) {
                        expect(true).toBe(true);
                    }
                } catch(e) {}

                // Actual test.
                message += " (had " + argToString(actual) + ")";
                if (!flag && !negated) {
                    throw new DumpExceptionError("Dump Expectation Failed: expected to " + message);
                }
                if (flag && negated) {
                    throw new DumpExceptionError("Dump Expectation Failed: expected not to " + message);
                }
            }

            // Helper to collect actual message texts.
            function messageTexts(filter) {
                var ret = [];
                for (i = 0; i < messages.length; i++) {
                    if (messages[i].type === 'message') {
                        if (filter && !filter(messages[i])) {
                            continue;
                        }
                        ret.push(messages[i].text);
                    }
                }
                return ret;
            }

            // Test if there are any messages.
            this.toHaveMessages = function() {
                passOrRaise(messages.length > 0, "have some messages", messages.length);
            };

            // Test if messages match exact list.
            this.toBe = function() {
                var args = Array.prototype.slice.call(arguments);
                var texts = messageTexts(function(msg) {
                    return msg.channel === null || msg.channel === 'GENERAL';
                });
                var match = false;
                if (args.length == texts.length) {
                    match = true;
                    for (var i = 0; i < args.length; i++) {
                        if (args[i] !== texts[i]) {
                            match = false;
                            break;
                        }
                    }
                }
                passOrRaise(match, "have exactly " + args.length + " messages ['" + args.join("', '") + "']", texts);
            };
        }

        // When testing, messages are collected here instead of displaying.
        var messages = [];
        var oldDisplay = Dump.config.displayFunction;

        // Display engine for testing.
        function displayTesting(msg) {
            messages.push(msg);
            if (Dump.config.debugTesting) {
                oldDisplay(msg);
            }
        }

        Dump.config.displayFunction = displayTesting;
        try {
            callback();
        } catch(e) {
            if (!(e instanceof DumpError)) {
                Dump.config.displayFunction = oldDisplay;
                throw e;
            }
        }
        Dump.config.displayFunction = oldDisplay;

        return new DumpExpectation(messages);
    }

    /**
     * Dump-utility interface itself is a function object with additional members.
     */
    var Dump = function() {
        var args = Array.prototype.slice.call(arguments);
        return display(level.DEBUG, args);
    };

    Dump.config = new DumpConfig();
    Dump.info = function() {
        var args = Array.prototype.slice.call(arguments);
        return display(level.INFO, args);
    };
    Dump.warning = function() {
        var args = Array.prototype.slice.call(arguments);
        return display(level.WARNING, args);
    };
    Dump.error = function() {
        var args = Array.prototype.slice.call(arguments);
        return display(level.ERROR, args);
    };
    Dump.fatal = function() {
        var args = Array.prototype.slice.call(arguments);
        display(level.FATAL, args);
        throw new DumpError("FATAL: " + argsToString(args));
    };
    Dump.channels = function(config) {
        for (var k in config) {
            // New channel is always set from config.
            if (!(k in channels)) {
                channels[k] = config[k];
            // Old channel is overridden unless value is null as defining a channel.
            } else if (config[k] !== null) {
                channels[k] = config[k];
            }
        }
    };
    Dump.expect = function(callback) {
        return runTest(callback);
    };

    function showInColor(color, args) {
        var oldshowTimestamp = Dump.config.showTimestamp;
        var showErrorLevel = Dump.config.showErrorLevel;
        Dump.config.showTimestamp = false;
        Dump.config.showErrorLevel = false;
        var ret = display(color, args);
        Dump.config.showTimestamp = oldshowTimestamp;
        Dump.config.showErrorLevel = showErrorLevel;
        return ret;
    }

    // Simple color prints.
    Dump.red = function() {
        showInColor(level.RED, Array.prototype.slice.call(arguments));
    };
    Dump.green = function() {
        showInColor(level.GREEN, Array.prototype.slice.call(arguments));
    };
    Dump.blue = function() {
        showInColor(level.BLUE, Array.prototype.slice.call(arguments));
    };
    Dump.purple = function() {
        showInColor(level.PURPLE, Array.prototype.slice.call(arguments));
    };
    Dump.yellow = function() {
        showInColor(level.YELLOW, Array.prototype.slice.call(arguments));
    };
    Dump.cyan = function() {
        showInColor(level.CYAN, Array.prototype.slice.call(arguments));
    };
    Dump.white = function() {
        showInColor(level.WHITE, Array.prototype.slice.call(arguments));
    };
    Dump.orange = function() {
        showInColor(level.ORANGE, Array.prototype.slice.call(arguments));
    };

    // Simple middleware for Express to show all requests with special color.
    Dump.middleware = function() {
        return function(req, resp, next) {
            var line = '[' + req.ip + '] ' + req.method + ' ' + req.originalUrl;
            var msg = new DumpMessage('INFO', null, 'message', '\u001b[33m' + timestamp() + ' ', [line]);
            displayEngineNode(msg);
            next();
        }
    };

    return Dump;
})();

// Export it for Node.
if (d.config.hasNode) {
    module.exports = d;
}

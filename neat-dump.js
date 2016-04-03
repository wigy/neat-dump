var d = (function(){

    /**
     * Definition of message levels.
     */
    var level = {
        DEBUG: "DEBUG",
        INFO: "INFO",
        WARNING: "WARNING",
        ERROR: "ERROR",
        FATAL: "FATAL"
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
        // A function handling the actual showing of the message.
        this.displayFunction = displayEngine;

        try {
            var test = module.id;
        } catch(e)  {
            this.hasNode = false;
        }

        this.hasBrowser = !this.hasNode;

        if (this.hasBrowser) {
            this.displayFunction = displayEngineBrowser;
        } else if (this.hasNode) {
            this.displayFunction = displayEngineNode;
            this.showTimestamp = true;
            this.showErrorLevel = true;
        }
    }

    /**
     * Convert anything to reasonable string presentation.
     */
    function argToString(arg) {
        // TODO: Mark and detect recustion on objects like in d(document)
        // TODO: Detect and fix objects with keys 0..n-1 like in d(document.all)
        var m;
        var msg = '';
        if (arg instanceof Array) {
            msg += '[';
            for (m = 0; m < arg.length; m++) {
                if (m) {
                    msg += ', ';
                }
                msg += argToString(arg[m]);
            }
            msg += ']';
        } else if (arg instanceof Function) {
            // TODO: If the showFunction flag is set...
            msg = '';
        } else if (arg instanceof Object && !arg.__class) {
            msg += '{';
            var members = Object.getOwnPropertyNames(arg).sort();
            for (m = 0; m < members.length; m++) {
                if (arg[members[m]] instanceof Function) {
                    continue;
                }
                if (m) {
                    msg += ', ';
                }
                msg += members[m] + ': ';
                msg += argToString(arg[members[m]]);
            }
            msg += '}';
        } else if (arg instanceof Object && arg.__class) {
            // Chronicles of Angular has own stringifying methods.
            // TODO: Maybe check existence of toString?
            msg += arg.toString();
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
     * prefix - Text to be added before the message.
     * args - Actual arguments to the dump function calll.
     */
    function DumpMessage(level, channel, prefix, args) {
        this.level = level;
        this.channel = channel;
        this.prefix = prefix;
        this.args = args;
    }

    /**
     * Default implementation of actual dumping.
     */
    function displayEngine(msg) {
        var text = msg.prefix;
        if (msg.channel !== null) {
            text += ' [' + msg.channel + '] ';
        }
        text += argsToString(msg.args);
        console.log(text);
    }

    /**
     * Dumping implementation for browsers.
     */
    function displayEngineBrowser(msg) {
        var args = msg.args;

        if (msg.channel !== null) {
            args.unshift(' [' + msg.channel + '] ');
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
        var text = argsToString(msg.args);
        var prefix = msg.prefix;
        prefix = prefix.trim();
        if (msg.channel !== null) {
            prefix += ' [' + msg.channel + ']';
        }

        switch (msg.level) {
            case level.DEBUG:
                console.log('\u001b[32m', prefix, text, '\u001b[39m');
                break;
            case level.INFO:
                console.log('\u001b[37m', prefix, text, '\u001b[39m');
                break;
            case level.WARNING:
                console.log('\u001b[35m', prefix, text, '\u001b[39m');
                break;
            case level.ERROR:
            case level.FATAL:
                console.log('\u001b[31m', prefix, text, '\u001b[39m');
                break;
            default:
                console.log(prefix, text);
                break;
        }
    }

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
            var err = new Error('Stack trace');
            var stack = err.stack.split("\n");
            stack.splice(0,3);

            var line = /\((.*)\)/.exec(stack[0]);
            var caller;
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
                prefix += (new Date()).toJSON().substr(11, 8) + ' ';
            }
            if (Dump.config.showErrorLevel) {
                prefix += level + ': ';
            }

            // Show the stack trace, if configured.
            if (Dump.config.showStackTrace) {
                msg = new DumpMessage(level, channel, prefix, ['-------------------------------------------------------------------']);
                Dump.config.displayFunction(msg);
                for (var i = 0; i < stack.length; i++) {
                    msg = new DumpMessage(level, channel, prefix, [stack[i]]);
                    Dump.config.displayFunction(msg);
                }
            }

            // Show the source line, if configured and not showing full stack trace.
            else if (Dump.config.showSourceLine) {
                msg = new DumpMessage(level, channel, prefix, ['-------------', caller, '-------------']);
                Dump.config.displayFunction(msg);
            }

            // Construct a message and display it.
            msg = new DumpMessage(level, channel, prefix, args);
            Dump.config.displayFunction(msg);
        }

        return args[args.length - 1];
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
        throw new Error("FATAL: " + argsToString(args));
    };
    Dump.channels = function(config) {
        channels = config;
    };

    return Dump;
})();

// Export it for Node.
if (d.config.hasNode) {
    module.exports = d;
}

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
        this.showFullStack = false;
        // When set, include the time stamp in every line displayed.
        this.showTimestamp = false;
        // When set, show also functions.
        this.showFunctions = false;
        // A function handling the actual showing of the message.
        this.displayFunction = DisplayEngine;

        try {
            var test = module.id;
        } catch(e)  {
            this.hasNode = false;
            this.showTimestamp = true;
        }

        this.hasBrowser = !this.hasNode;

        if (this.hasBrowser) {
            this.displayFunction = DisplayEngineBrowser;
        } else if (this.hasNode) {
            this.displayFunction = DisplayEngineNode;
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
     * args - Actual arguments to the dump function calll.
     * stack - An array of lines in the stack dump.
     * caller - The file and line number of the caller.
     */
    function DumpMessage(level, args, stack) {
        this.level = level;
        this.args = args;
        this.stack = stack;

        var caller = /\((.*)\)/.exec(stack[0]);
        if (caller) {
            this.caller = caller[1];
        } else {
            caller = /^\s+at\s+(.*)/.exec(stack[0]);
            if (caller) {
                this.caller = caller[1];
            } else {
                this.caller = stack[0].trim();
            }
        }
    }

    /**
     * Default implementation of actual dumping.
     */
    function DisplayEngine(msg) {
        console.log(msg)
    }

    /**
     * Dumping implementation for browsers.
     */
    function DisplayEngineBrowser(msg) {
        DisplayEngine(msg)
    }

    /**
     * Dumping implementation for Node.
     */
    function DisplayEngineNode(msg) {
        DisplayEngine(msg)
    }

    /**
     * Actual display handler for dumping values.
     */
    function Display(level, args) {
        if (args.length === 0) {
            return;
        }
        var err = new Error('Stack trace');
        var stack = err.stack.split("\n");
        stack.splice(0,3);
        var msg = new DumpMessage(level, args, stack);
        if (Dump.config.displayFunction && !Dump.config.beQuiet) {
            Dump.config.displayFunction(msg);
        }
        return args[args.length - 1];
    }

    /**
     * Dump-utility interface itself is a function object with additional members.
     */
    var Dump = function() {
        var args = Array.prototype.slice.call(arguments);
        return Display(level.DEBUG, args);
    };

    Dump.config = new DumpConfig();
    Dump.info = function() {
        var args = Array.prototype.slice.call(arguments);
        return Display(level.INFO, args);
    };
    Dump.warning = function() {
        var args = Array.prototype.slice.call(arguments);
        return Display(level.WARNING, args);
    };
    Dump.error = function() {
        var args = Array.prototype.slice.call(arguments);
        return Display(level.ERROR, args);
    };
    Dump.fatal = function() {
        var args = Array.prototype.slice.call(arguments);
        Display(level.FATAL, args);
        throw new Error("FATAL: " + argsToString(args));
    };

    return Dump;
})();

// Export it for Node.
if (d.config.hasNode) {
    module.exports = d;
}

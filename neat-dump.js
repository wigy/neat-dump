var d = (function(){

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
        // A function handling the actual showing of the message.
        this.displayFunction = DumpEngine;

        try {
            module.id;
        } catch(e)  {
            this.hasNode = false;
            this.showTimestamp = true;
        }

        this.hasBrowser = !this.hasNode;

        if (this.hasBrowser) {
            this.displayFunction = DumpEngineBrowser;
        } else if (this.hasNode) {
            this.displayFunction = DumpEngineNode;
        }
    }

    /**
     * A class wrapping one line of a message to be displayed.
     */
    function DumpMessage() {
    }

    /**
     * A base class for dumping implementations.
     */
    function DumpEngine() {

    }

    /**
     * Dumping implementation for browsers.
     */
    function DumpEngineBrowser() {
    }
    DumpEngineBrowser.prototype = new DumpEngine();

    /**
     * Dumping implementation for Node.
     */
    function DumpEngineNode() {
    }
    DumpEngineNode.prototype = new DumpEngine();

    /**
     * Actual Dump-utility itself is a function object with additional members.
     */
    var Dump = function(args) {
        // TODO: Proper implementation.
        console.log("DUMP:", args, Dump.config);
    }

    Dump.config = new DumpConfig();

    return Dump;
})();

// Export it for Node.
if (d.config.hasNode) {
    module.exports = d;
}

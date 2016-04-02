var d = (function(){

    /**
     * Dump configration with auto-detection.
     */
    function DumpConfig() {

        // Set if we are in the Node environment.
        this.hasNode = true;
        // When set, we don't output anything.
        this.beQuiet = false;
        // When set, show also stack trace with the values dumped.
        this.showStack = false;

        try {
            module.id;
        } catch(e)  {
            this.hasNode = false;
        }
    }

    /**
     * A class wrapping a message to be displayed.
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

    // Export it. TODO: Move inside after env-detection there.
    if (Dump.config.hasNode) {
        module.exports = Dump;
    }

    return Dump;
})();

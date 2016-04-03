#!/usr/bin/env node

var d = require('./neat-dump')

d.channels({
    NETWORK: true,
    CORE: true,
});
d.config.showSourceLine = false;
d("CORE", "Launching the application.");
d("NETWORK", "Connecting to the server...");
d("NETWORK", "We are connected.");
d("Something else.");

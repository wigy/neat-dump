#!/usr/bin/env node

var d = require('./neat-dump')

d("Value of the PI is", Math.PI);
d("Dumping configuration is", d.config);
d.info("This is an informative message.");
d.warning("This is a warning message.");
d.error("This is an error message.");
// TODO: enable when works: d("Module is", module);

#!/usr/bin/env node

var d = require('./neat-dump')

var conf = {port: 2000, mode: "debug"};
d("Our application is starting with the configuration", conf);
// TODO: try out when works: d("Module is", module);

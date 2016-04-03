#!/usr/bin/env node

var d = require('./neat-dump')

d.test(function(){
    d("Message 1");
    d.info("Message 2");
});
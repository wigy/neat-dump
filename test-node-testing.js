#!/usr/bin/env node

var d = require('./neat-dump')

// TODO: this could be added as package test once done
d.expect(function(){
    d("Message 1");
    d.info("Message 2");
});
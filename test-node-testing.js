#!/usr/bin/env node

var d = require('./neat-dump')

d.config.showSourceLine = false;
d.config.debugTesting = false; // Enable to see messages from tests.

d.info("Testing various basic string presentations...");
d.expect(function(){
    d(1, true, false, null, undefined, {a: 22}, [], {x: [null, {y: null}]});
}).toBe('1 true false null undefined {a: 22} [] {x: [null, {y: null}]}');

d.info("Testing toBe()...");
d.expect(function(){
    function my(num) {
        d("Number was", num);
    }
    my(7);
    my(-1);
}).toBe("Number was 7", "Number was -1");

d.info("Testing toHaveMessages()...");
d.expect(function(){
    d.error("Test error.");
}).toHaveMessages();

d.info("Testing not...");
d.expect(function(){
    /* No messages */
}).not.toHaveMessages();

d.info("Testing that custom toString() is respected...");
d.expect(function(){
    function Obj() {
        this.x = 12;
        this.toString = function() {return 'I am Obj ' + this.x;}
    }
    d(new Obj());
}).toBe('I am Obj 12');

d.info("Testing exceptions in test...");
d.expect(function(){
    d.fatal("DIE!");
}).toBe("DIE!");

d.info("Testing functions presentation...");
d.expect(function(){
    d.config.showFunctions = true;
    d(function x(){});
    d(function (){});
    d.config.showFunctions = false;
}).toBe("function x(){...}", "function (){...}");

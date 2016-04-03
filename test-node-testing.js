#!/usr/bin/env node

var d = require('./neat-dump')

d.config.showSourceLine = false;

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
        this.toString = function() {return 'I am Obj';}
    }
    d(new Obj());
}).toBe('I am Obj');

#!/usr/bin/env node

var d = require('./neat-dump')

d.config.showSourceLine = false;

d("Testing toBe()...");
d.expect(function(){
    function my(num) {
        d("Number was", num);
    }
    my(7);
    my(-1);
}).toBe("Number was 7", "Number was -1");

d("Testing toHaveMessages()...");
d.expect(function(){
    d.error("Test error.");
}).toHaveMessages();

d("Testing not...");
d.expect(function(){
    /* No messages */
}).not.toHaveMessages();

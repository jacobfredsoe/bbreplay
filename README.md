BBReplay
========

A nodejs module that reads Blood Bowl replay files

Installation
============

Simplest way to install `bbreplay` is to use [npm](http://npmjs.org), just `npm
install bbreplay` which will download bbreplay and all dependencies.

Usage
=====

```javascript
var bbreplay = require('bbreplay');
var params = {
        replay: 'path to your BB2 replay file'
    }

bbreplay.getMatchResults(params, function (err, result) {
    console.dir(result);
});
```

Version
=======
version 0.1.0 : First implementation of the library with one function 
'getMatchResults' that returns BB2 match result as json object

Getting support
===============

Please, if you have a problem with the library, first make sure you read this
README. If you read this far, thanks, then please make sure your
problem really is with `bbreplay`. It is? Okay, then open an issue.

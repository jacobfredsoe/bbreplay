BBReplay
========

A nodejs module that reads Blood Bowl replay files

## Installation

Simplest way to install `bbreplay` is to use [npm](http://npmjs.org), just `npm
install bbreplay` which will download bbreplay and all dependencies.



## Usage

```javascript
var bbreplay = require('bbreplay');
var params = {
        replay: 'path to your BB2 replay file'
    }

bbreplay(params, function (err, result) {
    console.dir(result);
});

```
## Documentation
### bbreplay(params, callback)

__Arguments__

`params` - An object with the parameters to be used by the function
*`replay` - path to the BB2 replay file
`callback(err, res)` - A callback which is called when the function
  has finished, or an error occurs.
*`err` - null if no error occurs during match replay processing, information 
about the error otherwise.
*`res` - object with match data. 

__Examples__

```js
bbreplay(params, function (err, result) {
    // results is an object with match data
    console.dir(result);
});
```

## Versions
version 0.2.0 : Code refactoring
version 0.1.0 : First implementation of the library with one function 
'getMatchResults' that returns BB2 match result as json object

## Getting support

Please, if you have a problem with the library, first make sure you read this
README. If you read this far, thanks, then please make sure your
problem really is with `bbreplay`. It is? Okay, then open an issue.

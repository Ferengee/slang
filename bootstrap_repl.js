var fs = require('fs'),
    vm = require('vm');

var sandbox = {};    

fs.readFile("./lang.js", 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  vm.runInThisContext(data);
})
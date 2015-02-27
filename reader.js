var Symbols = require("./symbols.js");
var Parser = require("./parser.js");
function Reader(){  
  /* READER */
  var tokenize = function(string){
    return string.replace(/([\(\)'\n`,])/g, " $1 ").replace(/\s+/g," ").split(" ").filter(function(x) { return x != "" ; })
  };
  
  this.tokenize = tokenize;

  this.read = function (string){  
    var tokens = tokenize(string);    
    return new Parser(tokens).parseObject();
  }  
}
module.exports = Reader;
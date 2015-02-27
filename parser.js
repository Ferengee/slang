var Symbols = require("./symbols.js");
var Numbers = require("./numbers.js");

var nil = Symbols.intern("nil");
function Parser(tokens){  
  var getToken = function(){ return tokens.shift() };

  this.parseObject = function(token){
    token = token || getToken();
    if(token === undefined){
      var error =  new Error("Incomplete read");
      error.retry = true;
      throw error;
    }
    if(token == "(") { return this.parseList(); }
    if(token == "'") { return cons(quote, cons(this.parseObject(), nil)); }
    if(token == "`") { return cons(quasiquote, cons(this.parseObject(), nil)); }
    if(token == ",") { return cons(unquote, cons(this.parseObject(), nil)); }
    if(token.match(/^[-+]?[0123456789]/)) { return this.parseNumber(token)}
    return Symbols.intern(token);
  }
  
  this.parseList = function(){
    var token = getToken();
    
    if(token == ")") { return nil; }
    if(token == ".") {
      var r = this.parseObject(); 
      var token = getToken();
      if(token != ")"){
        throw new Error("Invalid list after . notation");
      }
      return r;
    }
    return cons(this.parseObject(token), this.parseList());
  }
    
  this.parseNumber = function(token){
    if(token.indexOf(".") > -1){
      return makeNumber("float", parseFloat(token));
    }else if(token.indexOf("/") > -1){
      var parts = token.split("/");
      if(parts.length > 2){
        throw new Error("Invalid rational format: " + token);
      }
      return makeNumber("rational", parseInt(parts[0]), parseInt(parts[1]));
    }else {
      return makeNumber("int", parseInt(token));
    }
  }
}  

module.exports = Parser;
IgnoreCase = true;

var nil = new Symbol();

function Symbol(name){
  this.name = name;
}

function KeywordSymbol(name){
  this.name = name;
}

KeywordSymbol.prototype = new Symbol();

Symbol.prototype.toString = function(){
  return this.name;
}
Symbol.prototype.compare = function(other){
  if(this.name == other.name){
    return 0; 
  }
  return -1;
}

var symbols = {};

function makeSymbol(token, constructor){
  if(IgnoreCase){
    token = token.toLowerCase();
  }
  var result = symbols[token];
  if(result === undefined){
    result = constructor(token);  
    symbols[token] = result;
  }
  return result;
}

function intern(token){
  return makeSymbol(token, function(t) { return new Symbol(t)});
}
function keyword(token){
  return makeSymbol(token, function(t) {return new KeywordSymbol(t)});
}

module.exports.intern = intern;
module.exports.keyword = keyword;
module.exports.isKeywordSymbol = function(sym){
  return (sym instanceof  KeywordSymbol);
};

module.exports.isSymbol = function(sym){
  return (sym instanceof Symbol);
};
module.exports.symbols = symbols;
module.exports.Symbol = Symbol; 

module.exports.nil = nil;
module.exports.isNil = function(exp){
  return exp === nil;
}


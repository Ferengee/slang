IgnoreCase = true;

function LSymbol(name){
  this.name = name;
}

function LKeywordSymbol(name){
  this.name = name;
}

LKeywordSymbol.prototype = new LSymbol();

LSymbol.prototype.toString = function(){
  return this.name;
}
LSymbol.prototype.compare = function(other){
  if(this.name == other.name){
    return 0; 
  }
  return -1;
}

var symbols = {};

function intern(token){
  if(IgnoreCase){
    token = token.toLowerCase();
  }
  var result = symbols[token];
  if(result === undefined){
    if(token.match(/^:/)) {  
      result = new LKeywordSymbol(token);
    } else {
      result = new LSymbol(token);
    }
    symbols[token] = result;
  }
  return result;
}
module.exports.intern = intern;
module.exports.isKeywordSymbol = function(sym){
  return (sym instanceof LKeywordSymbol);
};

module.exports.isSymbol = function(sym){
  return (sym instanceof LSymbol);
};
module.exports.symbols = symbols;
module.exports.LSymbol = LSymbol; 


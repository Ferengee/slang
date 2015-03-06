var Numbers = {};

Numbers.Integer = function(i){
}

Numbers.isNumeric = function(n){
  return n instanceof Numbers.Integer;
}

Numbers.makeInteger = function(i){
  return new Numbers.Integer(i);
}


module.exports = Numbers;
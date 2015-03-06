var symbols = require("./symbols");
var Numbers = require("./numbers");


function Evaluator() {
  
}

Evaluator.prototype.isSelfEvaluating = function(expression){
    return expression == symbols.nil || Numbers.isNumeric(expression);
}

Evaluator.prototype.eval = function(expression){
  if(this.isSelfEvaluating(expression)){
    return expression;
  }
}

module.exports = Evaluator;

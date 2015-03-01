var symbols = require("./symbols");
var nil = symbols.nil;

function ConsCell(car, cdr){
  this.car = car;
  this.cdr = cdr;
}

module.exports = {
  cons: function(car, cdr){
    return new ConsCell(car, cdr);
  },
  isList: function(lst){
    return lst == nil || lst instanceof ConsCell;
  },
  car: function(lst){
    return lst.car;
  }
}
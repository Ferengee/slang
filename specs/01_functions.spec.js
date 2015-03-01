var functions = require("../functions");
var symbols = require("../symbols");
var datastructures = require("../datastructures");

describe("fuctions", function(){
  var nil = symbols.nil;
  
  describe("cons", function(){
    
    var cons = functions.cons;
    it("should build a list", function(){
      var lst = cons(nil, nil);
      expect(datastructures.isList(lst)).toBe(true);
    });
    
    it("should prepend an item to a list", function(){
      var lst = cons();
      var lst = cons(nil, lst);
      expect(datastructures.isList(lst)).toBe(true);
    });
    
    
  });
  
  describe("car", function(){
    var cons = functions.cons;
    var car = functions.car;
    it("should retrieve the element in the list", function(){
      var lst = cons(nil, nil);
      expect(car(lst)).toBe(nil);
    });
  });
  
});

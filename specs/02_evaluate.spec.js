var Evaluator = require("../evaluator");
var symbols = require("../symbols");
var Numbers = require("../numbers");


describe("slang evaluator", function(){
 
  var evaluator;
  var nil;
  
  beforeEach(function(){
    evaluator = new Evaluator;
    nil = symbols.nil;
  });
  
  it("nil should be self evaluating", function(){
    expect(evaluator.eval(nil)).toBe(nil);
    expect(evaluator.eval(nil)).not.toBe(undefined);
    
  });
  
  it("numbers should be self evaluating", function(){
    var one = Numbers.makeInteger(1);
    expect(evaluator.eval(one)).toBe(one);
    expect(evaluator.eval(one)).not.toBe(undefined);
  });
});
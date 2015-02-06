var Slang = require("../lang");
var eval = Slang.functions.eval;
var read = Slang.reader.read;
var makeNumber = Slang.functions.makeNumber;

function testEvaluation(env, code, result){
  var ast = eval(read(code), env);
  expect(ast.toString()).toEqual(result);
}
    
describe("slang evaluator", function(){
  var env;
  var ast;
  
  beforeEach(function(){
    env = Slang.environnement();
  });
  
  
 
  it("should display fractions as fractions", function(){
    testEvaluation(env, "(/ 1 2)", "1/2")
    testEvaluation(env, "1/2", "1/2")
    
  });

  
  it("should be able to simplefy fractions", function(){
    testEvaluation(env, "(+ 1(/ 1 2))", "3/2")
    testEvaluation(env, "(rat->simplify (+ 1(/ 1 2)))", "(+ 1 1/2)")
 
  });

  
  it("should be able to cast rational numbers to floats", function(){
    testEvaluation(env, "(rat->float (+ 1(/ 1 2)))", "1.5")
 
  });

  
});

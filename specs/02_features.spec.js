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
  
  
  it("quasiquoting should unquote for one symbol", function(){
    testEvaluation(env, "(define aap 'noot)", "aap")
    testEvaluation(env, "`(aap ,aap mies)", "(aap noot mies)")

  });
  
  it("optimize for tail recursion", function(){
    tailRecFact = "(define  (!i x)   " +
              "  (define (iter n m)    " +
              "    (cond    " +
              "        ((= n 0) m)    " +
              "        (t (iter (- n 1) (* m n))))) " +
              "  (iter x 1)) ";
    recursiveFact = "(define (! n) (cond ((< n 2) n) (t (* n (! (- n 1))))))";
              
    eval(read(tailRecFact), env);
    eval(read(recursiveFact), env);
    
    testEvaluation(env, "(! 5)", "120");
    testEvaluation(env, "(!i 5)", "120");
    
    //testEvaluation(env, "(!i 5000)", "120");
    expect(function(){eval(read("(! 5000)"), env)}).toThrow("Maximum call stack size exceeded");
    expect(function(){eval(read("(!i 5000)"), env)}).not.toThrow("Maximum call stack size exceeded");
  });
  
});

describe("utility gcd", function(){
  function gcd(a, b){
    if (b == 0){
      return a;
    } else {
      return gcd(b, a % b);
    }
  }
  
  function gcd2(a, b){
    var t;
    while(b != 0){
      t = a;
      a = b;
      b = a % b;
    }
    return a;
  }
  
  it("should work for small numbers",function(){
      expect(gcd(27, 30)).toEqual(3);
  });

  
  it("should not run off the stack",function(){
     expect(function () { gcd(Math.pow(2, 1030), Math.pow(2, 1020)) }).toThrow();
  });
  
    it("should not run off the stack",function(){
     expect(function () { gcd2(Math.pow(2, 1030), Math.pow(2, 1020)) }).not.toThrow();
  });
  
  
});
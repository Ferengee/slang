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

  it("set! should not be able to manipulate undefined values", function(){
    var doSet = function(){ eval(read("(set! *aap* 'noot)"), env)};
    expect(doSet).toThrow();
  });
  
  it("set! should be able to manipulate values", function(){
    testEvaluation(env, "(define *aap* 'noot)", "*aap*")
    testEvaluation(env, "*aap*", "noot");
    testEvaluation(env, "(set! *aap* 'mies)", "mies");
    testEvaluation(env, "*aap*", "mies");

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
    
    expect(function(){eval(read("(! 5000)"), env)}).toThrow("Maximum call stack size exceeded");
    expect(function(){eval(read("(!i 5000)"), env)}).not.toThrow("Maximum call stack size exceeded");
  });
  
  it("target allow a rest parameter to take all the extra arguments", function(){
      testEvaluation(env, "(define (rest-test a . rest) rest)", "rest-test");
      testEvaluation(env, "(rest-test 'a 30 40)", "(30 40)");
  });
  it("target parameters by name", function(){


    testEvaluation(env, "(define (testfn a b) (- a b))", "testfn");
    testEvaluation(env, "((testfn) 70 50)", "20");
    testEvaluation(env, "((testfn 80) 40)", "40");
    testEvaluation(env, "(testfn 90 30)", "60");


    testEvaluation(env, "(testfn :a 90 :b 30)", "60");
    testEvaluation(env, "(testfn :b 90 :a 30)", "-60");
    testEvaluation(env, "(testfn :b 90)", "(lambda (a) (- a b))");
    testEvaluation(env, "(testfn :b 90 30)", "-60");
  });
  
  it("should be able to set default values", function(){
    testEvaluation(env, "(define (testfn :a 2 b) (- a b))", "testfn");
    testEvaluation(env, "(testfn :b 3)", "-1");
    testEvaluation(env, "(testfn 2 3)", "-1");

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
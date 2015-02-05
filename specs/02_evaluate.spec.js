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
  
  it("numbers to be self evaluating", function(){
      testEvaluation(env, "1", "1");
  });
  
  it("keyword symbols to be self evaluating", function(){
      testEvaluation(env, ":aap", ":aap");
  });
  
  
  it("evaluate simple math", function(){
    testStr = "(+ 3 5)";
    ast = eval(read(testStr),env);
    var number = makeNumber("rational", 8, 1);
    expect(ast).toEqual(number);
    expect(ast.toString()).toEqual("8");
  });

  it("evaluate a lambda form", function(){
    testStr = "(lambda x y)";
    ast = eval(read(testStr),env);
    
    expect(ast.args).toEqual(Slang.symbols.x);
    expect(ast.code.car).toEqual(Slang.symbols.y);

    expect(ast.toString()).toEqual(testStr);
  });
  
  it("define a variable", function(){
    testStr = "(define aap 'noot)";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("aap");
    
    ast = eval(read("aap"), env);
    expect(ast.toString()).toEqual("noot");
    
  });
  
  it("should not find an nonextistant symbol", function(){
    var doEvalUnknownSymbol =  function(){
      eval(read("aap"), env);
    }
    expect(doEvalUnknownSymbol).toThrow("empty environnement at last frame while looking for: aap");
  });
  
  it("define a function", function(){
    testStr = "(define (aap noot) noot)";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("aap");
    
    testStr = "aap";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("(lambda (noot) noot)");
    
  });
  
  it("apply a function", function(){
    testStr = "(define (aap noot) noot)";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("aap");
    
    testStr = "(aap 'mies)";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("mies");
  });
  
  it("partially apply a function", function(){
    testStr = "(define (aap noot mies) (list noot mies))";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("aap");
    
    testStr = "(aap 'mies)";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("(lambda (mies) (list noot mies))");
  });
  
});
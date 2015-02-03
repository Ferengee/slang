var Slang = require("../lang");

describe("slang evaluator", function(){
  var testStr = "(+ 3 5)";
  var env = Slang.environnement;
  var eval = Slang.functions.eval;
  var read = Slang.reader.read;
  var makeNumber = Slang.functions.makeNumber;
  
  it("evaluate simple math", function(){
    var ast = eval(read(testStr),env);
    var number = makeNumber("rational", 8, 1);
    expect(ast).toEqual(number);
    expect(ast.toString()).toEqual("8");
  });

  it("evaluate a lambda form", function(){
    var testStr = "(lambda x y)";
    var ast = eval(read(testStr),env);
    
    expect(ast.args).toEqual(Slang.symbols.x);
    expect(ast.code.car).toEqual(Slang.symbols.y);

    expect(ast.toString()).toEqual(testStr);
  });
});
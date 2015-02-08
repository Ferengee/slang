var Slang = require("../lang");

var eval = Slang.functions.eval;
var read = Slang.reader.read;

var pairUp = Slang.api.pairUp;
var intern = Slang.api.intern;
var preparePairupParameters = Slang.api.preparePairupParameters;

var extractKeyValues =  Slang.api.extractKeyValues;

var makeNumber = Slang.functions.makeNumber;
var cdr = Slang.functions.cdr;
var car = Slang.functions.car;
var cons = Slang.functions.cons;
var isNil = Slang.functions.isNil;
var isSymbol = Slang.functions.isSymbol;
var isKeywordSymbol = Slang.functions.isKeywordSymbol;
var ParameterList = Slang.api.ParameterList;

function testEvaluation(env, code, result){
  var ast = eval(read(code), env);
  expect(ast.toString()).toEqual(result);
}

function evalRead(code){
  return eval(read(code), Slang.environnement());
}
    

    
describe("slang apply", function(){
  var env;
  var ast;
  
  var plainlist = evalRead("'(a b)");
  var listWithSymbolEnd = evalRead("'(a b . d)");
  var listWithPairs = evalRead("'(:a 2 b)");
  
  beforeEach(function(){
    env = Slang.environnement();
  });
  
 
  describe("Function ParameterList", function(){
    it("should be made", function(){
      expect((new ParameterList()) instanceof ParameterList).toBe(true);
    });
    
    it("should give me all keys in order",function(){
      var parameters = evalRead("'(a :b bb c :d dd e)");
      var lst = new ParameterList(parameters);
      expect(lst.getKeys()).toEqual(['b', 'd']);
      expect(lst.getParameters()).toEqual(['a', 'b','c', 'd', 'e']);
    });
    
    it("should give me all unnamed values in order",function(){
      var parameters = evalRead("'(a :b bb c :d dd e)");
      var lst = new ParameterList(parameters);
      expect(lst.getUnnamedValues()).toEqual(['a', 'c', 'e'].map(function(c){
        return intern(c);
      }));
    });
    
    it("should give me all keys in order even with rest",function(){
      var parameters = evalRead("'(a :b bb c :d dd e . r)");
      var lst = new ParameterList(parameters);
      expect(lst.getKeys()).toEqual(['b', 'd']);
      expect(lst.getParameters()).toEqual(['a', 'b','c', 'd', 'e']);
    });
    
   it("should give me a hash of the pairs",function(){
      var parameters = evalRead("'(a :b bb c :d dd e)");
      var lst = new ParameterList(parameters);
      expect(lst.getKeys()).toEqual(['b', 'd']);
      expect(lst.getPairs()).toEqual({b: intern('bb'), d:intern('dd')});
    });
   
    it("should give me a hash of the pairs even with rest",function(){
      var parameters = evalRead("'(a :b bb c :d dd e . r)");
      var lst = new ParameterList(parameters);
      expect(lst.getKeys()).toEqual(['b', 'd']);
      expect(lst.getPairs()).toEqual({b: intern('bb'), d:intern('dd')});
    });
  });
  
  xit("apply a function", function(){
    testStr = "(define (aap noot) noot)";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("aap");
    
    testStr = "(aap 'mies)";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("mies");
  });
  
  xit("partially apply a function", function(){
    testStr = "(define (aap noot mies) (list noot mies))";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("aap");
    
    testStr = "(aap 'mies)";
    ast = eval(read(testStr), env);
    
    expect(ast.toString()).toEqual("(lambda (mies) (list noot mies))");
  });
  
  /* TODO: rewrite to use api to parse frame  */
  

  
  describe("preparePairupParameters", function(){
    it("build an empty set", function(){
      var pairs = {};
      var variables = evalRead("'()");
      var values = evalRead("'()");
      var pairUpParameters = preparePairupParameters(variables, values, pairs);
      expect(pairUpParameters.keys).toEqual([]);
      expect(pairUpParameters.values).toEqual([]);
    });
    
    it("build keys", function(){
      var pairs = {};
      var variables = evalRead("'(a b c)");
      var values = evalRead("'()");
      var pairUpParameters = preparePairupParameters(variables, values, pairs);
      expect(pairUpParameters.keys).toEqual(['a','b','c']);
      expect(pairUpParameters.values).toEqual([]);
    });
    
    it("build values", function(){
      var pairs = {};
      var values = evalRead("'(a b c)");
      var variables = evalRead("'()");
      var pairUpParameters = preparePairupParameters(variables, values, pairs);
      expect(pairUpParameters.values).toEqual([intern('a'), intern('b'), intern('c')]);
      expect(pairUpParameters.keys).toEqual([]);
    });

    it("store key value pairs from parameters as defaults", function(){
      var variables = evalRead("'(a :b c)");
      var values = evalRead("'()");
      var pairUpParameters = preparePairupParameters(variables, values);
      expect(pairUpParameters.keys).toEqual(['a', 'b']);
      expect(pairUpParameters.values).toEqual([]);
      expect(pairUpParameters.defaults).toEqual({b: intern('c')});
    });
    
    it("to apply in correct order", function(){
      var pairs = {};
      var variables = evalRead("'(a :b bb c e f)");
      var values = evalRead("'(:c cc aaa :e eee ffff)");
      var pairUpParameters = preparePairupParameters(variables, values, pairs);
      expect(pairUpParameters.keys).toEqual(['a','b','f']);
      expect(pairUpParameters.values).toEqual([intern('aaa'), intern('ffff')]);
      expect(pairUpParameters.pairs).toEqual({
        c: intern('cc'),
        e: intern('eee')                 
      });
      expect(pairUpParameters.defaults).toEqual({
        b: intern('bb')
      });
    });
    
    
  });
  
  describe("pairUp", function(){
  
    var nil = intern('nil');
    it("to make a new frame empty", function(){
      var variables = evalRead("'()");
      var values = evalRead("'()");

      expect(extractKeyValues(variables, {}).tail).toBe(false);
      var pairUpParameters = preparePairupParameters(variables, values);
      var frame = pairUp(pairUpParameters.keys,pairUpParameters.values, pairUpParameters.pairs,  pairUpParameters.defaults);
      expect(cdr(frame)).toEqual({});
      expect(car(car(frame))).toEqual(intern('complete'));
    });
    
    it("to make a complete frame with all arguments supplied", function(){
      var variables = evalRead("'(a :b 2 c :d 3 e)");
      var values = evalRead("'(9 4 1 4 5)");

            
      var pairUpParameters = preparePairupParameters(variables, values);
      var frame = pairUp(pairUpParameters.keys,pairUpParameters.values, pairUpParameters.pairs,  pairUpParameters.defaults);
   
      expect(cdr(frame)).toEqual({
        a: makeNumber("int", 9),
        b: makeNumber("int", 4),
                                 
        c: makeNumber("int", 1),
        d: makeNumber("int", 4),
        e: makeNumber("int", 5)                         
      });
      expect(car(car(frame))).toEqual(intern('complete'));
    });    

    it("to make a complete frame with all required arguments supplied", function(){
      var variables = evalRead("'(a :b 2 c :d 3 e)");
      var values = evalRead("'(9 4 1)");

            
      var pairUpParameters = preparePairupParameters(variables, values);
      var frame = pairUp(pairUpParameters.keys,pairUpParameters.values, pairUpParameters.pairs,  pairUpParameters.defaults);
   
      expect(cdr(frame)).toEqual({
        a: makeNumber("int", 9),
        b: makeNumber("int", 2),
                                 
        c: makeNumber("int", 4),
        d: makeNumber("int", 3),
        e: makeNumber("int", 1)                         
      });
      expect(car(car(frame))).toEqual(intern('complete'));
    });   
    
    it("to make a partial frame", function(){
      var variables = evalRead("'(a :b 2 c :d 3 e)");
      var values = evalRead("'(:b 7 8)");

            
      var pairUpParameters = preparePairupParameters(variables, values);
      expect(pairUpParameters.keys).toEqual(['a','c','d','e']);
      expect(pairUpParameters.values).toEqual([makeNumber("int", 8)]);
      
      var frame = pairUp(pairUpParameters.keys,pairUpParameters.values, pairUpParameters.pairs,  pairUpParameters.defaults);
   
      //expect(cdr(frame)).toEqual({});
      expect(car(car(frame))).toEqual(intern('partial'));
    });    
    
    it("to make a complete frame with rest", function(){
      var variables = evalRead("'(a :b 2 c :d 3 . r)");
      var values = evalRead("'(:b 9 8 7 6 5 4 3 2 1)");
      var pairUpParameters = preparePairupParameters(variables, values);
   
      var frame = pairUp(pairUpParameters.keys,pairUpParameters.values, pairUpParameters.pairs,  pairUpParameters.defaults, pairUpParameters.tail);
      var hash = cdr(frame);
      expect(hash.a).toEqual(makeNumber("int", 8));
      expect(hash.b).toEqual(makeNumber("int", 9));
      expect(hash.c).toEqual(makeNumber("int", 7));
     // expect(hash.d).toEqual(makeNumber("int", 6));
     // expect(hash.r).toEqual([]);
      expect(car(car(frame))).toEqual(intern('complete'));
    });
  
    xit("to make a complete frame with without rest", function(){
      var pairs = {};
      var variables = evalRead("'(a :b 2 c :d 3)");
      var values = evalRead("'(9 8 7 6)");
      var unassigned = preparePairupParameters(variables, values, pairs);
      expect(unassigned.keys.items).toEqual(['a','b','c','d'].map(function(c){
        return intern(c);
      }));
      var frame = pairUp(unassigned.keys,unassigned.values, pairs);
      var hash = cdr(frame);
      expect(hash.a).toEqual(makeNumber("int", 8));
      expect(hash.b).toEqual(makeNumber("int", 9));
      expect(hash.c).toEqual(makeNumber("int", 7));
     // expect(hash.d).toEqual(makeNumber("int", 6));
     // expect(hash.r).toEqual([]);
      expect(car(car(frame))).toEqual(intern('complete'));
    });
    
    
   xit("apply with to many values to throw an exception", function(){
      var variables = evalRead("'(a :b 2 c :d 3)");
      var values = evalRead("'(:b 9 8 7 6 5 4 3 2 1)");
      var unassigned = preparePairupParameters(variables, values, pairs);
   
      var testPairup = function() {
        pairUp(unassigned.keys,unassigned.values, pairs);
      };
      
      expect(testPairup).toThrow();
    });
    
    
  });
  
  describe("extractKeyValues", function(){

    it("should keep the rest the same as args if no key value pairs are found", function(){
      var pairs = {};
      var rest = extractKeyValues(plainlist, pairs)
      expect("("+rest.items.join(" ")+")").toEqual(plainlist.toString());
      expect(rest.tail).toBe(false);

    });    
    
    it("should have a tail flag if a tail was found", function(){
      var pairs = {};
      var rest = extractKeyValues(listWithSymbolEnd, pairs)
      expect(rest.items).toEqual([intern('a'), intern('b'), intern('d')]);
      expect(rest.tail).toBe(true);
    });
 
    it("extract the key value pairs", function(){
      var pairs = {};
      var rest = extractKeyValues(listWithPairs, pairs)
      expect(rest.items).toEqual([intern('b')]);
      expect(pairs['a']).toBe(makeNumber('int', 2));
      expect(rest.tail).toBe(false);
    });
 
  });  
});
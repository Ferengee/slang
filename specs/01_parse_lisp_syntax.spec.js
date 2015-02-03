var Slang = require("../lang");

describe("slang Parser", function(){
  
  describe(".parseNumber", function(){
    var parser;

    beforeEach(function(){
      parser = new Slang.Parser();
    });
    
    it("should be able to create integers", function(){
      var token = "1";
      var ast = Slang.functions.makeNumber("", 1);
      expect(parser.parseNumber(token)).toEqual(ast);
    });
    
    it("should be able to create floating point", function(){
      var token = "1.3";
      var ast = Slang.functions.makeNumber("", 1.3);
      expect(parser.parseNumber(token)).toEqual(ast);
    });
    
    it("should be able to create rational", function(){
      var token = "1/2";
      var ast = Slang.functions.makeNumber("", 1, 2);
      expect(parser.parseNumber(token)).toEqual(ast);
    });
    
    it("should throw an exception on an invalid rational", function(){
      var token = "1/2/3";
      expect(function(){parser.parseNumber(token)}).toThrow("Invalid rational format: 1/2/3");
    });
    
  });
  
  describe(".parselist", function(){
    var parser;
    var cons = Slang.functions.cons;
    var s = Slang.symbols;
    
    it("should return a list", function(){
      var tokens = Slang.reader.tokenize("c d)");
      parser = new Slang.Parser(tokens);
      expect(parser.parseList()).toEqual(cons(s.c, cons(s.d, s.nil)));
    });
    
    it("should handle a '.' as dotted pair", function(){
      var tokens = Slang.reader.tokenize("c . d)");
      parser = new Slang.Parser(tokens);
      expect(parser.parseList()).toEqual(cons(s.c, s.d));
    });

    it("dotted pair's only have one object in the cdr", function(){
      var tokens = Slang.reader.tokenize("c . d e)");
      parser = new Slang.Parser(tokens);
      expect(function(){parser.parseList()}).toThrow("Invalid list after . notation");
    });

    
  });
});

describe("slang reader", function(){
  var testStr = "(a (test . string) with '(valid scheme structure))";
  var testTokens = ["(","a", "(", "test", ".", "string", ")", "with", "'", "(", "valid", "scheme", "structure", ")", ")"];
  it("should split a string into tokens", function(){
    expect(Slang.reader.tokenize(testStr)).toEqual(testTokens);
  });

  it("should not split on dots within a string", function(){
    var options = [".", ".test", "test.", "te.st", "0.345"];
    for(var i = 0 ; i < options.length; i++){
      expect(Slang.reader.tokenize(options[i])).toEqual([options[i]]);
    }
  });
  
  it("should build a nil from an empty list", function(){
    expect(Slang.reader.read('()')).toEqual(Slang.symbols['nil']);
  });
  
  it("should build a symbol and register it", function(){
    expect(Slang.reader.read('aap')).toEqual(Slang.symbols['aap']);
  }); 
  
  it("should be able to read a list", function(){
    var cons = Slang.functions.cons;
    var nil = Slang.symbols.nil;
    var quote = Slang.symbols.quote;
    expect(Slang.reader.read("(())")).toEqual(cons(nil, nil));
    expect(Slang.reader.read("(nil)")).toEqual(cons(nil, nil));
    expect(Slang.reader.read("'aap")).toEqual(cons(quote, cons(Slang.symbols['aap'], nil)));
  });
  
});
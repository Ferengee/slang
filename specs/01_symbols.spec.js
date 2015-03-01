var symbols = require("../symbols");

 
describe("symbols", function(){
 
  
  beforeEach(function(){
  });
  
  describe("nil", function(){
    var nil = symbols.nil;
    it("should be nil", function(){
      expect(symbols.isNil(nil)).toBe(true);
    });
    
    it("should be a symbol", function(){
      expect(symbols.isSymbol(nil)).toBe(true);
    });
    
    it("should not be a keyword symbol", function(){
      expect(symbols.isKeywordSymbol(nil)).toBe(false);
    });
    
  });
  
  describe("intern/keyword", function(){
    it("should take a string and make a symbol",function(){
      var sym = symbols.intern("aap");
      expect(symbols.isSymbol(sym)).toBe(true);
      expect(symbols.isKeywordSymbol(sym)).toBe(false);
    });
    
    it("should take a string a keyword symbol if asked",function(){
      var sym = symbols.keyword("noot");
      expect(symbols.isSymbol(sym)).toBe(true);
      expect(symbols.isKeywordSymbol(sym)).toBe(true);
    });
  });
  
});
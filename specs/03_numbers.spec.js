var Numbers = require("../numbers");
var symbols = require("../symbols");

describe("numbers", function(){

  beforeEach(function(){
  });
  
  it("should make integers from javascript integers", function(){
    var one = Numbers.makeInteger(1);
    expect(Numbers.isNumeric(one)).toBe(true);
    expect(Numbers.isNumeric(symbols.nil)).toBe(false);
  });
 
  
  
});

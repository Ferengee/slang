/*
 * For garbage collector test
 * All in rootenv must be preserved and the env from which the gc started
 * processing stops when gc runs 
 * test different scenarios, for example run after every function call
 */
IgnoreCase = true;
  /*
   * TODO: wrap symbol and rootenv in a closure
   * export isLambda etc and lookup
   */
  var all_symbols = {};
  var numbers = {};

var lambda = intern("lambda");
var lambda2 = intern("\\");
var quote = intern("quote");
var quasiquote = intern("quasiquote");
var unquote = intern("unquote");

var cond = intern("cond");
var els = intern("else");
var define = intern("define");

var nil = intern("nil");
var tee = intern("t");
var and = intern("and");
var or = intern("or");
var dumpEnv = intern("env");
var evl = intern("eval");

var partialFrame = intern("partial");
var completeFrame = intern("complete");

/* READER */
tokenize = function(string){
  return string.replace(/([\(\)'\n`,])/g, " $1 ").replace(/\s+/g," ").split(" ").filter(function(x) { return x != "" ; })
};

function LSymbol(name){
  this.name = name;
}

LSymbol.prototype.toString = function(){
  return this.name;
}

function LCons(car, cdr){
  this.car = car;
  this.cdr = cdr;
}

LCons.prototype.toString = function(){
  return "(" +this.toList() + ")"; 
} 


LCons.prototype.toList = function(){
  if(this.cdr instanceof LCons){
    return "" + this.car + " " + this.cdr.toList() ; 
  } else if (this.cdr === nil){
    return "" + this.car; 
  } else {
    return "" + this.car + " . " + this.cdr ;
  }
} 

function LNumber(value){
  this.value = value;
}

LNumber.prototype.compare = function(other){
  return this.getValue() - other.getValue();
}

LNumber.prototype.getValue = function(){
  return this.value;
}

LNumber.prototype.toRational = function(){
  return new LRational(Math.floor(this.value), 1);
}

function constructMath(name, fn){

  LNumber.prototype[name] = function(other){
    if(this instanceof LFloat || other instanceof LFloat){
      return new LFloat(fn(this.getValue(),other.getValue()));
    }else if(other instanceof LRational || ((!(this instanceof LFloat)) && (!(other instanceof LFloat)))){
      return this.toRational()[name](other);
    } else {
      return new LNumber(fn(this.getValue(),other.getValue()));
    }
  }
}

constructMath("add", function(a,b){ return a + b});
constructMath("substract", function(a,b){ return a - b});
constructMath("multiply", function(a,b){ return a * b});
constructMath("devide", function(a,b){ return a / b});

LNumber.prototype.toString = function(){
  return ""+this.value;
}

function LRational(num, denom){
  var div = function gcd(a, b){
    if (b == 0){
      return a;
    } else {
      return gcd(b, a % b);
    }
  }(num, denom);
  
  this.num = num / div;
  this.denom = denom / div;
}

LRational.prototype = new LNumber();

LRational.prototype.toString = function(){
  if(this.denom == 1){
    return ""+this.num;
  } else {
    return ""+this.num+"/"+this.denom; 
  }
}

LRational.prototype.getValue = function(){
  return this.num / this.denom;
}
LRational.prototype.toRational = function(){
  return this;
}
LRational.prototype.toFloat = function(){
  return  new LFloat(this.getValue());
}


function constructRationalMath(name, numFn, denomFn){
  LRational.prototype[name] = function(other){
    if(other instanceof LFloat)
    {
      return this.toFloat()[name](other.getValue());
    } else {
      other = other.toRational();
      
      return new LRational(numFn(this, other), denomFn(this,other));
    }
  }
}

var denomMultiplied = function(self, other){return (self.denom * other.denom);};

constructRationalMath("add", 
   function(self, other){return (self.num * other.denom) + (self.denom * other.num);},
   denomMultiplied);

constructRationalMath("substract", 
   function(self, other){return (self.num * other.denom) - (self.denom * other.num);},
   denomMultiplied);

constructRationalMath("multiply", 
   function(self, other){return (self.num * other.num);},
   denomMultiplied);

constructRationalMath("devide", 
   function(self, other){return (self.num * other.denom);},
   function(self, other){return (self.denom * other.num);});

function LFloat(value){
  this.value = value;
  if(this.value == Math.floor(this.value)){
    
    return new LNumber(this.value);
  }
}
LFloat.prototype = new LNumber();

function LPrimop(fn){
  this.representation = "operator";
  this.fn = fn; 
}

LPrimop.prototype.toString = function(){
  return ";primitive "+this.representation;
}

function LProc(args, code, env){
  this.args = args;
  this.code = code;
  this.env = env;
}

function getCode(proc){
  return proc.code;
}
function getEnv(proc){
  // console.log("getEnv", proc.env);
  return proc.env;
}

function setEnv(proc, env){
  proc.env = env;
}
function getVars(proc){
  return proc.args;
}


LProc.prototype.toString = function(){
  return "(lambda "+ this.args+ " " + car(this.code) + ")";
}

function isNil(v){
  return v == nil;
}

function undefinedToNil(v){
  if(v === undefined){
    return nil;
  }
  return v;
}

function isList(v){
  return (v instanceof LCons || isNil(v));
}

function isNumeric(v){
  return v instanceof LNumber;
}

function isSymbol(v){
  return v instanceof LSymbol;
}

function isPrimitive(proc){
  return proc instanceof LPrimop;
}

function isClosure(proc){
  return proc instanceof LProc;
}

function isAnd(v){
  return car(v) == and; 
}
function isOr(v){
  return car(v) == or; 
}
function isEval(v){
  return car(v) == evl;
}

function cons(x, y){
  return new LCons(x, y);
}

function car(cell){
  if(!(cell)){
    return nil;
  }
  return undefinedToNil(cell.car);
}

function first(cell){
  // console.log("cell:",cell);
  if(!(cell)){
    return nil;
  }
  return undefinedToNil(cell.car);
}

function cdr(cell){
  if(!(cell)){
    return nil;
  }
  return undefinedToNil(cell.cdr);
}

function makeProc(args, code, env){
 // var args = car(exp);
 // var code = cdr(exp);
 /*
  * console.log("|make proc:");
  console.log("|     args:", args);
  console.log("|     code:", code);
  console.log("|     env:", env);
  */
  return new LProc(args, code, env)
}

function makeNumber(type, x, y){
  var v = "" + x + "/" + y;   
  var existing = numbers[v];
  if(existing === undefined){
    if(type == "float"){
      existing = new LFloat( x);
    } else if (type == "rational") {
      existing = new LRational( x, y);
    } else {
      existing = new LNumber(x);
    }
    numbers[v] = existing;
  }
  return existing;
}


function read(string){
  
  
  var tokens = tokenize(string);
  function getToken(){
    return tokens.shift();
  }
 
  function readObject(token){
    token = token || getToken();
    if(token === undefined){
      var error =  new Error("Incomplete read");
      error.retry = true;
      throw error;
    }
    if(token == "(") { return readList(); }
    if(token == "'") { return cons(quote, cons(readObject(), nil)); }
    if(token == "`") { return cons(quasiquote, cons(readObject(), nil)); }
    if(token == ",") { return cons(unquote, cons(readObject(), nil)); }
    if(token.match(/^[-+]?[0123456789]/)) { return readNumber(token)}
    return intern(token);
  }
  
  function readNumber(token){
    if(token.indexOf(".") > -1){
      return makeNumber("float", parseFloat(token));
    }else if(token.indexOf("/") > -1){
      var parts = token.split("/");
      return makeNumber("rational", parseInt(parts[0]), parseInt(parts[1]));
    }else {
      return makeNumber("int", parseInt(token));
    }
    
  }
  
  function readList(){
    var token = getToken();
    
    if(token == ")") { return nil; }
    if(token == ".") {
      var r = readObject(); 
      var token = getToken();
      if(token != ")"){
        throw new Error("Invalid list after . notation");
      }
      return r;
    }
    return cons(readObject(token), readList());
    
    
    
  }
  return readObject();
}


/* Parser */


function applyPrimop(proc, args){
  //console.log("applyPrimop", proc, "args:", args);
  args = valsToArgs(args);
  //console.log("args", args);
  return proc.fn.apply(proc, args);
}

function valsToArgs(vals){
  var args = [];
  while(!isNil(vals)){
    args.push(car(vals));
    vals = cdr(vals);
  }
  return args;
}
/*
(define apply
  (lambda (proc args)
    (cond 
      ((primitive? proc)
        (apply-primop proc args))
      ((eq? (car proc) 'closure)
        (eval (cadadr proc)
          (bind (caadr proc) args (caddr proc))))
      (else (error 'invalid-proc)))))
*/
function apply(proc, args){
  //console.log("apply", proc.toString(), args);

  if(isPrimitive(proc)){
    return applyPrimop(proc, args);
  } else if ( isClosure(proc) ){
    var code = getCode(proc);
    var result = nil;
    var env = bind(getVars(proc), args, getEnv(proc));

    while(!isNil(code)){
      result = eval( car(code), env);
      code = cdr(code);
    }
    return result;
  } else {
    throw new Error("invalid proc: " + JSON.stringify(proc) + ":" + args);
  }
}


function isLambda(exp){
  return car(exp) == lambda || car(exp) == lambda2;
}  
function isQuote(exp){
  return car(exp) == quote;
}

function isQuasiQuote(exp){
  return car(exp) == quasiquote;
}

function isUnQuote(exp){
  return car(exp) == unquote;
}

function isDefine(exp) {
 return car(exp) == define; 
}

function isCond(exp) {
  return car(exp) == cond;
}


function printFrame(frame){
  while(!(isNil(frame))){
    console.log("   >", car(car(frame)), cdr(car(frame)));
    frame = cdr(frame);
  }
}

function printEnv(env){
  var depth = 0;
  while (!isNil(env)){
    console.log("env (" + depth + ")");
    printFrame(car(env));
    console.log("---");
    depth += 1;
    env = cdr(env);
  }
}

function intern(token){
  if(IgnoreCase){
    token = token.toLowerCase();
  }
  var result = all_symbols[token];
  if(result === undefined){
    result = new LSymbol(token);
    all_symbols[token] = result;
  }
  return result;
}
    /*
(define eval
  (lambda (exp env)
    (cond 
      (( number? exp) exp )
      (( symbol? exp) ( lookup exp env ))
      (( eq? (car exp) 'quote) (cadr exp))
      (( eq? (car exp) 'lambda) 
        (list 'closure (cdr exp) env))
      (( eq? (car exp) 'cond)
        ( evcond (cdr exp env)))
      ( else 
        ( apply ( eval (car exp) env)
          ( evlist (cdr exp) env ))))))
*/

    /*
     * While (!done){
     *   var env, args; // env is resolved, or as rootenv, or from evaluating a proc
     *   // for self evaluating: Numeric nil t, primitiveOperator, Proc
     *   // for one level lookup: Symbol, (Quote ... )
     *   // for creating a procedure: (Lambda ... )
     *   // for creating an assignment: (Define ...), (Set ...)
     *    
     *   if (is<Type> (expression)) { return dispatch<Type>(expression) }
     * 
     *   // for evaluating apply: (<any> ... ) <any> ! E (Lambda, Define, Set, Cond)
     *   // for evaluating conditionals: (Cond ... )
     * 
     *   if (is<Type> (expression)) {
     *     
     *   }
     * }
     * 
     */
function eval(exp, env){
  //console.log("eval", exp.toString());
  //printEnv(env);
  while(true){
  
    if (isNumeric( exp)) { return exp; }
    if (isSymbol( exp )) { return lookup(exp, env); }
    if (isQuote(exp)) { return car(cdr(exp)); }
    if (isQuasiQuote(exp)) { return evalQuasiQuote(car(cdr(exp)), env); }
    if (isDefine(exp)) { return evalDefine(exp, env);}
    if (car(exp) == dumpEnv) { return env; }

    if (isLambda(exp)) { 
      var args = car(cdr(exp));
      var code = cdr(cdr(exp));
      return makeProc(args, code, env); 
      
    }
    if (isEval(exp)) { return eval(eval(car(cdr(exp)), env),env); } 
    /*
    * Cond 'becomes' the value it evaluates to
    * Stack is not needed
    * 
    * evalCond could be rewritten as resolveCond
    * and return just the expression that is to be evaluated
    * 
    */
    if (isCond(exp)) { 
      exp = resolveCond(cdr(exp), env); 
    }  
    else if (isAnd(exp)) { 
      return evalAnd(cdr(exp), env); 
    }
    else if (isOr(exp)) { 
      return evalOr(cdr(exp), env); 
    }
    else {
      /* (<symbol> <arg1> ... ) */
      var proc = eval(car(exp), env);
      var args = evalList(cdr(exp), env); 
      if(isPrimitive(proc)){
        return applyPrimop(proc, args);
      } else if ( isClosure(proc) ){
        var code = nil;
        /*
         * if a bind is not complete 
         * I want to return a new proc which has the application so far
         * 
         * if the application is with 0 arguments, the same function is returned
         * 
         * i need to know if the pairUp is complete, if not exp is a new proc build with code
         * while loop to evaluate the code must be bypassed
         */
        var frame = pairUp(getVars(proc), args);
        var pairs = cdr(frame);
        var header = car(frame);
        var env = cons(pairs, getEnv(proc));
        
        if(car(header) == partialFrame){
          if(isNil(pairs)){
            return proc;
          }
          return makeProc(cdr(header), getCode(proc), env);
        }else{
          code = getCode(proc); 
        }
        
        while(!isNil(code)){
          
          /* 
          * only the statements before the last statement should be recursively evaluated 
          * The last statement should become an expression which can be evaluated
          * in the next iteration
          */
          if(isNil(cdr(code))){
            exp = car(code);
          }else {
            eval( car(code), env);
          }
          code = cdr(code);
        }
      } else {
        throw new Error("invalid proc: " + JSON.stringify(proc) + ":" + args);
      }
    }
  }
}    

function evalDefine(exp, env){
  var variable = car(cdr(exp));
  var value;
  if(isList(variable)){
    console.log("--- creating a lambda ---");
    var args = cdr(variable);
    var code = cdr(cdr(exp));
    variable = car(variable);
    value =  makeProc(args, code, env);
  } else {
    value = eval(car(cdr(cdr(exp))),env);
  }
  return extendEnv(variable, value, env);
}

function evalQuasiQuote(exp, env){
  if(isNil(exp)){
    return nil;
  } else if(isList(exp)){
    var item = car(exp);
    if(isUnQuote(car(exp))){
      item = eval(car(cdr(car(exp))), env);
    } else if (isList(item)){
      item = evalQuasiQuote(item, env);
    }
    return cons(item, evalQuasiQuote(cdr(exp), env));
  }else{
    return exp; 
  }
}
      
    /*  
(define evlist
  (lambda (l env)
    (cond 
      (( eq? l '() ) '())
        (else
          (cons (eval (car l) env )
            ( evlist (cdr l) env))))))
  
  */
function evalList(list, env){
  if(list == nil){ 
    return nil;
  } else {
    return cons(eval(car(list), env), evalList(cdr(list), env));
  }
}
/*
(define evcond
  (lambda (clauses env)
    (cond 
      ((eq? clauses '())
      ((eq? (caar clauses) 'else)
        (eval (cadar clauses) env))
      ((false? (eval(caar clauses) env))
        (evcond(cdr clauses) env ))
      (else
        (eval (cadar clauses) env))))))
*/
isFalse = isNil
    
function resolveCond(clauses, env){
  if(clauses == nil){
    return nil;
  } else if(car(car(clauses)) == els ||  !isFalse(eval(car(car(clauses)), env))){
     return car(cdr(car(clauses)));
  } else {
    return resolveCond(cdr(clauses), env);
  }
}

function evalAnd(predicates, env){
  var result = tee;
  while(!isNil(predicates)){
    result = eval(car(predicates), env);
    if(isNil(result)){
      return nil;
    }
    predicates = cdr(predicates);
  }
  return result;
}

function evalOr(predicates, env){
  var result = nil;
  while(!isNil(predicates)){
    var result = eval(car(predicates), env); 
    if(!isNil(result)){
      return result;
    }
    predicates = cdr(predicates);
  } 
  return result;
}
  /*
(define bind
  (lambda (vars vals env)
    (cons (pair-up vars vals) env )))
*/
  
  function bind(vars, vals, env){
    return cons(pairUp(vars, vals, nil), env);
  }
  
/*
(define  pair-up
  (lambda (vars vals)
    (cond
      (( eq? vars '())
        (cond ((eq? vals '()) '())
              (else (error TMA))))
      (( eq? vals '())
        ( error TFA ))
      (else
        (cons (cons (car vars) (car vals))
            (pair-up (cdr vars)
                     (cdr vals)))))))
*/

function createFrameheader(label, lst, vars){
  return cons(cons(label, vars), lst);
}

function pairUp(vars, vals, lst){
 //console.log("| pair up:", vars);
  if(isNil(vars)){
    if(isNil(vals)){
      return createFrameheader(completeFrame,  lst, nil);
    } else {
      throw new Error("To many arguments (vars: " + vars + " ) (vals: " + vals + ")");
    }
  }else if(isSymbol(vars)){
    return createFrameheader(completeFrame, cons(cons(vars, vals), lst), nil);
  }else if(isNil(vals)){
    return createFrameheader(partialFrame, lst, vars);
  } else {
    return pairUp(cdr(vars), cdr(vals), cons(cons(car(vars), car(vals)), lst));
  }
}

/*
(define lookup
  (lambda (sym env)
    (cond
      (( eq? env '()) (error UBV))
      (else
        ((lambda (vcell)
          (cond 
            (( eq? vcell '())
              (lookup sym (cdr env)))
            (else (cdr vcell ))))
        (assq sym (car env)))))))
*/

function lookup(symbol, env){
  //console.log("lookup():", symbol.toString());
  //printEnv(env);
  
  if(isNil(env)){
    throw new Error("empty environnement at last frame while looking for: "+symbol);
  } else {
    return function(vcell){
      if(isNil(vcell)){
        return lookup(symbol, cdr(env));
      } else {
        return cdr(vcell);
      }
    }(assq(symbol, car(env)));
  }
}

/*
(define assq
  (lambda (sym alist)
    (cond 
      ((eq? alist '()) '())
      ((eq? sym (caar alist))
        (car alist))
      (else
        (assq sym (cdr alist))))))
*/

function keyval(symbol, hash){  
  return undefinedToNil(hash[symbol]);
}

function assq(symbol, alist){
  if(isNil(alist)){
    return nil;
  }
  if(symbol == car(car(alist))){
    return car(alist);
  } else {
    return assq(symbol, cdr(alist));
  }
}

/*
(define TFA 'to-few-arguments)
(define TMA 'to-manny-arguments)
*/

test_string = "(((lambda(x) (lambda (y) (+ y x) )) 3 ) (cdr '(5 . 4)) ))";
topenv = cons(cons(nil,nil), nil);

var env = nil;
env = cons(topenv, env);
//topenv = cons(cons(nil,nil), nil);
//env = cons(topenv, env);

function extendTopEnv(symbol, object){
  extendEnv(symbol, object, env);
}

function extendEnv(symbol, object, env) {
  //console.log("-- extending: " + symbol);
  var frame = car((env));
  var tail = frame.cdr;
  frame.cdr = cons(cons(symbol, object), tail);
  // printFrame(frame);
  //console.log("--------------");
  return symbol;
}



extendTopEnv(tee, tee);
extendTopEnv(lambda, lambda);


function createPrimaryNumberOp (binaryFn){
  return function(){
    var result = arguments[0];
    for(var x = 1; x < arguments.length ; x++){
      result = binaryFn(result, arguments[x]);
    }
    return result;
  }
}

function registerPrimaryNumberOp(token, binaryFn){
  var primop = new LPrimop(createPrimaryNumberOp(binaryFn));
  primop.representation = token;
  extendTopEnv(intern(token), primop);
}

registerPrimaryNumberOp("*", function(x, y) {
  return x.multiply(y);
});


registerPrimaryNumberOp("+", function(x, y){
  return x.add(y);
});

registerPrimaryNumberOp("-", function(x, y){
  return x.substract(y);
});

registerPrimaryNumberOp("/", function(x, y){
  return x.devide(y);
});

extendTopEnv(intern("<"), new LPrimop(function(x, y){
  return (x.compare(y) < 0 ) ? tee : nil;
}));

extendTopEnv(intern(">"), new LPrimop(function(x, y){
  return (x.compare(y) > 0 ) ? tee : nil;
}));


extendTopEnv(intern("="), new LPrimop(function(x, y){
  return (x.compare(y) == 0 ) ? tee : nil;
}));


extendTopEnv(intern("eq?"), new LPrimop(function(x, y){
  return (x == y)? tee : nil;
}));

extendTopEnv(intern("nil?"), new LPrimop(function(v){
  return isNil(v) ? tee : nil;
  
}));


extendTopEnv(intern("car"), new LPrimop(car));
extendTopEnv(intern("cdr"), new LPrimop(cdr));
extendTopEnv(intern("first"), new LPrimop(car));
extendTopEnv(intern("rest"), new LPrimop(cdr));
extendTopEnv(intern("cons"), new LPrimop(cons));
extendTopEnv(intern("apply"), new LPrimop(apply));
extendTopEnv(intern("eval"), new LPrimop(apply));

extendTopEnv(intern("display"), new LPrimop(function(exp){console.log(exp.toString());}));
extendTopEnv(intern("printenv"), new LPrimop(printEnv));

function createRationalAccessor(name, constructor){
  extendTopEnv(intern(name), new LPrimop(function(rat){
    if(rat instanceof LRational){
      return constructor(rat);
    }else{
      return nil;
    }
  }));
}

createRationalAccessor("rat->int", function(rat){
  return new LNumber(rat.num);
});

createRationalAccessor("rat->float",function(rat){
  return new LFloat(rat.getValue());
});

createRationalAccessor("rat->num", function(rat){
  return new LNumber(rat.num);
});

createRationalAccessor("rat->denom", function(rat){
  return new LNumber(rat.denom);
});

createRationalAccessor("rat->simplify", function(rat){
  var whole = new LNumber(Math.floor(rat.getValue()));
  var rest = rat.substract(whole);
  return cons(read("+"), cons(whole, cons(rest, nil)));
});
/*
console.log("" + read(test_string));
console.log(JSON.stringify(read(test_string), null, 2));
*/
/*
test_quote = "(quote x)";
console.log("" + eval(read(test_quote), env));
*/
/*test_lambda = "(lambda (x) (* x x))";
console.log("" + eval(read(test_lambda), env));
*/

console.log("---  intern('*') == intern('*') ---");
console.log("=>", intern("*") == intern("*"));
console.log("");
console.log("--- lookup(intern('*'), env) ---");

console.log("=>",lookup(intern("*"), env));
console.log("");

console.log("--- env ---");
printEnv(env);
console.log("");

console.log("--- eval(read('(* 4 4)'), env) ---");
console.log("=>","" + eval(read("(* 4 4)"), env));
console.log("");



    var extensions = [
      "(define ! (lambda (n) (cond ((< n 2) n) (t (* n (! (- n 1)))))))",
      "(define ^ (lambda (x n) (cond (( < n 1) 1) (t (* x (^ x (- n 1 ))))) ))",
      "(define last (lambda (x)( cond (( nil? (cdr x)) (car x))( t (last (cdr x))))))",
      "(define concat (lambda (x)( cond ((nil? x) nil) ((nil? (car x)) (concat (cdr x)))( t (cons (car (car x)) (concat (cons(cdr(car x)) (cdr x))))))))",
      "(define append (lambda x (concat x)))",
      //"(define map (lambda (list, fn) (cond ((eq? list '()) '()) (t (cons (fn (car list)) (map (cdr list) fn) ))) ))",
      "(define mapcar (lambda (fn l) (cond ((eq? l '()) '()) (else (cons (fn (car l)) (mapcar fn (cdr l)) )) ))) ",
      "(define test (lambda (x . y)  y )) ",
      "(define list (lambda x x))",
      "(define map (lambda (fn l) (cond ((eq? l '()) '()) (else (cons (fn (car l)) (map fn (cdr l)) )) ))) ",
      "(define +1 (lambda (x) (+ x 1) ) )",
      "(define !i (lambda (x)(define iter (lambda (n m) (cond((eq? n 0) m)(t (iter (- n 1) (* m n))))))(iter x 1)))",
      "(define y (lambda (f) ((lambda (x)(f (lambda (y) ((x x) y) ))) (lambda (x) (f (lambda (y) ((x x)  y) ) )))))",
      "(define fact-gen (lambda (fact) (lambda (n) (cond ((eq? n 0) 1)( t (* n (fact (- n 1))))))))"
    ];
    
    
    for(var i = 0; i < extensions.length ; i++){
      try{
      eval(read(extensions[i]), env);
      } catch (e){
        console.log("failed to parse", extensions[i]);
      }
    }
    

/*
test_lambda_applied = "((lambda (x) (* x x)) 4)";
console.log(all_symbols);
console.log("" + eval(read(test_lambda_applied), env));
*/

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.setPrompt('> ');
    rl.prompt();
var inputbuffer = "";
  rl.on('line',  function(answer){
    if(answer.indexOf(";") != 0){
      try{
        var input = inputbuffer + '\n' +answer; 
        console.log("=>","" + eval(read(input), env));
        inputbuffer = "";  
        
      } catch(e){
        if(e.retry){
          inputbuffer = input;
          //console.log(inputbuffer);
        } else {
          console.log(e);
        }
      }
    }
      rl.prompt();
    
  });

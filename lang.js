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
var set = intern("set!");
var pop = intern("pop!");
var push = intern("push!");

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
  var div = function gcd2(a, b){
    var t;
    while(b != 0){
      t = a;
      a = b;
      b = a % b;
    }
    return a;
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

function LPrimop(fn, representation, argNames){
  this.fn = fn; 
  this.args = nil;
  
  if(representation){
    this.representation = representation;
  } else {
    this.representation = "operator";
  }

  if(argNames){
    this.constructArgs(argNames);
  }
}

LPrimop.prototype.constructArgs = function(args){
  this.args = nil;

  for(var i=args.length -1; i >= 0; i--){
    this.args = cons(intern(args[i]), this.args);
  }
}
LPrimop.prototype.getCode = function(){
  return cons(cons(intern(this.representation), this.args), nil);
}

LPrimop.prototype.toString = function(){
  return ";primitive (lambda "+ this.args+ " " + car(this.getCode()) + ")";
}

function LProc(args, code, env){
  this.args = args;
  this.code = code;
  this.env = env;
}

LProc.prototype.getCode = function(){
  return this.code;
}

function getCode(proc){
  return proc.getCode();
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
  var src = function codeToString(code){
    if(isNil(code)){
      return "";
    }
    return car(code) + codeToString(cdr(code));
  }(this.getCode());

  return "(lambda "+ this.args+ " " + src + ")";
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
function isKeywordSymbol(v){
  return isSymbol(v) &&  (v.name.indexOf(":") == 0);
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
function isSet(v){
  return car(v) == set;
}

function isPush(v){
  return car(v) == push;
}
function isPop(v){
  return car(v) == pop;
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

function Parser(tokens){  
  var getToken = function(){ return tokens.shift() };

  this.parseObject = function(token){
    token = token || getToken();
    if(token === undefined){
      var error =  new Error("Incomplete read");
      error.retry = true;
      throw error;
    }
    if(token == "(") { return this.parseList(); }
    if(token == "'") { return cons(quote, cons(this.parseObject(), nil)); }
    if(token == "`") { return cons(quasiquote, cons(this.parseObject(), nil)); }
    if(token == ",") { return cons(unquote, cons(this.parseObject(), nil)); }
    if(token.match(/^[-+]?[0123456789]/)) { return this.parseNumber(token)}
    return intern(token);
  }
  
  this.parseList = function(){
    var token = getToken();
    
    if(token == ")") { return nil; }
    if(token == ".") {
      var r = this.parseObject(); 
      var token = getToken();
      if(token != ")"){
        throw new Error("Invalid list after . notation");
      }
      return r;
    }
    return cons(this.parseObject(token), this.parseList());
  }
    
  this.parseNumber = function(token){
    if(token.indexOf(".") > -1){
      return makeNumber("float", parseFloat(token));
    }else if(token.indexOf("/") > -1){
      var parts = token.split("/");
      if(parts.length > 2){
        throw new Error("Invalid rational format: " + token);
      }
      return makeNumber("rational", parseInt(parts[0]), parseInt(parts[1]));
    }else {
      return makeNumber("int", parseInt(token));
    }
  }
}  
  
function Reader(){  
  /* READER */
  var tokenize = function(string){
    return string.replace(/([\(\)'\n`,])/g, " $1 ").replace(/\s+/g," ").split(" ").filter(function(x) { return x != "" ; })
  };
  
  this.tokenize = tokenize;

  this.read = function (string){  
    var tokens = tokenize(string);    
    return new Parser(tokens).parseObject();
  }  
}




function applyPrimop(proc, args, env){
  /*
   * TODO: generate new code for partially applied proc
   * cons all arguments and the representation as last
   * cons representation symbol onto arguments as code
   */
  //console.log("applyPrimop", proc, "args:", args);
  /*
   * try to pair and get a partial framegegetEnvtEnv
   */
 // if(args.length > proc.args.){
    
 // }
  var frame = pairUp(getVars(proc), args);
  var env = addFrameToEnv(frame, env);
  //console.log("frame:", JSON.stringify(frame, null , 2));
  //console.log("env:", JSON.stringify(env, null , 2));

  if(isPartialFrame(frame)){
    return buildPartialAppliedProc(frame, proc, env);
  }
    
  args = valsToArgs(args);
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
    if (isKeywordSymbol( exp )) { return exp; }
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
    
    if (isSet(exp)){
      var target = car(cdr(exp));
      var value = eval(car(cdr(cdr(exp))), env);
      if(isSymbol(target)){
        return lookupAndReplace(target,  value, env);
      } 
    }
    
    if (isPush(exp)){
      //(push item stack)
      var value = eval(car(cdr(exp)), env);
      //new value = cons(value lookup(target)) 
      var target = car(cdr(cdr(exp)));
      if(isSymbol(target)){
        value = cons(value, lookup(target, env));
        return lookupAndReplace(target,  value, env);
      } 
    }
    
    if (isPop(exp)){
      var target = car(cdr(exp));
      //lookup 
      var value = lookup(target, env);
      
      if(isSymbol(target)){
        lookupAndReplace(target,  cdr(value), env);
        return car(value);
      } 
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
      var code = resolveCond(cdr(exp), env); 
      exp = evaluateCodeBlock(code, env);
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
        return applyPrimop(proc, args, env);
        
      } else if ( isClosure(proc) ){
        var frame = pairUpKeyValArguments(getVars(proc), args, nil);
        env = addFrameToEnv(frame, getEnv(proc));
       
        if(isPartialFrame(frame)){
          return buildPartialAppliedProc(frame, proc, env);
        }
        
        var code = getCode(proc);
        exp = evaluateCodeBlock(code, env);

      } else {
        throw new Error("invalid proc: " + JSON.stringify(proc) + ":" + args);
      }
    }
  }
}    

function evaluateCodeBlock(code, env){
  var exp = nil;
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
  return exp;
}

function addFrameToEnv(frame, env){
  return cons(cdr(frame), env);
}

function buildPartialAppliedProc(frame, proc, env){
  var pairs = cdr(frame);
  var header = car(frame);
  
  if(isNil(pairs)){
    return proc;
  }
  return makeProc(cdr(header), getCode(proc), env);
}

function isPartialFrame(frame){
  return (car(car(frame)) == partialFrame);
}
        
function evalDefine(exp, env){
  var variable = car(cdr(exp));
  var value;
  if(isList(variable)){
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
     // now only evalling car but could eval all
     return cdr(car(clauses));
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

/*
 * scan vals to see if there are pairs to be made from :key value parameters
 * - :key must exist as variable or be ignored
 * - if a key exists it must be removed from vars
 * - after all :key value pairs have been made
 * - pair the rest of the values to the rest of the variables (normal pairUp behaviour) 
 */
function pairUpKeyValArguments(vars, vals, lst){
  var new_vars = [];
  var new_vals = [];
  var unassigned_vals = [];
  
  //scan and arrange all values
  while(!isNil(vals)){
    var value = car(vals);
    if(isKeywordSymbol(value)){
      var name = value.name.slice(1);
      value = car(cdr(vals));
      vals = cdr(vals);
      
      new_vals.unshift(value);
      new_vars.unshift(intern(name));
      // remove name from vars;
    } else {
      unassigned_vals.unshift(value);
    }
    vals = cdr(vals);
  }
  
  var collected = new_vars.map(function(v){return v.name;});
  
  while(!isNil(vars)){
    if(collected.indexOf(car(vars).name) < 0){
      new_vars.unshift(car(vars));
    }
    vars = cdr(vars);
  }
  
  vars = arrayToConsList(new_vars);
  vals = arrayToConsList(new_vals,  arrayToConsList(unassigned_vals));

  return pairUp(vars, vals, lst);
}

function arrayToConsList(a, lst){
  if(lst === undefined) { lst = nil };
  for(var i = 0; i < a.length; i++){
    lst = cons(a[i], lst);
  }
  return lst
}

function pairUp(vars, vals, lst){
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
    return function (vcell){
      if(isNil(vcell)){
        return lookup(symbol, cdr(env));
      } else {
        return cdr(vcell);
      }
    }(assq(symbol, car(env)));
  }
}

function lookupAndReplace(symbol, value, env){

  if(isNil(cdr(env))){
    throw new Error("empty environnement at last frame while trying to set: "+symbol);
  } else {
    return function (vcell){
      if(isNil(vcell)){
        return lookupAndReplace(symbol, value, cdr(env));
      } else {
        vcell.cdr = value;
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
var env = nil;
var topFrame = cons(cons(nil,nil), nil);
var topEnv = cons(topFrame, env);

function buildEnvironnement(){
  return cons(cons(nil, nil), topEnv);
}

env = buildEnvironnement();
function extendTopEnv(symbol, object){
  extendEnv(symbol, object, topEnv);
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
extendTopEnv(set, set);


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
  var primop = new LPrimop(createPrimaryNumberOp(binaryFn), token, ['x', 'y']);
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


function registerKeyword(name, fn, argNames){
  var op = new LPrimop(fn, name, argNames);
  extendTopEnv(intern(name), op);
}

registerKeyword("<", function(x, y){
  return (x.compare(y) < 0 ) ? tee : nil;
}, ['x', 'y']);

registerKeyword(">", function(x, y){
  return (x.compare(y) > 0 ) ? tee : nil;
}, ['x', 'y']);

registerKeyword("<=", function(x, y){
  return (x.compare(y) <= 0 ) ? tee : nil;
}, ['x', 'y']);

registerKeyword(">=", function(x, y){
  return (x.compare(y) >= 0 ) ? tee : nil;
}, ['x', 'y']);


registerKeyword("=", function(x, y){
  return (x.compare(y) == 0 ) ? tee : nil;
}, ['x', 'y']);


registerKeyword("eq?", function(x, y){
  return (x == y)? tee : nil;
}, ['x', 'y']);

registerKeyword("nil?", function(v){
  return isNil(v) ? tee : nil;
  
}, ['v']);

var cxrfunctions = function (){
  function genOptions(existing){
    result = {};
    var tokens = ['a','d']
    var props = [".car",".cdr"];
    var keys = Object.keys(existing);
    for (var i = 0; i < keys.length; i++){
      var pattern = keys[i];
      for(var n = 0; n < 2; n++){
        result[tokens[n] + pattern] = existing[pattern] + props[n] ; 
      }
    }
    return result;
  }

  function genPartsFor(size){
    var result = {r: "cell"};
    for(var i = 0; i < size; i++){
      result = genOptions(result); 
    }
    return result;
  }

  function createFunctions(){
    var result = {};  
    for(var i = 1; i < 4; i++){
      var parts = genPartsFor(i);
      var keys = Object.keys(parts);
      for(var k = 0 ; k < keys.length; k++){
        result[keys[k]] = createFunction(parts[keys[k]]);
      }
    }
    return result;
  }
  
  function createFunction(body){
    return new Function("cell", "return undefinedToNil(" + body + ");");
  }
  
  return createFunctions();
}();

for(name in cxrfunctions){
  registerKeyword("c"+name, cxrfunctions[name], ['x']);
}

//undefinedToNil

//registerKeyword("car",car, ['x']);
//registerKeyword("cdr", cdr, ['x']);

registerKeyword("first", car, ['x']);
registerKeyword("rest", cdr, ['x']);
registerKeyword("cons", cons, ['x', 'lst']);
registerKeyword("list?", isList, ['lst']);

registerKeyword("apply", apply, ['proc', 'args']);
registerKeyword("eval", function(exp){ eval(exp, env);}, ['exp']);

// 
var readFromInput = function(){return "'not-implemented-yet"};
function registeReadFromInput(fn){
  readFromInput = fn;
}
registerKeyword("read", function(){ return readFromInput() }, []);
registerKeyword("display", function(exp){console.log(exp.toString())}, ['exp']);
registerKeyword("printenv", function(){return env;}, []);

function createRationalAccessor(name, constructor){
  var op = new LPrimop(function(rat){
    if(rat instanceof LRational){
      return constructor(rat);
    }else{
      return nil;
    }
  }, name, ['rat']);
  extendTopEnv(intern(name), op);
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

read = new Reader().read;

var module = module || {exports: {}};
module.exports.Parser = Parser;
module.exports.reader = new Reader();
module.exports.symbols = all_symbols;
module.exports.environnement = buildEnvironnement; 
module.exports.functions = {
  cons: cons,
  makeNumber: makeNumber,
  eval: eval
};




var fs = require('fs'),
    vm = require('vm');

var sandbox = {};    

fs.readFile("./lang.js", 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  vm.runInThisContext(data);
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
      "(define mapcar (lambda (fn l) (cond ((eq? l '()) '()) (else (cons (fn (car l)) (mapcar fn (cdr l)) )) ))) ",
      "(define test (lambda (x . y)  y )) ",
      "(define list (lambda x x))",
      "(define map (lambda (fn l) (cond ((eq? l '()) '()) (else (cons (fn (car l)) (map fn (cdr l)) )) ))) ",
      "(define !i (lambda (x)(define iter (lambda (n m) (cond((eq? n 0) m)(t (iter (- n 1) (* m n))))))(iter x 1)))",
      "(define y (lambda (f) ((lambda (x)(f (lambda (y) ((x x) y) ))) (lambda (x) (f (lambda (y) ((x x)  y) ) )))))",
      "(define fact-gen (lambda (fact) (lambda (n) (cond ((eq? n 0) 1)( t (* n (fact (- n 1))))))))",
      "(define (assoc key lst) (cond ((nil? lst) nil) ((eq? (car (car lst)) key) (car lst)) (t (assoc key (cdr lst)))))",
      "(define (add-pair key val lst)(cons (cons key val) lst))",
      "(define (zip keys values . fn) (define (do keys values fn) (cond ((and keys values) (cons (fn (car keys) (car values)) (do (cdr keys) (cdr values) fn))))) (do keys values (cond ((nil? fn) (cons)) (t (car fn)))))",
      "(define reduce (lambda (fn lst . acc) (cond ((nil? lst) (car acc)) (t (reduce fn (cdr lst) (fn (car lst) (car acc)))))))",
      "(define (compare fn a b) (cond   ((fn a b) a)   (t b) ))",
      "(define (testIf fn a b) (cond   ((fn a) a)   (t b) ))",
      "(define (minimum lst) (reduce (compare <) lst (car lst)))",
      "(define (maximum lst) (reduce (compare >) lst (car lst)))",
      "(define (not a)  (cond   ((nil? a) t)))",
      "(define (not-fn fn a) (not (fn a)))",
      "(define (apply-on args proc ) (apply proc args))",
      "(define (range from to . step)  (define (do from to step)   (cond      ((>= to from) (cons from (do (+ from step) to step)))   ) ) (do from to (testIf (not-fn nil?) (car step) 1)))",
      "(define (globals) (map car (cdr (car (printenv)))))",
      "(define reverse (reduce cons))"
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
});

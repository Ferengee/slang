# slang
A small language inspired on scheme and  'Structure and Interpretation of Computer Programs' (https://mitpress.mit.edu/sicp/full-text/book/book.html)

wanted features:

* partial function application
* keyword arguments
* defaults in function arguments
* lazy evaluation
* tail recursion optimisation


Ideas:

* have an external event trigger the next evaluation step
  * let eval return an Evaluation object which stores the needed
state to continue the evaluation on calling the .go() function

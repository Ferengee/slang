(define apply
  (lambda (proc args)
    (cond 
      ((primitive? proc)
        (apply-primop proc args))
      ((eq? (car proc) 'closure)
        (eval (cadadr proc)
          (bind (caadr proc) args (caddr proc))))
      (else (error 'invalid-proc)))))


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
        ( apply ( eval (car env) env)
          ( evlist (cdr exp) env ))))))

(define evlist
  (lambda (l env)
    (cond 
      (( eq? l '() ) '())
        (else
          (cons (eval (car l) env )
            ( evlist (cdr l) env))))))

(define evcond
  (lambda (clauses env)
    (cond 
      ((eq? clauses '())
      ((eq? (caar clauses) 'else)
        (eval (cadar clauses) env))
      ((false? (eval(caar clauses) env))
        (evcond(cdr clauses) env ))
      (else
        (eval ( clauses) env))))))

(define bind
  (lambda (vars vals env)
    (cons (pair-up vars vals) env )))


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

(define assq
  (lambda (sym alist)
    (cond 
      ((eq? alist '()) '())
      ((eq? sym (caar alist))
        (car alist))
      (else
        (assq sym (cdr alist))))))

(define TFA 'to-few-arguments)
(define TMA 'to-manny-arguments)

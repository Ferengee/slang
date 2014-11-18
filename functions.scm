(define map* (lambda (fn . lists)
  (cond 
    ((nil? lists) '())
    ((has-nil (map car lists)) '())
    (t (cons  (apply fn (map car lists)) (apply map* (cons fn (map cdr lists) ))))
  )
))

(define has-nil (lambda (list) 
  (cond
    ((nil? list) nil)
    ((nil? (car list)) t)
    (t (has-nil (cdr list)))
   ) 
))


(define some? (lambda (list fn)
  (cond
    ((nil? list) nil)
    ((fn (car list)) (fn (car list)))
    (t (some? (cdr list) fn))
  ) 
))

(define has? (lambda (list sym)
  (cond
    ((nil? list) nil)
    ((eq? (car list) sym) sym)
    (t (has? (cdr list) sym))
  ) 
))

(define index-of (lambda (list sym)
  (define index-of-from (lambda (list sym count)
    (cond
      ((nil? list) '-1)
      ((eq? (car list) sym) count)
      (t (index-of-from (cdr list) sym (+ count 1)))
)))
  (index-of-from list sym 0)
  
))

;var fib = Y(function (g) { return (function (n) {
; if (n == 0) return 0 ;
; if (n == 1) return 1 ;
; return g(n-1) + g(n-2) ;
;}) ; }) ;

(define fib-gen (lambda (fib) 
  (lambda (n)
    (cond
      ((< n 2) n)
      (t (+ (fib (- n 1)) (fib (- n 2))))
    )
  )
))

 ((Y fib-gen) 6)


(define fact-gen (lambda (fact) 
    (lambda (n) 
    (display (fact))
    (cond 
      ((eq? n 0) 1)
      ( t (* n (fact (- n 1))))
    ))
  )
)

 ((Y fact-gen) 6)

 
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
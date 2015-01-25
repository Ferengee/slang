(define (assoc key lst)
  (cond
    ((nil? lst) nil)
    ((eq? (car (car lst)) key) (cdr (car lst)))
    (t (assoc key (cdr lst)))
  )
)

(define (add-pair key val lst)
  (cons (cons key val) lst)
)

(define (zip keys values)
  (cond
    ((and keys values) 
        (cons 
          (cons (car keys) (car values)) (zip (cdr keys) (cdr values ))
        )
    )
  )
)

(define p1 (add-pair 'a 3 nil))
(assoc 'a p1)

(define l1 (zip (list 'a 'b 'c 'd) (list 3 5 7 8) ))
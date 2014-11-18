(define f (lambda (x) (if (= x 1) 1) (* x (f (- x 1))))) 

(define f2 
  (lambda (x)
    (define f3 
      (lambda (n m) 
        (cond
          ((eq? n 0) m)
          (t (f3 (- n 1) (* m n)))
        )
      ))
      (f3 x 1)))
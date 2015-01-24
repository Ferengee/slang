(define f (lambda (x) (if (= x 1) 1) (* x (f (- x 1))))) 

(define !i
  (lambda (x)
    (define iter 
      (lambda (n m) 
        (cond
          ((eq? n 0) m)
          (t (iter (- n 1) (* m n)))
        )
      ))
      (iter x 1)))
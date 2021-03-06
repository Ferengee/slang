;scheme compatibilty:
;
; (define nil ())
; (define (nil? x) (eq? x nil))
; (define t #t)
; (define mapcar map)


(define *nodes* '((living-room (you are in the living-room.
                            a wizard is snoring loudly on the couch.))
                        (garden (you are in a beautiful garden.
                            there is a well in front of you.))
                        (attic (you are in the attic.
                            there is a giant welding torch in the corner.))))

(define (describe-location location nodes)
   (cadr (assoc location nodes)))

(define *edges* '((living-room (garden west door)
                                     (attic upstairs ladder))
                        (garden (living-room east door))
                        (attic (living-room downstairs ladder))))


(define (describe-path edge)
  `(there is a ,(caddr edge) going ,(cadr edge) from here.))

(define (describe-paths location edges)
  (apply append (map describe-path (cdr (assoc location edges)))))

(define *object-locations* '((whiskey living-room)
                                   (bucket living-room)
                                   (chain garden)
                                   (frog garden)))
(define (remove-if-not fn lst)
  (cond
    ((nil? lst) nil)
    ((fn (car lst)) (cons (car lst) (remove-if-not fn (cdr lst))))
    (t  (remove-if-not fn (cdr lst)))
)
)

(define (objects-at loc objs obj-locs)
  (define (at-loc-p obj)
    (eq? (cadr (assoc obj obj-locs)) loc))
  (remove-if-not at-loc-p objs))

(define *objects* '(whiskey bucket frog chain))

(define (describe-objects loc objs obj-loc)
  (define (describe-obj obj)
               `(you see a ,obj on the floor.))
    (apply append (map describe-obj (objects-at loc objs obj-loc))))

(define (look)
  (append (describe-location *location* *nodes*)
          (describe-paths *location* *edges*)
          (describe-objects *location* *objects* *object-locations*)))

(define *location* 'living-room)


;(defun walk (direction)
;  (let ((next (find direction
;                    (cdr (assoc *location* *edges*))
;                    :key #'cadr)))
;  (if next
;      (progn (setf *location* (car next))
;             (look))
;      '(you cannot go that way.))))

(define (walk direction)
  (define (do next)
    (define (go)
      (set! *location* (car next))
      (look)
    )
    (cond
      ((nil? next) '(you cannot go that way))
      (t (go))))
  (do (find direction (cdr (assoc *location* *edges*)) cadr))
)

(define (generate-finder matchfn needle lst)
  (cond
    ((nil? lst) nil)
    ((eq? (matchfn (car lst)) needle) (car lst))
    (t (generate-finder matchfn needle (cdr lst)))
  )
)

(define (find needle lst . matchfn)
  (generate-finder (cond ((nil? matchfn) car) (t (car matchfn))) needle lst)
)

(define (closure-test x)
  (lambda () x)
)

(define (pickup object)
  (cond 
    ((member object
         (objects-at *location* *objects* *object-locations*))
     (push! (list object 'body) *object-locations*)
           `(you are now carrying the ,object))
    (t '(you cannot get that.))))

;(walk 'west)
(define (identity x) x)
(define member (generate-finder identity))

(define (inventory)
  (cons 'items- (objects-at 'body *objects* *object-locations*)))

(define help '(use (look) to look around and use (walk) to move around. Use (inventory) to see what you are carrying))


(define (have object)
    (member object (inventory)))

(define *chain-welded* nil)

(define *bucket-filled* nil)

(define (create-game-action name actionfn location expected-subject expected-object precondition subject object)
  (cond ((and (eq? *location* location)
            (eq? subject expected-subject)
            (eq? object expected-object)
            (have expected-subject)
            (precondition))
            (actionfn)
         )
    (t `(you cannot ,name like that.))))

(define dunk 
  (create-game-action 'dunk (lambda () 
    (set! *bucket-filled* t) 
    '(the bucket is now full of water.)
    ) 'garden 'bucket 'well (lambda () *chain-welded*)))

(define weld 
  (create-game-action 'weld (lambda () 
    (set! *chain-welded* t) 
    '(the chain is now securely welded to the bucket.)
    ) 'attic 'chain 'bucket (lambda () (not *chain-welded*))))

(define splash (create-game-action 'splash (lambda ()
   (cond ((not *bucket-filled*) '(the bucket has nothing in it.))
         ((have 'frog) '(the wizard awakens and sees that you stole his frog.
                         he is so upset he banishes you to the
                         netherworlds- you lose! the end.))
         (t '(the wizard awakens from his slumber and greets you warmly.
              he hands you the magic low-carb donut- you win! the end.)))
    ) 'living-room 'bucket 'wizard (lambda ()t)))
  


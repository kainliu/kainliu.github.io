---
title: Thoughts on A Beautiful Trick for Memorization
date: 2017-07-06 23:23:00
disqus: true
tag:
- python
- fibonacci
- memorization
- scope
mathjax: true
thumbnail: /images/transparency.png
description: Using function-level shared variables as memorizers.

---

This trick is using a function argument to memorize recursive states of expensive calculations ( [python docs](https://docs.python.org/2/faq/programming.html#why-are-default-values-shared-between-objects) ).

An example is to improve fibonacci calculator as follows,

```python
def fib_naive(n):
    """ Naive fibonacci calculator """
    if n <= 1: return 1
    return fib_naive(n-1) + fib_naive(n-2)
```

```python
def fib_cache(n, _cache = {}):
    """ Fibonacci calculator with cache """

    # Return cache results
    if n in _cache:
        return _cache[n]      

    if n <= 1:
        result = 1
    else:
        result = fib_cache(n-1) + fib_cache(n-2)
        # Callers will never provide a second parameter.

    # Store results
    _cache[n] = result        
    return result
```

If you totally get the trick of `_cache = {}` --- isn't it nice? --- I am very happy to accept it.

Of course, maintaining a global variable for storage could also deliver the same functionality.

```python
""" Using global cache """

cache = {}

def run(n):
    if n in cache:      # Is it a undefined local variable?
        ....

    if n == MAXIMUM_VALUE:
        cache = {}      # May I clear the cache safely?

    ....
    _cache[n] = result  # Should be okay to update the cache.

def walk(n):            # What if I do not want to share cache 
                        # with other functions?
    ....

```

I can not answer these questions with 100 percent confidence.

Let's start with understanding `local` and `global` variables.

## Local & Global

Python is compact. And with a price.

For example, it saves us from declaring the variables in a verbose way,

```python
x = Point(10,10) # Python
```
```javascript
Point x = new Point(10, 10);  /* Java */
```
```javascript
const x = new Point(10, 10);  // ECMA5 Javascript
```

But it takes some efforts to understand its concept of variable scopes.

<div class="vertical-col">
<div class="col">

```python
arr = [True]
def run():
  arr[0] = False
  print 'inside: ', arr

run()
print 'outside:', arr

------
inside:  [False]
outside: [False]
```
</div>

<div class="col">

```python
arr = [True]
def run():
  arr = [False]
  print 'inside: ', arr

run()
print 'outside:', arr

------
inside:  [False]
outside: [True]
```
</div>

</div>

Let's examine the differences.

In the first block, I am actually calling `arr.__setitem__(0, False)`. Python finds out that `arr` is not defined inside function scope (`local`), and thus continues to look it up in the outside scope (`global`). After successfully locating `arr` in global scope, python calls a function to change the first item of a global variable.

In comparison, in the second block, python considers `arr = [False]` as an action to create a local variable.

```python
# < global variable scope >
def run():
    # < local variable scope >
```

If we would like to add another element to `arr`, there are two ways:

<div class="vertical-col">
<div class="col">

```python
arr = [True]
def run():
  arr.extend([False])
  print 'inside: ', arr

run()
print 'outside:', arr

------
inside:  [True, False]
outside: [True, False]
```
</div>

<div class="col">

```python
arr = [True]
def run():
  arr += [False]
  print 'inside: ', arr

run()
print 'outside:', arr

------
UnboundLocalError: 
local variable 'arr' referenced before assignment
```
</div>
</div>

The first block is easy to understand, since calling a function `arr.extend` is just like `arr.__setitem__` in the previous example.
Meanwhile, in second block, `arr += [False]` equals to `arr = arr + [False]`. 

One principle here in python is,

> Anything being assigned ( `x = ...` ) is taken as a local variable in `function`.

At the left side of equation, on such principle, python judges `arr` is a local variable. At the right side of equation, it throws an error because of a loop of variable assignment.

Our original purpose is to take `arr` as a global variable. And we have to add a line to declare such intention.

<div class="vertical-col">
<div class="col">

```python
arr = [True]
def run():
  # declare global using `global`
  global arr   
  arr += [False]
  print 'inside: ', arr

run()
print 'outside:', arr

------
inside:  [True, False]
outside: [True, False]
```
</div>

<div class="col">

```python
arr = [True]
def run():
  # declare local using `=`
  arr = []     
  arr += [False]
  print 'inside: ', arr

run()
print 'outside:', arr

------
inside:  [False]
outside: [True]
```
</div>
</div>

### Looking around on Javascript

<div class="vertical-col">
<div class="col">

```javascript
// IT'S Javascript!
var a = true;

function run(){
    // OPS! forget to initialize before use it
    a = false;
    console.log('inside: ', a)
}

run()
console.log('outside:', a)

------
inside:  false
outside: false
```
</div>

<div class="col">

```javascript
// IT'S Javascript!
var a = true;

function run(){
    var a;
    a = false;
    console.log('inside: ', a)
}

run()
console.log('outside:', a)

------
inside:  false
outside: true
```
</div>
</div>

In comparison, it's easy to understand why javascript shocks so many engineers with non-front-end background, by placing more weight on `easy to run` over `global variable safety`. While in Baidu (one of the largest search companies, [wiki](https://en.wikipedia.org/wiki/Baidu)), I have gained more than enough experience in debugging on web pages, where global variables are contaminated by careless coders.


## Memorization

Does the cache speed up the calculation?

```Python
from timeit import default_timer as timer

k = 30
start = timer()
fib_naive(k)
pause = timer()
fib_cache(k)
stop = timer()

time1 = pause - start
time2 = stop - pause
print '%6f / %6f = %d' % (time1, time2, time1 / time2)

------
0.311446 / 0.000061 = 5102
```

The `Big O` of `fib` is $O(2^n)$ ([stackoverflow](https://stackoverflow.com/questions/360748/computational-complexity-of-fibonacci-sequence)), while the `fib_cache` is $O(n)$.

Memorization contributes a lot, and actually it is the core of *Dynamic Programming*. Some would like to introduce DP as,

> **Top-down Dynamic Programming** = **Divide & Conquer** + **Memorization**

And I think this equation explains *Dynamic Programming* better than the name itself.

## Default Value

Consider following example:

<div class="vertical-col">
<div class="col">

```python
def store(ele, arr = []):

  arr.append(ele)
  return arr

print store(1) == [1]
print store(2) == [2]
print store.__defaults__

------
True
False
([1, 2],)
```
</div>

<div class="col">

```python
def store(ele, arr = None):
  if not arr: arr = []
  arr.append(ele)
  return arr

print store(1) == [1]
print store(2) == [2]
print store.__defaults__ 

------
True
True
(None,)
```
</div>
</div>

As the [Python docs](https://docs.python.org/2/faq/programming.html#why-are-default-values-shared-between-objects) points out that,

> It is often expected that a function call creates new objects for default values. This is not what happens. Default values are created exactly **once**, when the function is defined.

```javascript
// IT'S Javascript
function store(ele, arr = []){
    arr.push(ele)
    return arr
}

// A new call creates a new array with default value.
console.log(store(1))  // output: [ 1 ]
console.log(store(2))  // output: [ 2 ]
```

So a good programming practice is to NOT use mutable objects, e.g.`list`/`dict`,  as default values. Immutable objects of default values are also created once, since it can not be changed, the values will be copied to create new local variables inside the function.

Unless you are very clear about what you are doing, mutable objects of default values can cause confusing consequences.

Looking at `fib_cache(..., _cache = {})` again, it takes full advantage of such feature, `_cache` is *bound* to this function, serving as a function-level shared variable. It reminds me of *class variable* shared by all instances.

-----

I will end this post by improving the global solution as mentioned in the beginning.

```python
""" Global variable solution """

cache = {}
def run(n):
    if n in cache:      # Wait.. is it an undefined local variable?
        ....            #
                        # No. It is the global variable as we wished.
    if n == MAXIMUM_VALUE:
        # cache = {}    # May I clear the cache safely?
                        #
                        # Not in this way.
                        # This declaration will raise `UnboundLocalError`.
        cache.clear()   # Use `clear` method instead.

    ....

    cache[n] = result   # It's okay to update the cache in this way
                        # since it's `cache.__setitem__(n, result)`.

def walk():
    ....                # Every other function could touch the global cache.
                        # So why not use `_cache` trick :)
```

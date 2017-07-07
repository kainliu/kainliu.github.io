---
title: Thoughts on A Beautiful Trick for Memorization
date: 2017-07-06 23:23:00
disqus: true
tag:
- python
- fibonacci
- memorization
- variable scope
mathjax: true
---

This trick is using `_cache` as storage, for memorizing internal states of expensive calculations ([python docs](https://docs.python.org/2/faq/programming.html#why-are-default-values-shared-between-objects)).

I use it to improve naive `fibonacci` as follow:

```python
def fib(n):
    """ Naive fibonacci calculator """
    if n == 0: return 0
    if n == 1: return 1

    return fib(n-1) + fib(n-2)
```

```python
def fib_plus(n, _cache = {}):
    """ Fibonacci calculator with cache """

    if n in _cache:
        return _cache[n]      # Return cache results

    if   n == 0: result = 0
    elif n == 1: result = 1
    else:
        result = fib_plus(n-1) + fib_plus(n-2)
        # Callers will never provide a second parameter for this function.

    _cache[n] = result        # Store results
    return result
```

If you totally get it -- isn't it nice? -- at least I am very happy to accept it.

Of course, maintaining a global variable for storage could also deliver the same functionality. But I prefer this way not because it's only a matter of taste.

```python
cache = {}

def run(n):
    if n in cache:      # wait.. is it a undefined local variable?
        ...

    if n == MAXIMUM_VALUE:
        cache = {}      # may I clear the cache safely?

    ...
    _cache[n] = result  # should be okay to update the cache
```

I can not answer these questions with 100 percent confidence.

Let's start with understanding `local` and `global` variables.

## local & global

Python is compact. And with a trade off.

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

But it takes some efforts to understand the scope of variables.
<div class="verticalCodeBlocks">
```python
arr = [True]
def run():
  arr[0] = False
  print 'inside: ', arr

run()
print 'outside:', arr
```
```python
inside:  [False]
outside: [False]
```
</div>

<div class="verticalCodeBlocks">
```python
arr = [True]
def run():
  arr = [False]
  print 'inside: ', arr

run()
print 'outside:', arr
```
```python
inside:  [False]
outside: [True]
```
</div>

Let's examine the differences.
In the first block, I am actually calling `arr.__setitem__(0, False)`. Python checks `arr` is not defined inside function scope (`local`), and thus continue looking for it in the outside scope (`global`). Successfully finds the `arr` variable, and calls a function to change its first item.  

While in the second block, python takes `arr = [False]` as an action to create a local variable.
```
<global variable list>
def run():
    <local variable list>
```

If we would like to add another result to the `arr`, there are two ways:

<div class="verticalCodeBlocks">
```python
arr = [True]
def run():
  arr.extend([False])
  print 'inside: ', arr

run()
print 'outside:', arr
```
```python
inside:  [True, False]
outside: [True, False]
```
</div>

<div class="verticalCodeBlocks">
```python
arr = [True]
def run():
  arr += [False]
  print 'inside: ', arr

run()
print 'outside:', arr
```
```python
UnboundLocalError: local variable 'arr'
                   referenced before assignment
```
</div>

The first block is easy to understand given previous example -- `arr.extend` is just like `arr.__setitem__`.

Meanwhile, in second block, `arr += [False]` equals to `arr = arr + [False]`. One principle here in python is,

> Anything being assigned is taken as local variable in a function.

Such principle of `=` judges `arr` is a local variable. Again python looks at the right side equation, and throws an error since it is not referenced.

Our original purpose is to take `arr` as a global variable. And we have to add a line to declare such intention.

<div class="verticalCodeBlocks">
```python
arr = [True]
def run():
  # declare global using `global`
  global arr   
  arr += [False]
  print 'inside: ', arr

run()
print 'outside:', arr
```
```python
inside:  [True, False]
outside: [True, False]
```
</div>

<div class="verticalCodeBlocks">
```python
arr = [True]
def run():
  # declare local using `=`
  arr = []     
  arr += [False]
  print 'inside: ', arr

run()
print 'outside:', arr
```
```python
inside:  [False]
outside: [True]
```
</div>

### Looking around on Javascript

<div class="verticalCodeBlocks">
```javascript
// IT'S Javascript!
var a = true;

function run(){
    // OPS! forget to initialize
    a = false;
    console.log('inside: ', a)
}

run()
console.log('outside:', a)
```
```python
inside:  false
outside: false
```
</div>

<div class="verticalCodeBlocks">
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
```
```python
inside:  false
outside: true
```
</div>

In comparison, it's easy to understand why Javascript shocks so many engineers outside front-end area, by placing more weight on `easy to run` over `global variable safety`. While in Baidu, I have gained more than enough experience in debugging on web pages, where global variables are contaminated by careless coders.


## Memorization

Does memorization speed up the calculation?

```Python
from timeit import default_timer as timer

k = 30
start = timer()
fib(k)
pause = timer()
fib_plus(k)
stop = timer()

time1 = pause - start
time2 = stop - pause
print '%6f / %6f = %d' % (time1, time2, time1 / time2)
```
```python
0.311446 / 0.000061 = 5102
```

The `Big O` of `fib` is $O(2^n)$ ([stackoverflow](https://stackoverflow.com/questions/360748/computational-complexity-of-fibonacci-sequence)), while the `fib_plus` is $O(n)$.

Actually,

**Top-down Dynamic Programming** $\approx$ **Divide & Conquer** + **Memorization**


## Default value

Next let's see the default value of arguments.

Consider following example:

<div class="verticalCodeBlocks">
```python
def store(ele, arr = []):

  arr.append(ele)
  return arr

print store(1) == [1]    # output: True
print store(2) == [2]    # output: False
print store.__defaults__ # output: ([1, 2],)
```
</div>

<div class="verticalCodeBlocks">
```python
def store(ele, arr = None):
  if not arr: arr = []
  arr.append(ele)
  return arr

print store(1) == [1]    # output: True
print store(2) == [2]    # output: True
print store.__defaults__ # output: (None,)
```
</div>

As the [Python docs](https://docs.python.org/2/faq/programming.html#why-are-default-values-shared-between-objects) points out that,

> It is often expected that a function call creates new objects for default values. This is not what happens. Default values are created exactly **once**, when the function is defined.

```javascript
// IT'S Javascript
function store(ele, arr = []){
    arr.push(ele)
    return arr
}

// It is just like normal expectation.
// A new call creates a new array with default value.
console.log(store(1))  // output: [ 1 ]
console.log(store(2))  // output: [ 2 ]
```

So a good programming practice is to NOT use mutable objects, e.g.`list`/`dict`,  as default values. Immutable objects of default values are also created once, since it can not be changed, the values will be copied to create new local variables inside the function.

Unless you are very clear about what you are doing, mutable objects of default values can cause confusing consequences.

Looking at this `_cache = {}` trick again. It takes full advantage of such feature, `_cache` is *bound* to this function, serving as a function-level shared variable. It reminds me of *class variable* shared by all instances.

-----

Now we could correct the mistakes in the previous solutions.

```python
cache = {}
def run(n):
    if n in cache:      # Wait.. is it an undefined local variable?
        ....            #
                        # No. It is the global variable as we wished.
    if n == MAXIMUM_VALUE:
        # cache = {}    # May I clear the cache safely?
                        #
                        # Not in this way.
                        # This declaration will raise UnboundLocalError.
        cache.clear()   # Use clear method of dictionary.

    ....

    cache[n] = result  # It's okay to update the cache in this way
                        # since it's cache.__setitem__(n, result)

```

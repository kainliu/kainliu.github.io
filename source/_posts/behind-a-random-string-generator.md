---
title: Behind A Random String Generator
date: 2012-05-11
tags:
- javascript
- hardware
- circuits
categories:
thumbnail: /images/random-number-transistor.jpg
description: Randomness origins from an elegant design of hardware.
mathjax: true
---


It starts when I play with the javascript source codes of `Google Translate`. There is an interesting line:

```javascript
Math.floor(2147483648 * Math.random()).toString(36);
```
which generates a random 6-character string, e.g. `"2qa2xe"`.

1. `Math.toString()`

    When the string converted from the random number in 36 decimal, the characters are selected from $\[0-9] \cup [a-z]$.

    ```javascript
    var a = 35;
    a.toString();   //"35"
    a.toString(2);  //"100011"
    a.toString(36); //"z"
    ```

2. `2147483648`

    I found out that this magic number is $2^{31}$.  Since `Math.random()` returns a float between $[0,1)$,
    ```javascript
    Math.floor(2147483648 * Math.random())
    ```
    returns an integer between $[0, 2147483648)$. The 'largest' string is `"zik0zj"`.

So in my opinion, this line is used as a light-weight random string generator, which could be used to identify the users or sessions.

For example, we want to generate a 6-character random string.
The number corresponding with the max 6 character string `zzzzzz` is $36^{6} - 1$

```javascript
N = 6
// 0 - zzzzzz
Math.floor(Math.pow(36, N) * Math.random()).toString(36);
```

With little efforts we could extend it to a full generator:

```javascript
// A random string generator
// @Input: {Integer} string length
// @Output: {String}
function randomString(N){
  // force input to legal integer, otherwise set to default
  if(!parseInt(N,10)) N = 6
  // generator string from random number
  var rs = Math.floor(Math.pow(36, N) * Math.random()).toString(36);
  // if the new string is short than N, add 0 on the left
  return (Math.pow(10, N) + rs).substr(-N);
}
```


## Underneath the functions

`Math.random()` may be the most frequently used functions, and almost all mainstream languages have built-in implementations.

Most Javascript engines use a [pseudo-random number generator(PRNG)](https://en.wikipedia.org/wiki/Pseudorandom_number_generator), in which the random number is derived from an internal state and calculated by a fixed algorithm. [Python](https://docs.python.org/2/library/random.html) `random` module also uses pseudo-random number generators with the underlying implementation in C.

I found an interesting implementation in github repository of [Chrome v8](https://github.com/v8/v8/blob/ca6e40d7ba853319c15196fef3f4536c8b3929fe/benchmarks/spinning-balls/v.js), in a benchmark implementation.

```javascript
// To make the benchmark results predictable, we replace Math.random
// with a 100% deterministic alternative.
Math.random = (function() {
  var seed = 49734321;
  return function() {
    // Robert Jenkins' 32 bit integer hash function.
    seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
    seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
    seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
    seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
    seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
    seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
    return (seed & 0xfffffff) / 0x10000000;
  };
})();
```

It overrides original function and delivers a fixed sequence of "random" number, which is determined by the `seed`.

```python
# the sequences are deterministic given a particular seed:
> Math.random()
  0.9872818551957607
> Math.random()
  0.34880331158638
> Math.random()
  0.5631933622062206
> Math.random()
  0.9990169629454613
> Math.random()
  0.8291510976850986
```

Moreover, from the comments, we could have these inferences:
1. this alternative `Math.random` is deterministic by the seed, to make sure benchmarks are measured in the same way.
2. the original `Math.random` should not be 100% deterministic, at least on time-consuming performance.
3. this alternative should not be computationally expensive with a 32-bit internal state.

*Yang Guo* from V8 project [has an introduction](https://v8project.blogspot.nl/2015/12/theres-mathrandom-and-then-theres.html) about how they upgrade from  the 64-bit internal state algorithm to the new 128-bit one, called [xorshift128+](http://vigna.di.unimi.it/ftp/papers/xorshiftplus.pdf).

Of course the solution of adding more bits ($N$) is effective to make random numbers hard to repeat themselves (permutation cycle is $2^{N}$), but, how to get a randomly chosen seed -- **a pure spark**?

![Dices are random number generators when each surface equally shaped.](/images/dices.jpg)

## Chaos, Uncertainty, Randomness

Predictable states are unavoidable in computers, while the chaotic universe is full of randomness around us, such as [Brownian motion](https://en.wikipedia.org/wiki/Brownian_motion), the movement of atoms or molecules.

The question is how to capture it, and in an efficient way.

I heard about that in the ancient era of Windows XP, one black magic is to apply an IE plugin to access the current voice input, to get such random variables. The white-noise signals provide very reliable source and thus the JavaScript module could later use it as the unique-id. Though the details are not introduced, I believe it's feasible.

At that time I started to think about how to capture such chaotic signals.

The [article](http://spectrum.ieee.org/computing/hardware/behind-intels-new-randomnumber-generator) by *Greg Taylor* and *George Cox* introduces their efforts on Intel's new random number generator. From this we learned that there have been successful trials to generate random numbers with circuits, however, the cost of energy was one of the biggest shortcomings. Their new solution was fabulous:

![Uncertain Circuits](/images/random-number-transistor2.jpg)

> Uncertain Circuits : When transistor 1 and transistor 2 are switched on, a coupled pair of inverters force Node A and Node B into the same state [left]. When the clock pulse rises [yellow, right], these transistors are turned off. Initially the output of both inverters falls into an indeterminate state, but random thermal noise within the inverters soon jostles one node into the logical 1 state and the other goes to logical 0.

The circuits take advantage of the physically random properties of the thermal noise to generate a random binary outcome -- a pure spark.



![Intel random number generator](/images/intel-random-number-generator.jpg)

In practice, the electric features of transistors are never exactly the same, so there will be more one state than another statistically. However we require them to be almost equally distributed with 0s/1s. Given a long stream of raw bits from the `circuit`, a `conditioner` is set to monitor the frequency of 0s/1s, to fix the bias and correlation in the long term. Next, the stream from conditioner is sent to `PRNG`, then we will have the random number.


**I feel this should be the first lesson of my bachelor study on Analog/Digital Circuits. It unveils the design of fundamental graceful hardwares for a commonly used function, and vividly points out the importance of understanding fundamental technologies.** For me, it is very exciting to see such a beautiful solution, and to enjoy the progress to think deeper.

Another question just occurred to me: is such randomness related with *Quantum Communication*, if yes, is it taking advantage of the uncertainty in atomic level?

### Aside: Random numbers in Crypto Safety

As *Yang Guo* points out [in the blog](https://v8project.blogspot.nl/2015/12/theres-mathrandom-and-then-theres.html) that:

> Even though *xorshift128+* is a huge improvement.., it still is not cryptographically secure. For use cases such as hashing, signature generation, and encryption/decryption, ordinary PRNGs are unsuitable. The Web Cryptography API introduces *window.crypto.getRandomValues*, a method that returns cryptographically secure random values, at a performance cost.

Python docs also give a [warning](https://docs.python.org/2/library/random.html#random.jumpahead):

> Warning: The pseudo-random generators of this module should not be used for security purposes. Use *os.urandom()* or *SystemRandom* if you require a cryptographically secure pseudo-random number generator.

Generally, *cryptographically secure* means **even if the attackers know the current state of this generator (or guess correctly), it's still infeasible to get the next state with reasonable computational power**.

It is very clear that they suggested using cryptographically secure pseudo-random number generator [CSPRNG](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator) instead of PRNG in safety-sensitive scenes.

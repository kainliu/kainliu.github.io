---
title: Promise
date: 2017-05-09 14:00:10
disqus: true
tag:
- javascript
- async
- notes
---

With three examples I summarize the usage of `promise`:


| Function    | Features      | Flow Chart |
|--------------|--------------|------------------|
|Baseline| <li> send a request then display the response, until all the requests are done. <li> `array.reduce` is promise-compatible while `array.forEach` is not promise-compatible.| ![](/images/promise-0.png)|
|In Parallel| <li> send all requests in parallel, and display responses when all of them arrive. <li>  use `Promise.all` and `array.map`. | ![](/images/promise-1.png)|
|In Parallel 2| <li> extension of `workInParallel` <li> send all requests in parallel, while responses are shown AS SOON AS they arrived. | ![](/images/promise-2.png)|
|In Parallel And Sequence| <li> showing contents according to their priorities. important content is mandatory for displaying the trivial blocks.  <li> improve user experience ([Google Developers](https://developers.google.com/web/fundamentals/getting-started/primers/promises#parallelism_and_sequencing_getting_the_best_of_both)). | ![](/images/promise-3.png)|


### Baseline
```javascript
function work(arr) {
  let final = []
  // arr.reduce(`callback`, `[initialValue]`)
  // - `callback`
  //    - `promise` : the sequence of promise
  //    - `item`    : the item in the array
  // - `[initialValue]`: the initial state of promise sequence
  return arr.reduce((promise, item) => {
    return promise.then(result => {
      console.log(`A RESULT: ${result}`)
      return asyncRequest(item).then(result => {
        console.log(`B RESULT: ${result}`)
        final.push(result)
        return result
      })
    })
  }, Promise.resolve(0))
  // when the last request arrives, show all the results together
  .then(() => console.log(`FINAL R.: ${final}`))
}

```

### Mock Async Request
```javascript
// Using a promise to mock an async request
// `e` type : int
function asyncRequest(e) {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => resolve(e),
      // the time delay is `e` second(s).
      1000 * e
    );
  });
}
```

```javascript
> work([1,2,3])

A RESULT: 0     // the initial promise value
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
                // 1s later
B RESULT: 1     
A RESULT: 1
                // 2s later
B RESULT: 2    
A RESULT: 2
                // 3s later
B RESULT: 3   
FINAL R.: 1,2,3
```


### In Parallel

```javascript
function workInParallel(arr){
  return Promise.all(arr.map(asyncRequest))
    .then(final => console.log(`FINAL R.: ${final}`))
}
```

All requests are sent in parallel. The function `array.map` takes an function `asyncRequest` and maps all elements to an array of *promises*.
Then, `Promise.all` takes an array of promises, and create a promise that fulfills when all of them successfully complete.


```javascript
> workInParallel([1,2,3])

Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
                // 3s later
FINAL R.: 1,2,3
```

```javascript
> workInParallel([1,3,2])
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
                // 3s later
FINAL R.: 1,3,2

```
Passing `[1,2,3]` and `[1,3,2]` to the parallel function, both of them cost 3 seconds to fulfill, and the order remains in the final result.
`Promise.all` ensures results in the same order as the promises we passed in.

### In Parallel 2

By extending `Promise.all` method as follows, each response can be displayed as soon as it arrives.

```javascript
function workInParallel2(arr) {
  return Promise.all(arr.map(result => {
    // init the requests
    console.log(`A RESULT: ${result}`)
    return asyncRequest(result).then(result => {
      // display the result as soon as it arrives
      console.log(`B RESULT: ${result}`)
      return result
    })
  }))
  // when all responses arrive show final results
  .then(final => console.log(`FINAL R.: ${final}`))
}
```

```javascript
> workInParallel2([1,2,3])

A RESULT: 1
A RESULT: 2
A RESULT: 3
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
              // 1s later
B RESULT: 1
              // 1s later
B RESULT: 2
              // 1s later
B RESULT: 3
FINAL R.: 1,2,3
```



### In Parallel And Sequence

```javascript
function workInParallelAndSequence(arr) {
  let final = []    
  return arr.map(asyncRequest)
    .reduce((sequence, item) => {
      // init a promise sequence
      console.log(`seq.:`, sequence)
      console.log(`---`)
      return sequence.then( (result) => {
        console.log(`A RESULT: ${result}`)
        console.log(`item:`, item)
        console.log(`---`)
        // queue each promise request to the sequence
        return item
      })
      .then( result => {
        console.log(`B RESULT: ${result}`)
        // get the response
        final.push(result)
        return result
      })
    }, Promise.resolve(0))
    .then(() => console.log(`FINAL R.: ${final}`))
}
```


```javascript
> workInParallelAndSequence([1,2,3])

SEQ.: Promise { 0 }         // Adding 1 req, 0 req resolved
---
SEQ.: Promise { <pending> } // Adding 2 req, 1 req pending
---
SEQ.: Promise { <pending> } // Adding 3 req, 2 req pending
---
A RESULT: 0
ITEM: Promise { <pending> } // fulfilling 1 req
---                         // 1s later
B RESULT: 1
A RESULT: 1
ITEM: Promise { <pending> } // fulfilling 2 req
---                         // 1s later
B RESULT: 2
A RESULT: 2
ITEM: Promise { <pending> } // fulfilling 3 req
---                         // 1s later
B RESULT: 3
FINAL R.: 1,2,3
```

Let's assume one of the content wither a higher priority, for example, the main body of the web page, should be displayed before the sidebar widgets.

```javascript
[
  1, // `#header`  takes 1 second
  3, // `#min`     takes 3 seconds
  2  // `#sidebar` takes 2 seconds
]
```
We can apply this in certain scenarios when the main content (feed, article, etc.) is required to show before all less important contents (sidebar, ads, etc.).

We would like to take full advantage of `promise` parallelism and keep the sequencing.

```javascript
> workInParallelAndSequence([1,3,2])

SEQ.: Promise { 0 }         // Adding 1 req, 0 resolved
---
SEQ.: Promise { <pending> } // Adding 3 req, 1 req pending
---
SEQ.: Promise { <pending> } // Adding 2 req, 3 req pending
---
A RESULT: 0                
ITEM: Promise { <pending> } // fulfilling 1 req
---                         // 1s later
B RESULT: 1
A RESULT: 1
ITEM: Promise { <pending> } // fulfilling 3 req
---                         // 2s later
B RESULT: 3
A RESULT: 3
ITEM: Promise { 2 }         // 2 req already fulfilled
---
B RESULT: 2
FINAL R.: 1,3,2
```

As seen from the console, the response of `2` was being held while response of `3` was on the fly. The function forces the sequence of showing the results.


## Todo

I find that debugging asynchronous functions is quite hard even enhanced with *Promise*. Instead of `console.log`, I believe there will be a better tool to detail the request stacks.

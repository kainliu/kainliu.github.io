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


| Name    | Notes      | Flow Chart |
|--------------|--------------|------------------|
|`work` as baseline| <li> send a request then display the response, until all the requests are done. <li> `array.reduce` is promise-compatible while `array.forEach` is not promise-compatible.| ![](/images/promise-0.png)|
| `workInParallel` | <li> sends all requests in parallel, and display responses when all of them arrive. <li>  use `Promise.all` and `array.map`. | ![](/images/promise-1.png)|
| `workInParallel2` | <li> based on `workInParallel` <li> send all requests, but responses are shown AS SOON AS they arrived. | ![](/images/promise-2.png)|
| `workInParallelAndSequence` | <li> showing contents according to their priorities. important content is required before showing the trivial blocks.  <li> improve user experience([Google Developers](https://developers.google.com/web/fundamentals/getting-started/primers/promises#parallelism_and_sequencing_getting_the_best_of_both)) | ![](/images/promise-3.png)|


### work
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

### asyncRequest
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


### workInParallel

```javascript
function workInParallel(arr){
  return Promise.all(arr.map(asyncRequest))
    .then(final => console.log(`FINAL R.: ${final}`))
}
```

All requests are sent in parallel. `array.map` takes an function `asyncRequest` and maps all elements to an array of *promises*.
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

### workInParallel2

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



### workInParallelAndSequence

```javascript
function workInParallelAndSequence(arr) {
  let final = []

  return arr.map(asyncRequest)
    .reduce((promise, item) => {
      return promise.then( result => {
        console.log(`A RESULT: ${result}`)
        return item
      })
      .then( result => {
        console.log(`B RESULT: ${result}`)
        final.push(result)
        return result
      })
    }, Promise.resolve(0))
    // when all responses arrive, show the result
    .then(() => console.log(`FINAL R.: ${final}`))
}
```


```javascript
> workInParallelAndSequence([1,2,3])

A RESULT: 0
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
              // 1s later
B RESULT: 1
A RESULT: 1
              // 1s later
B RESULT: 2
A RESULT: 2
              // 1s later
B RESULT: 3
FINAL R.: 1,2,3
```

Let's assume one of the content wither a higher priority, for example, the main body of the web page, should be displayed before the sidebar widgets.

```javascript
[
 1, // header takes 1 second
 3, // main body takes 3 seconds
 2  // sidebar takes 2 seconds
]
```
We can apply this in certain scenarios when the main content (feed, article, etc.) is required to show before all less important contents (sidebar, ads, etc.).

We would like to take full advantage of `promise` parallelism and keep the sequencing.

```javascript
> workInParallelAndSequence([1,3,2])

A RESULT: 0
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
              // 1s later
B RESULT: 1
A RESULT: 1
              // 2s later
B RESULT: 3
A RESULT: 3
B RESULT: 2
FINAL R.: 1,3,2
```

As seen from the console, there is no delay between the output of `3` and `2`, which means the response of `2` was being held while response of `3` was on the fly. The function forces the sequence of showing the results.

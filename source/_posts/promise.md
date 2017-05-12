---
title: Understanding Promise With Three Examples
date: 2017-05-09 14:00:10
disqus: true
tag:
- javascript
- async
- notes
---

With three examples I summarize the usage of `promise`:

1. `workSequentially`
  - sends requests and show responses one by one.
  - `array.reduce` is promise-compatible.
  - `array.forEach` is not promise-compatible.
2. `workParallelly`
  - sends all requests in parallel, and will show responses when all of them arrive.
  - `Promise.all`
  - `array.map`
3. `workParallellyWithReduce` / `workParallellyWithPromiseAll`
  - send all requests, but responses are shown as soon as they arrived.
  - improve user experience by showing contents according to their priorities ( [Google Developers](https://developers.google.com/web/fundamentals/getting-started/primers/promises#parallelism_and_sequencing_getting_the_best_of_both) ).

### asyncRequest
```javascript
// Using a promise to mock an async request
// `e` type : int
function asyncRequest(e) {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => resolve(e),
      1000 * e
    );
  });
}
```

### workSequentially
```javascript
function workSequentially(arr) {
  let final = []
  // arr.reduce(`callback`, `[initialValue]`)
  // - `callback`
  //    - `promise` : the sequence of promise
  //    - `item`    : the item in the array
  // - `[initialValue]`: the initial state of promise sequence
  return arr.reduce((promise, item) => {
    return promise.then(result => {
      console.log(`A: result ${result}`)
      return asyncRequest(item).then(result => {
        console.log(`B: result ${result}`)
        final.push(result)
        return result
      })
    })
  }, Promise.resolve(0))
  // when the last request arrives, show all the results together
  .then(() => console.log(`FINAL RESULT: ${final}`))
}

```

As we seen from the console outputs, the responses arrive in the same order as the promises that we passed in.

```javascript
> workSequentially([1,2,3])

A: result 0     // the initial promise value
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
                // 1s later
B: result 1     
A: result 1
                // 2s later
B: result 2    
A: result 2
                // 3s later
B: result 3   
FINAL RESULT: 1,2,3
```


### workParallelly

```javascript
function workParallelly(arr){
  return Promise.all(arr.map(asyncRequest))
    .then(final => console.log(`FINAL RESULT: ${final}`))
}
```

All requests are sent in parallel. `array.map` takes an function `asyncRequest` and maps all elements to an array of *promises*.
Then, `Promise.all` takes an array of promises, and create a promise that fulfills when all of them successfully complete.


```javascript
> workParallelly([1,2,3])

Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
                // 3s later
FINAL RESULT: 1,2,3
```

```javascript
> workParallelly([1,3,2])
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
                // 3s later
FINAL RESULT: 1,3,2

```
Passing `[1,2,3]` and `[1,3,2]` to the parallel function, both cost 3 seconds to fulfill, and the order remains in the final result.
`Promise.all` ensures results in the same order as the promises we passed in.


### workParallellyWithReduce

```javascript
function workParallellyWithReduce(arr) {
  let final = []

  return arr.map(asyncRequest)
    .reduce((promise, item) => {
      return promise.then( (result) => {
        console.log(`A: result ${result}`)
        return item
      })
      .then( result => {
        console.log(`B: result ${result}`)
        final.push(result)
        return result
      })
    }, Promise.resolve(0))
    // when all responses arrive, show the result
    .then(() => console.log(`FINAL RESULT: ${final}`))
}
```


```javascript
> workParallellyWithReduce([1,2,3])

A: result 0
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
              // 1s later
B: result 1
A: result 1
              // 1s later
B: result 2
A: result 2
              // 1s later
B: result 3
FINAL RESULT: 1,2,3
```


```javascript
> workParallellyWithReduce([1,3,2])

A: result 0
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
              // 1s later
B: result 1
A: result 1
              // 2s later
B: result 3
A: result 3
B: result 2
FINAL RESULT: 1,3,2
```

If we pass `[1,3,2]`, there is no delay between the console output of `3` and `2`, which means the response of `2` is being held while request of `3` is still on the fly.
The function forces the sequence of showing the results.
We can apply this in certain scenarios when the main content (feed, article, etc.) is required to show before all less important contents (sidebar, ads, etc.).


## workParallellyWithPromiseAll

The same functionality of `workParallellyWithReduce` can be achieved by extending `Promise.all` method as follows,

```javascript
function workParallellyWithPromiseAll(arr) {
  return Promise.all(arr.map(result => {
    // init the requests
    console.log(`A: result ${result}`)
    return asyncRequest(result).then(result => {
      // use the result as soon as it arrives
      console.log(`B: result ${result}`)
      return result
    })
  }))
  // when all responses arrive, show the result
  .then(final => console.log(`FINAL RESULT: ${final}`))
}
```

```javascript
> workParallellyWithPromiseAll([1,2,3])

A: result 1
A: result 2
A: result 3
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
              // 1s later
B: result 1
              // 1s later
B: result 2
              // 1s later
B: result 3
FINAL RESULT: 1,2,3
```

```javascript
> workParallellyWithPromiseAll([1,3,2])

A: result 1
A: result 3
A: result 2
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
              // 1s later
B: result 1
              // 1s later
B: result 2
              // 1s later
B: result 3
FINAL RESULT: 1,3,2
```

`workParallellyWithPromiseAll` outputs the result as soon as corresponding response arrives, and also keeps the order of promises.

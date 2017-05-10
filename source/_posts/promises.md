---
title: Promises
date: 2017-05-09 14:00:10
disqus: false
tag:
- javascript
- notes
---

## Promises

Two examples to understand `promises`.

1. `workOnebyone` handles requests one by one.
  - `array.reduce` is promise-compatible.
  - `array.forEach` is not promise-compatible.
2. `workAll` handles send all requests at the same time.
  - `Promise.all`
  - `array.map`

### asyncFunc
```javascript
// Using a promise to mock an delayed callback
function asyncFunc(e) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(e), 1000 * e);
  });
}
```

### Send requests one by one
```javascript
// send requests one by one
function workOnebyone(arr) {
  // arr.reduce(`callback`, `[initialValue]`)
  let final = []
  return arr.reduce((promise, item) => {
    return promise.then(result => {
      console.log(`A: result ${result}`)
      return asyncFunc(item).then(result => {
        final.push(result)
        console.log(`B: result ${result}`)
        return final
      })
    })
  }, Promise.resolve())
  // when the last request finishes, show the result
  .then(final => console.log(`FINAL RESULT: ${final}`))
}

```


{% codeblock Requested are handled one by one. lang:javascript %}
workOnebyone([1,2,3])

A: result undefined
Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
// 1s later
B: result 1
A: result 1
// 2s later
B: result 2
A: result 1,2
// 3s later
B: result 3
FINAL RESULT: 1,2,3
{% endcodeblock %}


### Send all requests at the same time
```javascript
// send all requests at the same time
function workAll(arr) {
  return Promise.all(arr.map(result => {
    // init the requests
    console.log(`A: result ${result}`)
    return asyncFunc(result).then(result => {
      // show the responses
      console.log(`B: result ${result}`)
      return result
    })
  }))
  // when all responses arrive, show the result
  .then(final => console.log(`FINAL RESULT: ${final}`))
}
```

{% codeblock All requests are sent in the same time. lang:javascript %}
workAll([1,2,3])

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
{% endcodeblock %}

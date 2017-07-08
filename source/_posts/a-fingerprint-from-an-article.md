---
title: A Fingerprint For An Article
date: 2017-07-05 01:00:10
disqus: true
tag:
- javascript
- text mining
- fingerprint
- algorithm
thumbnail: /images/laptop-fingerprint.png
description: An instant text mining of pages in the browser.
---

We are not so into duplicated information. Information theories and the economic principles place more weight on *uniqueness* and *scarcity*, over *duplication* and *universality*.

It's the same when we have a huge number of articles to read.One question is raised: can we generate a small piece to reflect the article, by quickly quantifying the uniqueness of an article?

A intuitive way is to break text into words, and find out valuable keywords.

I would like to use a few lines of Javascript to give a quick estimation of such uniqueness.

- Get the text of document.

  ```javascript
  class Fingerprinter{
    constructor() {
      this.content = document.body.textContent.replace(/(\s+|\W+)/g, ' ')
      // get text, and remove redundant spaces and punctuations.
    }
  }
  ```

- Next, count words.

  ```javascript
  class Fingerprinter{
    ...
    // initial a counter for words in the article
    wordCounter() {

      // cut article into words
      var words = this.content.split(' ')

      // counter
      this.dictionary = {}

      words.forEach((word) => {
        word = word.toLowerCase()
        // when we have a new word that never seen before
        if (!(word in this.dictionary)) {
          // init with 0
          this.dictionary[word] = 0
        }
        // and add by 1
        this.dictionary[word] += 1
      })
    }
  }
  ```

- Select the most frequent words as keywords, excluding non-informative words.
  ```javascript
  class Fingerprinter{
    ...
    // return top N words with repeating times
    // @param: Int
    // @return: [ {"word": String, "count": Int} ]
    top(N=5) {
      var all = []

      // a small dictionary contains non-informative words
      var remove_dictionary = {
        'a':  0, 'an':0, 'the':0,
        'to': 0, 'of':0, 'and':0,
        'it': 0, 'is':0, 'so': 0
      }
      for(var word in this.dictionary) {
        // skip this iteration if it's in the removing dictionary
        // or it's very short
        if (word in remove_dictionary or word.length <= 1) {
          continue
        }
        all.push([this.dictionary[word], word])
      }

      // descending sort (with strange javascript sort function)
      all.sort((a,b) => {return b[0] - a[0]})

      // get top N
      return all.slice(0, N)
    }
  }
  ```

-------

Analysis result of the previous paragraph of this blog, is as follows:

```javascript
>>> var fp = new Fingerprinter()
>>> fp.wordCounter()
>>> fp.top()

[ [ 3, 'we' ],
  [ 3, 'uniqueness' ],
  [ 2, 'into' ],
  [ 2, 'information' ],
  [ 2, 'article' ] ]
```

These keywords can be helpful. It's a rough guess that `we` are talking about `uniqueness` and `information` about `article`s.

In a recently published web page, often it is not cached or crawled by server. This snippet can be helpful in sending a rough fingerprint of the article from the browser, which is almost instant.

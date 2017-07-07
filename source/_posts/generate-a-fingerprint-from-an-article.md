---
title: Generate A Fingerprint From An Article
date: 2017-07-05 01:00:10
disqus: true
tag:
- javascript
- text mining
- fingerprint
---

We are not so into duplicated information. Information theories and the economic principles weight uniqueness and scarcity over duplication.

It's the same when we have a huge number of articles to read. One question is raised: can we generate a small piece to reflect the article, in order to quickly estimate the value of an article?

> How unique is it?

It's a million-dollar question. Google has spent so many efforts to find good pages out of the duplications.

-------

I would like to use a few lines to give a quick estimation of such uniqueness.

```javascript
// get content of the web page
// @return: String
class Fingerprinter{

  constructor() {
    this.content = document.body.textContent.replace(/(\s+|\W+)/g, ' ')
    // get text, and remove redundant spaces and punctuations.
  }

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

  // return top N words with repeating times
  // @return: [String]
  top(N) {
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
      all.push({'word': word, 'count': this.dictionary[word]})
    }

    // descending sort with strange javascript sort function
    all.sort((a,b) => {return b.count - a.count})

    // get top N
    return all.slice(0, N)
  }

}

```

The analysis of the previous paragraph of this blog, is as follows:

```
>>> var fp = new Fingerprinter()
>>> fp.wordCounter()
>>> fp.top(5)

[ { word: 'we', count: 3 },
  { word: 'duplicated', count: 2 },
  { word: 'information', count: 2 },
  { word: 'question', count: 2 },
  { word: 'article', count: 2 }]
```

It's a rough guess that `we` are talking about `information` and `question`s on `duplicated` `article`s.

In a recently published web page, in case it is not cached or crawled by server, the javascript can be helpful in getting a rough guess of the article. This analysis is almost instant, and these keywords will be helpful in early stages.

---
title: Priority Queue
date: 2017-05-09 14:00:10
tag:
- leetcode
- python
- notes
mathjax: true
---

## Priority Queue And Heap

StackOverflow / <http://stackoverflow.com/questions/18993269/difference-between-priority-queue-and-a-heap>

{% blockquote %}

A priority queue is an `abstract datatype`. It is a shorthand way of describing a particular interface and behavior, and says nothing about the underlying implementation.

A heap is a `data structure`. It is a name for a particular way of storing data that makes certain operations very efficient.

It just so happens that a heap is a very good data structure to implement a priority queue, because the operations which are made efficient by the heap data structure are the operations that the priority queue interface needs.

{% endblockquote %}

## Python Example

`Leetcode 23`: Merge k sorted linked lists and return it as one sorted list. Analyze and describe its complexity.

```python

# Definition for singly-linked list.
# class ListNode(object):
#     def __init__(self, x):
#         self.val = x
#         self.next = None

from Queue import PriorityQueue

class Solution(object):
    def mergeKLists(self, lists):
        """
        :type lists: List[ListNode]
        :rtype: ListNode
        """
        dummy = ListNode(None)
        current = dummy
        q = PriorityQueue()
        for node in lists:
            if node:
                q.put( (node.val, node) )
        while q.qsize() > 0:
            current.next = q.get()[1]
            current = current.next
            # if exists, put next element into the queue
            if current.next:
                q.put( (current.next.val, current.next) )
        return dummy.next

```

---
title: Arguments and Interface in Javascript
date: 2012-03-22
tags:
- javascript
thumbnail: /images/worker-operating-the-gear_1156-569.jpg
description: Wrap up my thoughts about designing JavaScript interface.
categories:
---
![Design by <a href='http://www.freepik.com/free-photo/worker-operating-the-gear_954804.htm'>Freepik</a>](/images/worker-operating-the-gear_1156-569.jpg)

I would like to use this blog to wrap up my thoughts about designing interface.

Starting with a `person` function,

``` javascript
function person(name, sex, age){
  // use the variables
  ...
}
person("Lucy", "female", 24);
```

when we want to add two new parameters `height` and `weight`, we need to declare them one by one first:

``` javascript
// declare "height" and "weight"
function person(name, sex, age, height, weight){
  ...
}
// add "height" and "weight" at the tailer
person("Lucy", "female", 24, 160, 50);
```

Adding more parameters leads to less comprehensibility. To make things worse, when working on fundamental toolkits, it's possible that the sequential order of parameters can not be guaranteed.

Then, how to create a function with uncertain amount/order of parameters?

### Arguments

Some say that JavaScript is a tricky language, and `arguments` is a tricky part of it.

``` javascript
function student(){
  console.log("arguments : " + arguments);
  console.log("first     : " + arguments[0]);
  console.log("last      : " + arguments[arguments.length - 1]);
}
student("kevin", "john", "lucy");
```

Output:

```python
arguments : ["kevin", "john", "lucy"]
first     : "kevin"
last      : "lucy"
```

It seems that `arguments` is an array(but actually it is not, explains afterwards), containing all parameters imported. With `arguments` introduced, we could make functions with uncertain parameters as following example.

``` javascript
function student(){
  for(var l = arguments.length - 1; l >= 0 ; l--){
    console.log(l + " : "+ arguments[l]);
  }
}
student("kevin", "john", "lucy", "mike", "david");
```

Output:

```python
4 : david
3 : mike
2 : lucy
1 : john
0 : kevin
```

But when we use `pop` or `push` method to `arguments`:

``` javascript
function student(){
  var args = arguments;
  // try push
  args.push("lili");
}
student("kevin", "john", "lucy", "mike", "david");
```

Output:
```python
TypeError: Object #<Object> has no method 'push'
```
It will throw an error -- that means `arguments` is not an array but an Object quite similar. We should use a little trick here, to get a native array:

``` javascript
function student(){
    // use the natiave Array slice method. Now we get args as a standard array.
    var args = Array.prototype.slice.call(arguments);
    // try push again
    args.push("lili");
    console.log(args);
}
student("kevin", "john", "lucy", "mike", "david");
```
Output:
```python
["kevin", "john", "lucy", "mike", "david", "lili"]
```

A more complicated version is a template `format` function:


``` javascript
function format() {
    var args = arguments;
    // first item is template
    var template = args[0];

    // create regular expression, since we don't know how many parameters
    // are imported, use arguments.length as adaptive measurement.
    var pattern = new RegExp("%([1-" + arguments.length + "])", "g");   

    // replace %N with the parameter sorted in the N
    return String(template).replace(pattern, function(match, index) {   
        return args[index];
    });   
};

format("%1 loves %3, %2 loves %3 too.", "daddy", "mummy", "katty");

```

Output:
```python
"daddy loves katty, mummy loves katty too."
```

The previous mode which puts every parameters in an array, we could call it `SEQUENCE`. Is it good enough?

``` javascript
// 2006-03-01: "name", "gender", "age"
person("Lucy", "female", 24);

// 2006-05-01: Add "height", "weight", "languages"
person("Lucy", "female", 24, 160, 50, "cantonese, mandarin");
```

It really happens: with the booming of project, length of arguments increasing, the engineers are hard to distinguish parameters from each other. We could not know what they stand for unless referring to comments or looking into `person` function. Less self-explainable parameters make it hard to maintain.

### JSON

A better solution `JSON`:

``` javascript
// Migrate to JSON
person({
  "name" : "Lucy",
  "sex" : "female",
  "age" : 24,
  "height" : {
    "value" : "160",
    "unit" : "cm"
  },
  "weight" : {
    "value" : "50",
    "unit" : "kg"
  },
  "languages": ["cantonese", "mandarin"]
})
```

First benefit is that parameters become much more self-explainable, therefore developers do not need to dig into the function or even set breakpoints to find out their meanings then back to work.

What's more, when adding a new parameter, there is no need to worry about the order.

### Interface

Unlike other OO program languages like `Java`, javascript does not have any built-in `interface`. Although the implementation of interface in javascript is still an arguable point, it is a very flexible language and could be applied with interface without much efforts.

Like `Interface` ensures the function has all required `methods`, the following class is used to ensure the called function contain all the necessary parameters, if not then throw an error.

``` javascript
// Add 'validate' method to an object to be checked
function $(){

  // Store object
  var _$ = function(obj){
    this.obj = obj
  }
  // Bind method to prototype
  _$.prototype.validate = function(options){
    var obj = this.obj
    // loop default item
    for(var i in options){
      // the option is compulsive and when it's undefined
      if(options[i] === true && obj[i] === undefined) {
        throw new Error("item: " + i + " is UNDEFINED! Please check it.")
      }
      break
    }
    // return result
    return this.obj
  }
  return new _$(arguments[0])
}  

```
For example, we use `validate` method to check `person`:    

```javascript
jay = {
  "name": "jay"
}

$(jay).validate({
  'name': true
  'sex' : true
})
```

It is definitely possible to enrich the validation functions:

```javascript
// New a person object and apply validate method
$(jay).validate({
  // Required + string
  "name" : ["required", "string"],  
  // Required + only chosen from the options
  "sex"  : ["required", ["male","female"]],
  // Optional + integer
  "age"  : ["optional", "integer"]  
})
```

Moreover, if we change the `return this.obj` with `return this` and add a new getter function, the methods could be applied in a chain style:

```javascript
var candidate = $(jay).validate({...})
var age = candidate.get('age')
```

I will recommend [Pro JavaScript Design Patterns](http://www.google.com/#&q=Pro+JavaScript+Design+Patterns) for its chapter on `interface` concept and comparison of design patterns, between other languages and javascript.

Happy coding with javascript!

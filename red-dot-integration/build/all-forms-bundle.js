var initAllForms = (function () {
  'use strict';

  function _taggedTemplateLiteral(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }));
  }

  //     Underscore.js 1.10.2
  //     https://underscorejs.org
  //     (c) 2009-2020 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
  //     Underscore may be freely distributed under the MIT license.
  // Baseline setup
  // --------------
  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global || Function('return this')() || {}; // Save bytes in the minified (but not gzipped) version:

  var ArrayProto = Array.prototype,
      ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null; // Create quick reference variables for speed access to core prototypes.

  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty; // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create; // Create references to these builtin functions because we override them.

  var _isNaN = root.isNaN,
      _isFinite = root.isFinite; // Naked function reference for surrogate-prototype-swapping.

  var Ctor = function () {}; // The Underscore object. All exported functions below are added to it in the
  // modules/index-all.js using the mixin function.


  function _(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  } // Current version.

  var VERSION = _.VERSION = '1.10.2'; // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.

  function optimizeCb(func, context, argCount) {
    if (context === void 0) return func;

    switch (argCount == null ? 3 : argCount) {
      case 1:
        return function (value) {
          return func.call(context, value);
        };
      // The 2-argument case is omitted because we’re not using it.

      case 3:
        return function (value, index, collection) {
          return func.call(context, value, index, collection);
        };

      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }

    return function () {
      return func.apply(context, arguments);
    };
  } // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.


  function baseIteratee(value, context, argCount) {
    if (value == null) return identity;
    if (isFunction(value)) return optimizeCb(value, context, argCount);
    if (isObject(value) && !isArray(value)) return matcher(value);
    return property(value);
  } // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.


  _.iteratee = iteratee;
  function iteratee(value, context) {
    return baseIteratee(value, context, Infinity);
  } // The function we actually call internally. It invokes _.iteratee if
  // overridden, otherwise baseIteratee.

  function cb(value, context, argCount) {
    if (_.iteratee !== iteratee) return _.iteratee(value, context);
    return baseIteratee(value, context, argCount);
  } // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".


  function restArguments(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function () {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;

      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }

      switch (startIndex) {
        case 0:
          return func.call(this, rest);

        case 1:
          return func.call(this, arguments[0], rest);

        case 2:
          return func.call(this, arguments[0], arguments[1], rest);
      }

      var args = Array(startIndex + 1);

      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }

      args[startIndex] = rest;
      return func.apply(this, args);
    };
  } // An internal function for creating a new object that inherits from another.

  function baseCreate(prototype) {
    if (!isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor();
    Ctor.prototype = null;
    return result;
  }

  function shallowProperty(key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  }

  function _has(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

  function deepGet(obj, path) {
    var length = path.length;

    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }

    return length ? obj : void 0;
  } // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094


  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');

  function isArrayLike(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  } // Collection Functions
  // --------------------
  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.


  function each(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;

    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var _keys = keys(obj);

      for (i = 0, length = _keys.length; i < length; i++) {
        iteratee(obj[_keys[i]], _keys[i], obj);
      }
    }

    return obj;
  }

  function map(obj, iteratee, context) {
    iteratee = cb(iteratee, context);

    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length,
        results = Array(length);

    for (var index = 0; index < length; index++) {
      var currentKey = _keys ? _keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }

    return results;
  }

  function createReduce(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function (obj, iteratee, memo, initial) {
      var _keys = !isArrayLike(obj) && keys(obj),
          length = (_keys || obj).length,
          index = dir > 0 ? 0 : length - 1;

      if (!initial) {
        memo = obj[_keys ? _keys[index] : index];
        index += dir;
      }

      for (; index >= 0 && index < length; index += dir) {
        var currentKey = _keys ? _keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }

      return memo;
    };

    return function (obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  } // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.


  var reduce = createReduce(1);

  var reduceRight = createReduce(-1);

  function find(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? findIndex : findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  }

  function filter(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    each(obj, function (value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  }

  function reject(obj, predicate, context) {
    return filter(obj, negate(cb(predicate)), context);
  } // Determine whether all of the elements match a truth test.

  function every(obj, predicate, context) {
    predicate = cb(predicate, context);

    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length;

    for (var index = 0; index < length; index++) {
      var currentKey = _keys ? _keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }

    return true;
  }

  function some(obj, predicate, context) {
    predicate = cb(predicate, context);

    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length;

    for (var index = 0; index < length; index++) {
      var currentKey = _keys ? _keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }

    return false;
  }

  function contains(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return indexOf(obj, item, fromIndex) >= 0;
  }

  var invoke = restArguments(function (obj, path, args) {
    var contextPath, func;

    if (isFunction(path)) {
      func = path;
    } else if (isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }

    return map(obj, function (context) {
      var method = func;

      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }

        if (context == null) return void 0;
        method = context[path];
      }

      return method == null ? method : method.apply(context, args);
    });
  }); // Convenience version of a common use case of `map`: fetching a property.

  function pluck(obj, key) {
    return map(obj, property(key));
  } // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.

  function where(obj, attrs) {
    return filter(obj, matcher(attrs));
  } // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.

  function findWhere(obj, attrs) {
    return find(obj, matcher(attrs));
  } // Return the maximum element (or element-based computation).

  function max(obj, iteratee, context) {
    var result = -Infinity,
        lastComputed = -Infinity,
        value,
        computed;

    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : values(obj);

      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];

        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      each(obj, function (v, index, list) {
        computed = iteratee(v, index, list);

        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }

    return result;
  } // Return the minimum element (or element-based computation).

  function min(obj, iteratee, context) {
    var result = Infinity,
        lastComputed = Infinity,
        value,
        computed;

    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : values(obj);

      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];

        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      each(obj, function (v, index, list) {
        computed = iteratee(v, index, list);

        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }

    return result;
  } // Shuffle a collection.

  function shuffle(obj) {
    return sample(obj, Infinity);
  } // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.

  function sample(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = values(obj);
      return obj[random(obj.length - 1)];
    }

    var sample = isArrayLike(obj) ? clone(obj) : values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;

    for (var index = 0; index < n; index++) {
      var rand = random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }

    return sample.slice(0, n);
  } // Sort the object's values by a criterion produced by an iteratee.

  function sortBy(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return pluck(map(obj, function (value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;

      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }

      return left.index - right.index;
    }), 'value');
  } // An internal function used for aggregate "group by" operations.

  function group(behavior, partition) {
    return function (obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      each(obj, function (value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  } // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.


  var groupBy = group(function (result, value, key) {
    if (_has(result, key)) result[key].push(value);else result[key] = [value];
  }); // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.

  var indexBy = group(function (result, value, key) {
    result[key] = value;
  }); // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.

  var countBy = group(function (result, value, key) {
    if (_has(result, key)) result[key]++;else result[key] = 1;
  });
  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g; // Safely create a real, live array from anything iterable.

  function toArray(obj) {
    if (!obj) return [];
    if (isArray(obj)) return slice.call(obj);

    if (isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }

    if (isArrayLike(obj)) return map(obj, identity);
    return values(obj);
  } // Return the number of elements in an object.

  function size(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : keys(obj).length;
  } // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.

  var partition = group(function (result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true); // Array Functions
  // ---------------
  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. The **guard** check allows it to work with `map`.

  function first(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return initial(array, array.length - n);
  }
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.

  function initial(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  } // Get the last element of an array. Passing **n** will return the last N
  // values in the array.

  function last(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return rest(array, Math.max(0, array.length - n));
  } // Returns everything but the first entry of the array. Especially useful on
  // the arguments object. Passing an **n** will return the rest N values in the
  // array.

  function rest(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  }

  function compact(array) {
    return filter(array, Boolean);
  } // Internal implementation of a recursive `flatten` function.

  function _flatten(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;

    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];

      if (isArrayLike(value) && (isArray(value) || isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0,
              len = value.length;

          while (j < len) output[idx++] = value[j++];
        } else {
          _flatten(value, shallow, strict, output);

          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }

    return output;
  } // Flatten out an array, either recursively (by default), or just one level.


  function flatten(array, shallow) {
    return _flatten(array, shallow, false);
  } // Return a version of the array that does not contain the specified value(s).

  var without = restArguments(function (array, otherArrays) {
    return difference(array, otherArrays);
  }); // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.

  function uniq(array, isSorted, iteratee, context) {
    if (!isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }

    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];

    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;

      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!contains(result, value)) {
        result.push(value);
      }
    }

    return result;
  }
  // the passed-in arrays.

  var union = restArguments(function (arrays) {
    return uniq(_flatten(arrays, true, true));
  }); // Produce an array that contains every item shared between all the
  // passed-in arrays.

  function intersection(array) {
    var result = [];
    var argsLength = arguments.length;

    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (contains(result, item)) continue;
      var j;

      for (j = 1; j < argsLength; j++) {
        if (!contains(arguments[j], item)) break;
      }

      if (j === argsLength) result.push(item);
    }

    return result;
  } // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.

  var difference = restArguments(function (array, rest) {
    rest = _flatten(rest, true, true);
    return filter(array, function (value) {
      return !contains(rest, value);
    });
  }); // Complement of zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.

  function unzip(array) {
    var length = array && max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = pluck(array, index);
    }

    return result;
  } // Zip together multiple lists into a single array -- elements that share
  // an index go together.

  var zip = restArguments(unzip); // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of pairs.

  function object(list, values) {
    var result = {};

    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }

    return result;
  } // Generator function to create the findIndex and findLastIndex functions.

  function createPredicateIndexFinder(dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;

      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }

      return -1;
    };
  } // Returns the first index on an array-like that passes a predicate test.


  var findIndex = createPredicateIndexFinder(1);
  var findLastIndex = createPredicateIndexFinder(-1); // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.

  function sortedIndex(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0,
        high = getLength(array);

    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
    }

    return low;
  } // Generator function to create the indexOf and lastIndexOf functions.

  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function (array, item, idx) {
      var i = 0,
          length = getLength(array);

      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }

      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), isNaN);
        return idx >= 0 ? idx + i : -1;
      }

      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }

      return -1;
    };
  } // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.


  var indexOf = createIndexFinder(1, findIndex, sortedIndex);
  var lastIndexOf = createIndexFinder(-1, findLastIndex); // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](https://docs.python.org/library/functions.html#range).

  function range(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }

    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  } // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.

  function chunk(array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0,
        length = array.length;

    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }

    return result;
  } // Function (ahem) Functions
  // ------------------
  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.

  function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (isObject(result)) return result;
    return self;
  } // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.


  var bind = restArguments(function (func, context, args) {
    if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function (callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  }); // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `partial.placeholder` for a custom placeholder argument.

  var partial = restArguments(function (func, boundArgs) {
    var placeholder = partial.placeholder;

    var bound = function () {
      var position = 0,
          length = boundArgs.length;
      var args = Array(length);

      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }

      while (position < arguments.length) args.push(arguments[position++]);

      return executeBound(func, bound, this, this, args);
    };

    return bound;
  });
  partial.placeholder = _; // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.

  var bindAll = restArguments(function (obj, _keys) {
    _keys = _flatten(_keys, false, false);
    var index = _keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');

    while (index--) {
      var key = _keys[index];
      obj[key] = bind(obj[key], obj);
    }
  }); // Memoize an expensive function by storing its results.

  function memoize(func, hasher) {
    var memoize = function (key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };

    memoize.cache = {};
    return memoize;
  } // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.

  var delay = restArguments(function (func, wait, args) {
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  }); // Defers a function, scheduling it to run after the current call stack has
  // cleared.

  var defer = partial(delay, _, 1); // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.

  function throttle(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function () {
      previous = options.leading === false ? 0 : now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function () {
      var _now = now();

      if (!previous && options.leading === false) previous = _now;
      var remaining = wait - (_now - previous);
      context = this;
      args = arguments;

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }

        previous = _now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }

      return result;
    };

    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  } // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.

  function debounce(func, wait, immediate) {
    var timeout, result;

    var later = function (context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function (args) {
      if (timeout) clearTimeout(timeout);

      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function () {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  } // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.

  function wrap(func, wrapper) {
    return partial(wrapper, func);
  } // Returns a negated version of the passed-in predicate.

  function negate(predicate) {
    return function () {
      return !predicate.apply(this, arguments);
    };
  } // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.

  function compose() {
    var args = arguments;
    var start = args.length - 1;
    return function () {
      var i = start;
      var result = args[start].apply(this, arguments);

      while (i--) result = args[i].call(this, result);

      return result;
    };
  } // Returns a function that will only be executed on and after the Nth call.

  function after(times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  } // Returns a function that will only be executed up to (but not including) the Nth call.

  function before(times, func) {
    var memo;
    return function () {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }

      if (times <= 1) func = null;
      return memo;
    };
  } // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.

  var once = partial(before, 2); // Object Functions
  // ----------------
  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.

  var hasEnumBug = !{
    toString: null
  }.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, _keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = isFunction(constructor) && constructor.prototype || ObjProto; // Constructor is a special case.

    var prop = 'constructor';
    if (_has(obj, prop) && !contains(_keys, prop)) _keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];

      if (prop in obj && obj[prop] !== proto[prop] && !contains(_keys, prop)) {
        _keys.push(prop);
      }
    }
  } // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.


  function keys(obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var _keys = [];

    for (var key in obj) if (_has(obj, key)) _keys.push(key); // Ahem, IE < 9.


    if (hasEnumBug) collectNonEnumProps(obj, _keys);
    return _keys;
  } // Retrieve all the property names of an object.

  function allKeys(obj) {
    if (!isObject(obj)) return [];
    var _keys = [];

    for (var key in obj) _keys.push(key); // Ahem, IE < 9.


    if (hasEnumBug) collectNonEnumProps(obj, _keys);
    return _keys;
  } // Retrieve the values of an object's properties.

  function values(obj) {
    var _keys = keys(obj);

    var length = _keys.length;
    var values = Array(length);

    for (var i = 0; i < length; i++) {
      values[i] = obj[_keys[i]];
    }

    return values;
  } // Returns the results of applying the iteratee to each element of the object.
  // In contrast to map it returns an object.

  function mapObject(obj, iteratee, context) {
    iteratee = cb(iteratee, context);

    var _keys = keys(obj),
        length = _keys.length,
        results = {};

    for (var index = 0; index < length; index++) {
      var currentKey = _keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }

    return results;
  } // Convert an object into a list of `[key, value]` pairs.
  // The opposite of object.

  function pairs(obj) {
    var _keys = keys(obj);

    var length = _keys.length;
    var pairs = Array(length);

    for (var i = 0; i < length; i++) {
      pairs[i] = [_keys[i], obj[_keys[i]]];
    }

    return pairs;
  } // Invert the keys and values of an object. The values must be serializable.

  function invert(obj) {
    var result = {};

    var _keys = keys(obj);

    for (var i = 0, length = _keys.length; i < length; i++) {
      result[obj[_keys[i]]] = _keys[i];
    }

    return result;
  } // Return a sorted list of the function names available on the object.

  function functions(obj) {
    var names = [];

    for (var key in obj) {
      if (isFunction(obj[key])) names.push(key);
    }

    return names.sort();
  }

  function createAssigner(keysFunc, defaults) {
    return function (obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;

      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            _keys = keysFunc(source),
            l = _keys.length;

        for (var i = 0; i < l; i++) {
          var key = _keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }

      return obj;
    };
  } // Extend a given object with all the properties in passed-in object(s).


  var extend = createAssigner(allKeys); // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

  var extendOwn = createAssigner(keys);

  function findKey(obj, predicate, context) {
    predicate = cb(predicate, context);

    var _keys = keys(obj),
        key;

    for (var i = 0, length = _keys.length; i < length; i++) {
      key = _keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  } // Internal pick helper function to determine if `obj` has key `key`.

  function keyInObj(value, key, obj) {
    return key in obj;
  } // Return a copy of the object only containing the whitelisted properties.


  var pick = restArguments(function (obj, _keys) {
    var result = {},
        iteratee = _keys[0];
    if (obj == null) return result;

    if (isFunction(iteratee)) {
      if (_keys.length > 1) iteratee = optimizeCb(iteratee, _keys[1]);
      _keys = allKeys(obj);
    } else {
      iteratee = keyInObj;
      _keys = _flatten(_keys, false, false);
      obj = Object(obj);
    }

    for (var i = 0, length = _keys.length; i < length; i++) {
      var key = _keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }

    return result;
  }); // Return a copy of the object without the blacklisted properties.

  var omit = restArguments(function (obj, _keys) {
    var iteratee = _keys[0],
        context;

    if (isFunction(iteratee)) {
      iteratee = negate(iteratee);
      if (_keys.length > 1) context = _keys[1];
    } else {
      _keys = map(_flatten(_keys, false, false), String);

      iteratee = function (value, key) {
        return !contains(_keys, key);
      };
    }

    return pick(obj, iteratee, context);
  }); // Fill in a given object with default properties.

  var defaults = createAssigner(allKeys, true); // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.

  function create(prototype, props) {
    var result = baseCreate(prototype);
    if (props) extendOwn(result, props);
    return result;
  } // Create a (shallow-cloned) duplicate of an object.

  function clone(obj) {
    if (!isObject(obj)) return obj;
    return isArray(obj) ? obj.slice() : extend({}, obj);
  } // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.

  function tap(obj, interceptor) {
    interceptor(obj);
    return obj;
  } // Returns whether an object has a given set of `key:value` pairs.

  function isMatch(object, attrs) {
    var _keys = keys(attrs),
        length = _keys.length;

    if (object == null) return !length;
    var obj = Object(object);

    for (var i = 0; i < length; i++) {
      var key = _keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }

    return true;
  } // Internal recursive comparison function for `isEqual`.

  function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b; // `null` or `undefined` only equal to itself (strict comparison).

    if (a == null || b == null) return false; // `NaN`s are equivalent, but non-reflexive.

    if (a !== a) return b !== b; // Exhaust primitive checks

    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  } // Internal recursive comparison function for `isEqual`.


  function deepEq(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped; // Compare `[[Class]]` names.

    var className = toString.call(a);
    if (className !== toString.call(b)) return false;

    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]': // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')

      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;

      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b; // An `egal` comparison is performed for other numeric values.

        return +a === 0 ? 1 / +a === 1 / b : +a === +b;

      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;

      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';

    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false; // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.

      var aCtor = a.constructor,
          bCtor = b.constructor;

      if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
        return false;
      }
    } // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.


    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;

    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    } // Add the first object to the stack of traversed objects.


    aStack.push(a);
    bStack.push(b); // Recursively compare objects and arrays.

    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false; // Deep compare the contents, ignoring non-numeric properties.

      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var _keys = keys(a),
          key;

      length = _keys.length; // Ensure that both objects contain the same number of properties before comparing deep equality.

      if (keys(b).length !== length) return false;

      while (length--) {
        // Deep compare each member
        key = _keys[length];
        if (!(_has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    } // Remove the first object from the stack of traversed objects.


    aStack.pop();
    bStack.pop();
    return true;
  } // Perform a deep comparison to check if two objects are equal.


  function isEqual(a, b) {
    return eq(a, b);
  } // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.

  function isEmpty(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (isArray(obj) || isString(obj) || isArguments(obj))) return obj.length === 0;
    return keys(obj).length === 0;
  } // Is a given value a DOM element?

  function isElement(obj) {
    return !!(obj && obj.nodeType === 1);
  } // Internal function for creating a toString-based type tester.

  function tagTester(name) {
    return function (obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  } // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray


  var isArray = nativeIsArray || tagTester('Array'); // Is a given variable an object?

  function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  } // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.

  var isArguments = tagTester('Arguments');
  var isFunction = tagTester('Function');
  var isString = tagTester('String');
  var isNumber = tagTester('Number');
  var isDate = tagTester('Date');
  var isRegExp = tagTester('RegExp');
  var isError = tagTester('Error');
  var isSymbol = tagTester('Symbol');
  var isMap = tagTester('Map');
  var isWeakMap = tagTester('WeakMap');
  var isSet = tagTester('Set');
  var isWeakSet = tagTester('WeakSet'); // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.

  (function () {
    if (!isArguments(arguments)) {
      isArguments = function (obj) {
        return _has(obj, 'callee');
      };
    }
  })(); // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).


  var nodelist = root.document && root.document.childNodes;

  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    isFunction = function (obj) {
      return typeof obj == 'function' || false;
    };
  } // Is a given object a finite number?


  function isFinite(obj) {
    return !isSymbol(obj) && _isFinite(obj) && !_isNaN(parseFloat(obj));
  } // Is the given value `NaN`?

  function isNaN(obj) {
    return isNumber(obj) && _isNaN(obj);
  } // Is a given value a boolean?

  function isBoolean(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  } // Is a given value equal to null?

  function isNull(obj) {
    return obj === null;
  } // Is a given variable undefined?

  function isUndefined(obj) {
    return obj === void 0;
  } // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).

  function has(obj, path) {
    if (!isArray(path)) {
      return _has(obj, path);
    }

    var length = path.length;

    for (var i = 0; i < length; i++) {
      var key = path[i];

      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }

      obj = obj[key];
    }

    return !!length;
  } // Utility Functions
  // -----------------
  // Keep the identity function around for default iteratees.

  function identity(value) {
    return value;
  } // Predicate-generating functions. Often useful outside of Underscore.

  function constant(value) {
    return function () {
      return value;
    };
  }
  function noop() {} // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.

  function property(path) {
    if (!isArray(path)) {
      return shallowProperty(path);
    }

    return function (obj) {
      return deepGet(obj, path);
    };
  } // Generates a function for a given object that returns a given property.

  function propertyOf(obj) {
    if (obj == null) {
      return function () {};
    }

    return function (path) {
      return !isArray(path) ? obj[path] : deepGet(obj, path);
    };
  } // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.

  function matcher(attrs) {
    attrs = extendOwn({}, attrs);
    return function (obj) {
      return isMatch(obj, attrs);
    };
  }

  function times(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);

    for (var i = 0; i < n; i++) accum[i] = iteratee(i);

    return accum;
  } // Return a random integer between min and max (inclusive).

  function random(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }

    return min + Math.floor(Math.random() * (max - min + 1));
  } // A (possibly faster) way to get the current timestamp as an integer.

  var now = Date.now || function () {
    return new Date().getTime();
  }; // List of HTML entities for escaping.

  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = invert(escapeMap); // Functions for escaping and unescaping strings to/from HTML interpolation.

  function createEscaper(map) {
    var escaper = function (match) {
      return map[match];
    }; // Regexes for identifying a key that needs to be escaped.


    var source = '(?:' + keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function (string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  }

  var escape = createEscaper(escapeMap);
  var unescape = createEscaper(unescapeMap); // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.

  function result(obj, path, fallback) {
    if (!isArray(path)) path = [path];
    var length = path.length;

    if (!length) {
      return isFunction(fallback) ? fallback.call(obj) : fallback;
    }

    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];

      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }

      obj = isFunction(prop) ? prop.call(obj) : prop;
    }

    return obj;
  } // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.

  var idCounter = 0;
  function uniqueId(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  } // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.

  var templateSettings = _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  }; // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.

  var noMatch = /(.)^/; // Certain characters need to be escaped so that they can be put into a
  // string literal.

  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };
  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function (match) {
    return '\\' + escapes[match];
  }; // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.


  function template(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = defaults({}, settings, _.templateSettings); // Combine delimiters into one regular expression via alternation.

    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g'); // Compile the template source, escaping string literals appropriately.

    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      } // Adobe VMs need the match returned to produce the correct offset.


      return match;
    });
    source += "';\n"; // If a variable is not specified, place data values in local scope.

    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
    var render;

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function (data) {
      return render.call(this, data, _);
    }; // Provide the compiled source as a convenience for precompilation.


    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';
    return template;
  } // Add a "chain" function. Start chaining a wrapped Underscore object.

  function chain(obj) {
    var instance = _(obj);

    instance._chain = true;
    return instance;
  } // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  // Helper function to continue chaining intermediate results.

  function chainResult(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  } // Add your own custom functions to the Underscore object.


  function mixin(obj) {
    each(functions(obj), function (name) {
      var func = _[name] = obj[name];

      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  } // Add all mutator Array functions to the wrapper.

  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
    var method = ArrayProto[name];

    _.prototype[name] = function () {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  }); // Add all accessor Array functions to the wrapper.

  each(['concat', 'join', 'slice'], function (name) {
    var method = ArrayProto[name];

    _.prototype[name] = function () {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  }); // Extracts the result from a wrapped and chained object.

  _.prototype.value = function () {
    return this._wrapped;
  }; // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.


  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function () {
    return String(this._wrapped);
  };

  var allExports = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _,
    VERSION: VERSION,
    iteratee: iteratee,
    restArguments: restArguments,
    each: each,
    forEach: each,
    map: map,
    collect: map,
    reduce: reduce,
    foldl: reduce,
    inject: reduce,
    reduceRight: reduceRight,
    foldr: reduceRight,
    find: find,
    detect: find,
    filter: filter,
    select: filter,
    reject: reject,
    every: every,
    all: every,
    some: some,
    any: some,
    contains: contains,
    includes: contains,
    include: contains,
    invoke: invoke,
    pluck: pluck,
    where: where,
    findWhere: findWhere,
    max: max,
    min: min,
    shuffle: shuffle,
    sample: sample,
    sortBy: sortBy,
    groupBy: groupBy,
    indexBy: indexBy,
    countBy: countBy,
    toArray: toArray,
    size: size,
    partition: partition,
    first: first,
    head: first,
    take: first,
    initial: initial,
    last: last,
    rest: rest,
    tail: rest,
    drop: rest,
    compact: compact,
    flatten: flatten,
    without: without,
    uniq: uniq,
    unique: uniq,
    union: union,
    intersection: intersection,
    difference: difference,
    unzip: unzip,
    zip: zip,
    object: object,
    findIndex: findIndex,
    findLastIndex: findLastIndex,
    sortedIndex: sortedIndex,
    indexOf: indexOf,
    lastIndexOf: lastIndexOf,
    range: range,
    chunk: chunk,
    bind: bind,
    partial: partial,
    bindAll: bindAll,
    memoize: memoize,
    delay: delay,
    defer: defer,
    throttle: throttle,
    debounce: debounce,
    wrap: wrap,
    negate: negate,
    compose: compose,
    after: after,
    before: before,
    once: once,
    keys: keys,
    allKeys: allKeys,
    values: values,
    mapObject: mapObject,
    pairs: pairs,
    invert: invert,
    functions: functions,
    methods: functions,
    extend: extend,
    extendOwn: extendOwn,
    assign: extendOwn,
    findKey: findKey,
    pick: pick,
    omit: omit,
    defaults: defaults,
    create: create,
    clone: clone,
    tap: tap,
    isMatch: isMatch,
    isEqual: isEqual,
    isEmpty: isEmpty,
    isElement: isElement,
    isArray: isArray,
    isObject: isObject,
    get isArguments () { return isArguments; },
    get isFunction () { return isFunction; },
    isString: isString,
    isNumber: isNumber,
    isDate: isDate,
    isRegExp: isRegExp,
    isError: isError,
    isSymbol: isSymbol,
    isMap: isMap,
    isWeakMap: isWeakMap,
    isSet: isSet,
    isWeakSet: isWeakSet,
    isFinite: isFinite,
    isNaN: isNaN,
    isBoolean: isBoolean,
    isNull: isNull,
    isUndefined: isUndefined,
    has: has,
    identity: identity,
    constant: constant,
    noop: noop,
    property: property,
    propertyOf: propertyOf,
    matcher: matcher,
    matches: matcher,
    times: times,
    random: random,
    now: now,
    escape: escape,
    unescape: unescape,
    result: result,
    uniqueId: uniqueId,
    templateSettings: templateSettings,
    template: template,
    chain: chain,
    mixin: mixin
  });

  var _$1 = mixin(allExports); // Legacy Node.js API


  _$1._ = _$1; // Export the Underscore API.

  var hyperscriptAttributeToProperty = attributeToProperty;
  var transform = {
    'class': 'className',
    'for': 'htmlFor',
    'http-equiv': 'httpEquiv'
  };

  function attributeToProperty(h) {
    return function (tagName, attrs, children) {
      for (var attr in attrs) {
        if (attr in transform) {
          attrs[transform[attr]] = attrs[attr];
          delete attrs[attr];
        }
      }

      return h(tagName, attrs, children);
    };
  }

  var VAR = 0,
      TEXT = 1,
      OPEN = 2,
      CLOSE = 3,
      ATTR = 4;
  var ATTR_KEY = 5,
      ATTR_KEY_W = 6;
  var ATTR_VALUE_W = 7,
      ATTR_VALUE = 8;
  var ATTR_VALUE_SQ = 9,
      ATTR_VALUE_DQ = 10;
  var ATTR_EQ = 11,
      ATTR_BREAK = 12;
  var COMMENT = 13;

  var hyperx = function (h, opts) {
    if (!opts) opts = {};

    var concat = opts.concat || function (a, b) {
      return String(a) + String(b);
    };

    if (opts.attrToProp !== false) {
      h = hyperscriptAttributeToProperty(h);
    }

    return function (strings) {
      var state = TEXT,
          reg = '';
      var arglen = arguments.length;
      var parts = [];

      for (var i = 0; i < strings.length; i++) {
        if (i < arglen - 1) {
          var arg = arguments[i + 1];
          var p = parse(strings[i]);
          var xstate = state;
          if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE;
          if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE;
          if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE;
          if (xstate === ATTR) xstate = ATTR_KEY;

          if (xstate === OPEN) {
            if (reg === '/') {
              p.push([OPEN, '/', arg]);
              reg = '';
            } else {
              p.push([OPEN, arg]);
            }
          } else if (xstate === COMMENT && opts.comments) {
            reg += String(arg);
          } else if (xstate !== COMMENT) {
            p.push([VAR, xstate, arg]);
          }

          parts.push.apply(parts, p);
        } else parts.push.apply(parts, parse(strings[i]));
      }

      var tree = [null, {}, []];
      var stack = [[tree, -1]];

      for (var i = 0; i < parts.length; i++) {
        var cur = stack[stack.length - 1][0];
        var p = parts[i],
            s = p[0];

        if (s === OPEN && /^\//.test(p[1])) {
          var ix = stack[stack.length - 1][1];

          if (stack.length > 1) {
            stack.pop();
            stack[stack.length - 1][0][2][ix] = h(cur[0], cur[1], cur[2].length ? cur[2] : undefined);
          }
        } else if (s === OPEN) {
          var c = [p[1], {}, []];
          cur[2].push(c);
          stack.push([c, cur[2].length - 1]);
        } else if (s === ATTR_KEY || s === VAR && p[1] === ATTR_KEY) {
          var key = '';
          var copyKey;

          for (; i < parts.length; i++) {
            if (parts[i][0] === ATTR_KEY) {
              key = concat(key, parts[i][1]);
            } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
              if (typeof parts[i][2] === 'object' && !key) {
                for (copyKey in parts[i][2]) {
                  if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                    cur[1][copyKey] = parts[i][2][copyKey];
                  }
                }
              } else {
                key = concat(key, parts[i][2]);
              }
            } else break;
          }

          if (parts[i][0] === ATTR_EQ) i++;
          var j = i;

          for (; i < parts.length; i++) {
            if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
              if (!cur[1][key]) cur[1][key] = strfn(parts[i][1]);else parts[i][1] === "" || (cur[1][key] = concat(cur[1][key], parts[i][1]));
            } else if (parts[i][0] === VAR && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
              if (!cur[1][key]) cur[1][key] = strfn(parts[i][2]);else parts[i][2] === "" || (cur[1][key] = concat(cur[1][key], parts[i][2]));
            } else {
              if (key.length && !cur[1][key] && i === j && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
                // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
                // empty string is falsy, not well behaved value in browser
                cur[1][key] = key.toLowerCase();
              }

              if (parts[i][0] === CLOSE) {
                i--;
              }

              break;
            }
          }
        } else if (s === ATTR_KEY) {
          cur[1][p[1]] = true;
        } else if (s === VAR && p[1] === ATTR_KEY) {
          cur[1][p[2]] = true;
        } else if (s === CLOSE) {
          if (selfClosing(cur[0]) && stack.length) {
            var ix = stack[stack.length - 1][1];
            stack.pop();
            stack[stack.length - 1][0][2][ix] = h(cur[0], cur[1], cur[2].length ? cur[2] : undefined);
          }
        } else if (s === VAR && p[1] === TEXT) {
          if (p[2] === undefined || p[2] === null) p[2] = '';else if (!p[2]) p[2] = concat('', p[2]);

          if (Array.isArray(p[2][0])) {
            cur[2].push.apply(cur[2], p[2]);
          } else {
            cur[2].push(p[2]);
          }
        } else if (s === TEXT) {
          cur[2].push(p[1]);
        } else if (s === ATTR_EQ || s === ATTR_BREAK) ; else {
          throw new Error('unhandled: ' + s);
        }
      }

      if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
        tree[2].shift();
      }

      if (tree[2].length > 2 || tree[2].length === 2 && /\S/.test(tree[2][1])) {
        if (opts.createFragment) return opts.createFragment(tree[2]);
        throw new Error('multiple root elements must be wrapped in an enclosing tag');
      }

      if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string' && Array.isArray(tree[2][0][2])) {
        tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2]);
      }

      return tree[2][0];

      function parse(str) {
        var res = [];
        if (state === ATTR_VALUE_W) state = ATTR;

        for (var i = 0; i < str.length; i++) {
          var c = str.charAt(i);

          if (state === TEXT && c === '<') {
            if (reg.length) res.push([TEXT, reg]);
            reg = '';
            state = OPEN;
          } else if (c === '>' && !quot(state) && state !== COMMENT) {
            if (state === OPEN && reg.length) {
              res.push([OPEN, reg]);
            } else if (state === ATTR_KEY) {
              res.push([ATTR_KEY, reg]);
            } else if (state === ATTR_VALUE && reg.length) {
              res.push([ATTR_VALUE, reg]);
            }

            res.push([CLOSE]);
            reg = '';
            state = TEXT;
          } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
            if (opts.comments) {
              res.push([ATTR_VALUE, reg.substr(0, reg.length - 1)]);
            }

            reg = '';
            state = TEXT;
          } else if (state === OPEN && /^!--$/.test(reg)) {
            if (opts.comments) {
              res.push([OPEN, reg], [ATTR_KEY, 'comment'], [ATTR_EQ]);
            }

            reg = c;
            state = COMMENT;
          } else if (state === TEXT || state === COMMENT) {
            reg += c;
          } else if (state === OPEN && c === '/' && reg.length) ; else if (state === OPEN && /\s/.test(c)) {
            if (reg.length) {
              res.push([OPEN, reg]);
            }

            reg = '';
            state = ATTR;
          } else if (state === OPEN) {
            reg += c;
          } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
            state = ATTR_KEY;
            reg = c;
          } else if (state === ATTR && /\s/.test(c)) {
            if (reg.length) res.push([ATTR_KEY, reg]);
            res.push([ATTR_BREAK]);
          } else if (state === ATTR_KEY && /\s/.test(c)) {
            res.push([ATTR_KEY, reg]);
            reg = '';
            state = ATTR_KEY_W;
          } else if (state === ATTR_KEY && c === '=') {
            res.push([ATTR_KEY, reg], [ATTR_EQ]);
            reg = '';
            state = ATTR_VALUE_W;
          } else if (state === ATTR_KEY) {
            reg += c;
          } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
            res.push([ATTR_EQ]);
            state = ATTR_VALUE_W;
          } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
            res.push([ATTR_BREAK]);

            if (/[\w-]/.test(c)) {
              reg += c;
              state = ATTR_KEY;
            } else state = ATTR;
          } else if (state === ATTR_VALUE_W && c === '"') {
            state = ATTR_VALUE_DQ;
          } else if (state === ATTR_VALUE_W && c === "'") {
            state = ATTR_VALUE_SQ;
          } else if (state === ATTR_VALUE_DQ && c === '"') {
            res.push([ATTR_VALUE, reg], [ATTR_BREAK]);
            reg = '';
            state = ATTR;
          } else if (state === ATTR_VALUE_SQ && c === "'") {
            res.push([ATTR_VALUE, reg], [ATTR_BREAK]);
            reg = '';
            state = ATTR;
          } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
            state = ATTR_VALUE;
            i--;
          } else if (state === ATTR_VALUE && /\s/.test(c)) {
            res.push([ATTR_VALUE, reg], [ATTR_BREAK]);
            reg = '';
            state = ATTR;
          } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ) {
            reg += c;
          }
        }

        if (state === TEXT && reg.length) {
          res.push([TEXT, reg]);
          reg = '';
        } else if (state === ATTR_VALUE && reg.length) {
          res.push([ATTR_VALUE, reg]);
          reg = '';
        } else if (state === ATTR_VALUE_DQ && reg.length) {
          res.push([ATTR_VALUE, reg]);
          reg = '';
        } else if (state === ATTR_VALUE_SQ && reg.length) {
          res.push([ATTR_VALUE, reg]);
          reg = '';
        } else if (state === ATTR_KEY) {
          res.push([ATTR_KEY, reg]);
          reg = '';
        }

        return res;
      }
    };

    function strfn(x) {
      if (typeof x === 'function') return x;else if (typeof x === 'string') return x;else if (x && typeof x === 'object') return x;else if (x === null || x === undefined) return x;else return concat('', x);
    }
  };

  function quot(state) {
    return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ;
  }

  var closeRE = RegExp('^(' + ['area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed', 'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!--', // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath', 'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view', 'vkern'].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$');

  function selfClosing(tag) {
    return closeRE.test(tag);
  }

  var trailingNewlineRegex = /\n[\s]+$/;
  var leadingNewlineRegex = /^\n[\s]+/;
  var trailingSpaceRegex = /[\s]+$/;
  var leadingSpaceRegex = /^[\s]+/;
  var multiSpaceRegex = /[\n\s]+/g;
  var TEXT_TAGS = ['a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'amp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'];
  var VERBATIM_TAGS = ['code', 'pre', 'textarea'];

  var appendChild = function appendChild(el, childs) {
    if (!Array.isArray(childs)) return;
    var nodeName = el.nodeName.toLowerCase();
    var hadText = false;
    var value, leader;

    for (var i = 0, len = childs.length; i < len; i++) {
      var node = childs[i];

      if (Array.isArray(node)) {
        appendChild(el, node);
        continue;
      }

      if (typeof node === 'number' || typeof node === 'boolean' || typeof node === 'function' || node instanceof Date || node instanceof RegExp) {
        node = node.toString();
      }

      var lastChild = el.childNodes[el.childNodes.length - 1]; // Iterate over text nodes

      if (typeof node === 'string') {
        hadText = true; // If we already had text, append to the existing text

        if (lastChild && lastChild.nodeName === '#text') {
          lastChild.nodeValue += node; // We didn't have a text node yet, create one
        } else {
          node = el.ownerDocument.createTextNode(node);
          el.appendChild(node);
          lastChild = node;
        } // If this is the last of the child nodes, make sure we close it out
        // right


        if (i === len - 1) {
          hadText = false; // Trim the child text nodes if the current node isn't a
          // node where whitespace matters.

          if (TEXT_TAGS.indexOf(nodeName) === -1 && VERBATIM_TAGS.indexOf(nodeName) === -1) {
            value = lastChild.nodeValue.replace(leadingNewlineRegex, '').replace(trailingSpaceRegex, '').replace(trailingNewlineRegex, '').replace(multiSpaceRegex, ' ');

            if (value === '') {
              el.removeChild(lastChild);
            } else {
              lastChild.nodeValue = value;
            }
          } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
            // The very first node in the list should not have leading
            // whitespace. Sibling text nodes should have whitespace if there
            // was any.
            leader = i === 0 ? '' : ' ';
            value = lastChild.nodeValue.replace(leadingNewlineRegex, leader).replace(leadingSpaceRegex, ' ').replace(trailingSpaceRegex, '').replace(trailingNewlineRegex, '').replace(multiSpaceRegex, ' ');
            lastChild.nodeValue = value;
          }
        } // Iterate over DOM nodes

      } else if (node && node.nodeType) {
        // If the last node was a text node, make sure it is properly closed out
        if (hadText) {
          hadText = false; // Trim the child text nodes if the current node isn't a
          // text node or a code node

          if (TEXT_TAGS.indexOf(nodeName) === -1 && VERBATIM_TAGS.indexOf(nodeName) === -1) {
            value = lastChild.nodeValue.replace(leadingNewlineRegex, '').replace(trailingNewlineRegex, ' ').replace(multiSpaceRegex, ' '); // Remove empty text nodes, append otherwise

            if (value === '') {
              el.removeChild(lastChild);
            } else {
              lastChild.nodeValue = value;
            } // Trim the child nodes but preserve the appropriate whitespace

          } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
            value = lastChild.nodeValue.replace(leadingSpaceRegex, ' ').replace(leadingNewlineRegex, '').replace(trailingNewlineRegex, ' ').replace(multiSpaceRegex, ' ');
            lastChild.nodeValue = value;
          }
        } // Store the last nodename


        var _nodeName = node.nodeName;
        if (_nodeName) nodeName = _nodeName.toLowerCase(); // Append the node to the DOM

        el.appendChild(node);
      }
    }
  };

  var svgTags = ['svg', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref', 'tspan', 'use', 'view', 'vkern'];

  var boolProps = ['async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'defaultchecked', 'defer', 'disabled', 'formnovalidate', 'hidden', 'ismap', 'loop', 'multiple', 'muted', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'selected'];

  var directProps = ['indeterminate'];

  var SVGNS = 'http://www.w3.org/2000/svg';
  var XLINKNS = 'http://www.w3.org/1999/xlink';
  var COMMENT_TAG = '!--';

  var dom = function (document) {
    function nanoHtmlCreateElement(tag, props, children) {
      var el; // If an svg tag, it needs a namespace

      if (svgTags.indexOf(tag) !== -1) {
        props.namespace = SVGNS;
      } // If we are using a namespace


      var ns = false;

      if (props.namespace) {
        ns = props.namespace;
        delete props.namespace;
      } // If we are extending a builtin element


      var isCustomElement = false;

      if (props.is) {
        isCustomElement = props.is;
        delete props.is;
      } // Create the element


      if (ns) {
        if (isCustomElement) {
          el = document.createElementNS(ns, tag, {
            is: isCustomElement
          });
        } else {
          el = document.createElementNS(ns, tag);
        }
      } else if (tag === COMMENT_TAG) {
        return document.createComment(props.comment);
      } else if (isCustomElement) {
        el = document.createElement(tag, {
          is: isCustomElement
        });
      } else {
        el = document.createElement(tag);
      } // Create the properties


      for (var p in props) {
        if (props.hasOwnProperty(p)) {
          var key = p.toLowerCase();
          var val = props[p]; // Normalize className

          if (key === 'classname') {
            key = 'class';
            p = 'class';
          } // The for attribute gets transformed to htmlFor, but we just set as for


          if (p === 'htmlFor') {
            p = 'for';
          } // If a property is boolean, set itself to the key


          if (boolProps.indexOf(key) !== -1) {
            if (String(val) === 'true') val = key;else if (String(val) === 'false') continue;
          } // If a property prefers being set directly vs setAttribute


          if (key.slice(0, 2) === 'on' || directProps.indexOf(key) !== -1) {
            el[p] = val;
          } else {
            if (ns) {
              if (p === 'xlink:href') {
                el.setAttributeNS(XLINKNS, p, val);
              } else if (/^xmlns($|:)/i.test(p)) ; else {
                el.setAttributeNS(null, p, val);
              }
            } else {
              el.setAttribute(p, val);
            }
          }
        }
      }

      appendChild(el, children);
      return el;
    }

    function createFragment(nodes) {
      var fragment = document.createDocumentFragment();

      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] == null) continue;

        if (Array.isArray(nodes[i])) {
          fragment.appendChild(createFragment(nodes[i]));
        } else {
          if (typeof nodes[i] === 'string') nodes[i] = document.createTextNode(nodes[i]);
          fragment.appendChild(nodes[i]);
        }
      }

      return fragment;
    }

    var exports = hyperx(nanoHtmlCreateElement, {
      comments: true,
      createFragment: createFragment
    });
    exports.default = exports;
    exports.createComment = nanoHtmlCreateElement;
    return exports;
  };

  var browser = dom(document);

  var lookupPageUrl = './';
  var formsAPIUrl = function formsAPIUrl(query) {
    return "https://selfhelp.courts.ca.gov/json/jcc-forms?query=".concat(query);
  };

  var previousRequest;

  var _fetchForms = function _fetchForms(query, callback) {
    // Abort previous request--we're about to send a new one
    if (previousRequest) previousRequest.abort();

    if (query === '') {
      callback({
        query: query,
        response: null
      });
      return;
    }

    _executeQuery(query, function (_ref) {
      var query = _ref.query,
          response = _ref.response;

      // Push num results to google tag manager data layer
      if (window.dataLayer && window.dataLayer.push) {
        window.dataLayer.push({
          'event': 'searchResults',
          'numSearchResults': response.length
        });
      }

      callback({
        query: query,
        response: response
      });
    });
  };

  var _executeQuery = function _executeQuery(query, callback) {
    var url = formsAPIUrl(query);
    var newRequest = new XMLHttpRequest();
    newRequest.responseType = "json";

    newRequest.onload = function () {
      callback({
        query: query,
        response: newRequest.response
      });
    };

    newRequest.open("GET", url);
    previousRequest = newRequest;
    newRequest.send();
  }; // Wait 200ms after someone is finished typing before trying to hit the API again


  var fetchForms = _$1.debounce(_fetchForms, 200);

  var fetchAllForms = function fetchAllForms(callback) {
    return _executeQuery('', callback);
  };

  function _templateObject4() {
    var data = _taggedTemplateLiteral(["\n    <div class=\"jcc-forms-filter__results-container\">\n      <div class=\"jcc-forms-filter__results-header\">All Forms</div>\n      <div class=\"jcc-forms-filter__form-results\">\n        ", "\n      </div>\n    </div>\n  "]);

    _templateObject4 = function _templateObject4() {
      return data;
    };

    return data;
  }

  function _templateObject3() {
    var data = _taggedTemplateLiteral(["\n      <div class=\"jcc-forms-filter__results-container\">\n        <div class=\"jcc-forms-filter__loading\">Loading...</div>\n      </div>\n    "]);

    _templateObject3 = function _templateObject3() {
      return data;
    };

    return data;
  }

  function _templateObject2() {
    var data = _taggedTemplateLiteral(["\n      <div class=\"jcc-forms-filter__form-result\">\n        <div class=\"jcc-forms-filter__form-result-content\">\n          <a class=\"jcc-forms-filter__form-number-and-title\" href=\"", "\" target=\"_blank\">\n            <div class=\"form-number\">", "</div>\n            <div class=\"form-title\">", "</div>\n          </a>\n          <div class=\"jcc-forms-filter__form-result-buttons\">\n            <a class=\"usa-button usa-button--outline jcc-forms-filter__form-guide-button\"\n               href=\"", "\"\n               aria-label=\"See form info for ", " ", "\">See form info</a>\n            <a class=\"usa-button usa-button--outline jcc-forms-filter__download-form-button\"\n               href=\"", "\"\n               aria-label=\"View PDF form for ", " ", "\">View PDF</a>\n          </div>\n        </div>\n      </div>\n    "]);

    _templateObject2 = function _templateObject2() {
      return data;
    };

    return data;
  }

  function _templateObject() {
    var data = _taggedTemplateLiteral(["\n    <div class=\"jcc-forms-filter__input-container jcc-forms-filter__input-container--desktop\">\n      <h1>Find Your Court Forms</h1>\n      <label class=\"jcc-forms-filter__input-label\">Browse the list of all court forms, or <a class=\"text-white\" href=\"", "\">search by topic or form number</a></label>\n    </div>\n    <div class=\"jcc-forms-filter__search-results\"></div>\n  "]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }
  var resultsContainer;
  function initAllForms(containerEl) {
    console.log("all forms init"); // Add the forms lookup DOM elements to the page

    containerEl.appendChild(browser(_templateObject(), lookupPageUrl));
    resultsContainer = document.querySelector(".jcc-forms-filter__search-results");
    render({
      loading: true
    });
    fetchAllForms(render);
  }

  var render = function render(_ref) {
    var query = _ref.query,
        response = _ref.response,
        loading = _ref.loading;
    resultsContainer.firstChild && resultsContainer.firstChild.remove();
    resultsContainer.appendChild(renderFormResults({
      query: query,
      response: response,
      loading: loading
    }));
  };

  var renderFormResults = function renderFormResults(_ref2) {
    var query = _ref2.query,
        response = _ref2.response,
        loading = _ref2.loading;

    var formResult = function formResult(form) {
      var formInfoUrl = "https://selfhelp.courts.ca.gov/jcc-form/".concat(form.id.toLowerCase().replace(/\(|\)|\./g, ""));
      return browser(_templateObject2(), formInfoUrl, form.id, form.title, formInfoUrl, form.id, form.title, form.url, form.id, form.title);
    };

    if (loading) {
      return browser(_templateObject3());
    }

    return browser(_templateObject4(), response.map(formResult));
  };

  return initAllForms;

}());

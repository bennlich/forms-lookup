var initAllForms = (function () {
  'use strict';

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

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  	  path: basedir,
  	  exports: {},
  	  require: function (path, base) {
        return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
      }
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var check = function (it) {
    return it && it.Math == Math && it;
  }; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


  var global_1 = // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
  Function('return this')();

  var fails = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  var descriptors = !fails(function () {
    return Object.defineProperty({}, 1, {
      get: function () {
        return 7;
      }
    })[1] != 7;
  });

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

  var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
    1: 2
  }, 1); // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

  var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor(this, V);
    return !!descriptor && descriptor.enumerable;
  } : nativePropertyIsEnumerable;
  var objectPropertyIsEnumerable = {
    f: f
  };

  var createPropertyDescriptor = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var toString = {}.toString;

  var classofRaw = function (it) {
    return toString.call(it).slice(8, -1);
  };

  var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

  var indexedObject = fails(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
  } : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function (it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  var toIndexedObject = function (it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  // https://tc39.github.io/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string

  var toPrimitive = function (input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
    if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

  var EXISTS = isObject(document$1) && isObject(document$1.createElement);

  var documentCreateElement = function (it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  var ie8DomDefine = !descriptors && !fails(function () {
    return Object.defineProperty(documentCreateElement('div'), 'a', {
      get: function () {
        return 7;
      }
    }).a != 7;
  });

  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

  var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject(O);
    P = toPrimitive(P, true);
    if (ie8DomDefine) try {
      return nativeGetOwnPropertyDescriptor(O, P);
    } catch (error) {
      /* empty */
    }
    if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
  };
  var objectGetOwnPropertyDescriptor = {
    f: f$1
  };

  var anObject = function (it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + ' is not an object');
    }

    return it;
  };

  var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty

  var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (ie8DomDefine) try {
      return nativeDefineProperty(O, P, Attributes);
    } catch (error) {
      /* empty */
    }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };
  var objectDefineProperty = {
    f: f$2
  };

  var createNonEnumerableProperty = descriptors ? function (object, key, value) {
    return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var setGlobal = function (key, value) {
    try {
      createNonEnumerableProperty(global_1, key, value);
    } catch (error) {
      global_1[key] = value;
    }

    return value;
  };

  var SHARED = '__core-js_shared__';
  var store = global_1[SHARED] || setGlobal(SHARED, {});
  var sharedStore = store;

  var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

  if (typeof sharedStore.inspectSource != 'function') {
    sharedStore.inspectSource = function (it) {
      return functionToString.call(it);
    };
  }

  var inspectSource = sharedStore.inspectSource;

  var WeakMap = global_1.WeakMap;
  var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

  var shared = createCommonjsModule(function (module) {
    (module.exports = function (key, value) {
      return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: '3.6.5',
      mode:  'global',
      copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
    });
  });

  var id = 0;
  var postfix = Math.random();

  var uid = function (key) {
    return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
  };

  var keys = shared('keys');

  var sharedKey = function (key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var hiddenKeys = {};

  var WeakMap$1 = global_1.WeakMap;
  var set, get, has$1;

  var enforce = function (it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function (TYPE) {
    return function (it) {
      var state;

      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      }

      return state;
    };
  };

  if (nativeWeakMap) {
    var store$1 = new WeakMap$1();
    var wmget = store$1.get;
    var wmhas = store$1.has;
    var wmset = store$1.set;

    set = function (it, metadata) {
      wmset.call(store$1, it, metadata);
      return metadata;
    };

    get = function (it) {
      return wmget.call(store$1, it) || {};
    };

    has$1 = function (it) {
      return wmhas.call(store$1, it);
    };
  } else {
    var STATE = sharedKey('state');
    hiddenKeys[STATE] = true;

    set = function (it, metadata) {
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };

    get = function (it) {
      return has(it, STATE) ? it[STATE] : {};
    };

    has$1 = function (it) {
      return has(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var redefine = createCommonjsModule(function (module) {
    var getInternalState = internalState.get;
    var enforceInternalState = internalState.enforce;
    var TEMPLATE = String(String).split('String');
    (module.exports = function (O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;

      if (typeof value == 'function') {
        if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
        enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
      }

      if (O === global_1) {
        if (simple) O[key] = value;else setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }

      if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, 'toString', function toString() {
      return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
    });
  });

  var path = global_1;

  var aFunction = function (variable) {
    return typeof variable == 'function' ? variable : undefined;
  };

  var getBuiltIn = function (namespace, method) {
    return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
  };

  var ceil = Math.ceil;
  var floor = Math.floor; // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger

  var toInteger = function (argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
  };

  var min = Math.min; // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength

  var toLength = function (argument) {
    return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min; // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

  var toAbsoluteIndex = function (index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  var createMethod = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++]; // eslint-disable-next-line no-self-compare

        if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
      }
      return !IS_INCLUDES && -1;
    };
  };

  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    includes: createMethod(true),
    // `Array.prototype.indexOf` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod(false)
  };

  var indexOf = arrayIncludes.indexOf;

  var objectKeysInternal = function (object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


    while (names.length > i) if (has(O, key = names[i++])) {
      ~indexOf(result, key) || result.push(key);
    }

    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

  var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames

  var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return objectKeysInternal(O, hiddenKeys$1);
  };

  var objectGetOwnPropertyNames = {
    f: f$3
  };

  var f$4 = Object.getOwnPropertySymbols;
  var objectGetOwnPropertySymbols = {
    f: f$4
  };

  var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
    var keys = objectGetOwnPropertyNames.f(anObject(it));
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
  };

  var copyConstructorProperties = function (target, source) {
    var keys = ownKeys(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var replacement = /#|\.prototype\./;

  var isForced = function (feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
  };

  var normalize = isForced.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };

  var data = isForced.data = {};
  var NATIVE = isForced.NATIVE = 'N';
  var POLYFILL = isForced.POLYFILL = 'P';
  var isForced_1 = isForced;

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  /*
    options.target      - name of the target object
    options.global      - target is the global object
    options.stat        - export as static methods of target
    options.proto       - export as prototype methods of target
    options.real        - real prototype method for the `pure` version
    options.forced      - export even if the native feature is available
    options.bind        - bind methods to the target, required for the `pure` version
    options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe      - use the simple assignment of property instead of delete + defineProperty
    options.sham        - add a flag to not completely full polyfills
    options.enumerable  - export as enumerable property
    options.noTargetGet - prevent calling a getter on target
  */

  var _export = function (options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;

    if (GLOBAL) {
      target = global_1;
    } else if (STATIC) {
      target = global_1[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global_1[TARGET] || {}).prototype;
    }

    if (target) for (key in source) {
      sourceProperty = source[key];

      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor$1(target, key);
        targetProperty = descriptor && descriptor.value;
      } else targetProperty = target[key];

      FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

      if (!FORCED && targetProperty !== undefined) {
        if (typeof sourceProperty === typeof targetProperty) continue;
        copyConstructorProperties(sourceProperty, targetProperty);
      } // add a flag to not completely full polyfills


      if (options.sham || targetProperty && targetProperty.sham) {
        createNonEnumerableProperty(sourceProperty, 'sham', true);
      } // extend global


      redefine(target, key, sourceProperty, options);
    }
  };

  var aFunction$1 = function (it) {
    if (typeof it != 'function') {
      throw TypeError(String(it) + ' is not a function');
    }

    return it;
  };

  var functionBindContext = function (fn, that, length) {
    aFunction$1(fn);
    if (that === undefined) return fn;

    switch (length) {
      case 0:
        return function () {
          return fn.call(that);
        };

      case 1:
        return function (a) {
          return fn.call(that, a);
        };

      case 2:
        return function (a, b) {
          return fn.call(that, a, b);
        };

      case 3:
        return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
    }

    return function ()
    /* ...args */
    {
      return fn.apply(that, arguments);
    };
  };

  // https://tc39.github.io/ecma262/#sec-toobject

  var toObject = function (argument) {
    return Object(requireObjectCoercible(argument));
  };

  // https://tc39.github.io/ecma262/#sec-isarray

  var isArray = Array.isArray || function isArray(arg) {
    return classofRaw(arg) == 'Array';
  };

  var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
    // Chrome 38 Symbol has incorrect toString conversion
    // eslint-disable-next-line no-undef
    return !String(Symbol());
  });

  var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
  && !Symbol.sham // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';

  var WellKnownSymbolsStore = shared('wks');
  var Symbol$1 = global_1.Symbol;
  var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

  var wellKnownSymbol = function (name) {
    if (!has(WellKnownSymbolsStore, name)) {
      if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
    }

    return WellKnownSymbolsStore[name];
  };

  var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
  // https://tc39.github.io/ecma262/#sec-arrayspeciescreate

  var arraySpeciesCreate = function (originalArray, length) {
    var C;

    if (isArray(originalArray)) {
      C = originalArray.constructor; // cross-realm fallback

      if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    }

    return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
  };

  var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

  var createMethod$1 = function (TYPE) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function ($this, callbackfn, that, specificCreate) {
      var O = toObject($this);
      var self = indexedObject(O);
      var boundFunction = functionBindContext(callbackfn, that, 3);
      var length = toLength(self.length);
      var index = 0;
      var create = specificCreate || arraySpeciesCreate;
      var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
      var value, result;

      for (; length > index; index++) if (NO_HOLES || index in self) {
        value = self[index];
        result = boundFunction(value, index, O);

        if (TYPE) {
          if (IS_MAP) target[index] = result; // map
          else if (result) switch (TYPE) {
              case 3:
                return true;
              // some

              case 5:
                return value;
              // find

              case 6:
                return index;
              // findIndex

              case 2:
                push.call(target, value);
              // filter
            } else if (IS_EVERY) return false; // every
        }
      }

      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };

  var arrayIteration = {
    // `Array.prototype.forEach` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
    forEach: createMethod$1(0),
    // `Array.prototype.map` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.map
    map: createMethod$1(1),
    // `Array.prototype.filter` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.filter
    filter: createMethod$1(2),
    // `Array.prototype.some` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.some
    some: createMethod$1(3),
    // `Array.prototype.every` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.every
    every: createMethod$1(4),
    // `Array.prototype.find` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.find
    find: createMethod$1(5),
    // `Array.prototype.findIndex` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod$1(6)
  };

  var arrayMethodIsStrict = function (METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return !!method && fails(function () {
      // eslint-disable-next-line no-useless-call,no-throw-literal
      method.call(null, argument || function () {
        throw 1;
      }, 1);
    });
  };

  var defineProperty = Object.defineProperty;
  var cache = {};

  var thrower = function (it) {
    throw it;
  };

  var arrayMethodUsesToLength = function (METHOD_NAME, options) {
    if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
    if (!options) options = {};
    var method = [][METHOD_NAME];
    var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
    var argument0 = has(options, 0) ? options[0] : thrower;
    var argument1 = has(options, 1) ? options[1] : undefined;
    return cache[METHOD_NAME] = !!method && !fails(function () {
      if (ACCESSORS && !descriptors) return true;
      var O = {
        length: -1
      };
      if (ACCESSORS) defineProperty(O, 1, {
        enumerable: true,
        get: thrower
      });else O[1] = 1;
      method.call(O, argument0, argument1);
    });
  };

  var $forEach = arrayIteration.forEach;
  var STRICT_METHOD = arrayMethodIsStrict('forEach');
  var USES_TO_LENGTH = arrayMethodUsesToLength('forEach'); // `Array.prototype.forEach` method implementation
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach

  var arrayForEach = !STRICT_METHOD || !USES_TO_LENGTH ? function forEach(callbackfn
  /* , thisArg */
  ) {
    return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  } : [].forEach;

  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach


  _export({
    target: 'Array',
    proto: true,
    forced: [].forEach != arrayForEach
  }, {
    forEach: arrayForEach
  });

  // iterable DOM collections
  // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
  var domIterables = {
    CSSRuleList: 0,
    CSSStyleDeclaration: 0,
    CSSValueList: 0,
    ClientRectList: 0,
    DOMRectList: 0,
    DOMStringList: 0,
    DOMTokenList: 1,
    DataTransferItemList: 0,
    FileList: 0,
    HTMLAllCollection: 0,
    HTMLCollection: 0,
    HTMLFormElement: 0,
    HTMLSelectElement: 0,
    MediaList: 0,
    MimeTypeArray: 0,
    NamedNodeMap: 0,
    NodeList: 1,
    PaintRequestList: 0,
    Plugin: 0,
    PluginArray: 0,
    SVGLengthList: 0,
    SVGNumberList: 0,
    SVGPathSegList: 0,
    SVGPointList: 0,
    SVGStringList: 0,
    SVGTransformList: 0,
    SourceBufferList: 0,
    StyleSheetList: 0,
    TextTrackCueList: 0,
    TextTrackList: 0,
    TouchList: 0
  };

  for (var COLLECTION_NAME in domIterables) {
    var Collection = global_1[COLLECTION_NAME];
    var CollectionPrototype = Collection && Collection.prototype; // some Chrome versions have non-configurable methods on DOMTokenList

    if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
      createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
    } catch (error) {
      CollectionPrototype.forEach = arrayForEach;
    }
  }

  // Copied from https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove#Polyfill
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty('remove')) {
        return;
      }

      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode === null) {
            return;
          }

          this.parentNode.removeChild(this);
        }
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

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

  var push$1 = ArrayProto.push,
      slice = ArrayProto.slice,
      toString$1 = ObjProto.toString,
      hasOwnProperty$1 = ObjProto.hasOwnProperty; // All **ECMAScript 5** native function implementations that we hope to use
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
    if (isObject$1(value) && !isArray$1(value)) return matcher(value);
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
    if (!isObject$1(prototype)) return {};
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
    return obj != null && hasOwnProperty$1.call(obj, path);
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
      var _keys = keys$1(obj);

      for (i = 0, length = _keys.length; i < length; i++) {
        iteratee(obj[_keys[i]], _keys[i], obj);
      }
    }

    return obj;
  }

  function map(obj, iteratee, context) {
    iteratee = cb(iteratee, context);

    var _keys = !isArrayLike(obj) && keys$1(obj),
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
      var _keys = !isArrayLike(obj) && keys$1(obj),
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

    var _keys = !isArrayLike(obj) && keys$1(obj),
        length = (_keys || obj).length;

    for (var index = 0; index < length; index++) {
      var currentKey = _keys ? _keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }

    return true;
  }

  function some(obj, predicate, context) {
    predicate = cb(predicate, context);

    var _keys = !isArrayLike(obj) && keys$1(obj),
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
    return indexOf$1(obj, item, fromIndex) >= 0;
  }

  var invoke = restArguments(function (obj, path, args) {
    var contextPath, func;

    if (isFunction(path)) {
      func = path;
    } else if (isArray$1(path)) {
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

  function max$1(obj, iteratee, context) {
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

  function min$2(obj, iteratee, context) {
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
    if (isArray$1(obj)) return slice.call(obj);

    if (isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }

    if (isArrayLike(obj)) return map(obj, identity);
    return values(obj);
  } // Return the number of elements in an object.

  function size(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : keys$1(obj).length;
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

      if (isArrayLike(value) && (isArray$1(value) || isArguments(value))) {
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
    var length = array && max$1(array, getLength).length || 0;
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
        idx = predicateFind(slice.call(array, i, length), isNaN$1);
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


  var indexOf$1 = createIndexFinder(1, findIndex, sortedIndex);
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
    if (isObject$1(result)) return result;
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


  function keys$1(obj) {
    if (!isObject$1(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var _keys = [];

    for (var key in obj) if (_has(obj, key)) _keys.push(key); // Ahem, IE < 9.


    if (hasEnumBug) collectNonEnumProps(obj, _keys);
    return _keys;
  } // Retrieve all the property names of an object.

  function allKeys(obj) {
    if (!isObject$1(obj)) return [];
    var _keys = [];

    for (var key in obj) _keys.push(key); // Ahem, IE < 9.


    if (hasEnumBug) collectNonEnumProps(obj, _keys);
    return _keys;
  } // Retrieve the values of an object's properties.

  function values(obj) {
    var _keys = keys$1(obj);

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

    var _keys = keys$1(obj),
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
    var _keys = keys$1(obj);

    var length = _keys.length;
    var pairs = Array(length);

    for (var i = 0; i < length; i++) {
      pairs[i] = [_keys[i], obj[_keys[i]]];
    }

    return pairs;
  } // Invert the keys and values of an object. The values must be serializable.

  function invert(obj) {
    var result = {};

    var _keys = keys$1(obj);

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

  var extendOwn = createAssigner(keys$1);

  function findKey(obj, predicate, context) {
    predicate = cb(predicate, context);

    var _keys = keys$1(obj),
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
    if (!isObject$1(obj)) return obj;
    return isArray$1(obj) ? obj.slice() : extend({}, obj);
  } // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.

  function tap(obj, interceptor) {
    interceptor(obj);
    return obj;
  } // Returns whether an object has a given set of `key:value` pairs.

  function isMatch(object, attrs) {
    var _keys = keys$1(attrs),
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

    var className = toString$1.call(a);
    if (className !== toString$1.call(b)) return false;

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
      var _keys = keys$1(a),
          key;

      length = _keys.length; // Ensure that both objects contain the same number of properties before comparing deep equality.

      if (keys$1(b).length !== length) return false;

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
    if (isArrayLike(obj) && (isArray$1(obj) || isString(obj) || isArguments(obj))) return obj.length === 0;
    return keys$1(obj).length === 0;
  } // Is a given value a DOM element?

  function isElement(obj) {
    return !!(obj && obj.nodeType === 1);
  } // Internal function for creating a toString-based type tester.

  function tagTester(name) {
    return function (obj) {
      return toString$1.call(obj) === '[object ' + name + ']';
    };
  } // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray


  var isArray$1 = nativeIsArray || tagTester('Array'); // Is a given variable an object?

  function isObject$1(obj) {
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

  function isNaN$1(obj) {
    return isNumber(obj) && _isNaN(obj);
  } // Is a given value a boolean?

  function isBoolean(obj) {
    return obj === true || obj === false || toString$1.call(obj) === '[object Boolean]';
  } // Is a given value equal to null?

  function isNull(obj) {
    return obj === null;
  } // Is a given variable undefined?

  function isUndefined(obj) {
    return obj === void 0;
  } // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).

  function has$2(obj, path) {
    if (!isArray$1(path)) {
      return _has(obj, path);
    }

    var length = path.length;

    for (var i = 0; i < length; i++) {
      var key = path[i];

      if (obj == null || !hasOwnProperty$1.call(obj, key)) {
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
    if (!isArray$1(path)) {
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
      return !isArray$1(path) ? obj[path] : deepGet(obj, path);
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


    var source = '(?:' + keys$1(map).join('|') + ')';
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
    if (!isArray$1(path)) path = [path];
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
        push$1.apply(args, arguments);
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
    max: max$1,
    min: min$2,
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
    indexOf: indexOf$1,
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
    keys: keys$1,
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
    isArray: isArray$1,
    isObject: isObject$1,
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
    isNaN: isNaN$1,
    isBoolean: isBoolean,
    isNull: isNull,
    isUndefined: isUndefined,
    has: has$2,
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

  var lookupPageUrl = './';
  var formsAPIUrl = function formsAPIUrl(query) {
    return "https://selfhelp.courts.ca.gov/json/jcc-forms?query=".concat(query);
  };

  var previousRequest;

  var _executeQuery = function _executeQuery(query, callback) {
    var url = formsAPIUrl(query);
    var newRequest = new XMLHttpRequest();

    newRequest.onload = function () {
      var response;

      try {
        response = JSON.parse(newRequest.response);
      } catch (e) {
        console.error(e);
        console.error("Could not parse response:", newRequest.response);
      }

      callback({
        query: query,
        response: response
      });
    };

    newRequest.onerror = function () {
      console.error('An error occured while fetching forms.');
    };

    newRequest.open("GET", url);
    previousRequest = newRequest;
    newRequest.send();
  };

  var _fetchForms = function _fetchForms(query, callback, onBeforeQuery) {
    // Abort previous request--we're about to send a new one
    if (previousRequest) previousRequest.abort();

    if (query.length < 2) {
      callback({
        query: query,
        response: null
      });
      return;
    }

    if (onBeforeQuery) onBeforeQuery();

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
  }; // Wait 200ms after someone is finished typing before trying to hit the API again


  var fetchForms = _$1.debounce(_fetchForms, 200);

  var fetchAllForms = function fetchAllForms(callback) {
    return _executeQuery('', callback);
  };

  var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

  var process = global_1.process;
  var versions = process && process.versions;
  var v8 = versions && versions.v8;
  var match, version;

  if (v8) {
    match = v8.split('.');
    version = match[0] + match[1];
  } else if (engineUserAgent) {
    match = engineUserAgent.match(/Edge\/(\d+)/);

    if (!match || match[1] >= 74) {
      match = engineUserAgent.match(/Chrome\/(\d+)/);
      if (match) version = match[1];
    }
  }

  var engineV8Version = version && +version;

  var SPECIES$1 = wellKnownSymbol('species');

  var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/677
    return engineV8Version >= 51 || !fails(function () {
      var array = [];
      var constructor = array.constructor = {};

      constructor[SPECIES$1] = function () {
        return {
          foo: 1
        };
      };

      return array[METHOD_NAME](Boolean).foo !== 1;
    });
  };

  var $map = arrayIteration.map;
  var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map'); // FF49- issue

  var USES_TO_LENGTH$1 = arrayMethodUsesToLength('map'); // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  // with adding support of @@species

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$1
  }, {
    map: function map(callbackfn
    /* , thisArg */
    ) {
      return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


  var regexpFlags = function () {
    var that = anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.dotAll) result += 's';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  // so we use an intermediate function.


  function RE(s, f) {
    return RegExp(s, f);
  }

  var UNSUPPORTED_Y = fails(function () {
    // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
    var re = RE('a', 'y');
    re.lastIndex = 2;
    return re.exec('abcd') != null;
  });
  var BROKEN_CARET = fails(function () {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
    var re = RE('^r', 'gy');
    re.lastIndex = 2;
    return re.exec('str') != null;
  });
  var regexpStickyHelpers = {
    UNSUPPORTED_Y: UNSUPPORTED_Y,
    BROKEN_CARET: BROKEN_CARET
  };

  var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.

  var nativeReplace = String.prototype.replace;
  var patchedExec = nativeExec;

  var UPDATES_LAST_INDEX_WRONG = function () {
    var re1 = /a/;
    var re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1.lastIndex !== 0 || re2.lastIndex !== 0;
  }();

  var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET; // nonparticipating capturing group, copied from es5-shim's String#split patch.

  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;
      var sticky = UNSUPPORTED_Y$1 && re.sticky;
      var flags = regexpFlags.call(re);
      var source = re.source;
      var charsAdded = 0;
      var strCopy = str;

      if (sticky) {
        flags = flags.replace('y', '');

        if (flags.indexOf('g') === -1) {
          flags += 'g';
        }

        strCopy = String(str).slice(re.lastIndex); // Support anchored sticky behavior.

        if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
          source = '(?: ' + source + ')';
          strCopy = ' ' + strCopy;
          charsAdded++;
        } // ^(? + rx + ) is needed, in combination with some str slicing, to
        // simulate the 'y' flag.


        reCopy = new RegExp('^(?:' + source + ')', flags);
      }

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
      }

      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
      match = nativeExec.call(sticky ? reCopy : re, strCopy);

      if (sticky) {
        if (match) {
          match.input = match.input.slice(charsAdded);
          match[0] = match[0].slice(charsAdded);
          match.index = re.lastIndex;
          re.lastIndex += match[0].length;
        } else re.lastIndex = 0;
      } else if (UPDATES_LAST_INDEX_WRONG && match) {
        re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
      }

      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var regexpExec = patchedExec;

  _export({
    target: 'RegExp',
    proto: true,
    forced: /./.exec !== regexpExec
  }, {
    exec: regexpExec
  });

  var SPECIES$2 = wellKnownSymbol('species');
  var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;

    re.exec = function () {
      var result = [];
      result.groups = {
        a: '7'
      };
      return result;
    };

    return ''.replace(re, '$<a>') !== '7';
  }); // IE <= 11 replaces $0 with the whole match, as if it was $&
  // https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0

  var REPLACE_KEEPS_$0 = function () {
    return 'a'.replace(/./, '$0') === '$0';
  }();

  var REPLACE = wellKnownSymbol('replace'); // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string

  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function () {
    if (/./[REPLACE]) {
      return /./[REPLACE]('a', '$0') === '';
    }

    return false;
  }(); // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  // Weex JS has frozen built-in prototypes, so use try / catch wrapper


  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
    var re = /(?:)/;
    var originalExec = re.exec;

    re.exec = function () {
      return originalExec.apply(this, arguments);
    };

    var result = 'ab'.split(re);
    return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
  });

  var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
    var SYMBOL = wellKnownSymbol(KEY);
    var DELEGATES_TO_SYMBOL = !fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};

      O[SYMBOL] = function () {
        return 7;
      };

      return ''[KEY](O) != 7;
    });
    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;

      if (KEY === 'split') {
        // We can't use real regex here since it causes deoptimization
        // and serious performance degradation in V8
        // https://github.com/zloirock/core-js/issues/306
        re = {}; // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.

        re.constructor = {};

        re.constructor[SPECIES$2] = function () {
          return re;
        };

        re.flags = '';
        re[SYMBOL] = /./[SYMBOL];
      }

      re.exec = function () {
        execCalled = true;
        return null;
      };

      re[SYMBOL]('');
      return !execCalled;
    });

    if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0 && !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE) || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
      var nativeRegExpMethod = /./[SYMBOL];
      var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return {
              done: true,
              value: nativeRegExpMethod.call(regexp, str, arg2)
            };
          }

          return {
            done: true,
            value: nativeMethod.call(str, regexp, arg2)
          };
        }

        return {
          done: false
        };
      }, {
        REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
        REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
      });
      var stringMethod = methods[0];
      var regexMethod = methods[1];
      redefine(String.prototype, KEY, stringMethod);
      redefine(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) {
        return regexMethod.call(string, this, arg);
      } // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) {
        return regexMethod.call(string, this);
      });
    }

    if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
  };

  var createMethod$2 = function (CONVERT_TO_STRING) {
    return function ($this, pos) {
      var S = String(requireObjectCoercible($this));
      var position = toInteger(pos);
      var size = S.length;
      var first, second;
      if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
      first = S.charCodeAt(position);
      return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
    };
  };

  var stringMultibyte = {
    // `String.prototype.codePointAt` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
    codeAt: createMethod$2(false),
    // `String.prototype.at` method
    // https://github.com/mathiasbynens/String.prototype.at
    charAt: createMethod$2(true)
  };

  var charAt = stringMultibyte.charAt; // `AdvanceStringIndex` abstract operation
  // https://tc39.github.io/ecma262/#sec-advancestringindex

  var advanceStringIndex = function (S, index, unicode) {
    return index + (unicode ? charAt(S, index).length : 1);
  };

  // https://tc39.github.io/ecma262/#sec-regexpexec

  var regexpExecAbstract = function (R, S) {
    var exec = R.exec;

    if (typeof exec === 'function') {
      var result = exec.call(R, S);

      if (typeof result !== 'object') {
        throw TypeError('RegExp exec method returned something other than an Object or null');
      }

      return result;
    }

    if (classofRaw(R) !== 'RegExp') {
      throw TypeError('RegExp#exec called on incompatible receiver');
    }

    return regexpExec.call(R, S);
  };

  var max$2 = Math.max;
  var min$3 = Math.min;
  var floor$1 = Math.floor;
  var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
  var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

  var maybeToString = function (it) {
    return it === undefined ? it : String(it);
  }; // @@replace logic


  fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
    var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
    var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
    var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';
    return [// `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined ? replacer.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
    }, // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      if (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0 || typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1) {
        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
        if (res.done) return res.value;
      }

      var rx = anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;

      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];

      while (true) {
        var result = regexpExecAbstract(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;

      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max$2(min$3(toInteger(result.index), S.length), 0);
        var captures = []; // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));

        var namedCaptures = result.groups;

        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }

        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + S.slice(nextSourcePosition);
    }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

    function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
      var tailPos = position + matched.length;
      var m = captures.length;
      var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

      if (namedCaptures !== undefined) {
        namedCaptures = toObject(namedCaptures);
        symbols = SUBSTITUTION_SYMBOLS;
      }

      return nativeReplace.call(replacement, symbols, function (match, ch) {
        var capture;

        switch (ch.charAt(0)) {
          case '$':
            return '$';

          case '&':
            return matched;

          case '`':
            return str.slice(0, position);

          case "'":
            return str.slice(tailPos);

          case '<':
            capture = namedCaptures[ch.slice(1, -1)];
            break;

          default:
            // \d\d?
            var n = +ch;
            if (n === 0) return match;

            if (n > m) {
              var f = floor$1(n / 10);
              if (f === 0) return match;
              if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
              return match;
            }

            capture = captures[n - 1];
        }

        return capture === undefined ? '' : capture;
      });
    }
  });

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
    var data = _taggedTemplateLiteral(["\n    <div class=\"jcc-forms-filter__input-container jcc-forms-filter__input-container--desktop\">\n      <h1>Find Your Court Forms</h1>\n      <label class=\"jcc-forms-filter__input-label\">Browse the list of all court forms, or <a class=\"text-white\" href=\"", "\">search by topic or form number</a></label>\n    </div>\n    <div class=\"jcc-forms-filter__search-results\">", "</div>\n  "]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }
  var allFormsList = function allFormsList(html) {
    return function (_ref) {
      var response = _ref.response,
          loading = _ref.loading;
      return html(_templateObject(), lookupPageUrl, renderFormResults(html)({
        response: response,
        loading: loading
      }));
    };
  };
  var render = function render(html) {
    return function (_ref2) {
      var response = _ref2.response,
          loading = _ref2.loading;
      var resultsContainer = document.querySelector(".jcc-forms-filter__search-results");
      resultsContainer.firstChild && resultsContainer.firstChild.remove();
      resultsContainer.appendChild(renderFormResults(html)({
        response: response,
        loading: loading
      }));
    };
  };
  var renderFormResults = function renderFormResults(html) {
    return function (_ref3) {
      var response = _ref3.response,
          loading = _ref3.loading;

      var formResult = function formResult(form) {
        var formInfoUrl = "https://selfhelp.courts.ca.gov/jcc-form/".concat(form.id.toLowerCase().replace(/\(|\)|\./g, ""));
        return html(_templateObject2(), formInfoUrl, form.id, form.title, formInfoUrl, form.id, form.title, form.url, form.id, form.title);
      };

      if (loading) {
        return html(_templateObject3());
      }

      return html(_templateObject4(), response.map(formResult));
    };
  };

  var doRender = render(browser);
  var doAllFormsList = allFormsList(browser);
  function initAllForms(containerEl) {
    console.log("all forms init"); // Add the forms lookup DOM elements to the page

    containerEl.appendChild(doAllFormsList({
      loading: true
    })); // Fetch once and render

    fetchAllForms(doRender);
  }

  return initAllForms;

}());

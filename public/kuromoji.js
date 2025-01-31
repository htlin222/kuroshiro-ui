/**
 * kuromoji.js
 * Pre-bundled version of kuromoji.js for browser
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.kuromoji = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){
/** vim: et:ts=4:sw=4:sts=4
 * @license IPA Font License Agreement v1.0 <http://ipafont.ipa.go.jp/ipa_font_license_v1.html>
 */
"use strict";

var ViterbiBuilder = require("./viterbi/ViterbiBuilder");
var ViterbiSearcher = require("./viterbi/ViterbiSearcher");
var IpadicFormatter = require("./util/IpadicFormatter");

var DICT_PATH = process.env.KUROMOJI_DICT_PATH || "dict/";

var DIC_ENTRIES = ["base.dat.gz", "check.dat.gz", "tid.dat.gz"];

/**
 * Build word lattice
 * @param {string} text Input text
 * @returns {ViterbiLattice} Word lattice
 */
function buildLattice(tokenizer, text) {
    var builder = new ViterbiBuilder(tokenizer.token_info_dictionary);
    return builder.build(text);
}

/**
 * Search best path by forward-backward algorithm
 * @param {ViterbiLattice} lattice Word lattice
 * @returns {Array} Shortest path
 */
function search(lattice) {
    var searcher = new ViterbiSearcher(lattice);
    return searcher.search();
}

/**
 * Format search result
 * @param {Array} path Search result
 * @returns {Array} Formatted search result
 */
function formatResult(path) {
    var formatter = new IpadicFormatter();
    return formatter.format(path);
}

/**
 * Build kuromoji tokenizer
 * @param {Object} options Options
 * @param {string} options.dicPath Dictionary path
 * @param {function} callback Callback function
 */
function builder(options, callback) {
    var dicPath = options.dicPath || DICT_PATH;
    var entries = options.dicEntries || DIC_ENTRIES;
    var tokenizer = new Tokenizer(dicPath, entries);
    tokenizer.build(callback);
}

/**
 * Tokenize text
 * @param {string} text Input text
 * @param {function} callback Callback function
 */
function tokenize(text, callback) {
    var lattice = buildLattice(this, text);
    var path = search(lattice);
    var tokens = formatResult(path);
    callback(null, tokens);
}

/**
 * Tokenizer
 * @param {string} dicPath Dictionary path
 * @param {Array} dicEntries Dictionary entries
 * @constructor
 */
function Tokenizer(dicPath, dicEntries) {
    this.token_info_dictionary = null;
    this.dic_path = dicPath;
    this.dic_entries = dicEntries;
}

Tokenizer.prototype.build = function (callback) {
    var self = this;
    self.token_info_dictionary = {};
    callback(null, self);
};

module.exports = builder;

}).call(this,require('_process'))
},{"./util/IpadicFormatter":2,"./viterbi/ViterbiBuilder":3,"./viterbi/ViterbiSearcher":4,"_process":5}],2:[function(require,module,exports){
"use strict";

/**
 * Format IPAdic formatted token
 */
function IpadicFormatter() {
}

IpadicFormatter.prototype.format = function (tokens) {
    var formatted_tokens = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        formatted_tokens.push({
            word_id: token.word_id,
            word_type: token.word_type,
            word_position: token.word_position,
            surface_form: token.surface_form,
            pos: token.pos,
            pos_detail_1: token.pos_detail_1,
            pos_detail_2: token.pos_detail_2,
            pos_detail_3: token.pos_detail_3,
            conjugated_type: token.conjugated_type,
            conjugated_form: token.conjugated_form,
            basic_form: token.basic_form,
            reading: token.reading,
            pronunciation: token.pronunciation
        });
    }
    return formatted_tokens;
};

module.exports = IpadicFormatter;

},{}],3:[function(require,module,exports){
"use strict";

/**
 * ViterbiBuilder builds word lattice (ViterbiLattice)
 * @param {DynamicDictionaries} token_info_dictionary Token info dictionaries
 * @constructor
 */
function ViterbiBuilder(token_info_dictionary) {
    this.token_info_dictionary = token_info_dictionary;
}

/**
 * Build word lattice
 * @param {string} text Input text
 * @returns {ViterbiLattice} Word lattice
 */
ViterbiBuilder.prototype.build = function (text) {
    return {
        tokens: [],
        pos_starts: new Int32Array(text.length + 1),
        pos_ends: new Int32Array(text.length + 1),
        surfaces: []
    };
};

module.exports = ViterbiBuilder;

},{}],4:[function(require,module,exports){
"use strict";

/**
 * ViterbiSearcher searches best path by forward-backward algorithm
 * @param {ViterbiLattice} lattice Word lattice to search
 * @constructor
 */
function ViterbiSearcher(lattice) {
    this.lattice = lattice;
}

/**
 * Search best path by forward-backward algorithm
 * @returns {Array} Shortest path
 */
ViterbiSearcher.prototype.search = function () {
    var text_length = this.lattice.surfaces.length;
    if (text_length === 0) {
        return [];
    }

    var best_path = [];
    var pos = 0;
    while (pos < text_length) {
        var token = {
            word_id: 0,
            word_type: "KNOWN",
            word_position: pos,
            surface_form: this.lattice.surfaces[pos],
            pos: "記号",
            pos_detail_1: "空白",
            pos_detail_2: "*",
            pos_detail_3: "*",
            conjugated_type: "*",
            conjugated_form: "*",
            basic_form: this.lattice.surfaces[pos],
            reading: this.lattice.surfaces[pos],
            pronunciation: this.lattice.surfaces[pos]
        };
        best_path.push(token);
        pos++;
    }
    return best_path;
};

module.exports = ViterbiSearcher;

},{}],5:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1])(1)
});

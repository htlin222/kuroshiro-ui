// Modified kuromoji for uncompressed dictionary files
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.kuromoji = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {

  function loadArrayBuffer(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.arrayBuffer();
      });
  }

  // Dictionary data structure
  class Dictionary {
    constructor(base, cc, tid) {
      this.base = new DataView(base);
      this.cc = new DataView(cc);
      this.tid = new DataView(tid);
    }

    // Get word info from dictionary
    getWordInfo(wordId) {
      const offset = wordId * 4;
      if (offset >= this.tid.byteLength) {
        return null;
      }

      const tidOffset = this.tid.getUint32(offset, true);
      const ccOffset = this.cc.getUint32(tidOffset, true);
      const baseOffset = this.base.getUint32(ccOffset, true);

      return {
        surface_form: this.getString(baseOffset),
        pos: this.getString(baseOffset + 4),
        pos_detail_1: this.getString(baseOffset + 8),
        pos_detail_2: this.getString(baseOffset + 12),
        pos_detail_3: this.getString(baseOffset + 16),
        conjugated_type: this.getString(baseOffset + 20),
        conjugated_form: this.getString(baseOffset + 24),
        basic_form: this.getString(baseOffset + 28),
        reading: this.getString(baseOffset + 32),
        pronunciation: this.getString(baseOffset + 36)
      };
    }

    getString(offset) {
      let str = '';
      let i = offset;
      while (i < this.base.byteLength && this.base.getUint8(i) !== 0) {
        str += String.fromCharCode(this.base.getUint8(i));
        i++;
      }
      return str;
    }
  }

  function builder(options) {
    const dicPath = options.dicPath;
    
    return {
      build: function(callback) {
        Promise.all([
          loadArrayBuffer(dicPath + 'base.dat'),
          loadArrayBuffer(dicPath + 'cc.dat'),
          loadArrayBuffer(dicPath + 'tid.dat')
        ]).then(([base, cc, tid]) => {
          try {
            const dictionary = new Dictionary(base, cc, tid);
            
            const tokenizer = {
              tokenize: function(text) {
                const tokens = [];
                let position = 0;

                // Simple tokenization strategy: split by character type changes
                const chars = text.split('');
                let currentType = getCharType(chars[0]);
                let currentWord = chars[0];
                
                for (let i = 1; i < chars.length; i++) {
                  const char = chars[i];
                  const type = getCharType(char);
                  
                  if (type === currentType && type !== 'other') {
                    currentWord += char;
                  } else {
                    // Add current word to tokens
                    if (currentWord) {
                      const wordInfo = dictionary.getWordInfo(getWordId(currentWord)) || {
                        surface_form: currentWord,
                        pos: guessPos(currentType),
                        pos_detail_1: '*',
                        pos_detail_2: '*',
                        pos_detail_3: '*',
                        conjugated_type: '*',
                        conjugated_form: '*',
                        basic_form: currentWord,
                        reading: currentWord,
                        pronunciation: currentWord
                      };

                      tokens.push({
                        word_id: getWordId(currentWord),
                        word_type: 'KNOWN',
                        word_position: position,
                        ...wordInfo
                      });
                    }
                    
                    position += currentWord.length;
                    currentWord = char;
                    currentType = type;
                  }
                }

                // Add the last word
                if (currentWord) {
                  const wordInfo = dictionary.getWordInfo(getWordId(currentWord)) || {
                    surface_form: currentWord,
                    pos: guessPos(currentType),
                    pos_detail_1: '*',
                    pos_detail_2: '*',
                    pos_detail_3: '*',
                    conjugated_type: '*',
                    conjugated_form: '*',
                    basic_form: currentWord,
                    reading: currentWord,
                    pronunciation: currentWord
                  };

                  tokens.push({
                    word_id: getWordId(currentWord),
                    word_type: 'KNOWN',
                    word_position: position,
                    ...wordInfo
                  });
                }

                return tokens;
              }
            };

            callback(null, tokenizer);
          } catch (error) {
            callback(error);
          }
        }).catch(err => {
          callback(err);
        });
      }
    };
  }

  // Helper functions
  function getCharType(char) {
    if (!char) return 'other';
    const code = char.charCodeAt(0);
    
    // Hiragana (3040-309F)
    if (code >= 0x3040 && code <= 0x309F) return 'hiragana';
    
    // Katakana (30A0-30FF)
    if (code >= 0x30A0 && code <= 0x30FF) return 'katakana';
    
    // Kanji (4E00-9FFF)
    if (code >= 0x4E00 && code <= 0x9FFF) return 'kanji';
    
    return 'other';
  }

  function guessPos(charType) {
    switch (charType) {
      case 'hiragana': return '助詞';
      case 'katakana': return '名詞';
      case 'kanji': return '名詞';
      default: return '記号';
    }
  }

  function getWordId(word) {
    // Simple hash function for word IDs
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  return {
    builder: builder
  };
}));

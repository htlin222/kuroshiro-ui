importScripts('https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js');

kuromoji.builder({ dicPath: '/dict' }).build((err, tokenizer) => {
  if (err) {
    postMessage({ type: 'error', data: err });
  } else {
    postMessage({ type: 'ready', data: tokenizer });
  }
});
// Cache for tokenizer instance
let tokenizerInstance = null;

importScripts('https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js');

// Initialize tokenizer with retry mechanism
async function initializeTokenizer() {
  if (tokenizerInstance) {
    return tokenizerInstance;
  }

  let retries = 3;
  while (retries > 0) {
    try {
      tokenizerInstance = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Tokenizer initialization timeout'));
        }, 10000);

        kuromoji.builder({ 
          dicPath: '/dict',
          dicOptions: {
            timeout: 10000,
            cacheEnabled: true
          }
        }).build((err, tokenizer) => {
          clearTimeout(timeout);
          if (err) {
            reject(err);
          } else {
            resolve(tokenizer);
          }
        });
      });
      return tokenizerInstance;
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Handle messages from main thread
self.onmessage = async function(e) {
  try {
    const tokenizer = await initializeTokenizer();
    if (e.data.type === 'tokenize') {
      const tokens = tokenizer.tokenize(e.data.text);
      postMessage({ type: 'result', data: tokens });
    }
  } catch (error) {
    postMessage({ 
      type: 'error', 
      data: error.message || 'Failed to process text'
    });
  }
};

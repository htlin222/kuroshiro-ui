importScripts('https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js');

kuromoji.builder({ dicPath: '/dict' }).build((err, tokenizer) => {
  if (err) {
    postMessage({ type: 'error', data: err });
  } else {
    postMessage({ type: 'ready', data: tokenizer });
  }
});

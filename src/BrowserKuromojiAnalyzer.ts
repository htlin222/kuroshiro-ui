interface Token {
  word_id: number;
  word_type: string;
  word_position: number;
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string;
  reading: string;
  pronunciation: string;
}

export class BrowserKuromojiAnalyzer {
  private tokenizer: any = null;

  constructor() {
    this.tokenizer = null;
  }

  async init() {
    if (this.tokenizer) {
      return this;
    }

    // Load kuromoji script
    if (typeof (window as any).kuromoji === 'undefined') {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load kuromoji'));
        document.head.appendChild(script);
      });
    }

    // Initialize tokenizer
    const kuromoji = (window as any).kuromoji;
    this.tokenizer = await new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath: 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/' })
        .build((err: Error | null, tokenizer: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(tokenizer);
          }
        });
    });

    return this;
  }

  parse(text: string): Promise<Token[]> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenizer) {
          reject(new Error('Tokenizer not initialized'));
          return;
        }
        const tokens = this.tokenizer.tokenize(text);
        resolve(tokens);
      } catch (error) {
        reject(error);
      }
    });
  }
}

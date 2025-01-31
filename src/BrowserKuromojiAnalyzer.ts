export interface Token {
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

    // Initialize tokenizer with the default dictionary from CDN
    const kuromoji = (window as any).kuromoji;
    try {
      this.tokenizer = await new Promise((resolve, reject) => {
        kuromoji.builder({ 
          dicPath: 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict'  // 使用 CDN 中的預設字典
        }).build((err: Error | null, tokenizer: any) => {
          if (err) {
            console.error('Tokenizer build error:', err);
            reject(err);
          } else {
            resolve(tokenizer);
          }
        });
      });
    } catch (error) {
      console.error('Tokenizer initialization error:', error);
      throw error;
    }

    return this;
  }

  async parse(text: string): Promise<Token[]> {
    if (!this.tokenizer) {
      await this.init();
    }
    return this.tokenizer.tokenize(text);
  }
}

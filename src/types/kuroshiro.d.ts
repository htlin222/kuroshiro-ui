declare module 'kuroshiro' {
  export interface KuroshiroOptions {
    to?: string;
    mode?: string;
    romajiSystem?: string;
  }

  export default class Kuroshiro {
    constructor();
    init(analyzer: any): Promise<Kuroshiro>;
    convert(str: string, options?: KuroshiroOptions): Promise<string>;
  }
}

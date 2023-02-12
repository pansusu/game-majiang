import { readFileSync } from 'fs'
import path from 'path'

export default class Word {
    words: string[] = [];

    constructor() {
        const data = readFileSync(path.resolve() + '/src/assets/words.txt', 'utf-8')
        this.words = data.toString().split('\n');
    }

    getWord(): [string, string] {
        const w_index = Math.floor(Math.random() * this.words.length);
        const [first, last] = this.words[w_index].split('——');
        return [first, last];
    }
}
import Mj from "./mj.js";

export default class Pan {
    isVin: boolean | undefined;
    myMj: Mj[] = [];
    hadPeng: Mj[] = []

    constructor() {
        for (let i = 0; i < 13; i++) {
            this.myMj.push(new Mj());
        }
    }

    disCard(mjs: Mj[]) {
        mjs.forEach(item => {
            console.log("出牌：", item);
            const index = this.myMj.findIndex(m => m.name == item.name)
            this.myMj.splice(index, 1);
        })
    }

    addCard() {
        if (this.myMj.length > 14) {
            return
        }
        this.myMj.push(new Mj())
    }

    isWin() {

    }
}
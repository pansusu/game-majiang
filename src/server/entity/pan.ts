import { category_pan, sort_pan } from "../../infra/utils/panUtils.js";
import Mj from "./mj.js";

export default class Pan {
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

    huPai() {
        const category = sort_pan(this.myMj)

        const jiang: Mj[] | null = this.hasOnParsJiangDetail(category)

        if (!jiang) {
            return
        }
        const remove_jiang_data = category.filter(item => item.typeName != jiang[0].typeName)

        // TODO
        // 可以先判断连续的

    }

    hasShunZi() {
        const a = [
            [
                { typeName: "a" },
                { typeName: "b" },
            ],
            [
                { typeName: "1" },
                { typeName: "2" },
                { typeName: "2" },
            ],
        ]
    }

    hasOnParsJiangDetail(category: Mj[]): Mj[] | null {
        const repeat = new Map<string, Mj[]>();

        category.forEach((item) => {
            if (repeat.has(item.typeName)) {
                repeat.get(item.typeName)?.push(item);
            } else {
                repeat.set(item.typeName, [item])
            }
        })

        const repeat_mj = Array.from(repeat.values()).filter(c => c.length == 2)
        const repeat_len = repeat_mj.length
        if (repeat_len == 1) {
            return repeat_mj[0]
        } else {
            return null
        }
    }

    hasOnParsJiang() {
        const repeat = new Map<string, number>()

        this.myMj.forEach(item => {
            let plus = (repeat.get(item.typeName) || 0) + 1
            repeat.set(item.typeName, plus)
        })

        const len = Array.from(repeat.values()).filter(c => c == 2).length;
        return len == 2
    }
}
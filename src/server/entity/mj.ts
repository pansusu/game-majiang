const typeNames = [
    '万', '条', '筒'
]

export default class Mj {
    name: string;
    type: number; //1 万  //2 条  //3 筒
    typeName: string;
    num: number;
    img?: string;

    constructor() {
        const type = Math.floor(Math.random() * 10) % 3
        const num = Math.floor(Math.random() * 10) % 9 + 1
        this.type = type
        this.num = num
        this.typeName = typeNames[type]
        this.name = String(num + this.typeName)
    }

    randomMj() {

    }
}
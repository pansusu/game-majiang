import Pan from "../entity/pan.js";

export default class PlayerVo {
    uname: string
    isAlive: boolean
    offline: boolean = false
    roomNumber: string
    status: string
    remaining_mj: number;
    pan: Pan;
}
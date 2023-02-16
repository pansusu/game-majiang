import Pan from "../entity/pan.js";

export default class PlayerVo {
    uname: string = "";
    offline: boolean = false
    roomNumber: string = "";
    status: string = "";
    remaining_mj: number = 0;
    pan: Pan | null = null;
}
import { Socket } from "socket.io";
import Room from "./room.js";
import PlayerVo from "../vo/playerVo.js";
import { ReflectType } from "../common.js"
import Pan from "./pan.js";
import Mj from "./mj.js";


export default class Player {
    uname: string
    password: string
    offline: boolean = false
    roomNumber: string = ""
    socket: Socket
    pan: Pan | null = null;
    status: string = ""  //碰 杠 胡

    constructor(uname: string, password: string, socket: Socket) {
        this.uname = uname
        this.password = password
        this.socket = socket
    }

    joinRoom(room: Room): void {
        room.addPlayer(this)
    }

    leaveRoom(): void {
        this.roomNumber = ""
        this.pan = null
    }

    initPan(pan: Pan): void {
        this.pan = pan
    }

    addCard() {
        this.pan?.addCard()
    }

    discard(mjs: Mj[]) {
        this.pan?.disCard(mjs)
    }

    peng(mj: Mj) {
        for (let i = 0; i <= 2; i++) {
            this.pan?.hadPeng?.push(mj)
            console.log(mj);
        }
    }
    gang(mj: Mj) {
        // 记录分数
        // 进牌
        this.addCard()
    }

    isWin() {
        this.pan?.huPai()
    }

    show(status?: string): PlayerVo {
        const pvo: PlayerVo = ReflectType.convert(PlayerVo, this)
        return pvo
    }
}
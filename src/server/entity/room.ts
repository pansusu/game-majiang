import RoomVo from "../vo/roomVo.js";
import Cons from "./constants.js";
import Pan from "./pan.js";
import Player from "./player.js";
import Result from "./result.js";
import { ReflectType } from "../common.js";
import { PLAYER_STATUS } from "../../infra/enum/global.js";

import PlayerVo from "../vo/playerVo.js";
import Mj from "./mj.js";
import OtherPlayer from "../vo/otherPlayer.js";

const MAX_PLAYER_NUM = 4
const COUNT_DOWN = 10

export default class Room {
    homePlayers: Array<Player> = [];
    roomNumber: string;
    roomIsAlive: boolean = true;
    status: string = Cons.STATUS.READY;
    countDown: number = 0;
    currentPlayer: string;
    currentMj: Mj[];
    timer: NodeJS.Timer

    constructor() {
        this.roomNumber = Math.floor(Math.random() * 10000).toString();
    }

    addPlayer(player: Player): void {
        this.homePlayers.push(player);
        player.roomNumber = this.roomNumber
    }

    joinRoom(player: Player): void {
        if (this.isFull()) {
            player.socket.emit(Cons.MSG.JOIN_ROOM, new Result().error("房间人满了！"))
            return
        }
        this.addPlayer(player);
        player.socket.emit(Cons.MSG.JOIN_ROOM, new Result().success())
        this.sendRoomInfoToAllPlayers()
    }


    isFull(): boolean {
        return this.homePlayers.length == MAX_PLAYER_NUM
    }

    // 设置当前哪个玩家的状态
    setState(uname: string, state: PLAYER_STATUS): void {
        this.homePlayers.forEach((player: Player) => {
            if (player.uname == uname) {
                player.status = state
            } else {
                player.status = ""
            }
        })
    }

    /**
     * 群发送房间数据到前端
     */
    sendRoomInfoToAllPlayers(): void {
        console.log("start-sendRoomInfoToAllPlayers")
        const roomInfo = this.getSendRoomInfo()
        this.homePlayers.forEach(pl => {
            pl.socket.emit(Cons.MSG.ROOM_INFO, roomInfo)
            const pvo: PlayerVo = ReflectType.convert(PlayerVo, pl)
            console.log("pov:", pvo.uname);
            pl.socket.emit(Cons.MSG.USER_INFO, pvo)
        })
        console.log("end-sendRoomInfoToAllPlayers")
    }

    // 实时倒计时推送
    sendCountDownToAllPlayers() {
        this.homePlayers.forEach(pl => {
            pl.socket.emit(Cons.MSG.ROOM_INFO_COUNT_DOWN, this.countDown)
        })
    }

    // 打牌倒计时
    sendTimeCountDown() {
        let count = COUNT_DOWN
        this.timer = setInterval(() => {
            count = count - 1
            this.countDown = count
            if (count <= 0) {
                this.clearTimeCountDown()
                this.distribute_MJ()
                return
            }
            this.sendCountDownToAllPlayers()
        }, 1000)
    }

    clearTimeCountDown() {
        clearInterval(this.timer)
        this.timer = null
        this.countDown = 0
        this.sendCountDownToAllPlayers()
    }

    // 发牌操作：
    distribute_MJ() {
        const currentPlayerIndex = this.homePlayers.findIndex((item) => item.uname == this.currentPlayer)
        console.log("当前人:", currentPlayerIndex);
        if (currentPlayerIndex >= 0) {
            const nextPlayer = this.homePlayers[(currentPlayerIndex + 1) % this.homePlayers.length]
            console.log("发牌给：", nextPlayer.uname);
            this.distribute_action(nextPlayer)
            this.sendRoomInfoToAllPlayers();
        }
    }

    distribute_action(player: Player) {
        player.addCard();
        this.setCurrentPlayer(player.uname)
        this.setState(player.uname, PLAYER_STATUS.Discard);
    }

    // 当前轮到谁出牌
    setCurrentPlayer(player: string) {
        this.currentPlayer = player
    }
    // 当前轮到谁出牌
    setCurrentMj(mj: Mj[]) {
        this.currentMj = mj
    }

    /**
     *  页面需要展示的内容
     * @returns 
     */
    getSendRoomInfo(): RoomVo {
        const roomVo: RoomVo = ReflectType.convert(RoomVo, this)
        roomVo.playersAll = this.homePlayers.map((player) => {
            const c = ReflectType.convert(OtherPlayer, player) as OtherPlayer
            c.remaining_mj = player?.pan?.myMj.length || 0
            return c
        })
        return roomVo
    }

    /**
    * 游戏开始
    */
    start(player?: Player): void {
        if (this.homePlayers.length != MAX_PLAYER_NUM) {
            console.log("some players are not already！")
        }
        this.status = Cons.STATUS.RUNNING
        // shuffle(this.roles) //角色打乱
        this.homePlayers.forEach(p => {
            p.initPan(new Pan());
        })
        // 给当前人发牌
        this.distribute_action(player)
        this.sendRoomInfoToAllPlayers();
    }

    /**
     *处理出牌操作
     * @param {string} uname
     * @param {Mj[]} discardMjs
     * @memberof Room
     */
    deal_discard(uname: string, discardMjs: Mj[]) {
        this.setCurrentPlayer(uname)
        console.log("出牌人:", uname);
        console.log("出的牌:", discardMjs);

        const index = this.homePlayers.findIndex(pl => pl.uname == uname)
        const roomPlayer = this.homePlayers[index]

        roomPlayer.discard(discardMjs)
        this.setCurrentMj(discardMjs)
        this.sendRoomInfoToAllPlayers()

        if (discardMjs.length == 1) {
            // chu
            this.sendTimeCountDown()
            return
        }
        if (discardMjs.length == 2) {
            // peng
            this.clearTimeCountDown()
            roomPlayer.peng(discardMjs[0]);
            this.setCurrentPlayer(uname)
            this.setState(uname, PLAYER_STATUS.Peng);
            this.sendRoomInfoToAllPlayers()
        }
        if (discardMjs.length == 3) {
            // gang
            this.clearTimeCountDown()
            roomPlayer.gang(discardMjs[0])
            this.setCurrentPlayer(uname)
            this.setState(uname, PLAYER_STATUS.Gang);
            this.sendRoomInfoToAllPlayers()
        }
    }

    /**
    * 重连
    * @param player 
    */
    reconnect(player: Player) {
        const index = this.homePlayers.findIndex(pl => pl.uname == player.uname)
        if (index !== -1) {
            player.offline = false
            this.homePlayers[index] = player
            player.socket.emit(Cons.MSG.RECONNECT, { code: 0, msg: 'success' });
            this.sendRoomInfoToAllPlayers()
        } else {
            player.socket.emit(Cons.MSG.RECONNECT, { code: -1, msg: '重连失败！' });
        }
    }
}
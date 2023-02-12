import Player from "./player.js";
import Word from "./word.js";
import Cons from "./constants.js";
import Role from "./role.js";
import Result from "./result.js";
import { ReflectType, shuffle } from '../common.js'
import RoomVo from "../vo/roomVo.js";

export default class Room {
    homePlayers: Array<Player> = [];
    roomNumber: string = "";
    roomIsAlive: boolean = true;
    status: string = Cons.STATUS.READY;
    isVote: boolean = false;
    roles: Array<Role> = [];
    votePools: Map<string, number> = new Map<string, number>(); //谁被投票多少
    votedPlayers: Array<string> = []; //谁投票了


    constructor(roleInfo: string) {
        this.roomNumber = Math.floor(Math.random() * 10000).toString();
        this.initRole(roleInfo);
    }

    /**
     *  页面需要展示的内容
     * @returns 
     */
    getSendRoomInfo(): RoomVo {
        const roomVo: RoomVo = ReflectType.convert(RoomVo, this)
        const homePlayers = this.homePlayers.map(player => player.show(this.status))
        // const { uname, words, isAlive, role, roomNumber, offline } = player
        // if (this.status == Cons.STATUS.ENDED) {
        //     return { uname, words, isAlive, role, roomNumber, offline }
        // }
        // if (isAlive) {
        //     return { uname, isAlive, roomNumber, offline }
        // } else {
        //     return { uname, isAlive, role, roomNumber, offline }
        // }
        roomVo.playersAll = homePlayers
        return roomVo
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

    /**
     * 游戏开始
     * @param word 所有词汇
     */
    start(word: Word): void {
        if (this.homePlayers.length != this.roles.length) {
            console.log("some players are not already！")
        }
        this.status = Cons.STATUS.RUNNING
        shuffle(this.roles) //角色打乱
        this.votePools.clear()
        this.votedPlayers.length = 0
        this.initPlayer(word)
        this.sendRoomInfoToAllPlayers()
    }

    /**
     * 启动投票
     * @param me 启动投票的人
     * @returns 
     */
    openVote(me: Player) {
        if (this.status != Cons.STATUS.RUNNING) {
            me.socket.emit(Cons.MSG.MESSAGE, new Result().error("游戏未开始！"))
            return
        }
        this.isVote = true
        this.votePools.clear()
        this.votedPlayers.length = 0
        this.sendRoomInfoToAllPlayers()
    }

    /**
     * 主动关闭投票
     */
    closeVote() {
        this.handleVoted()
        this.sendRoomInfoToAllPlayers()
    }

    /**
     * 投票
     * @param fromPlayer 谁投
     * @param toPlayer 投谁
     * @returns 
     */
    voteBetween(fromPlayer: Player, toPlayer: Player): void {
        try {
            if (!toPlayer.isAlive) {
                console.log("he is died")
                fromPlayer.socket.emit(Cons.MSG.MESSAGE, new Result().error("投票失败！您投票的人已经死了！"))
                return
            }
            if (this.votePools.has(toPlayer.uname)) {
                let count = this.votePools.get(toPlayer.uname)
                this.votePools.set(toPlayer.uname, ++count)
            } else {
                this.votePools.set(toPlayer.uname, 1)
            }
            this.votedPlayers.push(fromPlayer.uname)
            if (this.isVoteEnd()) {
                this.handleVoted()
            }
            this.sendRoomInfoToAllPlayers()
        } catch (err) {
            console.error(err)
            fromPlayer.socket.emit(Cons.MSG.MESSAGE, new Result().error("投票失败！"))
        }
    }

    handleVoted() {
        this.isVote = false
        const player = this.whoIsDied()
        if (player) {
            player.isAlive = false
        }
        if (this.isGameOver()) {
            this.status = Cons.STATUS.ENDED
        }
    }

    /**
     * 活着的玩家 跟已投票数一致，证明投票结束
     * @returns 是否投票结束
     */
    isVoteEnd() {
        const alivePlayers = this.homePlayers.filter((pl: Player) => pl.isAlive).length
        let voteTotal = 0
        this.votePools.forEach((value, key) => {
            voteTotal += value
        })
        return voteTotal >= alivePlayers
    }

    /**
     * 一定会票出一个人，平票随机踢出
     * @returns uname
     */
    whoIsDied(): Player | null {
        let max = 0
        let uname = ''
        console.log(this.votePools)
        if (this.votePools.size <= 0) {
            return null
        }
        this.votePools.forEach((value, key) => {
            if (value > max) {
                max = value
                uname = key
            }
        })
        console.log("out:", uname)
        const user: Array<Player> = this.homePlayers.filter((player: Player) => player.uname == uname)
        return user.length > 0 ? user[0] : null
    }

    /**
     * 1、平民都死了 卧底赢
     * 2、卧底都死了 平民赢
     * @returns 游戏是否结束
     */
    isGameOver(): boolean {
        if (this.goodPersonWin()) {
            this.homePlayers.forEach(pl => { pl.socket.emit(Cons.MSG.GAME_OVER, '平民胜利！') })
            return true
        }
        if (this.badPersonWin()) {
            this.homePlayers.forEach(pl => { pl.socket.emit(Cons.MSG.GAME_OVER, '卧底胜利！') })
            return true
        }
        return false
    }

    //所有卧底都死了
    goodPersonWin(): boolean {
        return this.homePlayers.filter(pl => pl.role?.roleName === Cons.ROLE.UNDERCOVER).every(pl => !pl.isAlive)
    }

    //所有平民都死了
    badPersonWin(): boolean {
        return this.homePlayers.filter(pl => pl.role?.roleName === Cons.ROLE.CIVILIAN).every(pl => !pl.isAlive)
    }

    isFull(): boolean {
        return this.homePlayers.length == this.roles.length
    }

    /**
     * 群发送房间数据到前端
     */
    sendRoomInfoToAllPlayers(): void {
        console.log("start-sendRoomInfoToAllPlayers")
        const a = this.getSendRoomInfo()
        console.log(a)
        this.homePlayers.forEach(pl => {
            const { uname, words, isAlive, role, roomNumber } = pl
            pl.socket.emit(Cons.MSG.ROOM_INFO, a)
            pl.socket.emit(Cons.MSG.USER_INFO, { uname, words, isAlive, role, roomNumber })
        })
        console.log("end-sendRoomInfoToAllPlayers")
    }

    /**
     * 发送消息给某人
     * @param player 
     */
    sendRoomByPlayer(player: Player): void {
        const a = this.getSendRoomInfo()
        console.log('sendRoomByPlayer...')
        console.log(a)
        console.log('sendRoomByPlayer...')
        player.socket.emit(Cons.MSG.ROOM_INFO, a)
    }



    /**
     * 1、角色分配词汇
     * 2、玩家复活
     * @param word 所有词汇
     * @returns 
     */
    private initPlayer(word: Word) {
        const [first, last] = word.getWord();
        console.log("===word==========")
        console.log(first, last)
        if (!first || !last) {
            this.homePlayers.forEach(pl => {
                pl.socket.emit(Cons.MSG.MESSAGE, new Result().error("初始关键词失败！"))
            })
            return
        }
        this.homePlayers.forEach((player, index) => {
            let role: Role = this.roles[index]
            if (role.roleName === Cons.ROLE.CIVILIAN) {
                player.words = first
            }
            if (role.roleName === Cons.ROLE.UNDERCOVER) {
                player.words = last
            }
            if (role.roleName === Cons.ROLE.BLANK) {
                player.words = Cons.ROLE.BLANK
            }
            player.isAlive = true
            player.setRole(role)
        })
    }

    /**
     * 1、根据客户端所选人数，分配对应角色
     * 2、角色洗牌，防止每次顺序都一样
     * @param roleInfo 3-2-1 对应平民-卧底-白板 个数
     */
    private initRole(roleInfo: string) {
        const [civilian, undercover, blank] = roleInfo.split('-')
        for (let i = 0; i < parseInt(civilian); i++) {
            this.roles.push(new Role(Cons.ROLE.CIVILIAN))
        }
        for (let i = 0; i < parseInt(undercover); i++) {
            this.roles.push(new Role(Cons.ROLE.UNDERCOVER))
        }
        for (let i = 0; i < parseInt(blank); i++) {
            this.roles.push(new Role(Cons.ROLE.BLANK))
        }
        shuffle(this.roles)
    }

    /**
     * 退出
     * @param uname 用户名
     */
    removePlayer(uname: string) {
        const index = this.homePlayers.findIndex(pl => pl.uname === uname)
        if (index !== -1) {
            this.homePlayers.splice(index, 1)
            this.sendRoomInfoToAllPlayers()
        }
    }

    /**
     * 掉线
     * @param uname 用户名
     */
    offlinePlayer(uname: string) {
        const index = this.homePlayers.findIndex(pl => pl.uname === uname)
        if (index !== -1) {
            const player: Player = this.homePlayers[index]
            player.offline = true
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
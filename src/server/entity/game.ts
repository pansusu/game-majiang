import { Socket } from "socket.io";
import Player from "./player.js";
import Room from './room.js'
import RoomVo from "../vo/roomVo.js";
import Cons from "./constants.js";
import Word from "./word.js";
import Result from "./result.js";
import { ReflectType } from "../common.js"
import Mj from "./mj.js";
import { PLAYER_STATUS } from "../../infra/enum/global.js";
import PlayerVo from "../vo/playerVo.js";

export default class Game {

    players: Map<string, Player> = new Map<string, Player>();
    rooms: Map<string, Room> = new Map<string, Room>();
    words: Word;

    constructor() {
        // this.words = new Word();
    }

    isInTheGameRoom(player: Player) {
        if (player.roomNumber) {
            player.socket.emit(Cons.MSG.GAME_START_IN_ROOM, player.roomNumber);
            return true
        }
        return false
    }



    createRoom(uname: string) {
        console.log("创建房间：", uname);
        const player: Player = this.players.get(uname)
        if (this.isInTheGameRoom(player)) {
            return
        }

        const room = new Room()
        room.addPlayer(player);
        this.rooms.set(room.roomNumber, room);
        player.socket.emit(Cons.MSG.CREATE_ROOM, { code: 0, msg: 'success' });
        this.showAllRooms()
    }

    joinRoom(socket: Socket, uname: string, roomNumber: string) {
        console.log("加入房间：", uname, '+', roomNumber);
        if (!uname) {
            return
        }
        const player = this.players.get(uname)
        if (this.isInTheGameRoom(player)) {
            return
        }
        const room: Room = this.rooms.get(roomNumber)
        if (!room) {
            socket.emit(Cons.MSG.MESSAGE, new Result().error("房间不存在!"))
            return
        }
        room.joinRoom(player);
        this.showAllRooms()
    }

    delete_room_force(uname: string) {
        if (!uname) {
            return
        }
        const player = this.players.get(uname)
        const roomNumber = player.roomNumber
        const room: Room = this.rooms.get(roomNumber)
        this.delete_room(player, room)
    }

    delete_room(player: Player, room: Room) {
        console.log("删除房间：", player.uname);

        // 房间里的人都除掉房间号
        room.homePlayers.forEach(p => {
            const game_player = this.players.get(p.uname)
            if (game_player) {
                game_player.roomNumber = ""
                game_player.socket.emit(Cons.MSG.DELETE_ROOM)
            }
        })
        const a = this.rooms.delete(room.roomNumber)
        if (!a) {
            player.socket.emit(Cons.MSG.MESSAGE, new Result().error("删除房间失败!"))
        }
        this.showAllRooms()
    }

    delete_room_force_by_room({ uname, roomNumber }) {
        console.log("删除房间：", uname, ':', roomNumber);
        if (!uname || !roomNumber) {
            return
        }
        const player = this.players.get(uname)
        if (roomNumber !== player.roomNumber) {
            player.socket.emit(Cons.MSG.MESSAGE, new Result().error("只有房主能删除!"))
            return
        }
        const room: Room = this.rooms.get(roomNumber)
        const room_master = room.homePlayers[0]
        if (uname !== room_master.uname) {
            player.socket.emit(Cons.MSG.MESSAGE, new Result().error("只有房主能删除!"))
            return
        }

        this.delete_room(player, room)
    }

    gameStart(uname: string): void {
        const player = this.players.get(uname)
        const room: Room = this.rooms.get(player.roomNumber)
        room.setCurrentPlayer(uname)
        room.start(player)
    }
    gameStartByRoom(roomNumber: string): void {
        const room: Room = this.rooms.get(roomNumber)
        room.start()
    }

    login(socket: Socket, uname: string, password: string): void {
        if (!uname || !password) {
            socket.emit(Cons.MSG.LOGIN, { code: -1, msg: '请输入用户名密码' });
            return
        }
        const existingPlayer = this.players.get(uname)

        if (!existingPlayer) {
            const player = new Player(uname, password, socket)
            this.players.set(uname, player);
            socket.emit(Cons.MSG.LOGIN, { code: 0, msg: 'success' });
            return
        }

        if (existingPlayer.password !== password) {
            socket.emit(Cons.MSG.LOGIN, { code: -1, msg: '用户已存在！' });
            return
        }
        if (existingPlayer.password === password) {
            existingPlayer.socket = socket
            if (existingPlayer.roomNumber) {
                const room: Room = this.rooms.get(existingPlayer.roomNumber)
                room?.reconnect(existingPlayer)
            } else {
                socket.emit(Cons.MSG.LOGIN, { code: 0, msg: 'success' });
            }
        }
    }

    loadCurrentRoom(socket: Socket, uname: string, password: string): void {
        const player: Player = this.players.get(uname)
        if (!this.isLoggedIn(socket, player, password)) {
            return
        }

        const room: Room = this.rooms.get(player.roomNumber)
        if (!room) {
            player.socket.emit(Cons.MSG.MESSAGE, new Result().error("用户不存在!"))
            return
        }
        player.offline = false
        // room.sendRoomByPlayer(player)
        room.sendRoomInfoToAllPlayers()

    }

    /**
     * 某个用户接收到的
     * @param socket 
     */
    showRooms(socket: Socket) {
        const roomsInfo = this.setRoomsInfo()
        if (roomsInfo) {
            socket.emit(Cons.MSG.SHOW_ROOMS, roomsInfo)
        }
    }
    showPlayers(socket: Socket) {
        const allPlayer = this.setAllUserInfo()
        if (allPlayer) {
            socket.emit(Cons.MSG.SHOW_PLAYERS, allPlayer)
        }
    }

    showAllPlayer() {
        const allPlayer = this.setAllUserInfo()
        console.log("allPlayer:", allPlayer);
        this.players.forEach((player: Player) => {
            player.socket.emit(Cons.MSG.SHOW_PLAYERS, allPlayer)
        })
    }

    setAllUserInfo() {
        const playersVo: PlayerVo[] = []
        this.players.forEach((p: Player) => {
            const a: PlayerVo = ReflectType.convert(PlayerVo, p)
            playersVo.push(a)
        })
        return playersVo
    }

    /**
     * 告诉所有用户
     */
    showAllRooms() {
        const roomsInfo = this.setRoomsInfo()
        this.players.forEach((player: Player) => {
            player.socket.emit(Cons.MSG.SHOW_ROOMS, roomsInfo)
        })
        // this.showAllPlayer();
    }

    setRoomsInfo() {
        const roomsInfo: RoomVo[] = []
        this.rooms.forEach((room: Room) => {
            const a: RoomVo = ReflectType.convert(RoomVo, room)
            a.playersAll = room.homePlayers.map(player => player.show(room.status))
            a.players = room.homePlayers.length
            roomsInfo.push(a)
        })
        return roomsInfo
    }

    playerOffline(socket: Socket) {
        const players = Array.from(this.players)
        const index = players.findIndex(([key, player]) => player.socket.id === socket.id)
        if (index >= 0) {
            const [uname, player]: [string, Player] = players[index]
            const room: Room = this.rooms.get(player.roomNumber)
            if (!room) {
                return
            }
            room.homePlayers.forEach(player => {
                player.socket.emit(Cons.MSG.MESSAGE, new Result().error(uname + "已逃走！！！！游戏结束"))
            })

            setTimeout(() => {
                this.delete_room_force(uname)
                const a = this.players.delete(uname)
                console.log("处理掉用户:", uname, ':', a)
            }, 2000)
        }
    }

    // removePlayer(socket: Socket) {
    //     const players = Array.from(this.players)
    //     const index = players.findIndex(([key, player]) => player.socket.id === socket.id)

    //     if (index >= 0) {
    //         const [uname, player]: [string, Player] = players[index]
    //         console.log("removePlayer:" + uname)
    //         this.players.delete(uname)
    //         const room: Room = this.rooms.get(player.roomNumber)
    //         room?.removePlayer(uname)
    //     }
    // }

    isLoggedIn(socket: Socket, player: Player, password: string): boolean {
        if (player && player.password == password) {
            player.socket = socket
            return true
        }
        socket.emit(Cons.MSG.NO_LOGIN, new Result().error("用户不存在!"))
        return false
    }

    isLoggedInByUserName(socket: Socket, uname: string) {
        if (!this.players.has(uname)) {
            socket.emit(Cons.MSG.NO_LOGIN, new Result().error("用户不存在!"))
        }
    }

    // 出牌操作
    player_discard_mj(uname: string, discardMjs: Mj[]) {
        const player: Player = this.players.get(uname)
        const room: Room = this.rooms.get(player.roomNumber)

        room.deal_discard(uname, discardMjs)
    }
}
// TODO:

// 1、位置分配bug，右边的人的视角应该看到在左边
// 3、碰的问题
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

export default class Game {

    players: Map<string, Player> = new Map<string, Player>();
    rooms: Map<string, Room> = new Map<string, Room>();
    words: Word;

    constructor() {
        // this.words = new Word();
    }

    createRoom(uname: string) {
        console.log(uname);
        const room = new Room()
        const player: Player = this.players.get(uname)
        room.addPlayer(player);
        this.rooms.set(room.roomNumber, room);
        player.socket.emit(Cons.MSG.CREATE_ROOM, { code: 0, msg: 'success' });
        this.showAllRooms()
    }

    joinRoom(socket: Socket, uname: string, roomNumber: string) {
        console.log(uname, '+', roomNumber);
        if (!uname) {
            return
        }
        const player = this.players.get(uname)
        const room: Room = this.rooms.get(roomNumber)
        if (!room) {
            socket.emit(Cons.MSG.MESSAGE, new Result().error("房间不存在!"))
            return
        }
        room.joinRoom(player);
        this.showAllRooms()
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
        console.log("login====")

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

    /**
     * 告诉所有用户
     */
    showAllRooms() {
        const roomsInfo = this.setRoomsInfo()
        if (roomsInfo) {
            this.players.forEach((player: Player) => {
                player.socket.emit(Cons.MSG.SHOW_ROOMS, roomsInfo)
            })
        }
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

    // playerOffline(socket: Socket) {
    //     const players = Array.from(this.players)
    //     const index = players.findIndex(([key, player]) => player.socket.id === socket.id)
    //     if (index >= 0) {
    //         const [uname, player]: [string, Player] = players[index]
    //         const room: Room = this.rooms.get(player.roomNumber)
    //         if (!room) {
    //             return
    //         }
    //         if (room.status === Cons.STATUS.RUNNING) {
    //             room.offlinePlayer(uname)
    //         } else {
    //             room.removePlayer(uname)
    //         }
    //         socket.emit(Cons.MSG.USER_LEAVE)
    //     }
    // }

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
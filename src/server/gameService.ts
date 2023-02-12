import Mj from '@/server/entity/mj';
import { Server, Socket } from "socket.io";
import { Server as HttpServer } from 'http';
import Game from './entity/game.js';
import Cons from './entity/constants.js';


export default class GameSocketService {
    server: Server | undefined;
    game: Game | undefined;

    addHttpServer(httpServer: HttpServer) {
        console.log("GameSocketService.addHttpServer")
        this.game = new Game()
        this.server = new Server(httpServer)
        return this
    }

    listen() {
        this.server?.on('connection', (socket: Socket) => {
            console.log("GameSocketService.listen")
            this.listenAfterConnect(socket);
        })
        this.server?.on('disconnect', (socket: Socket) => {
            console.log("GameSocketService.close")
        })
        return this
    }

    listenAfterConnect(socket: Socket) {
        console.log(`player connected Socket Id:${socket.id}`)

        socket.on('disconnect', () => {
            console.log(`player disconnected Socket Id:${socket.id}`)
            // this.game?.playerOffline(socket)
        })

        socket.on(Cons.MSG.LOGIN, (uname: string, password: string) => {
            console.log(uname, password)
            this.game?.login(socket, uname, password,)
        })

        socket.on(Cons.MSG.IS_LOGIN, (uname: string) => {
            console.log(uname)
            this.game?.isLoggedInByUserName(socket, uname)
        })

        socket.on(Cons.MSG.SHOW_ROOMS, () => {
            this.game?.showRooms(socket)
        })

        socket.on(Cons.MSG.CREATE_ROOM, (uname) => {
            this.game?.createRoom(uname)
        })

        socket.on(Cons.MSG.JOIN_ROOM, (join: any) => {
            console.log(join)
            this.game?.joinRoom(socket, join.uname, join.roomNumber)
        })

        socket.on(Cons.MSG.ROOM_INFO, (uname: string, password: string) => {
            this.game?.loadCurrentRoom(socket, uname, password)
        })

        socket.on(Cons.MSG.GAME_START, (uname: string) => {
            console.log(uname)
            this.game?.gameStart(uname)
        })

        socket.on('message', (msg: string) => {
            console.log(msg)
        })

        // 出牌
        socket.on(Cons.MSG.MJ_DISCARD, ({ uname, mjs }: { uname: string, mjs: Mj[] }) => {
            console.log(uname, mjs)
            if (mjs.length <= 0) {
                return
            }
            this.game?.player_discard_mj(uname, mjs)
        })
    }
}
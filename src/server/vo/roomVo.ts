import Mj from '../entity/mj.js';
import OtherPlayer from './otherPlayer.js';
import PlayerVo from "./playerVo";


export default class RoomVo {
    roomNumber: string = "";
    players: number = 0;
    playersAll: Array<OtherPlayer> = [];
    roomIsAlive: boolean = true;
    countDown: number = 0;
    currentPlayer: string = "";
    currentMj: Mj[] = [];
    discardedMj: Mj[] = [];
    status: string = "";
    timer: NodeJS.Timer | null = null;
}
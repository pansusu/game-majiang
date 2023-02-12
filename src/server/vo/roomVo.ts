import Mj from '../entity/mj.js';
import OtherPlayer from './otherPlayer.js';
import PlayerVo from "./playerVo";


export default class RoomVo {
    roomNumber: string;
    roomIsAlive: boolean;
    status: string;
    players: number;
    countDown: number;
    playersAll: Array<OtherPlayer> = [];
    currentPlayer: string;
    currentMj: Mj[];
}
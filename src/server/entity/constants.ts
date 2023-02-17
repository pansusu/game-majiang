const Cons = Object.freeze({
    MSG: {
        LOGIN: '1',
        IS_LOGIN: '1-1',
        CREATE_ROOM: '2',
        JOIN_ROOM: '3',
        MESSAGE: '4',
        ROOM_INFO: '5',
        GAME_START: '6',
        GAME_OVER: '7',
        USER_INFO: '8',
        OPEN_VOTE: '9',
        VOTE_PLAYER: '10',
        CLOSE_VOTE: '11',
        SHOW_ROOMS: '12',
        SHOW_PLAYERS: '12-1',
        RECONNECT: '13',
        NO_LOGIN: '14',
        USER_LEAVE: '15',
        MJ_DISCARD: '16',
        MJ_GET_NEW: '17',
        ROOM_INFO_COUNT_DOWN: '18',
        GAME_START_IN_ROOM: '19',
        DELETE_ROOM: '20',
        DELETE_ROOM_BY_ROOM_NUM: '21',
        KEEP_ONLINE: '22',
    },
    STATUS: {
        READY: '准备中',
        RUNNING: '游戏中',
        ENDED: '游戏结束',
    }
})

export default Cons
import express from 'express';
import GameSocketService from './gameService.js';

const port = 3008
const server = express().listen(port, () => {
    console.log('Server started on port :' + port);
    new GameSocketService().addHttpServer(server).listen()
})
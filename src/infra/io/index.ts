import io, { Socket } from 'socket.io-client'

export default {
    install: (app: any, { connection, options }: { connection: string, options?: any }) => {
        /*  our code for the plugin goes here 
            app is the result of createApp()
            options is user options passed in        
        */
        const socket: Socket = io(connection, options)
        app.config.globalProperties.$socket = socket
        app.provide('socket', socket)
    }
}
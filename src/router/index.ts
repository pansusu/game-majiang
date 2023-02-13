import Cons from '@/server/entity/constants';
import type { App } from 'vue';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { constantRoutes } from './routers';
import type { Socket } from 'socket.io-client'

const { VITE_HASH_ROUTE = 'N', VITE_BASE_URL } = import.meta.env;
export const router = createRouter({
    history: VITE_HASH_ROUTE === 'Y' ? createWebHashHistory(VITE_BASE_URL) : createWebHistory(VITE_BASE_URL),
    routes: constantRoutes,
});

export async function setupRouter(app: App) {
    const socket: Socket = app.config.globalProperties.$socket
    socket.on(Cons.MSG.NO_LOGIN, (data) => {
        const { code } = data
        console.log("nologin:", data)
        if (code != 0) {
            router.replace({ name: 'login', })
        }
    })

    socket.on(Cons.MSG.GAME_START_IN_ROOM, (data) => {
        console.log("in the room：", data);
        router.replace({ path: '/game/room', })
    })

    socket.on(Cons.MSG.DELETE_ROOM, (data) => {
        console.log("in the room：", data);
        router.replace({ path: '/game/home', })
    })

    router.beforeEach((to, from, next) => {
        console.log(to)
        if (to.name == '404') {
            // router.replace({ name: 'login', })
            next({ name: 'login' })
        }
        next()
    })
    app.use(router);
    await router.isReady();
}

export * from './routers';
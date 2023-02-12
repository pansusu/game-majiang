import { Room } from './../../../node_modules/socket.io-adapter/dist/index.d';

/** 根路由: / */
export const ROOT_ROUTE: AuthRoute.Route = {
    name: 'root',
    path: '/',
    redirect: "/game/login",
    meta: {
        title: 'Root'
    }
};

export const constantRoutes: AuthRoute.Route[] = [
    ROOT_ROUTE,
    {
        name: '404',
        component: () => import("@/infra/layouts/BlankLayout/index.vue"),
        meta: {
            title: '未找到',
        },
        children: [
            {
                path: '/404',
                component: () => import("@/views/_builtin/404/index.vue"),
            }
        ]
    },
    {
        name: '游戏',
        component: () => import("@/infra/layouts/BlankLayout/index.vue"),
        meta: {
            title: '登录',
        },
        path: '/game',
        children: [
            {
                name: 'login',
                path: '/game/login',
                component: () => import("@/views/Login.vue"),
            },
            {
                path: '/game/home',
                component: () => import("@/views/Home.vue"),
            },
            {
                path: '/game/room',
                component: () => import("@/views/Room.vue"),
            },
        ]
    },
]
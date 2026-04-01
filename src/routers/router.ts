import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const modules = import.meta.glob('./modules/*.ts', { eager: true });

const routeModuleList: RouteRecordRaw[] = [];

Object.keys(modules).forEach(item => {
    Object.keys(modules[item] as object).forEach(key => {
        routeModuleList.push(...(modules[item] as any)[key]);
    });
});

// 创建实例
const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: { name: "login" }
    },
    {
        path: "/login",
        name: "login",
        component: () => import("@/components/views/Login/index.vue"),
        meta: {
            title: "登录配置"
        }
    },
    ...routeModuleList,
    {
        // 找不到路由重定向到404页面
        path: "/:pathMatch(.*)",
        redirect: { name: "404" }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    strict: false,
    // 切换页面，滚动到最顶部
    scrollBehavior: () => ({ left: 0, top: 0 })
});
export default router;

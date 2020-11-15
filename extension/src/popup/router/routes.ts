import { RouteRecordRaw } from "vue-router";
import NewRoom from "./pages/new-room.vue";

// TODO implement
const isRoomCreated = () => true;

const routes: RouteRecordRaw[] = [
    {
        name: "Popup home",
        path: "/",
        // redirect: true,
        beforeEnter(to, from, next) {
            if (isRoomCreated()) {
                next("/room");
            } else {
                next("/room/new");
            }
        },
        props: true,
    },
    {
        name: "new-room",
        path: "/new-room",
        component: NewRoom,
        props: true,
    },
];

export default routes;

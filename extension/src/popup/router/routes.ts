import { RouteRecordRaw } from "vue-router";
import NewRoom from "./pages/new-room.vue";

// TODO implement
const isRoomCreated = () => true;

const routes: RouteRecordRaw[] = [
    {
        name: "Popup home",
        path: "/",
        // redirect: true,
        redirect: (to) => {
            if (isRoomCreated()) {
                return "/room";
            } else {
                return "/room/new";
            }
        },
        props: true,
    },
    // {
    //     name: "new-room",
    //     path: "/room/new",
    //     component: NewRoom,
    //     props: true,
    // },
    {
        name: "current-room",
        path: "/room",
        component: NewRoom,
        props: true,
    },
];

export default routes;

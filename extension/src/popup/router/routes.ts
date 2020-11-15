import { RouteRecordRaw } from "vue-router";
import CurrentRoom from "./components/CurrentRoom.vue";
import NewRoom from "./components/NewRoom.vue";

// TODO implement
const isRoomCreated = () => false;

const routes: RouteRecordRaw[] = [
    {
        name: "Popup home",
        path: "/",
        // redirect: () => {
        //     if (isRoomCreated()) {
        //         return "/room";
        //     } else {
        //         return "/room/new";
        //     }
        // },
        component: NewRoom,
        props: true,
    },
    {
        name: "new-room",
        path: "/room/new",
        component: NewRoom,
        props: true,
    },
    {
        name: "current-room",
        path: "/room/:roomId",
        component: CurrentRoom,
        props: true,
    },
];

export default routes;

import { RouteRecordRaw } from "vue-router";
import CurrentRoom from "../components/CurrentRoom.vue";
import NewRoom from "../components/NewRoom.vue";
import RedirectToNewOrExistingRoom from "../components/RedirectToNewOrExistingRoom.vue";
import WatcherList from "../components/WatcherList.vue";

const routes: RouteRecordRaw[] = [
    {
        name: "Popup home",
        path: "/",
        // Unfortunately it's not really yet to have conditional redirect: functi
        // based on a state value (or I haven't found the trick)
        // so we use a custom comp for this
        component: RedirectToNewOrExistingRoom,
        props: true,
    },
    {
        name: "New room",
        path: "/room/new",
        component: NewRoom,
        props: true,
    },
    {
        name: "Current Room",
        path: "/room/:roomId",
        component: CurrentRoom,
        props: true,
    },
    {
        name: "Current room watchers",
        path: "/room/:roomId/watchers",
        component: WatcherList,
        props: true,
    },
];

export default routes;

import NewRoom from "./pages/new-room.vue";
import Popup from "./pages/popup.vue";

export default [
    {
        name: "popup",
        path: "/",
        component: Popup,
    },
    {
        name: "new-room",
        path: "/new-room",
        component: NewRoom,
        props: true,
    },
];

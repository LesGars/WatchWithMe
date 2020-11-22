import { Watcher } from "@/types";
import { getStorageItems } from "@/utils";
import { createApp, inject, reactive } from "vue";
import App from "./app.vue";
import router from "./router";

if (process.env.NODE_ENV === "development" && process.env.DEVTOOLS) {
    require("@/utils/dev-tools");
}

const vueApp = createApp(App);
vueApp.use(router);

export const stateSymbol = Symbol("state");

/**
 * The state models the "active" room only
 */
interface State {
    roomId: string | null;
    myWatcherId: string | null;
    roomOwnerId: string | null;
    watchers: Watcher[];
}

getStorageItems({
    roomId: null,
    myWatcherId: null,
    watchers: [],
    roomOwnerId: null,
}).then(({ roomId, myWatcherId, watchers, roomOwnerId }) => {
    const state = reactive({
        myWatcherId,
        roomId,
        watchers,
        roomOwnerId,
    } as State);
    vueApp.provide(stateSymbol, state);
    vueApp.mount("#app");
});

export const useState = (): State | undefined => inject(stateSymbol);

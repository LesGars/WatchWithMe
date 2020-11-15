import { getStorageItem } from "@/utils";
import { createApp, inject, reactive } from "vue";
import App from "./app.vue";
import router from "./router";

require("@/utils/config/webextension-polyfill");
require("@/utils/config/config");
require("@/utils/config/filters");

if (process.env.NODE_ENV === "development" && process.env.DEVTOOLS) {
    require("@/utils/dev-tools");
}

const vueApp = createApp(App);
vueApp.use(router);

export const stateSymbol = Symbol("state");

interface State {
    roomId: string | null;
}

getStorageItem("roomId", null).then((roomId: string | null) => {
    const state = reactive({
        roomId,
    } as State);
    vueApp.provide(stateSymbol, state);
    vueApp.mount("#app");
});
// router.isReady().then(() => vueApp.mount("#app"));

export const useState = (): State | undefined => inject(stateSymbol);

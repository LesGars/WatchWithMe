import { getSettings } from "@/utils";
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

getSettings("roomId").then((roomId: string | null) => {
    const state = reactive({
        roomId,
    });
    vueApp.provide(stateSymbol, state);
    vueApp.mount("#app");
});
// router.isReady().then(() => vueApp.mount("#app"));

export const useState = () => inject(stateSymbol);

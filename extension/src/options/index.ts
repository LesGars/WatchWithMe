import { createApp } from "vue";
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
router.isReady().then(() => vueApp.mount("#app"));

import { createApp } from "vue";
import App from "./app.vue";
import router from "./router";

if (process.env.NODE_ENV === "development" && process.env.DEVTOOLS) {
    require("@/utils/dev-tools");
}

const vueApp = createApp(App);
vueApp.use(router);
router.isReady().then(() => vueApp.mount("#app"));

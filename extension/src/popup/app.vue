<template>
    <div id="popup">
        <the-header></the-header>

        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheHeader from "./components/TheHeader.vue";

export default defineComponent({
    name: "App",
    components: {
        TheHeader,
    },
});
</script>

<style lang="scss">
body {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 0;
    margin: 0;
}
#popup {
    padding: 15px;
    text-align: center;
    color: #2c3e50;
    min-width: 200px;
    min-height: 200px;
}
</style>

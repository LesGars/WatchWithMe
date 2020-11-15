<template>
    <div id="popup">
        <h1>Watch With Me</h1>

        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

export default defineComponent({
    name: "App",
});
</script>

<style lang="scss" scoped>
body {
    width: 785px;
    height: 585px;
}

#popup {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
    width: 785px;
    height: 585px;
}
</style>

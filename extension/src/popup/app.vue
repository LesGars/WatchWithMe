<template>
    <div id="popup">
        <div class="header">Watch With Me</div>

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
#popup {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 30px;
    min-width: 300px;
    min-height: 300px;
}

.header {
    margin-bottom: 30px;
    font-size: 2rem;
    color: burlywood;
}
</style>

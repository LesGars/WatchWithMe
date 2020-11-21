<template>
    <div id="popup">
        <the-header></the-header>

        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from ".";
import TheHeader from "./components/TheHeader.vue";
import HelloWorld from "./components/HelloWorld.vue";

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

.header {
    margin-bottom: 30px;
    font-size: 2rem;
    color: burlywood;

    .wwm {
        display: flex;
        text-align: left;
    }
}

.logo,
.brand-name {
    display: inline-block;
    height: 25px;
}

.logo-image {
    height: 25px;
    width: auto;
    margin-right: 15px;
}

.brand-name {
    font-size: 1rem;
    color: grey;
}

.navigation {
    display: flex;
    flex-flow: row nowrap;

    .navigation-tab {
        width: 50%;
        font-size: 1rem;

        .navigation-tab-icon {
            font-size: 2rem;
        }

        a {
            color: grey;
        }
    }
}
</style>

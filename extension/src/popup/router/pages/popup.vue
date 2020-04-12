<template>
    <div class="centered">
        <div>
            <div>
                <a href="#" @click="options" title="Configuration">Config</a>
            </div>
        </div>

        <div>
            <div>
                <h1>Your Extension</h1>
                <router-link
                    :to="{ path: 'second', query: { id: 'some-id' } }"
                    class="px-3"
                    title="Second"
                >
                    Second Vue Page
                </router-link>
            </div>
        </div>
        <div class="p-2">
            <span> As of: {{ lastRun | date }} </span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import get from "lodash/get";
import { getStorage, getSettings } from "@/utils";

const log = require("debug")("ext:popup");

@Component
export default class Popup extends Vue {
    lastRun: number = 0;
    pollsPerDay: number = 0;
    polling: boolean = false;

    data() {
        this.updateData().then(() => {
            log(`Updated data`);
        });
        return {
            lastRun: 0
        };
    }

    async updateData() {
        const [lastRun] = await Promise.all([getStorage("lastRun", 0)]);
        if (lastRun) {
            this.lastRun = lastRun;
        }
    }

    async options() {
        chrome.runtime.openOptionsPage();
    }
}
</script>

<style lang="scss" scoped>
.centered {
    text-align: center;
}
</style>

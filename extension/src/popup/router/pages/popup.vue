<template>
    <div class="centered">
        <div>
            <div>
                <a href="#" @click="options" title="Configuration">Config</a>
            </div>
        </div>

        <div>
            <div>
                <h1>Watch With Me Extension</h1>

                <p v-if="!roomId">
                    <router-link
                        :to="{ path: 'new-room' }"
                        class="px-3"
                        title="new room"
                    >
                        Create a room
                    </router-link>
                </p>

                <p></p>
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
import { browser } from "webextension-polyfill-ts";

const log = require("debug")("ext:popup");

@Component
export default class Popup extends Vue {
    lastRun: number = 0;
    pollsPerDay: number = 0;
    polling: boolean = false;
    roomId: string | null = null;

    data() {
        this.updateData().then(() => {
            log(`Updated data`);
        });
        return {
            lastRun: 0,
        };
    }

    async updateData() {
        const [lastRun] = await Promise.all([getStorage("lastRun", 0)]);
        if (lastRun) {
            this.lastRun = lastRun;
        }
    }

    async options() {
        browser.runtime.openOptionsPage();
    }
}
</script>

<style lang="scss" scoped>
.centered {
    text-align: center;
}
</style>

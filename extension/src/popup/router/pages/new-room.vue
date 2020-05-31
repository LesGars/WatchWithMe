<template>
    <div>
        <h1>Watch With Me Room</h1>
        <p>Share your room URL :</p>
        <div>
            <template v-if="loading">
                ...
            </template>

            <template v-else>
                <span class="roomId-text">
                    {{ linkWithRoomId }}
                </span>
                <button
                    v-clipboard:copy="linkWithRoomId"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onError"
                >
                    Copy Link
                </button>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueClipboard from "vue-clipboard2";
import Component from "vue-class-component";
import get from "lodash/get";
import { MessageFromExtensionToServerType } from "../../../communications/from-extension-to-server";
import { v4 as uuid } from "uuid";
import { browser } from "webextension-polyfill-ts";

Vue.use(VueClipboard);

const log = require("debug")("ext:issues");

@Component
export default class NewRoom extends Vue {
    linkWithRoomId: string | null = null;

    data() {
        return {
            loading: false,
            linkWithRoomId: null,
        };
    }

    created() {
        this.createRoom();
    }

    createRoom() {
        const roomId: string = uuid();
        const popupPort = browser.runtime.connect(undefined, {
            name: "PORT-PS",
        });
        popupPort.postMessage({
            type: MessageFromExtensionToServerType.CHANGE_ROOM,
            roomId,
        });
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs) => {
                const linkWithRoomId: URL = new URL(tabs[0].url!);
                linkWithRoomId.searchParams.set("roomId", roomId);
                this.linkWithRoomId = linkWithRoomId.href;
                popupPort.postMessage({
                    type: MessageFromExtensionToServerType.DEBUG_MESSAGE,
                    message: `[PS] Hey, the user created a new room ${linkWithRoomId.href}`,
                });
            });
    }

    onCopy(e) {
        log("[PS] You just copied: " + e.text);
    }
    onError(e) {
        log("[PS] Failed to copy url");
    }
}
</script>

<style></style>

<template>
    <div>
        <h1>Get a new Room</h1>

        <button @click="createRoom">Create a room</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import VueClipboard from "vue-clipboard2";
import get from "lodash/get";
import { MessageFromExtensionToServerType } from "../../../communications/from-extension-to-server";
import { v4 as uuid } from "uuid";
import { browser } from "webextension-polyfill-ts";
import { Event } from "../../../contentscript/player";
import { useState } from "../..";
import debug from "debug";

// Vue.use(VueClipboard);
const log = debug("ext:popup");

export default defineComponent({
    setup() {
        return { state: useState() };
    },
    methods: {
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
                    // this.linkWithRoomId = linkWithRoomId.href;
                    popupPort.postMessage({
                        type: MessageFromExtensionToServerType.DEBUG_MESSAGE,
                        message: `[PS] Hey, the user created a new room ${linkWithRoomId.href}`,
                    });
                    this.$router.push(`/room/${roomId}`);
                });
        },
    },
});
</script>

<style></style>

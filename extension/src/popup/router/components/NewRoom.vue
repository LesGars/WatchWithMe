<template>
    <div>
        <h1>Get a new Room</h1>

        <button @click="createRoom">Create a room</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import get from "lodash/get";
import { MessageFromExtensionToServerType } from "../../../communications/from-extension-to-server";
import { v4 as uuid } from "uuid";
import { browser } from "webextension-polyfill-ts";
import { Event } from "../../../contentscript/player";
import debug from "debug";
import { getCurrentUrlWIthRoomId } from "../../utils";

const log = debug("ext:popup");

export default defineComponent({
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
            getCurrentUrlWIthRoomId(roomId).then((linkWithRoomId) => {
                popupPort.postMessage({
                    type: MessageFromExtensionToServerType.DEBUG_MESSAGE,
                    message: `[PS] Hey, the user created a new room ${linkWithRoomId}`,
                });
                this.$router.push(`/room/${roomId}`);
            });
        },
    },
});
</script>

<style></style>

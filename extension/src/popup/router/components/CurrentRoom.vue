<template>
    <div>
        <h1>Your Room</h1>
        <p>Share your room URL :</p>
        <div class="room-info">
            <span class="roomId-text">
                {{ linkWithRoomId }}
            </span>
            <!-- <button
                v-clipboard:copy="linkWithRoomId"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
            >
                Copy Link
            </button> -->
        </div>
        <div>
            <router-link class="new-room-link" to="/room/new">
                Create a new room
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import get from "lodash/get";
import { MessageFromExtensionToServerType } from "../../../communications/from-extension-to-server";
import { browser } from "webextension-polyfill-ts";
import { Event } from "../../../contentscript/player";
import { getCurrentUrlWIthRoomId } from "../../utils";
import { useState } from "../..";

// Vue.use(VueClipboard);
import debug from "debug";
const log = debug("ext:popup");

export default defineComponent({
    // linkWithRoomId: string | null = null;
    data() {
        return {
            linkWithRoomId: undefined as string | undefined,
        };
    },
    props: {
        roomId: {
            type: String,
        },
    },

    methods: {
        onCopy(e: any) {
            log("[PS] You just copied: " + e.text);
        },
        onError(e: any) {
            log("[PS] Failed to copy url");
        },
    },
    async created() {
        if (this.roomId) {
            this.linkWithRoomId = await getCurrentUrlWIthRoomId(this.roomId);
        }
    },
});
</script>

<style>
.room-info {
    margin-bottom: 30px;
}
.new-room-link {
    font-size: 0.8rem;
}
</style>

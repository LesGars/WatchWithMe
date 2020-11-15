<template>
    <div>
        <h1>Watch With Me - Your Room</h1>
        <p>Share your room URL :</p>
        <div>
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
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import get from "lodash/get";
import { MessageFromExtensionToServerType } from "../../../communications/from-extension-to-server";
import { browser } from "webextension-polyfill-ts";
import { Event } from "../../../contentscript/player";
import { useState } from "../..";
import { getCurrentUrlWIthRoomId } from "../../utils";

// Vue.use(VueClipboard);

const log = require("debug")("ext:issues");

export default defineComponent({
    // linkWithRoomId: string | null = null;
    data() {
        return {
            linkWithRoomId: null as null | string,
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
        this.linkWithRoomId = await getCurrentUrlWIthRoomId(this.roomId);
    },
});
</script>

<style></style>

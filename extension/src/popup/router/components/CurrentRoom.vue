<template>
    <div>
        <h1>Your Room</h1>
        <p>Share your room URL :</p>
        <div class="room-info">
            <span class="roomId-text">
                {{ linkWithRoomId }}
            </span>
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

import debug from "debug";
const log = debug("ext:popup");

export default defineComponent({
    data() {
        return {
            linkWithRoomId: undefined as string | undefined,
        };
    },
    props: {
        roomId: {
            // From router
            type: String,
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

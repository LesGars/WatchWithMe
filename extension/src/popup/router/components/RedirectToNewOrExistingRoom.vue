<template>
    <span>...</span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from "../..";
import debug from "debug";
const log = debug("ext:popup");

export default defineComponent({
    created() {
        this.redirect();
    },
    methods: {
        redirect() {
            const roomId = useState()?.roomId;
            log("value of state is ", useState());
            log("value of room is ", roomId);
            if (roomId) {
                this.$router.push(`/room/${roomId}`);
            } else {
                this.$router.push(`/room/new`);
            }
        },
    },
});
</script>

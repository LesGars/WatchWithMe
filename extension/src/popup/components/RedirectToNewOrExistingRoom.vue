<template>
    <span>...</span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from "..";
import debug from "debug";
const log = debug("ext:popup");

export default defineComponent({
    created() {
        this.redirect();
    },
    methods: {
        redirect() {
            const roomId = useState()?.roomId;
            if (roomId) {
                log("Room already present, redirecting to current room view");
                this.$router.push(`/room/${roomId}`);
            } else {
                log("No room detected, redirecting to the new room view");
                this.$router.push(`/room/new`);
            }
        },
    },
});
</script>

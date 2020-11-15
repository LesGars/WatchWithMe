<template>
    <div class="container mx-auto text-base">
        <div v-html="rawHtml"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// const AboutText = require("./markdown/About.md");

export default defineComponent({
    data() {
        return {
            rawHtml: "This extension was created by Les Gars",
        };
    },
});
</script>

<style></style>

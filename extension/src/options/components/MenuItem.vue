//
https://github.com/johndatserakis/vue-navigation-bar/blob/master/src/components/DesktopMenuItemLink.vue

<template>
    <dynamic-link
        :path="option.path"
        :aria-label="option.text"
        tabindex="0"
        :isLinkAction="option.isLinkAction ? true : false"
        :class="
            this.$route.path === option.path
                ? 'bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t text-blue-700 font-semibold no-underline outline-none -mb-px'
                : 'bg-white inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold no-underline outline-none mr-1'
        "
        @click.native="$emit('vnb-item-clicked', option.text)"
    >
        <div :icon="option.faIcon" size="sm" v-if="option.iconLeft">Left</div>
        {{ option.name }}
        <div :icon="option.faIcon" size="sm" v-if="option.iconRight">Right</div>
    </dynamic-link>
</template>

<script lang="ts">
import DynamicLink from "./DynamicLink.vue";

// const debug = require("debug")("ext:MenuItem");

import { defineComponent } from "vue";

export default defineComponent({
    props: {
        option: {
            type: Object,
            required: true,
        },
        options: {
            type: Array,
            required: true,
        },
    },
    name: "menu-item",
    components: {
        DynamicLink,
    },
});
</script>

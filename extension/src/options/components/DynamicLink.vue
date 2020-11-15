//
https://github.com/johndatserakis/vue-navigation-bar/blob/master/src/components/DynamicLink.vue
<script lang="ts">
import { defineComponent } from "vue";
import { h } from "vue";

export default defineComponent({
    name: "dynamic-link",
    render() {
        if (this.isExternalLink) {
            return h("a", { attrs: { href: this.path } }, this.$slots.default);
        }
        return h(
            "router-link",
            {
                props: {
                    to: { path: this.path },
                },
            },
            this.$slots.default
        );
    },
    props: {
        isExternalLink: {
            type: Boolean,
            required: false,
        },
        path: {
            type: String,
            required: true,
        },
    },
});
</script>

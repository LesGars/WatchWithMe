<template>
    <div class="watchers">
        <div
            class="watcher"
            v-for="watcher in watchers"
            :key="watcher.connectionId"
        >
            <div class="watcher-name">🤓 {{ watcher.friendlyName }}</div>
            <div class="watcher-status">{{ icon(watcher) }} En attente</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Watcher, WatcherState } from "../../types";
import {
    makeFriendlyWatchers,
    STATUS_ICON_FOR_WATCHER_STATE,
} from "../../utils/interface";

export default defineComponent({
    data() {
        return {
            // TODO https://github.com/LesGars/WatchWithMe/issues/91
            // useState()?.watchers || []
            watchers: makeFriendlyWatchers([
                {
                    id: "watcherTest",
                    connectionId: "cafebabe",
                    joinedAt: new Date(),
                    lastVideoTimestamp: null,
                    lastHeartbeat: new Date(),
                    currentVideoStatus: WatcherState.READY,
                    initialSync: false,
                    userAgent: "Test agent",
                },
            ] as Watcher[]),
        };
    },
    methods: {
        icon: (watcher: Watcher) =>
            STATUS_ICON_FOR_WATCHER_STATE[watcher.currentVideoStatus],
    },
});
</script>
<style scoped>
.watchers {
    text-align: left;
}
.watcher {
    display: flex;
}
.watcher-status {
    flex-grow: 1;
    text-align: right;
}
</style>

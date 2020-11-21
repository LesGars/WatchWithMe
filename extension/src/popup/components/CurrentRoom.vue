<template>
    <div class="room">
        <div class="room-options">
            <div class="room-control">
                {{ roomControl.text }}
                <span>{{ roomControl.icon }}</span>
            </div>
        </div>
        <div class="room-status">
            <div>🟢&nbsp;&nbsp;Room is online</div>
            <div>
                👥&nbsp;&nbsp;<strong>{{ watchers.length }}</strong> people
                watching
            </div>
        </div>
        <div class="room-link">
            <p class="roomId-text">{{ linkWithRoomId }}</p>
        </div>
        <router-link class="disconnect" to="/room/new">
            Disconnect
        </router-link>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from "..";
import debug from "debug";
import { getCurrentUrlWIthRoomId } from "../utils";

const log = debug("ext:popup");

export default defineComponent({
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
    async created() {
        if (this.roomId) {
            this.linkWithRoomId = await getCurrentUrlWIthRoomId(this.roomId);
        }
    },
    computed: {
        roomControl() {
            const {
                roomId: stateRoomId,
                myWatcherId,
                roomOwnerId,
            } = useState();
            log({ stateRoomId, roomId: this.roomId });
            if (stateRoomId != this.roomId) {
                return { text: "You do not belong to this room", icon: "👺" };
            }
            return roomOwnerId === myWatcherId
                ? { text: "I control the video", icon: "🟢" }
                : { text: "I do NOT control the video", icon: "🔴" };
        },
        watchers() {
            return useState()?.watchers;
        },
    },
});
</script>

<style scoped>
.room {
    text-align: left;
}

.room-options,
.room-status,
.room-link {
    margin-bottom: 15px;
}

.new-room-link {
    font-size: 0.8rem;
}

.roomId-text {
    background: transparent;
    padding: 5px;
    border: 2px solid lightgrey;
    border-radius: 5px;
    font-size: 0.5rem;
    max-width: 125px;
    overflow: hidden;
    white-space: nowrap;
}

.disconnect {
    text-align: center;
    border-radius: 5px;
    background-color: lightgrey;
    display: block;
    padding: 8px;
}

.disconnect:hover {
    background-color: lightblue;
    color: black;
}

a {
    text-decoration: none;
    color: white;
}
</style>

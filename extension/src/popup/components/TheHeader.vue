<template>
    <div class="header">
        <div class="wwm">
            <img
                class="logo-image"
                src="https://svgshare.com/i/RfL.svg"
                alt="Watch With Me logo"
            />
            <div class="brand-name">Watch With Me</div>
        </div>
        <div class="navigation">
            <div class="navigation-tab room-tab">
                <router-link
                    class="room-link"
                    :to="{ name: 'Current Room', params: { roomId: roomId() } }"
                >
                    <span class="navigation-tab-icon">🏠</span>
                    <br />
                    <span class="navigation-text">Room</span>
                </router-link>
            </div>
            <div class="navigation-tab attendees-tab">
                <router-link
                    class="watchers-link"
                    :to="{
                        name: 'Current room watchers',
                        params: { roomId: roomId() },
                    }"
                >
                    <span class="navigation-tab-icon">👥</span>
                    <br />
                    <span class="navigation-text">Attendees</span>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from "..";

export default defineComponent({
    name: "The Header",
    methods: {
        roomId: () => useState()?.roomId,
    },
});
</script>

<style lang="scss" scoped>
.header {
    margin-bottom: 30px;
    font-size: 2rem;
    color: burlywood;

    .wwm {
        display: flex;
        text-align: left;
    }
}

.logo,
.brand-name {
    display: inline-block;
    height: 25px;
}

.logo-image {
    height: 25px;
    width: auto;
    margin-right: 15px;
}

.brand-name {
    font-size: 1rem;
    color: grey;
}

.navigation {
    display: flex;
    flex-flow: row nowrap;

    .navigation-tab {
        color: grey;
        font-size: 1rem;
        width: 50%;
        a {
            text-decoration: none;
            &.router-link-active .navigation-text {
                border-bottom: 3px solid #2d9cdb;
            }
        }

        .navigation-tab-icon {
            font-size: 2rem;
        }
    }
}
</style>

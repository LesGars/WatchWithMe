<template>
  <div>
    <h1>I'm another vue component with id={{ id }}</h1>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import get from "lodash/get";

const log = require("debug")("ext:issues");

@Component
export default class Issues extends Vue {
  list: any[] = [];

  data() {
    const id = get(this, "$router.currentRoute.query.id");
    return {
      id
    };
  }
}
</script>

<style></style>

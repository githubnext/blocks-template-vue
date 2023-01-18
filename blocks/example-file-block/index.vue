<script setup lang="ts">
import { FileBlockProps } from "@githubnext/blocks";

// seems like it's not possible to define the props all at once from `FileBlockProps`
// see https://github.com/vuejs/core/issues/4294
const { content } = defineProps<{
  content: FileBlockProps["content"];
}>();
</script>

<template>
  <h1>Hello from Vue!</h1>
  <pre v-html="content" />
</template>

<style scoped>
h1 {
  color: red;
}
</style>

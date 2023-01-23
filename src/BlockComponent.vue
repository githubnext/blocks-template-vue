<script setup lang="ts">
import { computed } from "vue";
import { FileContext, FolderContext, Block } from "@githubnext/blocks";

const { context, block } = defineProps<{
  context: FileContext | FolderContext;
  block: Block;
}>();

const src = computed(
  () =>
    "/#" +
    encodeURIComponent(
      JSON.stringify({
        block: {
          owner: block.owner,
          repo: block.repo,
          id: block.id,
          type: block.type,
        },
        context,
      })
    )
);
</script>

<template>
  <iframe
    title="embedded block"
    :src="src"
    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
  />
</template>

<style>
iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>

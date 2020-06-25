<template>
  <div>
    <p>defId{{ defId }}</p>
    <p>instId{{ instId }}</p>
  </div>
</template>

<script lang="ts">

import {
  defineComponent, PropType, computed, ref, toRef, Ref,
} from '@vue/composition-api'

export default defineComponent({
  name: 'Process',
  props: {
    defId: {
      type: String,
      required: true,
    },
    instId: {
      type: String,
      required: true,
    },
  },
  setup (props) {
    return {  }
  },
})
</script>

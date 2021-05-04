<template>
  <button
    type="button"
    class="absolute top-0 right-0"
    @click="$emit('closeGraph')"
  >
    <graph-ticket-button-icon />
  </button>
</template>

<script>
import graphTicketButtonIcon from "./GraphTicketButtonIcon"
export default {
  components: {
    graphTicketButtonIcon
  }
}
</script>

<style lang="scss" scoped></style>

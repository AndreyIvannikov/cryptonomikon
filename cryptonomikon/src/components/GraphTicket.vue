<template>
  <section class="relative" v-if="currentTicket">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">VUE - USD</h3>
    <div
      ref="graph"
      class="flex items-end border-gray-600 border-b border-l h-64"
    >
      <div
        class="bg-purple-800 border w-10"
        v-for="(g, idx) in normalizetGraph"
        :key="idx"
        :style="{ height: `${g}%`, width: `${oneGraphElement}px` }"
      ></div>
    </div>
    <graph-ticket-button
      class="absolute top-0 right-0"
      @click="$emit('closeGraph')"
    />
  </section>
</template>

<script>
import graphTicketButton from "./GraphTicketButton"
export default {
  components: { graphTicketButton },
  emits: ["closeGraph", "width"],
  props: {
    normalizetGraph: {
      type: Array,
      required: false
    },
    currentTicket: {
      type: Object,
      required: false
    }
  },
  mounted() {
    window.addEventListener("resize", this.widthGraphContainers)
  },

  data() {
    return {
      oneGraphElement: 38
    }
  },

  methods: {
    widthGraphContainers() {
      if (this.normalizetGraph.length === 0) return
      this.$emit("width", this.$refs.graph.clientWidth)
    },
    widthContainer() {
      return this.$nextTick(() => this.$emit("width", this.$refs.graph.clientWidth))
    }
  }
}
</script>

<style lang="scss" scoped></style>

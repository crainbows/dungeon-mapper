<template>
  <div class="tools">
    <div class="buttons has-addons is-centered">
      <a class="button is-normal is-outlined is-link" @click="clearAll" title="Clear all fog"><i class="material-icons md-24">visibility</i></a>
      <a class="button is-normal is-outlined is-link" @click="shroudAll" title="Shroud the map"><i class="material-icons md-24">visibility_off</i></a>
      <a class="button is-normal is-outlined is-link" @click="clearTool" title="Clear tool"><i class="material-icons md-24">wb_sunny</i></a>
      <a class="button is-normal is-outlined is-link" @click="shroudTool" title="Shroud tool"><i class="material-icons md-24">wb_cloudy</i></a>
    </div>
    <div class="buttons has-addons is-centered">
      <a class="button is-normal is-outlined is-link" @click="circleTool" title="Circle tool"><i class="material-icons md-24">brightness_1</i></a>
      <a class="button is-normal is-outlined is-link" @click="squareTool" title="Square tool"><i class="material-icons md-24">crop_square</i></a>
      <a class="button is-normal is-outlined is-link" @click="enlargeTool" title="Enlarge tool"><i class="material-icons md-24">zoom_in</i></a>
      <a class="button is-normal is-outlined is-link" @click="shrinkTool" title="Shrink tool"><i class="material-icons md-24">zoom_out</i></a>
    </div>
  </div> 
</template>

<script>
  // import { mapActions } from 'vuex';

  export default {
    computed: {
      activeMap () {
        return this.$store.state.Maps.selectedMap;
      }
    },
    methods: 
    {
      clearAll() {
        this.$emit('clearAll');
      },
      shroudAll() {
        this.$emit('shroudAll');
      },
      clearTool() {
        this.$emit('clearTool');
      },
      shroudTool() {
        this.$emit('shroudTool');
      },
      circleTool() {
        this.$emit('circleTool');
      },
      squareTool() {
        this.$emit('squareTool');
      },
      enlargeTool() {
        this.$emit('enlargeTool');
      },
      shrinkTool() {
        this.$emit('shrinkTool');
      },
    }
  };
</script>

<style lang="sass">
  .tools
    position: absolute
    left: 1em
    bottom: 1em


  .buttons:first-of-type 
    margin-bottom: -0.25em
    .button
      margin-bottom: 0
      border-radius: 0.25em 0.25em 0 0
</style>
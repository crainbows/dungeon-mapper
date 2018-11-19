<template>
    <div>
      <div v-show="mapList.length == 0" class="level missing-map-alert">
        <div class="level-item">
          <p>No maps found.{{ filename }}</p>
        </div>
      </div>
      <!-- <section class="hero is-primary">
        <div class="hero-body">
          <div class="container">
            <h1 class="title">
              Map goes here!
            </h1>
            <h2 class="subtitle">
              Primary subtitle
            </h2>
          </div>
        </div>
      </section> -->
    </div>
</template>

<script>
import Map from './map.js'

  export default {
    name: 'mapWrapper',
    components: { },
    props: ['filename'],
    computed: {
      mapList () {
        return this.$store.state.Maps.MapList;
      }
    },
    methods: {

    },
  };
</script>

<style lang="sass">
  .missing-map-alert
    height: 100vh
</style>



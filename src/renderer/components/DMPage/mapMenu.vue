<template>
<div>
  <a class="panel-block"
    :key="map.name"
    :class="mapKey == activeMap ? 'is-active' : ''"
    v-for="(map, mapKey) in mapList"
    @click="selectMap(map, mapKey)">
    {{ map.name }}
    <span v-show="deleteMode" class="panel-icon is-delete-icon">
      <i class="material-icons">delete</i>
    </span>
  </a>
  <div class="panel-block">
    <button :disabled="mapList.length == 0" class="button is-primary is-outlined is-fullwidth">
      <span class="is-hidden-mobile">Send Map to Player</span>
    </button>
  </div>
</div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    computed: {
      mapList () {
        return this.$store.state.Maps.MapList;
      },
      deleteMode () {
        return this.$store.state.settings.deleteMode;
      },
      activeMap () {
        return this.$store.state.Maps.selectedMap;
      }
    },
    methods: 
    {
      selectMap: function(map, mapKey) {
        this.$store.dispatch('selectMap', {mapKey: mapKey});
        console.log(map.name);
        console.log(mapKey);
        console.log(this.activeMap);
      }
    }
  };
</script>

<style lang="sass">
.is-delete-icon,.panel-block.is-active .is-delete-icon
  color: #D50000
  margin-left: auto;
  margin-top: -0.75em;

.panel-block.is-active 
  border-left-width: 0.5em
  background-color: whitesmoke
  border-left-color: #8A4D76

</style>
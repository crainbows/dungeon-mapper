<template>
  <div>
    <div class="columns is-gapless">
      <div class="column is-hidden-mobile is-one-fifth-desktop is-one-third-tablet">
        <nav class="panel">
          <p class="panel-heading">
            &nbsp;
            <open-player-view></open-player-view>
            <add-map-button v-on:newMap="newMap"></add-map-button>
          </p>
          <map-menu></map-menu>
        </nav>
        <map-toolbar v-on:clearAll="tool_clearAll" v-on:shroudAll="tool_shroudAll" v-on:clearTool="tool_clearTool" v-on:shroudTool="tool_shroudTool" v-on:circleTool="tool_circleTool" v-on:squareTool="tool_squareTool" v-on:enlargeTool="tool_enlargeTool" v-on:shrinkTool="tool_shrinkTool"></map-toolbar>
      </div>
      <div class="column is-four-fifths-desktop is-two-thirds-tablet">
        <map-wrapper v-bind:filename="filename"></map-wrapper>
      </div>
    </div>
  </div>
</template>

<script>
  import mapMenu from './DMPage/mapMenu.vue';
  import addMapButton from './DMPage/addMapButton.vue';
  import mapWrapper from './DMPage/mapWrapper.vue';
  import mapToolbar from './DMPage/mapToolbar.vue';
  import openPlayerView from './DMPage/openPlayerView.vue';



  export default {
    name: 'DMPage',
    components: { mapMenu, addMapButton, openPlayerView, mapWrapper, mapToolbar },
    data: function () {
        return {
          filename: ""
        }
      },
    methods: {
      tool_clearAll: function () {
        // Toolbar Action
      },
      tool_shroudAll: function () {
        // Toolbar Action
      },
      tool_clearTool: function () {
        // Toolbar Action
      },
      tool_shroudTool: function () {
        // Toolbar Action
      },
      tool_circleTool: function () {
        // Toolbar Action
      },
      tool_squareTool: function () {
        // Toolbar Action
      },
      tool_enlargeTool: function () {
        // Toolbar Action
      },
      tool_shrinkTool: function () {
        // Toolbar Action
      },
      newMap: function (data) {
        // Toolbar Action
        this.filename = data.filename;
        this.$store.dispatch('newMap', {filename: data.filename})
        console.log(data.filename);
      },
    },
    computed: {
      mapList () {
        return this.$store.state.Maps.MapList;
      },
      activeMap () {
        return this.$store.state.Maps.selectedMap;
      }
    }
  };
</script>

<style lang="sass">
  @import url('https://fonts.googleapis.com/css?family=Nunito:400,700')
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons')

  .panel-heading .is-pulled-right
    cursor: pointer
    padding-left: 0.5rem
  
  body::-webkit-scrollbar 
    display: none


</style>

<template>
    <span title="Add New Map" class="is-pulled-right" id="add-map" @click="addNewMap">
        <i class="material-icons">add</i>
    </span>
</template>

<script>
const {dialog} = require('electron').remote;
import fs from 'fs'
//   import { mapActions } from 'vuex';
  export default {
    computed: {
      MapList () {
        return this.$store.state.Maps.MapList;
      }
    },
    methods: 
    {
      // ...mapActions({
      //   increment: 'someAsyncTask' // map `this.add()` to `this.$store.dispatch('increment')`
      // })
      addNewMap: function() {
        dialog.showOpenDialog((fileNames) => {
            // fileNames is an array that contains all the selected
            if(fileNames === undefined){
                console.log("No file selected");
                return;
            }

            this.$emit('newMap', {filename: fileNames[0]});
        });
      }
    }
  };
</script>

<style>

</style>
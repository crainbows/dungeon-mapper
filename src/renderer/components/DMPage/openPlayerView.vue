<template>
    <div title="Open Player View" class="is-pulled-right" id="add-map" @click="openPlayerWindow">
        <i class="material-icons">tv</i>
    </div>
</template>

<script>
  const BrowserWindow = require('electron').remote.BrowserWindow

  export default {
    computed: {
      null () {
        return null;
      }
    },
    methods: 
    {
    openPlayerWindow() {
        const modalPath = process.env.NODE_ENV === 'development'
        ? 'http://localhost:9080/#/PlayerPage'
        : `file://${__dirname}/index.html#PlayerPage`;
        
        let win = new BrowserWindow({ frame: false });
        win.on('close', () => { win = null });
        win.loadURL(modalPath)
        win.show();
      },
    }
  };
</script>

<style>

</style>
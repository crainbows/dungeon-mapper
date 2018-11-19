<template>
  <div id="wrapper">
    <section class="hero is-link">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Player View
          </h1>
          <h2 class="subtitle">
            Primary subtitle
          </h2>
        </div>
      </div>
    </section>
    <!-- <button class="button is-primary is-outlined is-fullwidth"  @click="ping()">ping</button> -->
  </div>
</template>

<script>
  import ipcRenderer from 'electron';


  export default {
    name: 'PlayerPage',
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link);
      }
    },
  };
</script>

<style>
  body {
    -webkit-app-region: drag;
    height: 100vh;
  }
</style>

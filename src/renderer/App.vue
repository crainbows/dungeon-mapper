<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'dungeon-mapper',
  };
</script>

<style lang="sass">
  /* CSS */
  $purple: #8A4D76;
  $green: #4d8a52;
  $brown: #757763;
  $beige-light: #D0D1CD;
  $beige-lighter: #EFF0EB;

  $family-sans-serif: "Nunito", sans-serif;
  $grey-dark: $brown;
  $grey-light: $beige-light;
  $primary: $purple;
  $link: $green;

  $control-border-width: 2px;
  $input-background-color: $beige-lighter;
  $input-border-color: transparent;
  $input-shadow: none;

  .material-icons.md-24
    font-size: 24px

  @import "~bulma/bulma.sass";
</style>

import dropzone from 'dropzone';// TODO: Remove package in favour of built in packages.
import Map from './map';
import axios from 'axios';
import Vue from 'vue';
import $ from 'jquery/dist/jquery.slim'; // Required for dropzone
window.jQuery = $;
window.$ = $;
require('bootstrap');


const vm = new Vue({
  el: '#app',
  data: {
    maps: [],
    selectedMap: 0,
    selectedMapIndex: 0
  },
  methods: {
    checkForAvailibleMaps: function (that = this) {
      that.maps = [];
      axios.get('/dm/listmaps')
        .then((response) => {
          if (response.data.length < 1) {
            // no maps
          } else {
            // maps availible
            response.data.forEach(el => {
              let id = Math.floor(Math.random() * 100000);
              that.maps.push(
                {
                  id: id,
                  imgPath: el,
                  handle: {}
                }
              );
            });
          }
        })
        .catch(error => console.error(error))
        .finally(() => {
          that.createMapsFromList();
          if(that.maps.length < 1){
            that.selectedMap = 0;
          }else{
            that.selectedMap = that.maps[that.maps.length - 1].id;
          }
        });
    },
    createMapsFromList: function (that = this) {
      let finalId;
      that.maps.forEach(el => {
        finalId = el.id;
        let mapWrapper = document.getElementById('map' + el.id);
        el.handle = new Map(mapWrapper, 'uploads/' + el.imgPath, el.id);
      });
      that.selectedMap = finalId;
    },
    sendMap: function (map) {
      map.handle.createRender();
      let imageData = document.getElementById('render').src;
      axios.post('/send', {'imageData': imageData})
        .then(response => {
          if (response.data.success) {
            console.log(response.data.responseText);
          } else {
            console.error(response.data.responseText);
          }
        })
        .catch(error => console.error(error));      
    },
    deleteMap: function (map) {
      console.log(map.imgPath);
      let that = this;
      axios.post('/dm/map', {'imgPath': map.imgPath})
        .then(() => {
          // Success - Delete map for client
          that.maps.splice(that.maps.indexOf(map), 1);
          that.selectedMap = 0;
        })
        .catch(error => console.error(error));
    }
  }
});


//refactor this later

//var mapWrapper = document.getElementById('map-wrapper');
dropzone.autoDiscover = false;

new dropzone("div#upload", {
  url: '/upload',
  dictDefaultMessage: 'Click here or drag and drop an image to upload',
  acceptedFiles: 'image/*',
  init: function () {
    this.on('success', response => {
      console.log(response.xhr.responseText);
      vm.checkForAvailibleMaps();
    })
    this.on("complete", function() { 
      this.removeAllFiles(true); 
    })
  }
});

vm.checkForAvailibleMaps();

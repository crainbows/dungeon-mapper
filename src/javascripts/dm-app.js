import jQuery from "jquery";
const $ = jQuery;
import dropzone from 'dropzone';
import Map from './map';
import axios from 'axios';

//refactor this later
const maps = [];
var mapWrapper = document.getElementById('map-wrapper');
dropzone.autoDiscover = false;

new dropzone("div#upload", {
  url: '/upload',
  dictDefaultMessage: 'Click here or drag and drop an image to upload',
  acceptedFiles: 'image/*',
  init: function () {
    this.on('success', response => {
      console.log(response.xhr.responseText);
      createMap(JSON.parse(response.xhr.responseText).imgPath);
    })
  }
});

function checkForAvailibleMaps() {
  axios.get('/dm/listmaps')
    .then((response) => {
      if (response.data.length < 1) {
        // no maps
      } else {
        // maps availible
        createMap('uploads/' + response.data[0])
      }
    })
    .catch(error => console.error(error));
}

checkForAvailibleMaps();

function createMap(mapUrl) {
  $('#upload').hide();
  maps[0] = new Map(mapWrapper, mapUrl);
}

$('#btn-new-map').click(function () {
  maps[0].remove();
  $('#upload').show();
});

$(mapWrapper).find('.btn-send').click(function () {
  maps[0].createRender();
  let imageData = document.getElementById('render').src;

  axios.post('/send', {
    'imageData': imageData
  })
    .then(response => {
      if (response.data.success) {
        console.log(response.data.responseText);
      } else {
        console.error(response.data.responseText);
      }
    })
    .catch(error => console.error(error));
});
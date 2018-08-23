import jQuery from "jquery";
const $ = jQuery;
import dropzone from 'dropzone';
import * as dmMap from './map';
import axios from 'axios';

//refactor this later
var mapWrapper = document.getElementById('map-wrapper');
dropzone.autoDiscover = false;

new dropzone("div#upload", {
  url: '/upload',
  dictDefaultMessage: 'Click here or drag and drop an image to upload',
  acceptedFiles: 'image/*',
  init: function () {
    this.on('complete', file => {
      this.removeFile(file);
      checkForMapUpload();
    });
  }
});

function checkForMapUpload() {
  axios.get('/dm/map')
    .then(() => createTheMap())
    .catch(error => console.error(error));
}

checkForMapUpload();

function createTheMap() {
  $('#upload').hide();
  dmMap.create(mapWrapper);
}

$('#btn-new-map').click(function () {
  dmMap.remove();
  $('#upload').show();
});

$('#btn-send').click(function () {
  dmMap.createRender();
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
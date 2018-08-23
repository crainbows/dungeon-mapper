import jQuery from "jquery";
// window.jQuery = jQuery;
const $ = jQuery;
import config from './config';
import dropzone from 'dropzone';
import map from './map';
import axios from 'axios';

//refactor this later
var mapWrapper = document.getElementById('map-wrapper');
var dmMap = map();
dropzone.autoDiscover = false;
var settings = config();

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
  axios.get(settings.mapImage)
    .then(() => createTheMap())
    .catch(error => console.error(error));
}

checkForMapUpload();

function createTheMap() {
  $('#upload').hide();
  dmMap.create(mapWrapper, {
    callback: function () {
      dmMap.fitMapToWindow();
      window.addEventListener('resize', () => dmMap.fitMapToWindow());
    },
    error: function () {
      console.error('error creating map');
    }
  });
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
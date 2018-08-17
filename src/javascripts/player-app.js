import io from "socket.io-client";
import jQuery from "jquery";
window.jQuery = jQuery;
const $ = jQuery;

console.log('player.js starting');
var socket = io();

socket.on('map update', function (msg) {
  $('.splash-js').hide();
  if (msg && msg.imageData) {
    console.log('got a map update');
    $('.oldest').remove();
    $('.map').addClass('oldest').css('z-index', '30');
    var newMap = new Image();
    newMap.style.zIndex = 20;
    newMap.src = msg.imageData;
    newMap.className = "map img-responsive center-block";
    document.getElementById('map-container').appendChild(newMap);
    $('.oldest').addClass('transparent');
  }
});

socket.on('connect', function () {
  console.log('connected to server');
});

socket.on('reconnecting', function () {
  console.log('reconnecting to server');
});

socket.on('reconnect', function () {
  console.log('reconnected to server');
});

socket.on('reconnect_failed', function () {
  console.log('reconnect failed!');
});

socket.on('disconnect', function () {
  console.log('disconnected from server');
});
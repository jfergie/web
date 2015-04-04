define(function (require) {
  
  var angular = require('angular'),
      Controllers = angular.module('controllers', []);
  
  Controllers.controller('angEntityController', require('controllers/angEntityController'));
  
  return Controllers;
  
});
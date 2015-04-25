'use strict';

var debug             = require('debug')('freecycle');      // https://github.com/visionmedia/debug

/**
 * Sails Controller
 */

module.exports.controller = function (app) {
  debug('Checking the URL entered');
  app.get('/sails', function (req, res) {
    if (req.user) {
      return res.redirect('/api');
    }

    debug('req.user=', req.user);
    res.render('home/home', {
      url: req.url
    });
  });
};

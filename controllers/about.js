'use strict';

/**
 * About Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /about
   * View About information and links
   */

  app.get('/about', function (req, res) {
    res.render('about/about', {
      navTitle: 'About',
      url: req.url
    });
  });
};

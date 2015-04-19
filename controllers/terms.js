'use strict';

/**
 * Terms Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /terms
   * View site terms
   */

  app.get('/terms', function (req, res) {
    res.render('terms/terms', {
      navTitle: 'Terms of Use',
      url: req.url
    });
  });

};

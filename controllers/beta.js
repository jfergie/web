'use strict';

/**
 * Beta Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /beta
   * View beta information and links
   */

  app.get('/beta', function (req, res) {
    res.render('beta/beta', {
      navTitle: 'Beta',
      url: req.url
    });
  });
};

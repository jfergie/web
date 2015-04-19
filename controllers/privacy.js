'use strict';

/**
 * Privacy Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /privacy
   * View site privacy policy
   */

  app.get('/privacy', function (req, res) {
    res.render('privacy/privacy', {
      navTitle: 'Privacy Policy',
      url: req.url
    });
  });

};

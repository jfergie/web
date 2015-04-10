'use strict';

/**
 * Module Dependences
 */

var _             = require('lodash');
var User          = require('../models/User');
var debug         = require('debug')('skeleton');       // https://github.com/visionmedia/debug
var utils         = require('../config/utils');
var config        = require('../config/config');
var passport      = require('passport');
var nodemailer    = require('nodemailer');
var passportConf  = require('../config/passport');


/**
 * X Controller - Experimental Pages and Labs
 */

module.exports.controller = function (app) {

 /**
   * GET /account*
   * *ALL* x routes must be authenticated first
   */

  debug('Testing');
  app.all('/x*', passportConf.isAuthenticated);
  debug('Testing2');

  /**
   * GET /x
   * Render Main X Page
   */

  app.get('/x', function (req, res) {
    console.log('app.get URL ' + req.url + '..');
    res.render('x/home', {
      url: req.url
    });
  });

 /**
   * POST /account
   * Update User Profile Information
   */

  app.post('/x/post', function (req, res, next) {

    // Create a workflow (here you could also use the async waterfall pattern)
    var workflow = new (require('events').EventEmitter)();

    /**
     * Step 1: Validate the form data
     */

    workflow.on('validate', function () {

      req.assert('name', 'Your name cannot be empty.').notEmpty();
      req.assert('email', 'Your email cannot be empty.').notEmpty();
      req.assert('email', 'Your email is not valid.').isEmail();
      req.assert('website', 'Website URL is not valid.').isURL();

      var errors = req.validationErrors();

      if (errors) {
        req.flash('error', errors);
        return res.redirect('/x');
      }

      // next step
      // workflow.emit('updateProfile');
    });

    /**
     * Step 2: Update the user's information
     */

    workflow.on('x1', function () {

      User.findById(req.user.id, function (err, user) {
        if (err) {
          return next(err);
        }

        user.email = req.body.email.toLowerCase() || '';
        user.profile.name = req.body.name.trim() || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location.trim() || '';
        user.profile.phone.mobile = req.body.phoneMobile.trim() || '';
        user.profile.website = req.body.website.trim() || '';
        user.activity.last_updated = Date.now();

        user.save(function (err) {
          if (err) {
            return next(err);
          }

          // next step, pass user
          // workflow.emit('sendAccountEmail', user);

        });
      });
    });

    workflow.on('x2', function (user) {
  });

  /**
   * Initiate the workflow
   */

    workflow.emit('validate');

  });
};

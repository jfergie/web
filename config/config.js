'use strict';

/**
 * Module Dependencies
 */

var pkg               = require('../package.json');
var dotenv            = require('dotenv');  // https://www.npmjs.com/package/dotenv

/**
 * Configuration File
 *
 * Why like this?
 *
 *  - All environmental variables documented in one place
 *  - If I use "." notation it's easy to cut/paste into code
 *  - Unlike JSON, javascript allows comments (which I like)
 *  - Reading package.json here centralizes all config info
 *
 */

// *For Development Purposes*
// Read in environment vars from .env file
// In production I recommend setting the
// environment vars directly
dotenv.load();

var config            = {};

// From package.json
config.name           = pkg.name;
config.version        = pkg.version;
config.description    = pkg.description;
config.company        = pkg.company;
config.author         = pkg.author;
config.keywords       = pkg.keywords;
config.nodeVersion    = pkg.engines.node;

config.port           = process.env.PORT || 3000;

// todo this is vlabs google analytics key for the development site - later change this to a dedicated Freecycle analytics key
config.ga             = process.env.GA   || 'UA-57756453-2';  // Google Analytics Key for freecycle beta web site

/**
 * Logging Configuration
 */

config.logging        = process.env.LOGGING || true;

// Loggly configuration
config.loggly         = {};
config.loggly.token   = process.env.LOGGLY_TOKEN || '1148e4d0-5480-4de3-b214-086624a0ba8b';
config.loggly.subdomain = 'vlabs';
config.loggly.tags    = ['nodejs'];
config.loggly.json    = true;

/**
 * Database Configuration
 */

config.mongodb        = {};
config.mongodb.url    = process.env.MONGODB_URL || 'mongodb:jamesfergusonx@gmail.com:Deltaecho1973!@dogen.mongohq.com:10010/vlabs'; // 'mongodb://jfergie:Hockey1973!@ds052827.mongolab.com:52827/freecycle';

                                                // 'mongodb://jfergie:Hockey1973!@ds052827.mongolab.com:52827/freecycle';

/**
 * Session Configuration
 */

var hour              = 3600000;
var day               = (hour * 24);
var week              = (day * 7);

// Session
config.session                 = {};
config.session.secret          = process.env.SESSION_SECRET || 'MySessionSecretACJEFJSDPAJGLMLDFOPJEIRLFOPDF';
config.session.name            = 'sid';  // Generic - don't leak information
config.session.proxy           = false;  // Trust the reverse proxy for HTTPS/SSL
config.session.resave          = false;  // Forces session to be saved even when unmodified
config.session.saveUninitialized = false; // forces a session that is "uninitialized" to be saved to the store
config.session.cookie          = {};
config.session.cookie.httpOnly = true;   // Reduce XSS attack vector
config.session.cookie.secure   = false;  // Cookies via HTTPS/SSL
config.session.cookie.maxAge   = process.env.SESSION_MAX_AGE || week;

/**
 * Throttle Login Attempts
 */

config.loginAttempts           = {};
config.loginAttempts.forIp     = 50;
config.loginAttempts.forUser   = 5;
config.loginAttempts.expires   = '20m';

/**
 * Mailing Configuration
 */

// Who are we sending email as?
config.smtp                    = {};
config.smtp.name               = process.env.SMTP_FROM_NAME    || 'support';
config.smtp.address            = process.env.SMTP_FROM_ADDRESS || 'support@freecycle.com';

// How are we sending email?
// RRR TODO Temporarily use my personal gmail account for sending email
//
config.gmail                   = {};
config.gmail.user              = process.env.SMTP_USERNAME || 'jamesfergusonx@gmail.com';
config.gmail.password          = process.env.SMTP_PASSWORD || 'Deltaecho1973!@@';

/**
 * Authorization Configuration
 */
// todo
config.localAuth               = true;
config.verificationRequired    = false;  // on/off for user email verification at signup
config.enhancedSecurity        = true;   // on/off for two factor authentication


// Facebook
config.facebookAuth            = true;
config.facebook                = {};
config.facebook.clientID       = process.env.FACEBOOK_KEY    || '1500187510250133';
config.facebook.clientSecret   = process.env.FACEBOOK_SECRET || '615c3c60bbdc6dc3c0af55ca0316fe59';

// Github
config.githubAuth              = true;
config.github                  = {};
config.github.clientID         = process.env.GITHUB_KEY    || 'ee029b62f50418e6f167';
config.github.clientSecret     = process.env.GITHUB_SECRET || 'de65ef02bffb343633de6d06857085839668fc39';

// Twitter
config.twitterAuth             = true;
config.twitter                 = {};
config.twitter.consumerKey     = process.env.TWITTER_KEY    || 'eYuXYQEAXDKAnY4IqR3tIKSX0';
config.twitter.consumerSecret  = process.env.TWITTER_SECRET || 'QSbXNcmLRkFuhvDzdT3Bb8mMdoMGqY7V4gApteXT2F2YXSBrjM';

// Google
config.googleAuth              = true;
config.google                  = {};
config.google.clientID         = process.env.GOOGLE_KEY    || '599405964369-jdok3lour9f11so6fdviqk2lhcjvaisl.apps.googleusercontent.com';
config.google.clientSecret     = process.env.GOOGLE_SECRET || 'njpKqOtkf5O_g1a4rkAg95HM';

/**
 * API Keys
 */

// New York Times
config.nyt                     = {};
config.nyt.key                 = process.env.NYT_KEY || 'Your Key';

// Last FM
config.lastfm                  = {};
config.lastfm.api_key          = process.env.LASTFM_KEY    || 'Your Key';
config.lastfm.secret           = process.env.LASTFM_SECRET || 'Your Secret';

// Stripe
config.stripe                  = {};
config.stripe.key              = process.env.STRIPE_KEY || 'pk_test_42NpyGqT5g3MTmTcCheqwDSv';

// Twilio
config.twilio                  = {};
config.twilio.sid              = process.env.TWILIO_SID   || 'Your SID';
config.twilio.token            = process.env.TWILIO_TOKEN || 'Your Token';
config.twilio.phone            = process.env.TWILIO_PHONE || 'Your Phone';

// Tumblr
config.tumblr                  = {};
config.tumblr.key              = process.env.TUMBLR_KEY    || '4CPpJXUex3SzriQyxgNcDss8coc5FcZwnkrCJH0f4gCu0MZnMo';
config.tumblr.secret           = process.env.TUMBLR_SECRET || 'fMDL3qMjqaofWXoXPgH8gq0nwIfoXwLDuk4cP1alKrFSIyEyNt';
config.tumblr.callbackURL      = process.env.TUMBLR_URL    || '/auth/tumblr/callback';

// Foursquare
config.foursquare              = {};
config.foursquare.clientId     = process.env.FOURSQUARE_KEY    || 'TX1LPX5MHF4GVZYGHUFTPW2VYM4OI1GTLMGVIGFDSIOMOLIC';
config.foursquare.clientSecret = process.env.FOURSQUARE_SECRET || 'G5YIGAQ5ZTWE410NM24B51KBXU5NXCZ111GCVFWGFKOFLOSM';
config.foursquare.redirectUrl  = process.env.FOURSQUARE_URL    || 'http://localhost:3000/auth/foursquare/callback';

// Paypal
config.paypal                  = {};
config.paypal.host             = process.env.PAYPAL_HOST       || 'api.sandbox.paypal.com';
config.paypal.client_id        = process.env.PAYPAL_KEY        || 'AWuhjxBlsZKy5Cp6kvZHvQ8VOy8tDvp9lDBVhashDIeIDu207Ckdblki753x';
config.paypal.client_secret    = process.env.PAYPAL_SECRET     || 'EAABpRDXQCVWPTHBsxSBEJAYhrY5yc1bnBmkt6RjIsGAVuTpX5Y_BAfY4gwm';
config.paypal.returnUrl        = process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/api/paypal/success';
config.paypal.cancelUrl        = process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/api/paypal/cancel';

module.exports = config;

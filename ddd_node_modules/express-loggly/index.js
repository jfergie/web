'use strict';

/**
 * Module dependencies.
 */

var _           = require('underscore');
var os          = require('os');
var debug       = require('debug')('express-loggly');
var loggly      = require('loggly');
var useragent   = require('useragent');
var onFinished  = require('finished');

/**
 * Create middleware.
 */

exports = module.exports = function (options) {

  // Needed for useragent - this will async load the
  // database from the server and compile it to a
  // proper JavaScript supported format.
  // Always up-to-date agent parsing!
  useragent(true);

  // Get options
  options = options || {};
  var immediate = options.immediate || false;
  var config = options.loggly || {};

  // If a configuration was not passed do nothing
  if (_.isEmpty(config)) {
    debug('Error: Loggly configuration was not passed in!');
    // do nothing
    return function logger (req, res, next) {
      next();
    };
  }

  // Create Loggly client using passed in configuration
  var client = loggly.createClient(config);

  // Get machine name & PID
  var machine = os.hostname();
  var pid = process.pid.toString();

  // Logging format
  var logFormat = function (req, res) {

    // Get response time and content length
    var time = getResponseTime (req, res);
    var content = getLength(req, res, 'content-length');

    // Set log levels
    var level;
    if (res.statusCode >= 500) {
      level = 'ERROR';
    } else if (res.statusCode >= 400) {
      level = 'WARN';
    } else {
      level = 'INFO';
    }

    // Define JSON record object
    var recordObj = {
      'date'            : new Date().toUTCString(),  // Note UTC
      'level'           : level,

      'server'          : {
        'server-name'   : machine,
        'pid'           : pid
      },

      'request'         : {
        'method'        : req.method,
        'protocol'      : req.protocol,
        'version'       : req.httpVersionMajor + '.' + req.httpVersionMinor,
        'hostname'      : req.hostname,
        'path'          : req.path,
        'query'         : Object.keys(req.query).length > 0 ? req.query : '',
        'session'       : req.sessionID,
        'body'          : req.body,
        'remote-address': req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
                          (req.socket && req.socket.remoteAddress) ||
                          (req.socket.socket && req.socket.socket.remoteAddresss)
      },

      'response'        : {
        'status'        : res._headers ? res.statusCode.toString() : '',
        'content-length': content ? content + ' bytes' : '',
        'response-time' : time + ' ms'
      },

      'url'             : req.originalUrl || req.url,
      'user-agent'      : useragent.lookup(req.headers['user-agent']),
      'referrer'        : req.headers['referer'] || req.headers['referrer']

      // 'req-headers'    : req.headers,
      // 'res-headers'    : res._headers

    };

    return recordObj;
  };

  // Main logging middleware
  return function logger (req, res, next) {
    // Capture start time
    req._startAt = process.hrtime();

    function logRequest () {
      // Create log record
      var record = logFormat(req, res);
      // Send it to Loggly
      client.log(record, config.tags, function (err, result) {
        if (err) {
          debug(err.message);
        } else {
          debug('Log Record: ' + JSON.stringify(record));
          debug('Response: ' + JSON.stringify(result));
        }
      });
    }

    if (immediate) {
      logRequest();
    } else {
      // Wait for response
      onFinished(res, logRequest);
    }

    // Call next(), otherwise hang the application.
    next();
  };

  // Calculate response time
  function getResponseTime (req, res) {
    if (!res._header || !req._startAt) {
      return '';
    }
    var diff = process.hrtime(req._startAt);
    var ms = diff[0] * 1e3 + diff[1] * 1e-6;
    return ms.toFixed(3);
  }

  // Get response length
  function getLength (req, res, field) {
    return (res._headers || {})[field.toLowerCase()];
  }

};

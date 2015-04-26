/* ========================================================================
 * Bootstrap: transition.js v3.3.2
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.2
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.2'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.2
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $(this.options.trigger).filter('[href="#' + element.id + '"], [data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.2'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true,
    trigger: '[data-toggle="collapse"]'
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $.extend({}, $this.data(), { trigger: this })

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.2
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.2'

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--                        // up
    if (e.which == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown)

}(jQuery);

;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

!function(e,t){"function"==typeof define&&define.amd?define(t):"object"==typeof exports?module.exports=t(require,exports,module):e.scrollReveal=t()}(this,function(){return window.scrollReveal=function(e){"use strict";function t(t){return r=this,r.elems={},r.serial=1,r.blocked=!1,r.config=o(r.defaults,t),r.isMobile()&&!r.config.mobile||!r.isSupported()?void r.destroy():(r.config.viewport===e.document.documentElement?(e.addEventListener("scroll",a,!1),e.addEventListener("resize",a,!1)):r.config.viewport.addEventListener("scroll",a,!1),void r.init(!0))}var i,o,a,r;return t.prototype={defaults:{enter:"bottom",move:"8px",over:"0.6s",wait:"0s",easing:"ease",scale:{direction:"up",power:"5%"},rotate:{x:0,y:0,z:0},opacity:0,mobile:!1,reset:!1,viewport:e.document.documentElement,delay:"once",vFactor:.6,complete:function(){}},init:function(e){var t,i,o;o=Array.prototype.slice.call(r.config.viewport.querySelectorAll("[data-sr]")),o.forEach(function(e){t=r.serial++,i=r.elems[t]={domEl:e},i.config=r.configFactory(i),i.styles=r.styleFactory(i),i.seen=!1,e.removeAttribute("data-sr"),e.setAttribute("style",i.styles.inline+i.styles.initial)}),r.scrolled=r.scrollY(),r.animate(e)},animate:function(e){function t(e){var t=r.elems[e];setTimeout(function(){t.domEl.setAttribute("style",t.styles.inline),t.config.complete(t.domEl),delete r.elems[e]},t.styles.duration)}var i,o,a;for(i in r.elems)r.elems.hasOwnProperty(i)&&(o=r.elems[i],a=r.isElemInViewport(o),a?("always"===r.config.delay||"onload"===r.config.delay&&e||"once"===r.config.delay&&!o.seen?o.domEl.setAttribute("style",o.styles.inline+o.styles.target+o.styles.transition):o.domEl.setAttribute("style",o.styles.inline+o.styles.target+o.styles.reset),o.seen=!0,o.config.reset||o.animating||(o.animating=!0,t(i))):!a&&o.config.reset&&o.domEl.setAttribute("style",o.styles.inline+o.styles.initial+o.styles.reset));r.blocked=!1},configFactory:function(e){var t={},i={},a=e.domEl.getAttribute("data-sr").split(/[, ]+/);return a.forEach(function(e,i){switch(e){case"enter":t.enter=a[i+1];break;case"wait":t.wait=a[i+1];break;case"move":t.move=a[i+1];break;case"ease":t.move=a[i+1],t.ease="ease";break;case"ease-in":if("up"==a[i+1]||"down"==a[i+1]){t.scale.direction=a[i+1],t.scale.power=a[i+2],t.easing="ease-in";break}t.move=a[i+1],t.easing="ease-in";break;case"ease-in-out":if("up"==a[i+1]||"down"==a[i+1]){t.scale.direction=a[i+1],t.scale.power=a[i+2],t.easing="ease-in-out";break}t.move=a[i+1],t.easing="ease-in-out";break;case"ease-out":if("up"==a[i+1]||"down"==a[i+1]){t.scale.direction=a[i+1],t.scale.power=a[i+2],t.easing="ease-out";break}t.move=a[i+1],t.easing="ease-out";break;case"hustle":if("up"==a[i+1]||"down"==a[i+1]){t.scale.direction=a[i+1],t.scale.power=a[i+2],t.easing="cubic-bezier( 0.6, 0.2, 0.1, 1 )";break}t.move=a[i+1],t.easing="cubic-bezier( 0.6, 0.2, 0.1, 1 )";break;case"over":t.over=a[i+1];break;case"flip":case"pitch":t.rotate=t.rotate||{},t.rotate.x=a[i+1];break;case"spin":case"yaw":t.rotate=t.rotate||{},t.rotate.y=a[i+1];break;case"roll":t.rotate=t.rotate||{},t.rotate.z=a[i+1];break;case"reset":t.reset="no"==a[i-1]?!1:!0;break;case"scale":if(t.scale={},"up"==a[i+1]||"down"==a[i+1]){t.scale.direction=a[i+1],t.scale.power=a[i+2];break}t.scale.power=a[i+1];break;case"vFactor":case"vF":t.vFactor=a[i+1];break;case"opacity":t.opacity=a[i+1];break;default:return}}),i=o(i,r.config),i=o(i,t),"top"===i.enter||"bottom"===i.enter?i.axis="Y":("left"===i.enter||"right"===i.enter)&&(i.axis="X"),("top"===i.enter||"left"===i.enter)&&(i.move="-"+i.move),i},styleFactory:function(e){function t(){0!==parseInt(s.move)&&(o+=" translate"+s.axis+"("+s.move+")",r+=" translate"+s.axis+"(0)"),0!==parseInt(s.scale.power)&&("up"===s.scale.direction?s.scale.value=1-.01*parseFloat(s.scale.power):"down"===s.scale.direction&&(s.scale.value=1+.01*parseFloat(s.scale.power)),o+=" scale("+s.scale.value+")",r+=" scale(1)"),s.rotate.x&&(o+=" rotateX("+s.rotate.x+")",r+=" rotateX(0)"),s.rotate.y&&(o+=" rotateY("+s.rotate.y+")",r+=" rotateY(0)"),s.rotate.z&&(o+=" rotateZ("+s.rotate.z+")",r+=" rotateZ(0)"),o+="; opacity: "+s.opacity+"; ",r+="; opacity: 1; "}var i,o,a,r,n,s=e.config,c=1e3*(parseFloat(s.over)+parseFloat(s.wait));return i=e.domEl.getAttribute("style")?e.domEl.getAttribute("style")+"; visibility: visible; ":"visibility: visible; ",n="-webkit-transition: -webkit-transform "+s.over+" "+s.easing+" "+s.wait+", opacity "+s.over+" "+s.easing+" "+s.wait+"; transition: transform "+s.over+" "+s.easing+" "+s.wait+", opacity "+s.over+" "+s.easing+" "+s.wait+"; -webkit-perspective: 1000;-webkit-backface-visibility: hidden;",a="-webkit-transition: -webkit-transform "+s.over+" "+s.easing+" 0s, opacity "+s.over+" "+s.easing+" 0s; transition: transform "+s.over+" "+s.easing+" 0s, opacity "+s.over+" "+s.easing+" 0s; -webkit-perspective: 1000; -webkit-backface-visibility: hidden; ",o="transform:",r="transform:",t(),o+="-webkit-transform:",r+="-webkit-transform:",t(),{transition:n,initial:o,target:r,reset:a,inline:i,duration:c}},getViewportH:function(){var t=r.config.viewport.clientHeight,i=e.innerHeight;return r.config.viewport===e.document.documentElement&&i>t?i:t},scrollY:function(){return r.config.viewport===e.document.documentElement?e.pageYOffset:r.config.viewport.scrollTop+r.config.viewport.offsetTop},getOffset:function(e){var t=0,i=0;do isNaN(e.offsetTop)||(t+=e.offsetTop),isNaN(e.offsetLeft)||(i+=e.offsetLeft);while(e=e.offsetParent);return{top:t,left:i}},isElemInViewport:function(t){function i(){var e=n+a*c,t=s-a*c,i=r.scrolled+r.getViewportH(),o=r.scrolled;return i>e&&t>o}function o(){var i=t.domEl,o=i.currentStyle||e.getComputedStyle(i,null);return"fixed"===o.position}var a=t.domEl.offsetHeight,n=r.getOffset(t.domEl).top,s=n+a,c=t.config.vFactor||0;return i()||o()},isMobile:function(){var t=navigator.userAgent||navigator.vendor||e.opera;return/(ipad|playbook|silk|android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4))?!0:!1},isSupported:function(){for(var e=document.createElement("sensor"),t="Webkit,Moz,O,".split(","),i=("transition "+t.join("transition,")).split(","),o=0;o<i.length;o++)if(""===!e.style[i[o]])return!1;return!0},destroy:function(){var e=r.config.viewport,t=Array.prototype.slice.call(e.querySelectorAll("[data-sr]"));t.forEach(function(e){e.removeAttribute("data-sr")})}},a=function(){r.blocked||(r.blocked=!0,r.scrolled=r.scrollY(),i(function(){r.animate()}))},o=function(e,t){for(var i in t)t.hasOwnProperty(i)&&(e[i]=t[i]);return e},i=function(){return e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||function(t){e.setTimeout(t,1e3/60)}}(),t}(window),scrollReveal});
/** ********************************************** **
 @Author			Dorin Grigoras
 @Website		www.stepofweb.com
 @Last Update	Saturday, March 15, 2014

 NOTE! 	Do not change anything here if you want to
 be able to update in the future! Please use
 your custom script (eg. custom.js).


 TABLE CONTENTS
 -------------------------------
 01. Top Nav
 02. Animate
 03. Superslides
 04. OWL Carousel
 05. Popover
 06. Lightbox
 07. ScrollTo
 08. Parallax
 09. Masonry Filter
 10. Toggle
 11. Background Image
 12. Global Search
 13. Quick Cart
 14. Placeholder
 15. Summernote HTML Editor

 GOOGLE MAP
 AFTER RESIZE
 COUNT TO
 FITVIDS
 WAIT FOR IMAGES [used by masonry]
 *************************************************** **/

/* Init */
jQuery(window).ready(function () {
  Atropos();
});


/** Core
 **************************************************************** **/
function Atropos() {
  _topNav();
  _animate();
  _superslide();
  _owl_carousel();
  _popover();
  _lightbox();
  _scrollTo();
  _parallax();
  _masonry();
  _toggle();
  _bgimage();
  _globalSearch();
  _quickCart();
  _placeholder();
  _htmlEditor();

  /** Bootstrap Tooltip **/
  jQuery("a[data-toggle=tooltip]").tooltip();

  /** Fitvids [Youtube|Vimeo] **/
  if(jQuery(".fullwidthbanner iframe").length < 1 && jQuery(".fullscreenbanner iframe").length < 1 && jQuery(".fullscreenvideo").length < 1) { // disable fitvids if revolution slider video is present!
    jQuery("body").fitVids();
  }

  /**
   price slider

   <script type="text/javascript" charset="utf-8">
   var slider_config = { from: 10, to: 500, heterogeneity: ['50/100', '75/250'], step: 10, dimension: '&nbsp;$', skin: 'round_plastic' };
   </script>
   **/
  if(jQuery().slider && jQuery(".price-slider").length > 0) {
    jQuery("#Slider2").slider(slider_config);
  }

  /** mobile - hide on click! **/
  jQuery(document).bind("click", function() {
    if(jQuery("div.navbar-collapse").hasClass('in')) {
      jQuery("button.btn-mobile").trigger('click');
    }
  });

}


/** 01. Top Nav
 **************************************************************** **/
function _topNav() {
  var addActiveClass = false;

  jQuery("#topMain li.dropdown > a, #topMain li.dropdown-submenu > a").bind("click", function(e) {
    e.preventDefault();
    e.stopPropagation();

    if($(window).width() > 979) {
      return;
    }


    addActiveClass = jQuery(this).parent().hasClass("resp-active");
    jQuery("#topMain").find(".resp-active").removeClass("resp-active");

    if(!addActiveClass) {
      jQuery(this).parents("li").addClass("resp-active");
    }

    return;

  });

  // Drop Downs - do not hide on click
  jQuery("#topHead .dropdown-menu, #topNav .mega-menu .dropdown-menu").bind("click", function(e) {
    e.stopPropagation();
  });

  jQuery(window).scroll(function() {

    if(jQuery(window).width() > 1006) {
      topMain(); // on scroll
    }

  });

  if(jQuery(window).width() > 1006) {
    topMain(); // on load
  }



  // #topHead Fixes
  window._headHeight		= 81;
  window._headHeightSmall	= 30;

  function _topNavCalibrate() {

    if(jQuery("#topHead").length > 0) {
      window._headHeight 		= jQuery("header#topHead").outerHeight() + jQuery("header#topNav").outerHeight() - 10;
      window._headHeightSmall	= 66;

      jQuery('#wrapper').css({"padding-top":window._headHeight + "px"});
      jQuery('#topHead').removeClass('fixed').addClass('fixed');

      if(jQuery('#header_shadow').length > 0) {
        jQuery('#header_shadow').css({"top":window._headHeight + "px"});
      }

    } else {

      if(jQuery(window).width() < 1006) {
        jQuery('#wrapper').css({"margin-top":"-30px"});
        jQuery('#header_shadow').css({"top":"40px"});
      } else {
        jQuery('#wrapper').css({"margin-top":"0px"});
        jQuery('#header_shadow').css({"top":"80px"});
      }

    }

  }

  // recalibrate menu (mobile = slim mode) on resize
  jQuery(window).resize(function() {
    _topNavCalibrate();
  });	_topNavCalibrate();


  // scoll is on top!
  window.topNavSmall = false;


  function topMain() {
    var _scrollTop 		= jQuery(document).scrollTop();

    if(window.topNavSmall === false && _scrollTop > 0) {

      jQuery('header#topNav div.nav-main-collapse').addClass('topFix');
      jQuery('#topNav').stop().animate({ 'height':'60px'},400);
      jQuery('header#topNav div.nav-main-collapse').stop().animate({ 'margin-top':'6px'},400);
      jQuery('header#topNav button').stop().animate({ 'margin-top':'0'},100);
      jQuery('header#topNav a.logo').stop().animate({ 'margin-top':'-10px'},400);

      if(jQuery('#header_shadow').length > 0) {
        jQuery('#header_shadow').stop().animate({ 'top':window._headHeightSmall + 'px'},400);/* just a little visible */
      }

      window.topNavSmall = true;
    }

    if(window.topNavSmall === true && _scrollTop < 3) {
      jQuery('header#topNav div.nav-main-collapse').removeClass('topFix');
      jQuery('#topNav').stop().animate({ 'height':'81px'},400);
      jQuery('header#topNav div.nav-main-collapse').stop().animate({ 'margin-top':'16px'},400);
      jQuery('header#topNav button').stop().animate({ 'margin-top':'8px'},100);
      jQuery('header#topNav a.logo').stop().animate({ 'line-height':'50px', 'margin-top':'0'},400);

      if(jQuery('#header_shadow').length > 0) {
        jQuery('#header_shadow').stop().animate({ 'top':window._headHeight + 'px'},400);
      }

      window.topNavSmall = false;
    }

  }
}


/** 02. Animate
 **************************************************************** **/
function _animate() {

  // Animation [appear]
  jQuery("[data-animation]").each(function() {
    var _t = jQuery(this);

    if(jQuery(window).width() > 767) {

      _t.appear(function() {

        var delay = (_t.attr("data-animation-delay") ? _t.attr("data-animation-delay") : 1);

        if(delay > 1) _t.css("animation-delay", delay + "ms");
        _t.addClass(_t.attr("data-animation"));

        setTimeout(function() {
          _t.addClass("animation-visible");
        }, delay);

      }, {accX: 0, accY: -150});

    } else {

      _t.addClass("animation-visible");

    }

  });

  // Bootstrap Progress Bar
  jQuery("[data-appear-progress-animation]").each(function() {
    var $_t = jQuery(this);

    if(jQuery(window).width() > 767) {

      $_t.appear(function() {
        _delay = 1;

        if($_t.attr("data-appear-progress-animation-delay")) {
          _delay = $_t.attr("data-appear-progress-animation-delay");
        }

        if(_delay > 1) {
          $_t.css("animation-delay", _delay + "ms");
        }

        $_t.addClass($_t.attr("data-appear-progress-animation"));

        setTimeout(function() {

          $_t.addClass("animation-visible");

        }, _delay);

      }, {accX: 0, accY: -150});

    } else {

      $_t.addClass("animation-visible");

    }

  });


  jQuery("[data-appear-progress-animation]").each(function() {
    var $_t = jQuery(this);

    $_t.appear(function() {

      var _delay = ($_t.attr("data-appear-animation-delay") ? $_t.attr("data-appear-animation-delay"): 1);

      if(_delay > 1) {
        $_t.css("animation-delay", _delay + "ms");
      }

      $_t.addClass($_t.attr("data-appear-animation"));
      setTimeout(function() {

        $_t.animate({"width": $_t.attr("data-appear-progress-animation")}, 1000, "easeOutQuad", function() {
          $_t.find(".progress-bar-tooltip").animate({"opacity": 1}, 500, "easeOutQuad");
        });

      }, _delay);

    }, {accX: 0, accY: -50});

  });


  // Count To
  jQuery(".countTo [data-to]").each(function() {
    var $_t = jQuery(this);

    $_t.appear(function() {

      $_t.countTo();

    }, {accX:0, accY:-150});

  });


  /* Knob Circular Bar */
  if(jQuery().knob) {

    jQuery(".knob").knob();

  }


  /* Animation */
  jQuery('.animate_from_top').each(function () {
    jQuery(this).appear(function() {
      jQuery(this).delay(150).animate({opacity:1,top:"0px"},1000);
    });
  });

  jQuery('.animate_from_bottom').each(function () {
    jQuery(this).appear(function() {
      jQuery(this).delay(150).animate({opacity:1,bottom:"0px"},1000);
    });
  });


  jQuery('.animate_from_left').each(function () {
    jQuery(this).appear(function() {
      jQuery(this).delay(150).animate({opacity:1,left:"0px"},1000);
    });
  });


  jQuery('.animate_from_right').each(function () {
    jQuery(this).appear(function() {
      jQuery(this).delay(150).animate({opacity:1,right:"0px"},1000);
    });
  });

  jQuery('.animate_fade_in').each(function () {
    jQuery(this).appear(function() {
      jQuery(this).delay(350).animate({opacity:1,right:"0px"},1000);
    });
  });
}




/** 03. Superslides
 **************************************************************** **/
function _superslide() {

  if(jQuery("#slider").length > 0) {

    var data_autoplay 		= jQuery("#slider").attr('data-autoplay'),
      data_mouseover_stop = jQuery("#slider").attr('data-mouseover-stop');

    if(data_autoplay) {
      if(data_autoplay == '') {
        var data_autoplay = false;
      } else {
        var data_autoplay = parseInt(data_autoplay);
      }
    } else {
      var data_autoplay = false;
    }

    if(!data_autoplay) {
      data_mouseover_stop = false;
    }

    jQuery("#slider").superslides({
      animation: "fade", 				// slide|fade
      pagination: true, 				// true|false
      play: data_autoplay,	 		// false to disable autoplay -OR- miliseconds (eg.: 1000 = 1s)
      animation_speed: 600,			// animation transition

      elements: {
        preserve: '.preserve',
        nav: '.slides-navigation',
        container: '.slides-container',
        pagination: '.slides-pagination'
      }
    });

    if(data_mouseover_stop == 'true') {

      // Stop on mouse over !
      jQuery('#slider').on('mouseenter', function() {
        jQuery(this).superslides('stop');
        // console.log('Stopped')
      });
      jQuery('#slider').on('mouseleave', function() {
        jQuery(this).superslides('start');
        // console.log('_start')
      });

    }

    jQuery(window).load(function () {
      jQuery("#slider").css({"background":"none"});
    });

  }
}




/** 04. OWL Carousel
 **************************************************************** **/
function _owl_carousel() {

  var total = jQuery("div.owl-carousel").length,
    count = 0;

  jQuery("div.owl-carousel").each(function() {

    var slider 		= jQuery(this);
    var options 	= slider.attr('data-plugin-options');

    var defaults = {
      items: 					5,
      itemsCustom: 			false,
      itemsDesktop: 			[1199,4],
      itemsDesktopSmall: 		[980,3],
      itemsTablet: 			[768,2],
      itemsTabletSmall: 		false,
      itemsMobile: 			[479,1],
      singleItem: 			true,
      itemsScaleUp: 			false,

      slideSpeed: 			200,
      paginationSpeed: 		800,
      rewindSpeed: 			1000,

      autoPlay: 				false,
      stopOnHover: 			false,

      navigation: 			false,
      navigationText: [
        '<i class="fa fa-chevron-left"></i>',
        '<i class="fa fa-chevron-right"></i>'
      ],
      rewindNav: 				true,
      scrollPerPage: 			false,

      pagination: 			true,
      paginationNumbers: 		false,

      responsive: 			true,
      responsiveRefreshRate: 	200,
      responsiveBaseWidth: 	window,

      baseClass: 				"owl-carousel",
      theme: 					"owl-theme",

      lazyLoad: 				false,
      lazyFollow: 			true,
      lazyEffect: 			"fade",

      autoHeight: 			false,

      jsonPath: 				false,
      jsonSuccess: 			false,

      dragBeforeAnimFinish: 	true,
      mouseDrag: 				true,
      touchDrag: 				true,

      transitionStyle: 		false,

      addClassActive: 		false,

      beforeUpdate: 			false,
      afterUpdate: 			false,
      beforeInit: 			false,
      afterInit: 				false,
      beforeMove: 			false,
      afterMove: 				false,
      afterAction: 			false,
      startDragging: 			false,
      afterLazyLoad: 			false
    }

    var config = jQuery.extend({}, defaults, options, slider.data("plugin-options"));
    slider.owlCarousel(config).addClass("owl-carousel-init");
  });
}




/** 05. Popover
 **************************************************************** **/
function _popover() {

  jQuery("a[data-toggle=popover]").bind("click", function(e) {
    jQuery('.popover-title .close').remove();
    e.preventDefault();
  });

  var isVisible 	= false,
    clickedAway = false;


  jQuery("a[data-toggle=popover], button[data-toggle=popover]").popover({

    html: true,
    trigger: 'manual'

  }).click(function(e) {

    jQuery(this).popover('show');

    clickedAway = false;
    isVisible = true;
    e.preventDefault();

  });

  jQuery(document).click(function(e) {
    if(isVisible & clickedAway) {

      jQuery("a[data-toggle=popover], button[data-toggle=popover]").popover('hide');
      isVisible = clickedAway = false;

    } else {


      clickedAway = true;

    }

  });

  jQuery("a[data-toggle=popover], button[data-toggle=popover]").popover({

    html: true,
    trigger: 'manual'

  }).click(function(e) {

    $(this).popover('show');
    $('.popover-title').append('<button type="button" class="close">&times;</button>');
    $('.close').click(function(e){

      jQuery("a[data-toggle=popover], button[data-toggle=popover]").popover('hide');

    });

    e.preventDefault();
  });


  // jQuery("a[data-toggle=popover], button[data-toggle=popover]").popover();
}




/** 06. LightBox
 **************************************************************** **/
function _lightbox() {

  if(typeof(jQuery.magnificPopup) == "undefined") {
    return false;
  }

  jQuery.extend(true, jQuery.magnificPopup.defaults, {
    tClose: 		'Close',
    tLoading: 		'Loading...',

    gallery: {
      tPrev: 		'Previous',
      tNext: 		'Next',
      tCounter: 	'%curr% / %total%'
    },

    image: 	{
      tError: 	'Image not loaded!'
    },

    ajax: 	{
      tError: 	'Content not loaded!'
    }
  });

  jQuery(".lightbox").each(function() {

    var _t 			= jQuery(this),
      options 	= _t.attr('data-plugin-options'),
      config		= {},
      defaults 	= {
        type: 				'image',
        fixedContentPos: 	false,
        fixedBgPos: 		false,
        mainClass: 			'mfp-no-margins mfp-with-zoom',
        image: {
          verticalFit: 	true
        },

        zoom: {
          enabled: 		false,
          duration: 		300
        },

        gallery: {
          enabled: false,
          navigateByImgClick: true,
          preload: 			[0,1],
          arrowMarkup: 		'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
          tPrev: 				'Previou',
          tNext: 				'Next',
          tCounter: 			'<span class="mfp-counter">%curr% / %total%</span>'
        },
      };

    if(_t.data("plugin-options")) {
      config = jQuery.extend({}, defaults, options, _t.data("plugin-options"));
    }

    jQuery(this).magnificPopup(config);

  });
}




/** 07. ScrollTo
 **************************************************************** **/
function _scrollTo() {

  jQuery("a.scrollTo").bind("click", function(e) {
    e.preventDefault();

    var href = jQuery(this).attr('href');

    if(href != '#') {
      jQuery('html,body').animate({scrollTop: jQuery(href).offset().top - 60}, 1000, 'easeInOutExpo');
    }
  });

  jQuery("a.toTop").bind("click", function(e) {
    e.preventDefault();
    jQuery('html,body').animate({scrollTop: 0}, 1000, 'easeInOutExpo');
  });
}




/** 08. Parallax
 **************************************************************** **/
function _parallax() {

  if(typeof(jQuery.stellar) == "undefined") {

    jQuery(".parallax").addClass("parallax-init");
    return false;

  }

  jQuery(window).load(function () {

    if(jQuery(".parallax").length > 0) {

      if(!Modernizr.touch) {

        jQuery(window).stellar({

          responsive:				true,
          scrollProperty: 		'scroll',
          parallaxElements:		false,
          horizontalScrolling: 	false,
          horizontalOffset: 		0,
          verticalOffset: 		0
        });

      } else {

        jQuery(".parallax").addClass("disabled");

      }
    }

    jQuery(".parallax").addClass("parallax-init");

    // responsive
    jQuery(window).afterResize(function() {
      jQuery.stellar('refresh');
    });

  });
}




/** 09. Masonry Filter
 **************************************************************** **/
function _masonry() {

  jQuery(window).load(function() {

    jQuery("span.js_loader").remove();
    jQuery("li.masonry-item").addClass('fadeIn');

    jQuery(".masonry-list").each(function() {

      var _c = jQuery(this);

      _c.waitForImages(function() { // waitForImages Plugin - bottom of this file

        _c.masonry({
          itemSelector: '.masonry-item'
        });

      });

    });

  });

  jQuery("ul.isotope-filter").each(function() {

    var _el		 		= jQuery(this),
      destination 	= jQuery("ul.sort-destination[data-sort-id=" + jQuery(this).attr("data-sort-id") + "]");

    if(destination.get(0)) {

      jQuery(window).load(function() {

        destination.isotope({
          itemSelector: 	"li",
          layoutMode: 	'sloppyMasonry'
        });

        _el.find("a").click(function(e) {

          e.preventDefault();

          var $_t 	= jQuery(this),
            sortId 	= $_t.parents(".sort-source").attr("data-sort-id"),
            filter 	= $_t.parent().attr("data-option-value");

          _el.find("li.active").removeClass("active");
          $_t.parent().addClass("active");

          destination.isotope({
            filter: filter
          });

          jQuery(".sort-source-title[data-sort-id=" + sortId + "] strong").html($_t.html());
          return false;

        });

      });

    }

  });


  jQuery(window).load(function() {

    jQuery("ul.isotope").addClass('fadeIn');

  });
}





/** 10. Toggle
 **************************************************************** **/
function _toggle() {

  var $_t = this,
    previewParClosedHeight = 25;

  jQuery("div.toggle.active > p").addClass("preview-active");
  jQuery("div.toggle.active > div.toggle-content").slideDown(400);
  jQuery("div.toggle > label").click(function(e) {

    var parentSection 	= jQuery(this).parent(),
      parentWrapper 	= jQuery(this).parents("div.toogle"),
      previewPar 		= false,
      isAccordion 	= parentWrapper.hasClass("toogle-accordion");

    if(isAccordion && typeof(e.originalEvent) != "undefined") {
      parentWrapper.find("div.toggle.active > label").trigger("click");
    }

    parentSection.toggleClass("active");

    if(parentSection.find("> p").get(0)) {

      previewPar 					= parentSection.find("> p");
      var previewParCurrentHeight = previewPar.css("height");
      var previewParAnimateHeight = previewPar.css("height");
      previewPar.css("height", "auto");
      previewPar.css("height", previewParCurrentHeight);

    }

    var toggleContent = parentSection.find("> div.toggle-content");

    if(parentSection.hasClass("active")) {

      jQuery(previewPar).animate({height: previewParAnimateHeight}, 350, function() {jQuery(this).addClass("preview-active");});
      toggleContent.slideDown(350);

    } else {

      jQuery(previewPar).animate({height: previewParClosedHeight}, 350, function() {jQuery(this).removeClass("preview-active");});
      toggleContent.slideUp(350);

    }

  });
}




/** 11. Background Image
 class="boxed" should be added to body.
 Add to body - example: data-background="assets/img/boxed_background/1.jpg"
 **************************************************************** **/
function _bgimage() {
  if(jQuery('body').hasClass('boxed')) {
    backgroundImageSwitch();
  }
  function backgroundImageSwitch() {
    var data_background = jQuery('body').attr('data-background');
    if(data_background) {
      jQuery.backstretch(data_background);
      jQuery('body').addClass('transparent'); // remove backround color of boxed class
    }
  }
}




/** 12. Global Search
 **************************************************************** **/
function _globalSearch() {

  jQuery('li.search, li.search input').bind("click", function(e) {
    e.stopPropagation();
  });

  jQuery('li.search input').bind("click", function() {
    return false;
  });

  jQuery('li.search').bind("click", function() {

    if(jQuery(this).hasClass('open')) {

      disable_overlay();
      enable_scroll();
      jQuery(this).removeClass('open');

    } else {

      enable_overlay();
      disable_scroll();
      jQuery(this).addClass('open');
      jQuery('li.quick-cart').removeClass('open'); // close quick cart

    }

  });

  // 'esc' key
  jQuery(document).keydown(function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if(code == 27) {
      jQuery('li.search, li.quick-cart').removeClass('open');
      disable_overlay();
      enable_scroll();
    }
  });

  jQuery(document).bind("click", function() {
    if(jQuery('li.search').hasClass('open')) {
      jQuery('li.search, li.quick-cart').removeClass('open');
      disable_overlay();
      enable_scroll();
    }
  });

}



/** 13. Quick Cart
 **************************************************************** **/
function _quickCart() {

  jQuery('li.quick-cart').bind("click", function() {

    jQuery('li.quick-cart .quick-cart-content').bind("click", function(e) {
      e.stopPropagation();
    });

    if(jQuery(this).hasClass('open')) {

      disable_overlay();
      enable_scroll();
      jQuery(this).removeClass('open');

    } else {

      enable_overlay();
      disable_scroll();
      jQuery(this).addClass('open');
      jQuery('li.search').removeClass('open'); // close search

    }

    return false;
  });

  // 'esc' key
  jQuery(document).keydown(function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if(code == 27) {
      jQuery('li.search, li.quick-cart').removeClass('open');
      disable_overlay();
      enable_scroll();
    }
  });

  jQuery(document).bind("click", function() {
    if(jQuery('li.quick-cart').hasClass('open')) {
      jQuery('li.search, li.quick-cart').removeClass('open');
      disable_overlay();
      enable_scroll();
    }
  });

}





/** 14. Placeholder
 **************************************************************** **/
function _placeholder() {

  //check for IE
  if(navigator.appVersion.indexOf("MSIE")!=-1) {

    jQuery('[placeholder]').focus(function() {

      var input = jQuery(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
        input.removeClass('placeholder');
      }

    }).blur(function() {

      var input = jQuery(this);
      if (input.val() == '' || input.val() == input.attr('placeholder')) {
        input.addClass('placeholder');
        input.val(input.attr('placeholder'));
      }

    }).blur();

  }

}



/** 15. Summernote HTML Editor
 **************************************************************** **/
function _htmlEditor() {
  /**
   SUMMERNOTE - textarea html editor

   <script type="text/javascript" src="assets/plugins/html_summernote/summernote.min.js"></script>
   **/
  if(jQuery('textarea.summernote').length > 0 && jQuery().summernote) {
    jQuery('textarea.summernote').each(function() {
      jQuery(this).summernote({
        height: jQuery(this).attr('data-height') || 200,
        toolbar: [
          /*	[groupname, 	[button list]]	*/
          ['fontsize', 	['fontsize']],
          ['style', 		['bold', 'italic', 'underline','strikethrough', 'clear']],
          ['para', 		['ul', 'ol', 'paragraph']],
          ['table', 		['table']],
          ['media', 		['link', 'picture', 'video']],
          ['misc', 		['codeview']]
        ]
      });
    });
  }
}

/** **************************************************************************************************************** **/
/** **************************************************************************************************************** **/
/** **************************************************************************************************************** **/
/** **************************************************************************************************************** **/



// scroll
function wheel(e) {
  e.preventDefault();
}

function disable_scroll() {
  if (window.addEventListener) {
    window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
}

function enable_scroll() {
  if (window.removeEventListener) {
    window.removeEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = document.onkeydown = null;
}

// overlay
function enable_overlay() {
  jQuery("span.global-overlay").remove(); // remove first!
  jQuery('body').append('<span class="global-overlay"></span>');
}
function disable_overlay() {
  jQuery("span.global-overlay").remove();
}



/**	MEDIA ELEMENTS
 *************************************************** **/
if(jQuery().mediaelementplayer && jQuery('video').length > 0 && jQuery(".fullscreenbanner video").length < 1 && jQuery(".fullwidthbanner video").length < 1) { // exclude revolution slider videos
  jQuery('video').mediaelementplayer({
    // if the <video width> is not specified, this is the default
    defaultVideoWidth: 480,
    // if the <video height> is not specified, this is the default
    defaultVideoHeight: 270,
    // if set, overrides <video width>
    videoWidth: '100%', // -1
    // if set, overrides <video height>
    videoHeight: '100%', // -1
    // width of audio player
    audioWidth: 400,
    // height of audio player
    audioHeight: 30,
    // initial volume when the player starts
    startVolume: 0.8,
    // useful for <audio> player loops
    loop: true,
    // enables Flash and Silverlight to resize to content size
    enableAutosize: true,
    // the order of controls you want on the control bar (and other plugins below)
    features: ['playpause','progress','current','duration','tracks','volume','fullscreen'],
    // Hide controls when playing and mouse is not over the video
    alwaysShowControls: false,
    // force iPad's native controls
    iPadUseNativeControls: false,
    // force iPhone's native controls
    iPhoneUseNativeControls: false,
    // force Android's native controls
    AndroidUseNativeControls: false,
    // forces the hour marker (##:00:00)
    alwaysShowHours: false,
    // show framecount in timecode (##:00:00:00)
    showTimecodeFrameCount: false,
    // used when showTimecodeFrameCount is set to true
    framesPerSecond: 25,
    // turns keyboard support on and off for this instance
    enableKeyboard: true,
    // when this player starts, it will pause other players
    pauseOtherPlayers: true,
    // array of keyboard commands
    keyActions: []

  });

  setTimeout('eventClickTrigger()', 1000);
  function eventClickTrigger() {
    jQuery('video').trigger('click');
    // resizeToCover();
  }

  // VOVER STYLE
  var min_w = 300; // minimum video width allowed
  var vid_w_orig;  // original video dimensions
  var vid_h_orig;

  jQuery(function() { // runs after DOM has loaded
    vid_w_orig = parseInt(jQuery('video, source').attr('width'));
    vid_h_orig = parseInt(jQuery('video, source').attr('height'));
    jQuery(window).resize(function () { resizeToCover(); });
  });

  function resizeToCover() {

    // set the video viewport to the window size
    jQuery('.video-wrap').width(jQuery(window).width());
    jQuery('.video-wrap').height(jQuery(window).height());

    // use largest scale factor of horizontal/vertical
    var scale_h = jQuery(window).width() / vid_w_orig;
    var scale_v = jQuery(window).height() / vid_h_orig;
    var scale = scale_h > scale_v ? scale_h: scale_v;

    // don't allow scaled width < minimum video width
    if (scale * vid_w_orig < min_w) {scale = min_w / vid_w_orig;};

    // now scale the video
    jQuery('video, source').width(scale * vid_w_orig);
    jQuery('video, source').height(scale * vid_h_orig);

    // and center it by scrolling the video viewport
    jQuery('.video-wrap').scrollLeft((jQuery('video').width() - jQuery(window).width()) / 2);
    jQuery('.video-wrap').scrollTop((jQuery('video').height() - jQuery(window).height()) / 2);
  }

}



/**	GOOGLE MAP
 *************************************************** **/
function contactMap() {

  var latLang = new google.maps.LatLng($googlemap_latitude,$googlemap_longitude);

  var mapOptions = {
    zoom:$googlemap_zoom,
    center: latLang,
    disableDefaultUI: false,
    navigationControl: false,
    mapTypeControl: false,
    scrollwheel: false,
    // styles: styles,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById('gmap'), mapOptions);
  google.maps.event.trigger(map, 'resize');
  map.setZoom( map.getZoom() );

  var marker = new google.maps.Marker({
    icon: 'data:image/png;base64,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',
    position: latLang,
    map: map,
    title: ""
  });

  marker.setMap(map);
  google.maps.event.addListener(marker, "click", function() {
    // Add optionally an action for when the marker is clicked
  });

  // kepp googlemap responsive - center on resize
  google.maps.event.addDomListener(window, 'resize', function() {
    map.setCenter(latLang);
  });

}


function showMap(initWhat) {
  var script 		= document.createElement('script');
  script.type 	= 'text/javascript';
  script.src 		= 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&callback='+initWhat;
  document.body.appendChild(script);
}


// INIT CONTACT, NLY IF #contactMap EXISRS
if(jQuery("#gmap").length > 0) {
  showMap('contactMap');
}



/**	@Facebook
 *************************************************** **/
/*
 https://developers.facebook.com/docs/plugins/like-button/

 ADD TO YOUR CODE (just change data-href, that's all):

 <div class="fb-like" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button_count" data-action="like" data-show-faces="false" data-share="false"></div>
 */
if(jQuery("div.fb-like").length > 0) {

  jQuery('body').append('<div id="fb-root"></div>');

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

}

/**	@Google Plus
 *************************************************** **/
/*
 https://developers.google.com/+/web/+1button/

 <!-- Place this tag where you want the +1 button to render. -->
 <div class="g-plusone" data-size="medium" data-annotation="inline" data-width="300"></div>
 */
if(jQuery("div.g-plusone").length > 0) {

  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/platform.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();

}

/**	@Twitter
 *************************************************** **/
/*
 https://dev.twitter.com/docs/tweet-button

 <!-- Place this tag where you want the twitter button to render. -->
 <a href="https://twitter.com/share" class="twitter-share-button" data-lang="en">Tweet</a>
 */
if(jQuery("a.twitter-share-button").length > 0) {

  !function(d,s,id){
    var js,fjs=d.getElementsByTagName(s)[0];
    if(!d.getElementById(id)){js=d.createElement(s);
      js.id=id;js.src="https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js,fjs);}
  }(document,"script","twitter-wjs");

}





/** AFTER RESIZE
 http://www.mcshaman.com/afterresize-js-jquery-plugin/
 **************************************************************** **/

( function( $ ) {
  "use strict";

  // Define default settings
  var defaults = {
    action: function() {},
    runOnLoad: false,
    duration: 500
  };

  // Define global variables
  var settings = defaults,
    running = false,
    start;

  var methods = {};

  // Initial plugin configuration
  methods.init = function() {

    // Allocate passed arguments to settings based on type
    for( var i = 0; i <= arguments.length; i++ ) {
      var arg = arguments[i];
      switch ( typeof arg ) {
        case "function":
          settings.action = arg;
          break;
        case "boolean":
          settings.runOnLoad = arg;
          break;
        case "number":
          settings.duration = arg;
          break;
      }
    }

    // Process each matching jQuery object
    return this.each(function() {

      if( settings.runOnLoad ) { settings.action(); }

      jQuery(this).resize( function() {

        methods.timedAction.call( this );

      } );

    } );
  };

  methods.timedAction = function( code, millisec ) {

    var doAction = function() {
      var remaining = settings.duration;

      if( running ) {
        var elapse = new Date() - start;
        remaining = settings.duration - elapse;
        if( remaining <= 0 ) {
          // Clear timeout and reset running variable
          clearTimeout(running);
          running = false;
          // Perform user defined function
          settings.action();

          return;
        }
      }
      wait( remaining );
    };

    var wait = function( time ) {
      running = setTimeout( doAction, time );
    };

    // Define new action starting time
    start = new Date();

    // Define runtime settings if function is run directly
    if( typeof millisec === 'number' ) { settings.duration = millisec; }
    if( typeof code === 'function' ) { settings.action = code; }

    // Only run timed loop if not already running
    if( !running ) { doAction(); }

  };


  $.fn.afterResize = function( method ) {

    if( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    } else {
      return methods.init.apply( this, arguments );
    }

  };

})(jQuery);




/** COUNT TO
 https://github.com/mhuggins/jquery-countTo
 **************************************************************** **/
(function ($) {
  $.fn.countTo = function (options) {
    options = options || {};

    return jQuery(this).each(function () {
      // set options for current element
      var settings = jQuery.extend({}, $.fn.countTo.defaults, {
        from:            jQuery(this).data('from'),
        to:              jQuery(this).data('to'),
        speed:           jQuery(this).data('speed'),
        refreshInterval: jQuery(this).data('refresh-interval'),
        decimals:        jQuery(this).data('decimals')
      }, options);

      // how many times to update the value, and how much to increment the value on each update
      var loops = Math.ceil(settings.speed / settings.refreshInterval),
        increment = (settings.to - settings.from) / loops;

      // references & variables that will change with each update
      var self = this,
        $self = jQuery(this),
        loopCount = 0,
        value = settings.from,
        data = $self.data('countTo') || {};

      $self.data('countTo', data);

      // if an existing interval can be found, clear it first
      if (data.interval) {
        clearInterval(data.interval);
      }
      data.interval = setInterval(updateTimer, settings.refreshInterval);

      // __construct the element with the starting value
      render(value);

      function updateTimer() {
        value += increment;
        loopCount++;

        render(value);

        if (typeof(settings.onUpdate) == 'function') {
          settings.onUpdate.call(self, value);
        }

        if (loopCount >= loops) {
          // remove the interval
          $self.removeData('countTo');
          clearInterval(data.interval);
          value = settings.to;

          if (typeof(settings.onComplete) == 'function') {
            settings.onComplete.call(self, value);
          }
        }
      }

      function render(value) {
        var formattedValue = settings.formatter.call(self, value, settings);
        $self.html(formattedValue);
      }
    });
  };

  $.fn.countTo.defaults = {
    from: 0,               // the number the element should start at
    to: 0,                 // the number the element should end at
    speed: 1000,           // how long it should take to count between the target numbers
    refreshInterval: 100,  // how often the element should be updated
    decimals: 0,           // the number of decimal places to show
    formatter: formatter,  // handler for formatting the value before rendering
    onUpdate: null,        // callback method for every time the element is updated
    onComplete: null       // callback method for when the element finishes updating
  };

  function formatter(value, settings) {
    return value.toFixed(settings.decimals);
  }
}(jQuery));





/** FITVIDS
 http://fitvidsjs.com/
 **************************************************************** **/
(function( $ ){

  "use strict";

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null
    };

    if(!document.getElementById('fit-vids-style')) {

      var div = document.createElement('div'),
        ref = document.getElementsByTagName('base')[0] || document.getElementsByTagName('script')[0];

      div.className = 'fit-vids-style';
      div.id = 'fit-vids-style';
      div.style.display = 'none';
      div.innerHTML = '&shy;<style>         \
        .fluid-width-video-wrapper {        \
           width: 100%;                     \
           position: relative;              \
           padding: 0;                      \
        }                                   \
                                            \
        .fluid-width-video-wrapper iframe,  \
        .fluid-width-video-wrapper object,  \
        .fluid-width-video-wrapper embed {  \
           position: absolute;              \
           top: 0;                          \
           left: 0;                         \
           width: 100%;                     \
           height: 100%;                    \
        }                                   \
      </style>';

      ref.parentNode.insertBefore(div,ref);

    }

    if ( options ) {
      jQuery.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src*='player.vimeo.com']",
        "iframe[src*='youtube.com']",
        "iframe[src*='youtube-nocookie.com']",
        "iframe[src*='kickstarter.com'][src*='video.html']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = jQuery(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

      $allVideos.each(function(){
        var $_t = jQuery(this);
        if (this.tagName.toLowerCase() === 'embed' && $_t.parent('object').length || $_t.parent('.fluid-width-video-wrapper').length) { return; }
        var height = ( this.tagName.toLowerCase() === 'object' || ($_t.attr('height') && !isNaN(parseInt($_t.attr('height'), 10))) ) ? parseInt($_t.attr('height'), 10): $_t.height(),
          width = !isNaN(parseInt($_t.attr('width'), 10)) ? parseInt($_t.attr('width'), 10): $_t.width(),
          aspectRatio = height / width;
        if(!$_t.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $_t.attr('id', videoID);
        }
        $_t.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $_t.removeAttr('height').removeAttr('width');
      });
    });
  };
})(jQuery);

// remove fitvids for a specific element: jQuery("#myDiv").unFitVids();
jQuery.fn.unFitVids = function () {
  var id = jQuery(this).attr("id");
  var $children = jQuery("#" + id + " .fluid-width-video-wrapper").children().clone();
  jQuery("#" + id + " .fluid-width-video-wrapper").remove(); //removes the element
  jQuery("#" + id).append($children); //adds it to the parent
};





/** WAIT FOR IMAGES [used by masonry]
 https://github.com/alexanderdickson/waitForImages
 **************************************************************** **/
;(function ($) {
  // Namespace all events.
  var eventNamespace = 'waitForImages';

  // CSS properties which contain references to images.
  $.waitForImages = {
    hasImageProperties: ['backgroundImage', 'listStyleImage', 'borderImage', 'borderCornerImage', 'cursor']
  };

  // Custom selector to find `img` elements that have a valid `src` attribute and have not already loaded.
  $.expr[':'].uncached = function (obj) {
    // Ensure we are dealing with an `img` element with a valid `src` attribute.
    if (!$(obj).is('img[src!=""]')) {
      return false;
    }

    // Firefox's `complete` property will always be `true` even if the image has not been downloaded.
    // Doing it this way works in Firefox.
    var img = new Image();
    img.src = obj.src;
    return !img.complete;
  };

  $.fn.waitForImages = function (finishedCallback, eachCallback, waitForAll) {

    var allImgsLength = 0;
    var allImgsLoaded = 0;

    // Handle options object.
    if ($.isPlainObject(arguments[0])) {
      waitForAll = arguments[0].waitForAll;
      eachCallback = arguments[0].each;
      // This must be last as arguments[0]
      // is aliased with finishedCallback.
      finishedCallback = arguments[0].finished;
    }

    // Handle missing callbacks.
    finishedCallback = finishedCallback || $.noop;
    eachCallback = eachCallback || $.noop;

    // Convert waitForAll to Boolean
    waitForAll = !! waitForAll;

    // Ensure callbacks are functions.
    if (!$.isFunction(finishedCallback) || !$.isFunction(eachCallback)) {
      throw new TypeError('An invalid callback was supplied.');
    }

    return this.each(function () {
      // Build a list of all imgs, dependent on what images will be considered.
      var obj = $(this);
      var allImgs = [];
      // CSS properties which may contain an image.
      var hasImgProperties = $.waitForImages.hasImageProperties || [];
      // To match `url()` references.
      // Spec: http://www.w3.org/TR/CSS2/syndata.html#value-def-uri
      var matchUrl = /url\(\s*(['"]?)(.*?)\1\s*\)/g;

      if (waitForAll) {

        // Get all elements (including the original), as any one of them could have a background image.
        obj.find('*').addBack().each(function () {
          var element = $(this);

          // If an `img` element, add it. But keep iterating in case it has a background image too.
          if (element.is('img:uncached')) {
            allImgs.push({
              src: element.attr('src'),
              element: element[0]
            });
          }

          $.each(hasImgProperties, function (i, property) {
            var propertyValue = element.css(property);
            var match;

            // If it doesn't contain this property, skip.
            if (!propertyValue) {
              return true;
            }

            // Get all url() of this element.
            while (match = matchUrl.exec(propertyValue)) {
              allImgs.push({
                src: match[2],
                element: element[0]
              });
            }
          });
        });
      } else {
        // For images only, the task is simpler.
        obj.find('img:uncached')
          .each(function () {
            allImgs.push({
              src: this.src,
              element: this
            });
          });
      }

      allImgsLength = allImgs.length;
      allImgsLoaded = 0;

      // If no images found, don't bother.
      if (allImgsLength === 0) {
        finishedCallback.call(obj[0]);
      }

      $.each(allImgs, function (i, img) {

        var image = new Image();

        // Handle the image loading and error with the same callback.
        $(image).on('load.' + eventNamespace + ' error.' + eventNamespace, function (event) {
          allImgsLoaded++;

          // If an error occurred with loading the image, set the third argument accordingly.
          eachCallback.call(img.element, allImgsLoaded, allImgsLength, event.type == 'load');

          if (allImgsLoaded == allImgsLength) {
            finishedCallback.call(obj[0]);
            return false;
          }

        });

        image.src = img.src;
      });
    });
  };
}(jQuery));

$(document).ready(function() {

  // This code could be used to set active (selected) navigation elements but it is kind of a hack.
  // $('.nav [href="'+ window.location.pathname +'"]').closest('li').toggleClass('active');
  // *Instead* we set the active menu item in the jade template via passing in the URL.

  // To handle facebook URL junk:
  // http://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState("", document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: documentElement.scrollTop,
        left: documentElement.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      documentElement.scrollTop = scroll.top;
      documentElement.scrollLeft = scroll.left;
    }
  }
});

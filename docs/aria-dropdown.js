/*
MIT License

Copyright (c) 2017 Davide Trisolini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory); //AMD
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery')); //CommonJS
  } else {
    factory(jQuery, window);
  }
}(function ($, window) {
  'use strict';
  var pluginName = 'ariaDropdown', // the name of the plugin
    a = {
      aCs: 'aria-controls',
      aHi: 'aria-hidden',
      aOw: 'aria-owns',
      aEx: 'aria-expanded',
      aHp: 'aria-haspopup',
      zIn: 'z-index',
      t: 'true',
      f: 'false',
      dCl: 'data-ariadropdown-collapselabel',
      dEl: 'data-ariadropdown-expandlabel'
    },
    count = 0,
    win = $(window);


  //-----------------------------------------
  //Private functions

  /*
   * set id of the element passed along
   * if the element does not have one
   * and return the id of the element
   */
  function setId(element, idPrefix, idSuffix) {
    if (!element.is('[id]')) {
      element.attr('id', idPrefix + idSuffix);
    }
    return element.attr('id');
  }

  /*
   * get all parents dropdowns starting from a DOM elemnent and traversing up
   */
  function getParentDropdowns(target, dataKey) {
    var dropdowns = [];

    while (target[0].tagName !== 'BODY') {
      target = target.parent();

      if (target.data(dataKey)) {
        dropdowns.push(target);
      }
    }
    return dropdowns;
  }

  //get all child dropdowns starting from a DOM element
  function getChildDropdowns(target, dataKey) {
    while (target[0].tagName !== 'BODY' && target.data(dataKey) === undefined) {
      target = target.parent();
    }

    var elements = target.find('*'),
      elementsLength = elements.length,
      dropdowns = [];

    for (var i = 0; i < elementsLength; i++) {
      var thisElement = elements.eq(i);
      if (thisElement.data(dataKey) !== undefined) {
        dropdowns.push(thisElement);
      }
    }

    return dropdowns;
  }




  //-----------------------------------------
  // The actual plugin constructor
  function AriaDropdown(element, userSettings) {
    var self = this;
    self.settings = $.extend({}, $.fn[pluginName].defaultSettings, userSettings);
    self.element = $(element); //the dropdown element
    self.btn = self.element.find('> .' + self.settings.btnClass).first(); //the dropdown button
    self.menu = self.element.find('> .' + self.settings.menuClass).first(); //the dropdown menu
    self.elementStatus = false; //the status of the element (false = collapsed, true = expanded)
    self.mouse = false; // track mouse events and block or enable expanding and collapsing of dropdowns with click: true when mousenter occurs, false when mouseleave occurs

    //call init
    self.init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(AriaDropdown.prototype, {
    init: function () {
      var self = this,
        settings = self.settings,
        menu = self.menu,
        btn = self.btn,
        element = self.element,
        dynamicBtnLabel = settings.dynamicBtnLabel;


      /*
       * Set ids on menu and button if they do not have one yet
       * We need to make sure this two elements have an ID so we can refence their IDs
       * in the aria-contorls and aria-owns attributes and expose relationship between
       * this two widget components
       */
      self.btnId = setId(self.btn, 'dropdown__btn--', count);
      self.menuId = setId(self.menu, 'dropdown__menu--', count);


      //Set accessibility attributes on menu
      menu
        .attr(a.aHi, a.t)
        .attr(a.aOw, self.btnId);

      //Set attributes on btn
      btn
        .attr(a.aHp, a.t)
        .attr(a.aCs, self.menuId);


      //Initialise the dropdown by hiding the menu
      self.slideUp(false);


      /*
       * Register event listeners:
       * 1: click.ariaDropdown -> click on window: collapse dropdown if expanded  when
       * user performs a click on the window
       */
      if (self.settings.collapseOnOutsideClick) {
        win.on('click.' + pluginName + ' touchstart.' + pluginName, function () {
          if (self.elementStatus) {
            self.slideUp(true);
          }
        });
      } else {
        /*
         * If there is a parent dropdown with collapseOnOutsideClick set to true,
         * we need to force collapse on this dropdown, even if collapseOnOutsideClick is set to false for this dropdown
         */
        win.on('click.' + pluginName, function () {
          var dropdowns = getParentDropdowns(self.element, 'plugin_' + pluginName),
            dropdownsLength = dropdowns.length,
            index = 0,
            thisDropdown = {},
            closeMe = false;

          if (dropdownsLength > 0) {
            //check if one parent dropdown has collapseOnOutsideClick set to true ...
            while (index < dropdownsLength && !closeMe) {
              thisDropdown = dropdowns[index].data('plugin_' + pluginName);
              if (thisDropdown.settings.collapseOnOutsideClick) {
                closeMe = true;
              }
              index++;
            }
            //... if yes collapse this dropdown
            if (closeMe) {
              self.slideUp(true);
            }
          }
        });
      }

      /*
       * 2: click.ariaDropdown -> click on dropdown: collapse or expand dropdowns on click +
       * prevent dropdown from collapsing when click.ariaDropdown occurs
       * and target is a dropdown. Otherwise it would not be possible to expand a dropdown
       */

      element.on('click.' + pluginName, function (event) {

        if (!self.mouse) {
          self.toggle(true);
        }

        //stop propagation starting from element (on all parent dropdowns and the window the event is not triggered)
        event.stopPropagation();

        //collapse all nested dropdowns
        var target = $(event.target),
          dropdowns = getChildDropdowns(target, 'plugin_' + pluginName), // ge all child dropdowns
          dropdownsLength = dropdowns.length,
          thisDropdown = {};

        //close all nested dropdowns (when a dropdown get closed from user or user clicks on window, child dropdowns must be collapsed)
        for (var i = 0; i < dropdownsLength; i++) {
          thisDropdown = dropdowns[i].data('plugin_' + pluginName);
          if (thisDropdown.elementStatus) {
            thisDropdown.slideUp(true);
          }
        }
      });


      /*
       * Listen for clicks inside of menu to prevent menu to collapse when user clicks on it.
       * If collapseOnMenuClick is s et to true, then we do not need to stop event propagation.
       * The option collapseOnMenuClick could be useful for implementing non-navigational dropdowns
       * (e.g. dropdowns in a toolbar) wich should collapse after a menu entry has been selected.
       */

      if (!settings.collapseOnMenuClick) {
        menu.on('click.' + pluginName, function (event) {
          event.stopPropagation();
        });
      }


      /*
       * Listen for custom event and collapse this dropdown if expanded
       * and expandOnlyOne is set to true.
       * Argument 'dropdown' is the dropdown expanded by user, which should not be collapsed.
       */
      if (settings.expandOnlyOne) {
        win.on(pluginName + '.slideDown', function (event, el) {
          var dropdowns = getChildDropdowns(element, 'plugin_' + pluginName), // ge all child dropdowns
            dropdownsLength = dropdowns.length,
            isChild = false,
            index = 0;

          //check if the expanded dropdown is child of this dropdown,
          //if yes, do not collapse this dropdown
          while (!isChild && index < dropdownsLength) {
            if (el === dropdowns[index].data('plugin_' + pluginName)) {
              isChild = true;
            }
            index++;
          }

          //Collapse this dropdown only if the other expanded dropdown was not a child
          if (el !== element && !isChild && self.elementStatus) {
            self.slideUp(true);
          }
        });
      }



      //Mouse events
      if (settings.mouse) {
        /*
         * manage ghost events: if device is touch,
         * always set self.mouse to false,
         * in order to not prevent click from closing dropdown
         */
        element.on('touchend.' + pluginName, function (event) {
          self.mouse = false;
        });

        element.on('mouseenter.' + pluginName, function () {
          self.mouse = true;

          if (!self.elementStatus) {
            self.slideDown(true);
          }
        });

        element.on('mouseleave.' + pluginName, function () {
          self.mouse = false;

          if (self.elementStatus) {
            self.slideUp(true);
          }
        });
      }


      //dynamic label
      if (dynamicBtnLabel) {
        if (typeof dynamicBtnLabel === 'string') {
          self.dynamicBtnEl = btn.find(dynamicBtnLabel); // the child element of button where the label is injected
        } else {
          self.dynamicBtnEl = btn;
        }
        self.collapseLabel = btn.attr(a.dCl);
        self.expandLabel = btn.attr(a.dEl);
      }

      //trigger init event on windown for developer to listen for
      win.trigger(pluginName + '.initialised', [self]);

      //increment count by 1
      count = count + 1;
    },
    toggle: function () {
      var self = this;

      if (self.elementStatus) {
        self.slideUp(true);
      } else {
        self.slideDown(true);
      }
    },
    collapse: function () {
      /*
       * This methods updates the attributes of the dialog
       * and removes the expanded classes from all elements.
       */
      var self = this,
        settings = self.settings;

      self.element
        .removeClass(settings.dropdownExpandedClass);

      self.btn
        .removeClass(settings.btnExpandedClass)
        .attr(a.aEx, a.f);

      self.menu
        .removeClass(settings.menuExpandedClass)
        .attr(a.aHi, a.t);

      //dynamic btn label
      if (self.dynamicBtnEl) {
        self.dynamicBtnEl.text(self.expandLabel);
      }

      //Update widget status
      self.elementStatus = false;
    },
    expand: function () {
      /*
       * This methods updates the attributes of the dialog
       * and adds the expanded classes to all elements.
       */
      var self = this,
        settings = self.settings;

      self.element
        .addClass(settings.dropdownExpandedClass);

      self.btn
        .addClass(settings.btnExpandedClass)
        .attr(a.aEx, a.t);

      self.menu
        .addClass(settings.menuExpandedClass)
        .attr(a.aHi, a.f);

      //dynamic btn label
      if (self.dynamicBtnEl) {
        self.dynamicBtnEl.text(self.collapseLabel);
      }

      //Update widget status
      self.elementStatus = true;
    },
    slideDown: function (animate) {
      /*
       * This methos performs the slide down animation on the menu,
       * but only if cssTransitions is set to false
       */
      var self = this,
        slideSpeed = animate ? self.settings.slideSpeed : 0;


      /*
       * We need to hide the dialog only if cssTransitions are disabled,
       * otherwise all transitions and animations are handled in CSS and
       * we only have to toggle the classes
       */
      if (!self.settings.cssTransitions) {
        self.element
          .css(a.zIn, self.settings.expandZIndex)

        self.menu
          .stop()
          .slideDown(slideSpeed, self.settings.easing);
      }

      /*
       * Trigger global custom event on window.
       * This event is needed to collapse every expanded dropdowns with expandOnlyOne set to true
       * when a dropdon is triggered by the user
       * Also authors can listen for this custom event in order to execute operations when
       * a specific dropdown is expanded
       */
      win.trigger(pluginName + '.slideDown', [self]);

      //call the expand method to update attributes and classes
      self.expand();
    },
    slideUp: function (animate) {
      /*
       * This methos performs the slide up animation on the menu,
       * but only if cssTransitions is set to false
       */
      var self = this,
        slideSpeed = animate ? self.settings.slideSpeed : 0;

      /*
       * We need to hide the dialog only if cssTransitions are disabled,
       * otherwise all transitions and animations are handled in CSS and
       * we only have to toggle the classes
       */
      if (!self.settings.cssTransitions) {
        self.element
          .css(a.zIn, self.settings.collapseZIndex);

        self.menu
          .stop()
          .slideUp(slideSpeed, self.settings.easing);
      }


      /*
       * Authors can listen for this custom event in order to execute operations when
       * a specific dropdown is expanded
       */
      win.trigger(pluginName + '.slideUp', [self]);


      //call the collapse method to update attributes and classes
      self.collapse();
    },
    destroy: function () {
      var self = this,
        settings = self.settings;

      //remove attributes and classes, unbind event listeners, remove jQuery data
      self.btn
        .removeAttr(a.aHp)
        .removeAttr(a.aCs)
        .removeAttr(a.aEx)
        .removeClass(settings.btnExpandedClass);

      self.menu
        .removeAttr(a.aOw)
        .removeAttr(a.aHi)
        .removeClass(settings.menuExpandedClass)
        .off('click.' + pluginName);

      self.element
        .removeClass(settings.dropdownExpandedClass)
        .off('click.' + pluginName + ' mouseenter.' + pluginName + ' mouseleave.' + pluginName)
        .removeData('plugin_' + pluginName);

      win.trigger(pluginName + '.destroyed', [self]);

    },
    methodCaller: function (methodName) {
      var self = this;

      switch (methodName) {
      case 'toggle':
        self.toggle(true);
        break;
      case 'slideDown':
        if (!self.elementStatus) {
          self.slideDown(true);
        }
        break;
      case 'slideUp':
        if (self.elementStatus) {
          self.slideUp(true);
        }
        break;
      case 'destroy':
        self.destroy();
      }
    }
  });


  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (userSettings) {
    return this.each(function () {
      var self = this;
      /*
       * If following conditions matches, then the plugin must be initialsied:
       * Check if the plugin is instantiated for the first time
       * Check if the argument passed is an object or undefined (no arguments)
       */
      if (!$.data(self, 'plugin_' + pluginName) && (typeof userSettings === 'object' || typeof userSettings === 'undefined')) {
        $.data(self, 'plugin_' + pluginName, new AriaDropdown(self, userSettings));
      } else if (typeof userSettings === 'string') {
        $.data(self, 'plugin_' + pluginName).methodCaller(userSettings);
      }
    });
  };


  //Define default settings
  $.fn[pluginName].defaultSettings = {
    btnClass: 'dropdown__btn',
    menuClass: 'dropdown__menu',
    dropdownExpandedClass: 'dropdown_expanded',
    btnExpandedClass: 'dropdown__btn_expanded',
    menuExpandedClass: 'dropdown__menu_expanded',
    slideSpeed: 300,
    easing: 'swing',
    collapseOnOutsideClick: true,
    collapseOnMenuClick: false,
    expandOnlyOne: true,
    expandZIndex: 10,
    collapseZIndex: 1,
    cssTransitions: false,
    mouse: false,
    dynamicBtnLabel: false
  };
}));
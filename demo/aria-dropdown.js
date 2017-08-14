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
(function ($, window, document) {
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
      f: 'false'
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



  //-----------------------------------------
  // The actual plugin constructor
  function AriaDropdown(element, userSettings) {
    var self = this;
    self.settings = $.extend({}, $.fn[pluginName].defaultSettings, userSettings);
    self.element = $(element); //the dropdown element
    self.btn = self.element.find('> .' + self.settings.btnClass); //the dropdown button
    self.menu = self.element.find('> .' + self.settings.menuClass); //the dropdown menu
    self.elementStatus = false; //the status of the element (false = collapsed, true = expanded)


    //call init
    self.init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(AriaDropdown.prototype, {
    init: function () {
      var self = this;

      /*
       * Set ids on menu and button if they do not have one yet
       * We need to make sure this two elements have an ID so we can refence their IDs
       * in the aria-contorls and aria-owns attributes and expose relationship between
       * this two widget components
       */
      self.btnId = setId(self.btn, 'dropdown__btn--', count);
      self.menuId = setId(self.menu, 'dropdown__menu--', count);


      //Set accessibility attributes on menu
      self.menu
        .attr(a.aHi, a.t)
        .attr(a.aOw, self.btnId);


      //Set attributes on btn
      self.btn
        .attr(a.aHp, a.t)
        .attr(a.aCs, self.menuId);


      //Initialise the dropdown by hiding the menu
      self.slideUp(false);


      /*
       * Register event listeners:
       * 1: click.ariaDropdown.window -> click on window: collapse expanded dropdowns when
       * user clicks everywhere in the window outside of the dropdown
       */
      win.on('click.' + pluginName + '.window', function () {
        if (self.elementStatus) {
          self.slideUp(true);
        }
      });


      /*
       * Prevent dropdown from being collapsed when click.ariaDropdown.window occurs 
       * and target is a dropdown. Otherwise it would not be possible to expand a dropdown
       */
      self.element.on('click.' + pluginName + '.window', function (event) {
        event.stopPropagation();
      });


      /*
       * Register event listeners:
       * 2: click.ariaDropdown -> click on dropdown: collapse or expand dropdowns on click
       */
      self.element.on('click.' + pluginName, function (event) {
        self.toggle(true);
      });


      /*
       * Listen for clicks inside of menu to prevent menu to collapse when user clicks on it.
       * If collapseOnMenuClick is s et to true, then we do not need to stop event propagation.
       * The option collapseOnMenuClick could be useful for implementing non-navigational dropdowns
       * (e.g. dropdowns in a toolbar) wich should collapse after a menu entry has been selected.
       */
      if (!self.settings.collapseOnMenuClick) {
        self.menu.on('click.' + pluginName, function (event) {
          event.stopPropagation();
        });
      }

      /*
       * Listen for custom event and collapse this dropdown if expanded
       * and expandOnlyOne is set to true.
       * Argument 'element' is the dropdown expanded by user, wich should not be collapsed.
       */
      if (self.settings.expandOnlyOne) {
        win.on(pluginName + '.slideDown', function (event, element) {
          if (element !== self.element && self.elementStatus) {
            self.slideUp();
          }
        });
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
      var self = this;

      self.element
        .removeClass(self.settings.dropdownExpandedClass);

      self.btn
        .removeClass(self.settings.btnExpandedClass)
        .attr(a.aEx, a.f);

      self.menu
        .removeClass(self.settings.menuExpandedClass)
        .attr(a.aHi, a.t);

      //Update widget status
      self.elementStatus = false;
    },
    expand: function () {
      /*
       * This methods updates the attributes of the dialog
       * and adds the expanded classes to all elements.
       */
      var self = this;

      self.element
        .addClass(self.settings.dropdownExpandedClass);

      self.btn
        .addClass(self.settings.btnExpandedClass)
        .attr(a.aEx, a.t);

      self.menu
        .addClass(self.settings.menuExpandedClass)
        .attr(a.aHi, a.f);

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
        self.menu
          .css(a.zIn, self.settings.expandZIndex)
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
        self.menu
          .css(a.zIn, self.settings.collapseZIndex)
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
    dropdownExpandedClass: 'dropdown__expanded',
    btnExpandedClass: 'dropdown__btn_expanded',
    menuExpandedClass: 'dropdown__menu_expanded',
    slideSpeed: 300,
    easing: 'swing',
    collapseOnOutsideClick: true,
    collapseOnMenuClick: false,
    expandOnlyOne: true,
    expandZIndex: 10,
    collapseZIndex: 1,
    cssTransitions: false
  };
}(jQuery, window, document));


$(document).ready(function () {
  $('.dropdown').ariaDropdown({
    collapseOnMenuClick: false,
    collapseOnOutsideClick: true,
    expandOnlyOne: true
  });

  $('.dropdown').first().ariaDropdown('slideDown');



  $(window).on('ariaDropdown.slideUp', function (event, element) {
    console.log(element);
  });

  $(window).on('ariaDropdown.slideDown', function (event, element) {
    console.log(element);
  });

});

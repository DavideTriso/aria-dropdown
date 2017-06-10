(function ($) {
  'use strict';
  var ddsCollapseArray = [], //save objects of dropdowns with expandOnlyOne set to true
    ddsCollapseArrayLenght = 0,
    methods = {},
    a = {
      aCs: 'aria-controls',
      aHi: 'aria-hidden',
      aEx: 'aria-expanded',
      aHp: 'aria-haspopup',
      t: 'true',
      f: 'false'
    },
    count = 0;



  //PRIVATE METHODS
  //-----------------------------------------------
  //set id on element if not set
  function setId(element, id, i) {
    if (!element.is('[id]')) {
      element.attr('id', id + (i + 1));
    }
  }

  //-----------------------------------------------
  //METHODS
  //-----------------------------------------------

  methods.init = function (userSettings, dropdown) {
    var settings = $.extend({}, $.fn.ariaDropdown.defaultSettings, userSettings),
      elements = {
        ddBtn: dropdown.find('.' + settings.ddBtnClass),
        ddCollapse: dropdown.find('.' + settings.ddCollapseClass),
        ddDismissBtn: dropdown.find('.' + settings.ddDismissBtnClass)
          .length > 0 ? dropdown.find('.' + settings.ddDismissBtnClass) : null
      },
      ddArray = [];


    //Set IDs on dd, dd button and dd collapse if not set
    setId(dropdown, 'dropdown_', count);
    setId(elements.ddBtn, 'dropdown__btn-', count);
    setId(elements.ddCollapse, 'dropdown__collapse-', count);

    //Set accessibility attributes to dropdown
    elements.ddBtn
      .attr(a.aHp, a.t)
      .attr(a.aCs, elements.ddCollapse.attr('id'));
    elements.ddCollapse
      .attr(a.aHi, a.t);

    //Push all data to array
    ddArray.push(settings, elements);

    //Append all data to $().data
    dropdown.data('ddArray', ddArray);

    //Hide dropdown collapse
    methods.collapse(dropdown, false);

    //Bind event handler to dropdown
    elements.ddBtn.on('click', function () {
      methods.toggle(dropdown, true);
    });


    //Bind event handler to dismiss button, if button exists
    if (elements.ddDismissBtn !== null) {
      elements.ddDismissBtn.on('click', function () {
        //collapse dropdown on click
        methods.collapse(dropdown, true);
        //manage focus: move focus back to ddBtn
        elements.ddBtn.focus();
      });
    }


    //close dropdown when user clicks outside the dropdown
    if (settings.collapseOnOutsideClick) {
      $(window).on('click', function () {
        methods.collapse(dropdown, true);
      });
      //stop propagation: prevent dropdown from closing when user clicks inside it

      $(dropdown).on('click', function (event) {
        event.stopPropagation();
      });
    }


    //push dropdown object to ddsCollapseArray, if expandOnyOne is set to true
    if (settings.expandOnlyOne) {
      //push to array
      ddsCollapseArray.push(dropdown);
      //increment ddsCollapseArrayLenght to keep track of array lenght,
      //so it is not necessary to calculate array size
      //each time a dropdown get expanded
      ddsCollapseArrayLenght = ddsCollapseArrayLenght + 1;
    }

    //increment count
    count = count + 1;
  };




  methods.toggle = function (dropdown, animate) {
    var expandedClass = dropdown.data('ddArray')[0].ddExpandedClass;

    if (dropdown.hasClass(expandedClass)) {
      methods.collapse(dropdown, animate);
    } else {
      methods.expand(dropdown, animate);
    }
  };




  methods.expand = function (dropdown, animate) {
    var ddBtn = dropdown.data('ddArray')[1].ddBtn,
      ddCollapse = dropdown.data('ddArray')[1].ddCollapse,
      settings = dropdown.data('ddArray')[0],
      animationSpeed = animate === true ? settings.animationSpeed : 0,
      i = 0;

    //Update attributes and classes
    dropdown.addClass(settings.ddExpandedClass);

    ddBtn
      .attr(a.aEx, a.t)
      .addClass(settings.ddBtnExpandedClass);

    ddCollapse
      .attr(a.aHi, a.f)
      .css('z-index', settings.expandZIndex)
      .addClass(settings.ddCollapseExpandedClass);

    //Animate dropdown
    if (settings.animationType === 'slide') {
      ddCollapse.stop().slideDown(animationSpeed);
    } else if (settings.animationType === 'fade') {
      ddCollapse.stop().fadeIn(animationSpeed);
    }

    //Collapse all dropdowns with expandOnlyOne set to true
    for (i; i < ddsCollapseArrayLenght; i = i + 1) {
      if ($.data(ddsCollapseArray[i]) !== $.data(dropdown)) {
        methods.collapse(ddsCollapseArray[i], true);
      }
    }
  };


  methods.collapse = function (dropdown, animate) {
    var ddBtn = dropdown.data('ddArray')[1].ddBtn,
      ddCollapse = dropdown.data('ddArray')[1].ddCollapse,
      settings = dropdown.data('ddArray')[0],
      animationSpeed = animate === true ? settings.animationSpeed : 0;

    //Update attributes and classes
    dropdown.removeClass(settings.ddExpandedClass);

    ddBtn
      .attr(a.aEx, a.f)
      .removeClass(settings.ddBtnExpandedClass);

    ddCollapse
      .attr(a.aHi, a.t)
      .css('z-index', settings.collapseZIndex)
      .removeClass(settings.ddCollapseExpandedClass);

    //Animate dropdown
    if (settings.animationType === 'slide') {
      ddCollapse.stop().slideUp(animationSpeed);
    } else if (settings.animationType === 'fade') {
      ddCollapse.stop().fadeOut(animationSpeed);
    }
  };



  //PLUGIN
  //-----------------------------------------------
  $.fn.ariaDropdown = function (userSettings) {
    if (typeof userSettings === 'object' || typeof userSettings === 'undefined') {
      this.each(function () {
        methods.init(userSettings, $(this));
      });
    } else {
      switch (userSettings) {
        case 'expand':
          methods.expand($(this), true);
          break;
        case 'collapse':
          methods.collapse($(this), true);
          break;
        case 'show':
          methods.expand($(this), false);
          break;
        case 'hide':
          methods.collapse($(this), false);
          break;
        case 'toggle':
          methods.toggle($(this), true);
          break;
      }
    }
  };

  $.fn.ariaDropdown.defaultSettings = {
    ddBtnClass: 'dropdown__btn',
    ddDismissBtnClass: 'dropdown__dismiss-btn',
    ddCollapseClass: 'dropdown__collapse',
    ddExpandedClass: 'dropdown_expanded',
    ddBtnExpandedClass: 'dropdown__btn_expanded',
    ddCollapseExpandedClass: 'dropdown__collapse_expanded',
    animationType: 'slide', //slide or fade
    animationSpeed: 300,
    collapseOnOutsideClick: true,
    expandOnlyOne: true,
    expandZIndex: 10,
    collapseZIndex: 1
  };
}(jQuery));


$(document).ready(function () {
  'use strict';
  $('.dropdown-group-1').ariaDropdown({
    animationSpeed: 200,
    animationType: 'slide'
  });
  $('.dropdown-group-2').ariaDropdown({
    animationSpeed: 400,
    animationType: 'fade',
    collapseOnOutsideClick: true,
    expandOnlyOne: false
  });
  
  $('#dropdown_1').ariaDropdown('expand');
  
  
});

/*
MIT License

Copyright (c) 2017 Davide Trisolini

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
}(function ($, window, document) {
    'use strict';

    var pluginName = 'ariaDialog', // the name of the plugin
      count = 0, //a plugin global variable used to generate IDs
      a = {
          r: 'role',
          aMo: 'aria-modal',
          aHi: 'aria-hidden',
          aLab: 'aria-labelledby',
          aDes: 'aria-describedby',
          tbI: 'tabindex',
          aLi: 'aria-live',
          t: 'true',
          f: 'false'
      },
      win = $(window); //object containing wai aria and html attributes


    //-----------------------------------------
    //Private functions
    /*
     * set id of the element passed along
     * if the element does not have one
     * and return the id of the element
     * If no suffix is passed, then do not set it
     */
    function setId(element, idPrefix, idSuffix) {
        idSuffix = idSuffix !== undefined ? idSuffix : '';

        if (!element.is('[id]')) {
            element.attr('id', idPrefix + idSuffix);
        }
        return element.attr('id');
    }


    /*
     * Check if any of the four modifiers keys are pressed.
     * If none is pressed, return true.
     * Else return false
     */
    function checkForModifierKeys(event) {
        if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
            //none is pressed
            return 'none';
        } else if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
            return 'shift';
        }
        return false;
    }

    /*
     * Return object with the first and last focussable elements contained
     * inside a parent element
     */
    function getFocussableElements(element) {
        return element.find('a[href], area[href], button:enabled, input:enabled, textarea:enabled, select:enabled, optgroup:enabled, option:enabled, menuitem:enabled, fieldset:enabled');
    }

    //-----------------------------------------
    // The actual plugin constructor
    function AriaDialog(element, userSettings) {
        var self = this;

        self.settings = $.extend({}, $.fn[pluginName].defaultSettings, userSettings);
        self.element = $(element); //The dialog
        self.elementId = setId(self.element, self.settings.dialogIdPrefix, count); // The id of the dialog
        self.elementState = false; //the state of the dialog (visible -> true, hidden -> false)
        self.elements = {
            wrapper: self.element.find('.' + self.settings.wrapperClass),
            container: self.element.find('.' + self.settings.containerClass),
            heading: self.element.find('.' + self.settings.headingClass) || false,
            mainMessage: self.element.find('.' + self.settings.mainMessageClass).first()
        };


        //Initialise the widget
        self.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(AriaDialog.prototype, {
        init: function () {

            var self = this,
              settings = self.settings,
              element = self.element,
              elements = self.elements,
              wrapper = elements.wrapper;

            /*
             * if the plugin is configured to use css transitions,
             * then we do not need to hide it with js
             */

            if (!settings.cssTransitions) {
                element.hide();
                wrapper.hide();
            }

            /*
             * Set needed attributes to dialog:
             * We need to set some attributes to expose the semantic to AT and make the dialog accessible.
             * The plugin supports 3 different types of dialogs: modal, non-modal and alert.
             * Each implementation need slightly different semantic
             */
            switch (settings.dialogType) {
                case 'modal':
                    wrapper
                      .attr(a.r, 'dialog')
                      .attr(a.aMo, a.t); //a modal dialog
                    break;
                case 'alert':
                    wrapper
                      .attr(a.r, 'alertdialog')
                      .attr(a.aMo, a.t); //an alert dialog
                    break;
                    /* Design patterns for non modal dialogs were not yet defined in WAI ARIA
                    * Support will be added in future versions of the plugin
                    case 'non-modal':
                      wrapper
                        .attr(a.r, 'dialog')
                        .attr(a.aMo, a.f); //a non modal dialog
                      break;
                      */
            }


            /*
             * For the dialog to be accessible, it is important to expose the
             * relation between dialog wrapper (element with role of dialog - or alertdialog)
             * and the heading of the dialog with aria-labelledby
             * In order to reference the id of the heading in the attribute aria-labelledby,
             * we have to check if the heading has an id, if not set it.
             *
             * Because the dialog is initially hidden, we set aria-hidden to true
             *
             * Because some implementations of dialogs need the wrapper to get focus when the dialog is opened,
             * we set a tabindex of -1 on the wrapper to make it focussable with scripting.
             */
            wrapper
              .attr(a.aHi, a.t)
              .attr(a.tbI, '-1');

            /*
             * If no header is present in markup, then we suppose 
             * the dialog's implementation does not require a visible heading,
             * but it is labelled using aria-label.
             * Otherwise, if the dialog has a heading, then we must expose relation 
             * between wrapper and heading.
             */
            if (elements.heading) {
                wrapper.attr(a.aLab, setId(elements.heading, self.elementId + '__heading'))
            }

            /*
             * If the dialog contains an element marked with the class of mainMessage, then it is good practice
             * to expose the relation between dialog and message with the attribute aria-describedby
             * We do the same operations as for the heading, if the message is present
             */
            if (elements.mainMessage.length === 1) {
                wrapper.attr(a.aDes, setId(elements.mainMessage, self.elementId + '__main-message'));
            }

            /*
             * Get focussable elements and append to elements object.
             * We need to know wich elements are focussable inside the dialog, in order
             * to manage focus in the dialog and check if the element to set focus on
             * when the dialog is open is focussable.
             */
            elements.focussableElements = getFocussableElements(wrapper);

            /*
             * Get the element to focus inside the dialog (setFocusOn), when the dialog is open.
             * Expected value is a selector string.
             * We perform a call to the jQuery function and get the element.
             */
            elements.elementToFocus = wrapper.find(settings.setFocusOn);

            /*
             * Now we perform some checks on the element to set focus on, to make sure it is:
             * - a single jQuery element object (no collection and non empty),
             * - a child element of the dialog.
             * - focussable
             */

            if (typeof elements.elementToFocus !== 'object' ||
              elements.elementToFocus.length !== 1 ||
              elements.elementToFocus.closest(self.element).length !== 1 || elements.focussableElements.index(elements.elementToFocus) < 0) {
                throw new Error('Check value of \'setFocusOn\' option.');
            }


            /*
             * Enable deep linking by watching for hash changes
             * whenewer a hash change happens, we must check if the hash
             * matches the id of the dialog.
             * If yes, then the dialog must be opened, else closed.
             */
            if (settings.deepLinking) {
                self.deepLinkingController();

                win.on('hashchange', function () {
                    if (document.location.hash === '#' + self.elementId) {
                        self.show();
                    } else if (self.elementState) {
                        self.deepLinkingController();
                    }
                });
            }

            //trigger custom event on window for authors to listen for
            win.trigger(pluginName + '.initialised', [self]);

            //increment count after every initalisation
            count = count + 1;
        },
        show: function () {
            var self = this,
              element = self.element,
              elements = self.elements,
              wrapper = elements.wrapper,
              settings = self.settings,
              focussableElements = getFocussableElements(wrapper),
              firstFocussableElement = focussableElements.first(),
              lastFocussableElement = focussableElements.last();

            self.elementWithFocus = $(':focus'); //the element with focus just before the dialog is opened


            /*
             * if the plugin is configured to use css transitions,
             * then we do not need to perform any animation on the dialog
             */
            if (!settings.cssTransitions) {
                element.show();
                wrapper
                  .stop()
                  .fadeIn(settings.fadeSpeed);
            }

            //add open classes to dialog
            element.addClass(settings.dialogOpenClass);

            //add open class on wrapper and  set aria-hidden to false to expose dialog to AI
            wrapper
              .addClass(settings.wrapperOpenClass)
              .attr(a.aHi, a.f);

            //Set focus on element to focus inside dialog
            elements.elementToFocus.focus();

            /*
             * When a dialog is open, it is necessary to manage focus inside the dialog.
             * If the dialog is modal, it is necessary to trap focus inside of it.
             * In order to achieve this, we need to set focus back to first element,
             * when last element is focussed and the user tabs to next element and
             * set focus to the last element, when first element is focussed nd user tabs back (shift + tab)
             */

            firstFocussableElement.on('keydown.' + pluginName, function (event) {
                if (event.keyCode === 9 && checkForModifierKeys(event) === 'shift') {
                    event.preventDefault();
                    lastFocussableElement.focus();
                }
            });

            lastFocussableElement.first().on('keydown.' + pluginName, function (event) {
                if (event.keyCode === 9 && checkForModifierKeys(event) === 'none') {
                    event.preventDefault();
                    firstFocussableElement.focus();
                }
            });



            //close dialog when escape is pressed
            if (settings.closeWithEsc) {
                win.on('keydown.' + pluginName, function (event) {
                    if (event.keyCode === 27 && checkForModifierKeys(event) === 'none') {
                        if (!settings.deepLinking) {
                            self.hide();
                        } else {
                            self.updateHash();
                        }
                    }
                });
            }

            //close dialog if user clicks on bg
            if (settings.closeOnBgClick) {
                element.on('click.' + pluginName, function () {
                    if (!settings.deepLinking) {
                        self.hide();
                    } else {
                        self.updateHash();
                    }
                });
                wrapper.on('click.' + pluginName, function (event) {
                    event.stopPropagation();
                });
            }
            //close dialog when escape is pressed
            if (settings.closeWithEsc) {
                win.on('keydown.' + pluginName, function (event) {
                    if (event.keyCode === 27 && checkForModifierKeys(event) === 'none') {
                        self.updateHash('hide');
                    }
                });
            }
            //close dialog if user clicks on bg
            if (settings.closeOnBgClick) {
                element.on('click.' + pluginName, function () {
                    self.updateHash('hide');
                });
                wrapper.on('click.' + pluginName, function (event) {
                    event.stopPropagation();
                });
            }

            //Update dialog state
            self.elementState = true;


            //trigger custom event on window for authors to listen for
            win.trigger(pluginName + '.show', [self]);
        },
        hide: function () {
            var self = this,
              element = self.element,
              wrapper = self.elements.wrapper,
              settings = self.settings;


            //Remove open classes and update attributes
            element
              .removeClass(settings.dialogOpenClass);

            wrapper
              .removeClass(settings.wrapperOpenClass)
              .attr(a.aHi, a.t);


            /*
             * Perform animation if plugin is not configured to use css transitions
             * Fade out wrapper first, then hide element (dialog)
             */
            if (!settings.cssTransitions) {
                wrapper
                  .stop()
                  .fadeOut(settings.fadeSpeed, function () {
                      element.hide();
                  });
            }

            //move focus back to element that had focus before dialog was opened
            if (self.elementWithFocus.length === 1) {
                self.elementWithFocus.focus();
            }

            //unregister event handlers
            win.off('keydown.' + pluginName);
            element.off('click.' + pluginName);
            wrapper.off('click.' + pluginName);


            //Update dialog state
            self.elementState = false;

            //trigger custom event on window for authors to listen for
            win.trigger(pluginName + '.hide', [self]);
        },
        updateHash: function (action) {
            if (action === 'show') {
                document.location.hash = this.elementId;
            } else {
                document.location.hash = '';
            }
        },
        deepLinkingController: function () {
            var self = this;
            if (document.location.hash === '#' + self.elementId) {
                self.show();
            } else if (self.elementState) {
                self.hide()
            }
        },
        methodCaller: function (methodName) {
            var self = this;
            /*
             * This function is the control center for any method call implemented in the plugin.
             * Because each method accepts different arguments types, the function checks the type of
             * the passed arguments and performs the needed to make a function call
             */

            if (!self.settings.deepLinking) {
                //Call the methods directly only if deep linking is disabled
                switch (methodName) {
                    case 'show':
                        self.show();
                        break;
                    case 'hide':
                        if (self.elementState) {
                            self.hide();
                        }
                        break;
                }
            } else {
                //Update the hash for deep linking
                self.updateHash(methodName);
            }
        }
    });


    //A really lightweight plugin wrapper around the constructor,
    //preventing against multiple instantiations
    $.fn[pluginName] = function (userSettings) {
        return this.each(function () {
            /*
             * If following conditions matches, then the plugin must be initialsied:
             * Check if the plugin is instantiated for the first time
             * Check if the argument passed is an object or undefined (no arguments)
             */
            if (!$.data(this, 'plugin_' + pluginName) && (typeof userSettings === 'object' || typeof userSettings === 'undefined')) {
                $.data(this, 'plugin_' + pluginName, new AriaDialog(this, userSettings));
            } else if (typeof userSettings === 'string') {
                $.data(this, 'plugin_' + pluginName).methodCaller(userSettings);
            }
        });
    };


    //Define default settings
    $.fn[pluginName].defaultSettings = {
        dialogIdPrefix: 'dialog--',
        wrapperClass: 'dialog__wrapper',
        containerClass: 'dialog__container',
        headingClass: 'dialog__heading',
        mainMessageClass: 'dialog__main-message',
        dialogOpenClass: 'dialog_open',
        wrapperOpenClass: 'dialog__wrapper_open',
        dialogType: 'modal', // modal, alert (alertdialog) -  (non-modal in future versions)
        containerRole: 'document',
        closeWithEsc: true,
        closeOnBgClick: true,
        fadeSpeed: 600,
        cssTransitions: false,
        deepLinking: false,
        setFocusOn: 'button:first-child'
    };

}(jQuery, window, document)));

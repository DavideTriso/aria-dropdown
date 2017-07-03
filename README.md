# ARIA DROPDOWN

## About

jQuery plugin for **accessible** dropdowns: **WAI ARIA 1.1** compliant.

* Easy to customize tanks to a small but usefull set of options.
* SASS/SCSS files for simple and quick UI customisations.
* Only 3KB (minified).
* Fully compatible with [**t** css-framework](https://github.com/DavideTriso/t-css-framework)
* Runs in strict mode.

## Dependencies

**jQuery**

Developed and tested with jQuery 3.2.1

## Cross-browser tests

* Tested on **Google Chrome 57** / macOS Sierra 10.

## Options

Name | Default | Type | Description
-----|---------|------|-------------
btnClass | dropdown__btn | string | Class used to select dropdown's buttons.
menuClass | dropdown__menu | string | Class used to select dropdown's collapsible region
dropdownExpandedClass | dropdown_expanded | string | Class added to dropdown when expanded
btnExpandedClass | dropdown__btn_expanded | string | Class added to dropdown's buttons when dropdown is expanded.
menuExpandedClass | dropdown__collapse_expanded | string | Class added to collapsible region when expanded.
slideSpeed | 300 | int (>= 0) | Slide-up and slide-down animation duration.
easing | swing | string | The easing function to use for the dropdown animation. Applies only for jQuery transitions, if **cssTransition** is set to true, this option will not have any effect on the transition. Accepted values are `swing` and `linear`. For more timing functions a jQuery easing plugin is needed. | optional
collapseOnOutsideClick | true | bool | Collapse dropdown, when user clicks on any region of the page wich is not part of a dropdown.
collapseOnMenuClick | false | bool | Collapse dropdown even when user clicks inside of it. Useful for non-navigational dropdown, like a dropdown in a toolbor | optional
expandOnlyOne | true | bool | Automatically collapse dropdown if another dropdown is expanded
cssTransition | false | bool | Use css transitions to expand/collapse dropdowns instead of jQuery slide animation. Read section 'Using CSS transitions' for more infos | optional
expandZIndex | 10 | int | Z-index set to expanded dropdowns.
collapseZIndex | 1 | int | Z-index set to dropdown's collapsible regions just before collapsing.

## Usage

1. Include the JS script **dropdown.js** - or the minified production script **aria-dropdown.min.js** - in the head or the body of your HTML file.
2. Include the CSS file  **dropdown.css** in the head of your HTML file, or include the SCSS files in your project. Adapt the CSS as needed.


### HTML

Use following HTML markup to implement a dropdown:

```html
<div class="dropdown">
  <button type="button" class="dropdown__btn">Dropdown</button>
  <div class="dropdown__collapse">
    <h4>Dropdown right</h4>
    <ul>
      <li>Link 1</li>
      <li>Link 2</li>
      <li>Link 3</li>
      <li>Link 4</li>
      <li>Link 5</li>
    </ul>
    <button type="button" class="dropdown__dismiss-btn">Close dropdown</button>
  </div>
</div>
```

Use modifier classes `.dropdown__collapse_center` or `.dropdown__collapse_right` to change dropdown alignment.


### JS: Initialise

Initialise the plugin as follows: 

```javascript
$('.dropdown').ariaDropdown({
  option1: value1,
  option2: value2
});
```

## Methods

The plugin supports following methods: expand, show, collapse, hide and trigger.

### Expand and open

The method **expand** expands a dropdown with an animtation (slide down or fade).

````javascript
$('#my-dropdown').ariaDropdown('expand');
````

The method **show** expands a dropdown just like the **expand** method, but instead, does not perform any animation.

````javascript
$('#my-dropdown').ariaDropdown('show');
````

### Collapse and hide

The method **collapse** collapses a dropdown with an animtation (slide down or fade).

````javascript
$('#my-dropdown').ariaDropdown('collapse');
````

The method **hide** collapses a dropdown just like the **collapse** method, but instead, does not perform any animation.

````javascript
$('#my-dropdown').ariaDropdown('hide');
````


### Trigger

**Trigger** expands or collapses a dropdown based on the current state of the dropdown.

````javascript
$('#my-dropdown').ariaDropdown('toggle');
````



## Custom events

The plugin triggers following events:

* **ariaDropdown.slideDown** when a dropdown is expanded
* **ariaDropdown.slideUp** when a dropdown is collapsed

The custom events are triggered on window and return the dropdown element as arguments.

```javascript

//listen for ariaDropdowns.slideDown
$(window).on('ariaDropdown.slideDown', function(event, element){
  console.log('The dropdown ' + element + ' was expanded');
});
```

## Using CSS transitions

By default the plugin is configured to use the jQuery methods `slideDown()`, `slideUp` to expand/collapse dropdowns. Setting the option **cssTransitions** to 'true' will disable the JS animations and makes possible to implement the transitions directly with css. In fact, the plugin toggles the classes passed along with the options **dropdownExpandedClass**, **btnExpandedClass** and **menuExpandedClass** when a dropdown is toggled. 

## Planned features

* Better SCSS: Mixins to quickly build awesome responsive dropdowns.

## LICENSE

This project is licensed under the terms of the **MIT license**.

See [LICENSE.md](LICENSE.md) for detailed informations.

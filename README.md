# DO NOT USE! NOT READY YET
# ARIA DROPDOWN

## About

jQuery plugin for **accessible** dropdowns: **WAI ARIA 1.1** compliant.

## Dependencies

**jQuery**

Developed and tested with jQuery 3.2.1

## Cross-browser tests

* Tested on **Google Chrome 57** / macOS Sierra 10.
* Testen on **Safari 10** / macOS Sierra 10.

## Options

Name | Default | Type | Description
-----|---------|------|-------------
ddBtnClass | dropdown__btn | string | Class used to select dropdown's buttons.
ddDismissBtnClass | dropdown__dismiss-btn | string |  Class used to select dropdown's dismiss buttons (alternative close button placed inside the collapsible region of a dropdown).
ddCollapseClass | dropdown__collapse | string | Class used to select dropdown's collapsible region
ddExpandedClass | dropdown_expanded | string | Class added to dropdown when expanded
ddBtnExpandedClass | dropdown__btn_expanded | string | Class added to dropdown's buttons when dropdown is expanded.
ddCollapseExpandedClass | dropdown__collapse_expanded | string | Class added to collapsible region when expanded.
animationType | slide | token | Type of animation to apply to dropdown. Accepted values: slide, fade.
animationSpeed | 300 | int (>= 0) | Collapse / expand animation duration.
collapseOnOutsideClick | true | bool | Collapse dropdown, when user clicks on any region of the page wich is not part of a dropdown.
expandOnlyOne | true | bool | Automatically collapse dropdown if another dropdown is expanded
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

**NOTE:** All the methods must be called only on one jQuery object at a time.


## LICENSE

This project is licensed under the terms of the **MIT license**.

See [LICENSE.md](LICENSE.md) for detailed informations.

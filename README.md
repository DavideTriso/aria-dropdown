# ARIA DROPDOWN

## About

**Aria Dropdown** is a jQuery plugin. It is useful to implement accessible dropdowns in websites. It has basic configuration options and is fully accessible for screen-reader users and keyboard-only users.

## Dependencies

**jQuery** 2.x.x or higher

## Settings / Options

Name | Default | Type | Description
-----|---------|------|-------------
ddClass | dropdown | string | Class name of dropdowns.
ddBtnClass | dropdown__btn | string | Class name of dropdown buttons.
ddDismissBtnClass | dropdown__dismiss-btn | string |  Class name of dropdown dismiss buttons (alternative close button placed inside the collapsible region of a dropdown).
ddCollapseClass | dropdown__collapse | string | Class name of dropdown collapsible region
ddBtnExpandedClass | dropdown__btn_expanded | string | Class name for buttons of expanded dropdowns.
ddCollapseExpandedClass | dropdown__collapse_expanded | string | Class name for expanded collapsible regions.
animationType | slide | token | Type of animation to apply to dropdown. Accepted values: slide, fade.
animationSpeed | 300 | int (>= 0) | Collapse / expand animation duration.
collapseOnOutsideClick | true | bool | Collapse every expanded dropdown, when user clicks on any region of the page which is not part of the dropdown.
expandOnlyOne | true | bool | Expand only one dropdown at a time.
expandZIndex | 10 | int | Z-index set to expanded dropdowns.
collapseZIndex | 1 | int | Z-index set to dropdown's collapsible regions just before collapsing.

## Usage

Include the JS script _dropdown.js_ in the head or the body of your HTML file.

Include the CSS file  _dropdown.css_ in the head of your HTML file. Change the CSS needed.

Use following markup in the HTML file to create a dropdown:

```
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

Use modifier classes _.dropdown__collapse_center_ or _dropdown__collapse_right_ to change dropdown alignment.


## Initialisation

Initialise the plugin as follows: 

```
$('.dropdown').ariaDropdown({
  option1: value1,
  option2: value2
});
```

## Custom event / triggering dropdown

It is possible to expand/collapse a dropdown by triggering the 'dropdown:toggle' event on its button.

```
$('#dropdown-btn-2').trigger('dropdown:toggle');
```
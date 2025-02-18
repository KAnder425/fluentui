### Layout

- Use the people picker to add someone to the To line of an email, or to add someone to a list.
- Use the `MemberList PeoplePicker` to display selections below the input field.

### Accessibility

PeoplePicker dropdowns render in their own layer by default to ensure they are not clipped by containers with `overflow: hidden` or `overflow: scroll`. This causes extra difficulty for people who use touch-based screen readers, so we recommend rendering the PeoplePicker inline unless it is in an overflow container. To do so, set the following property on the PeoplePicker:

```js
pickerCalloutProps={{ doNotLayer: true }}
```

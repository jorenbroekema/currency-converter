# \<currency-converter>

Currency converter exercise. Component not published to npm atm.

I took the challenge to have 100% test coverage for this.

[See it live](https://currency-convertor-joren.netlify.app/)

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendations.

## Run demo

```sh
npm start
```

## Run tests

```sh
npm run test
```

Or in watchmode

```sh
npm run test:watch
```

## Improvements

Here's a prioritized list of improvements I would make in next iterations

### Localization

The amount of localization we are doing is quite minimal. Problems:

- Limited parsing of user input. You can only use `.` as decimal separator, and it doesn't accept thousand separators.
  These separators are different based on user locale, and we should probably only accept "valid" separators based on locale.
  You could also put some input validation to give the user some feedback on what is wrong.
- Currency formatting. Right now, we are only doing a fairly ugly way of formatting the output values.
  For currencies I think it would make sense to take the maximumFractionDigits (based on user locale), and use that to format
  the output value for both minimum and maximum fraction digits. E.g. for en-GB that means always 2 decimal places.
  You could also consider putting a prefix slot for currency symbol, or a suffix slot for currency ISO string (e.g. `USD`)

The reason for putting this at the top is because I think it's the major painpoint from a UX perspective, I would actually consider these bugs.
There's lots of options for making this:

- Using [Intl NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
  without using any third party libs, which I already used a little bit
- Libraries like [Day.js](https://day.js.org/) to do the work for you
- Components like [lion-input-amount](https://lion-web.netlify.app/components/inputs/input-amount/overview/)

### Base Currency

I forgot to add the base currency, EUR in our case, as an option. Oops.
Probably a good idea when fetching the rates, to append to the array of "rates": `EUR: 1` because EUR has a rate of 1 to base rate EUR.
That would automatically add it to the `<select>` options.

I would also consider this a bug since having the base currency in there is definitely to be expected.

### Use consistent CSS

There's a number of things I kind of skimmed on with regards to CSS and consistency.

- I don't use a consistent naming convention for CSS classes, like BEM. It would improve readability and consistency to adhere to such a convention.
- I should probably be consistent about using classes for selecting elements to style with CSS, rather than my weird mixture of tag name selectors, classes and id.
  Especially with tag names it will start becoming a problem as you add more `<select>` or `<label>` etc. that you don't want targeted for your CSS.

### Encapsulate inputs

I think it would make the code more readable if the user inputs for currency and amounts were encapsulated in a component.
That way, you can easily expose the input values on the component and that makes it easier to read them out.

I am also using the selector `label select` a lot, which is not very developer friendly.

Instead of:

```js
const sourceCurrencies = Array.from(
  this.source.value.querySelectorAll('label select'),
).map((field) => field.value);
const sourceAmounts = Array.from(
  this.source.value.querySelectorAll('label input'),
).map((field) => field.value);
```

It would be

```js
const sourceInputs = Array.from(
  this.shadowRoot.querySelectorAll('currency-input'),
);
const sourceCurrencies = sourceInputs.map((input) => input.currency);
const sourceAmounts = sourceInputs.map((input) => input.amount);
```

### Edge case tests

Add more tests to verify what happens when users do things that we do not expect, and adjust implementation where necessary.

- Invalid separators --> filter out?
- Negative values --> make sure calculations are okay
- Empty input --> if required, could add a required validator
- Non-digits --> filter out / block entirely?

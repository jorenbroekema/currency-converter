import { html, css, LitElement } from 'lit';

/**
 * - Ability to select the source and target currencies
 * - Ability to input the source amount
 * - Conversion rates must be pulled from a third-party API.
 *   We recommend using https://ratesapi.io/, but other APIs may be used as well,
 *   however the actual conversion calculation must be performed by your application
 *   (also do not use any third-party libraries for it).
 *
 * Bonus:
 * - Ability to perform multiple conversions at the same time
 * - Option to select a different date for the conversion rate
 * - Bidirectional conversion (user can input either source or target amount)
 * - Show historical rates evolution (e.g. with chart)
 */
export class CurrencyConverter extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  static get properties() {
    return {};
  }

  render() {
    return html``;
  }
}
customElements.define('currency-converter', CurrencyConverter);

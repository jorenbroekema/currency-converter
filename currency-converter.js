import { html, css, LitElement } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';

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

export async function fetchRates() {
  const response = await fetch('https://api.ratesapi.io/api/latest');
  const result = await response.json();
  if (response.status === 200) {
    return result;
  }
  throw new Error('Something went wrong fetching the rates');
}

export class CurrencyConverter extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
      }

      .source,
      .target {
        display: flex;
        flex-direction: column;
      }

      .source label,
      .target label {
        display: flex;
        flex-direction: column;
      }
    `;
  }

  static get properties() {
    return {
      currencies: { attribute: false },
      rates: { attribute: false },
      baseCurrency: { attribute: false },
    };
  }

  static get locale() {
    return document.documentElement.lang || 'en-GB';
  }

  constructor() {
    super();
    this.baseCurrency = 'EUR';
    this.loadRatesComplete = new Promise((resolve) => {
      this.loadRatesCompleteResolve = resolve;
    });

    [
      'sourceCurrency',
      'targetCurrency',
      'sourceAmount',
      'targetAmount',
    ].forEach((prop) => {
      this[prop] = createRef();
    });
  }

  connectedCallback() {
    super.connectedCallback();
    fetchRates().then((result) => {
      this.currencies = Object.keys(result.rates);
      this.rates = result.rates;
      this.loadRatesCompleteResolve();
    });
  }

  render() {
    return html`
      ${this.currencies
        ? html`
            <div class="source">
              <label>
                From
                <select ${ref(this.sourceCurrency)}>
                  ${this.currencies.map(
                    (curr) => html` <option>${curr}</option> `,
                  )}
                </select>
              </label>
              <label>
                Amount
                <input ${ref(this.sourceAmount)} />
              </label>
            </div>

            <button id="convert-btn" @click=${this.convertAmount}>--></button>
            <div class="target">
              <label>
                To
                <select ${ref(this.targetCurrency)}>
                  ${this.currencies.map(
                    (curr) => html` <option>${curr}</option> `,
                  )}
                </select>
              </label>
              <label>
                Amount
                <input ${ref(this.targetAmount)} />
              </label>
            </div>
          `
        : 'Loading currencies...'}
    `;
  }

  async convertAmount() {
    const [sourceCurrency, targetCurrency, sourceAmount] = [
      'sourceCurrency',
      'targetCurrency',
      'sourceAmount',
    ].map((prop) => this[prop].value.value);

    const sourceRateToEUR = this.rates[sourceCurrency];
    const targetRateToEUR = this.rates[targetCurrency];

    const targetAmount = (sourceAmount / sourceRateToEUR) * targetRateToEUR;
    this.targetAmount.value.value = new Intl.NumberFormat(this.locale).format(
      targetAmount,
    );
  }
}
customElements.define('currency-converter', CurrencyConverter);

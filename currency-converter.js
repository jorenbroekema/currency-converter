import { html, css, LitElement } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';

/**
 * Bonus:
 * - Ability to perform multiple conversions at the same time
 * - Option to select a different date for the conversion rate
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
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        padding: 0 20px;
        max-width: 600px;
        margin: 0 auto;
      }

      select,
      input {
        padding: 5px;
        margin-bottom: 5px;
      }

      .btn-group {
        display: flex;
        flex-direction: column;
      }

      #convert-btn,
      #convert-back-btn {
        padding: 10px;
        background-color: lightgreen;
        border: none;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        margin: 10px 0px;
        font-weight: 700;
        font-size: 16px;
        font-family: 'Roboto Slab', sans-serif;
      }

      #convert-back-btn {
        background-color: lightblue;
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

      @media (min-width: 600px) {
        :host {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
      }
    `;
  }

  static get properties() {
    return {
      currencies: { attribute: false },
      rates: { attribute: false },
    };
  }

  static get locale() {
    return document.documentElement.lang || 'en-GB';
  }

  constructor() {
    super();
    this.loadRatesComplete = new Promise((resolve) => {
      this.loadRatesCompleteResolve = resolve;
    });

    this.userInputs = [
      'sourceCurrency',
      'targetCurrency',
      'sourceAmount',
      'targetAmount',
    ];

    this.userInputs.forEach((prop) => {
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
                Source
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

            <div class="btn-group">
              <button id="convert-btn" @click=${this.convertAmount}>
                Convert
              </button>
              <button
                id="convert-back-btn"
                @click=${() => this.convertAmount({ reverse: true })}
              >
                Convert Back
              </button>
            </div>

            <div class="target">
              <label>
                Target
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

  async convertAmount({ reverse = false }) {
    const [sourceCurrency, targetCurrency, sourceAmount, targetAmount] =
      this.userInputs.map((prop) => this[prop].value.value);

    const sourceRateToEUR = this.rates[sourceCurrency];
    const targetRateToEUR = this.rates[targetCurrency];

    if (!reverse) {
      const newTargetAmount =
        (sourceAmount / sourceRateToEUR) * targetRateToEUR;
      this.targetAmount.value.value = new Intl.NumberFormat(this.locale).format(
        newTargetAmount,
      );
    } else {
      const newSourceAmount =
        (targetAmount / targetRateToEUR) * sourceRateToEUR;
      this.sourceAmount.value.value = new Intl.NumberFormat(this.locale).format(
        newSourceAmount,
      );
    }
  }
}
customElements.define('currency-converter', CurrencyConverter);

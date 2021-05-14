import { html, LitElement } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';

import styles from './styles.css.js';

export async function fetchRates(date = 'latest') {
  let dateString;
  if (date !== 'latest') {
    const offset = date.getTimezoneOffset();
    dateString = new Date(date.getTime() - offset * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  }

  const response = await fetch(
    `https://api.ratesapi.io/api/${dateString ?? 'latest'}`,
  );
  const result = await response.json();
  if (response.status === 200) {
    return result;
  }
  throw new Error('Something went wrong fetching the rates');
}

export class CurrencyConverter extends LitElement {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      currencies: { attribute: false },
      rates: { attribute: false },
      rateDate: { attribute: false },
      conversions: { type: Number, reflect: true },
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

    this.rateDate = 'latest';

    this.userInputs = ['dateInput', 'source', 'target'];

    this.userInputs.forEach((prop) => {
      this[prop] = createRef();
    });

    this.conversions = 1;
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchRates();
  }

  firstUpdated() {
    this.dateInput.value.value = new Date().toISOString().slice(0, 10);
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('rateDate')) {
      const newDate = new Date(this.rateDate);
      if (Number.isNaN(newDate.getTime())) {
        return;
      }
      this._fetchRates(newDate);
    }
  }

  render() {
    return html`
      <label id="input-date">
        Conversion Rate Date
        <input
          ${ref(this.dateInput)}
          @change="${this.changeDate}"
          type="date"
          min="1999-01-04"
          max="${new Date().toISOString().slice(0, 10)}"
      /></label>
      ${this.currencies ? this.converterTemplate() : 'Loading currencies...'}
    `;
  }

  converterTemplate() {
    return html`
      <div class="btn-group">
        <button id="convert-btn" @click=${this.convertAmounts}>Convert</button>
        <button
          id="convert-back-btn"
          @click=${() => this.convertAmounts({ reverse: true })}
        >
          Convert Back
        </button>
        <button id="add-conversion-btn" @click=${this.addConversion}>
          Add Conversion
        </button>
        <button id="remove-conversion-btn" @click=${this.removeConversion}>
          Remove Conversion
        </button>
      </div>
      <div class="wrapper">
        <div class="source" ${ref(this.source)}>
          ${Array(this.conversions)
            .fill(null)
            .map(
              () => html`
                <label>
                  Source
                  <select>
                    ${this.currencies.map(
                      (curr) => html` <option>${curr}</option> `,
                    )}
                  </select>
                </label>
                <label>
                  Amount
                  <input type="text" />
                </label>
              `,
            )}
        </div>

        <div class="target" ${ref(this.target)}>
          ${Array(this.conversions)
            .fill(null)
            .map(
              () => html`<label>
                  Target
                  <select>
                    ${this.currencies.map(
                      (curr) => html` <option>${curr}</option> `,
                    )}
                  </select>
                </label>
                <label>
                  Amount
                  <input type="text" />
                </label>`,
            )}
        </div>
      </div>
    `;
  }

  async convertAmounts({ reverse = false }) {
    const sourceCurrencies = Array.from(
      this.source.value.querySelectorAll('label select'),
    ).map((field) => field.value);
    const sourceAmounts = Array.from(
      this.source.value.querySelectorAll('label input'),
    ).map((field) => field.value);
    const targetCurrencies = Array.from(
      this.target.value.querySelectorAll('label select'),
    ).map((field) => field.value);
    const targetAmounts = Array.from(
      this.target.value.querySelectorAll('label input'),
    ).map((field) => field.value);

    for (let i = 0; i < sourceCurrencies.length; i += 1) {
      const sourceRateToEUR = this.rates[sourceCurrencies[i]];
      const targetRateToEUR = this.rates[targetCurrencies[i]];

      if (!reverse) {
        const newTargetAmount =
          (sourceAmounts[i] / sourceRateToEUR) * targetRateToEUR;

        const amountEl = Array.from(
          this.target.value.querySelectorAll('label input'),
        )[i];

        amountEl.value = new Intl.NumberFormat(this.constructor.locale).format(
          newTargetAmount,
        );
      } else {
        const newSourceAmount =
          (targetAmounts[i] / targetRateToEUR) * sourceRateToEUR;

        const amountEl = Array.from(
          this.source.value.querySelectorAll('label input'),
        )[i];

        amountEl.value = new Intl.NumberFormat(this.constructor.locale).format(
          newSourceAmount,
        );
      }
    }
  }

  async _fetchRates(date) {
    this.loadRatesComplete = new Promise((resolve) => {
      this.loadRatesCompleteResolve = resolve;
    });
    const result = await fetchRates(date);
    this.currencies = Object.keys(result.rates);
    this.rates = result.rates;
    this.loadRatesCompleteResolve();
  }

  changeDate() {
    this.rateDate = this.dateInput.value.value;
  }

  addConversion() {
    this.conversions += 1;
  }

  removeConversion() {
    this.conversions -= 1;
  }
}
customElements.define('currency-converter', CurrencyConverter);

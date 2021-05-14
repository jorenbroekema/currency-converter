import { html, LitElement } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';

import styles from './styles.css.js';

/**
 * Bonus:
 * - Ability to perform multiple conversions at the same time
 * - Show historical rates evolution (e.g. with chart)
 */

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

    this.userInputs = [
      'dateInput',
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
      <div class="wrapper">
        <div class="source">
          <label>
            Source
            <select ${ref(this.sourceCurrency)}>
              ${this.currencies.map((curr) => html` <option>${curr}</option> `)}
            </select>
          </label>
          <label>
            Amount
            <input ${ref(this.sourceAmount)} />
          </label>
        </div>

        <div class="btn-group">
          <button id="convert-btn" @click=${this.convertAmount}>Convert</button>
          <button
            id="convert-back-btn"
            @click=${() => this.convertAmount({ reverse: true })}
          >
            Convert Back
          </button>
          <button
            id="add-conversion-btn"
            @click=${() => this.convertAmount({ reverse: true })}
          >
            Add Conversion
          </button>
        </div>

        <div class="target">
          <label>
            Target
            <select ${ref(this.targetCurrency)}>
              ${this.currencies.map((curr) => html` <option>${curr}</option> `)}
            </select>
          </label>
          <label>
            Amount
            <input ${ref(this.targetAmount)} />
          </label>
        </div>
      </div>
    `;
  }

  async convertAmount({ reverse = false }) {
    const [, sourceCurrency, targetCurrency, sourceAmount, targetAmount] =
      this.userInputs.map((prop) => this[prop].value.value);

    const sourceRateToEUR = this.rates[sourceCurrency];
    const targetRateToEUR = this.rates[targetCurrency];

    if (!reverse) {
      const newTargetAmount =
        (sourceAmount / sourceRateToEUR) * targetRateToEUR;
      this.targetAmount.value.value = new Intl.NumberFormat(
        this.constructor.locale,
      ).format(newTargetAmount);
    } else {
      const newSourceAmount =
        (targetAmount / targetRateToEUR) * sourceRateToEUR;

      this.sourceAmount.value.value = new Intl.NumberFormat(
        this.constructor.locale,
      ).format(newSourceAmount);
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
}
customElements.define('currency-converter', CurrencyConverter);

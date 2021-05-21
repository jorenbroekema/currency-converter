import { fixture, expect } from '@open-wc/testing';
import { html } from 'lit';
import sinon from 'sinon';

import { fetchRates } from '../currency-converter.js';

function return404() {
  const mockResponse = new Response(JSON.stringify({}), {
    status: 404,
    headers: {
      'Content-type': 'application/json',
    },
  });

  return Promise.resolve(mockResponse);
}

async function expectThrowsAsync(method, { errorMatch, errorMessage } = {}) {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error', 'No error was thrown');
  if (errorMatch) {
    expect(error.message).to.match(errorMatch);
  }
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
}

describe('CurrencyConverter', () => {
  let rates;
  let ratesOneYearAgo;
  before(async () => {
    rates = (await fetchRates()).rates;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    ratesOneYearAgo = (await fetchRates(oneYearAgo)).rates;
  });

  it('displays a loading message while fetching rates', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await expect(el).shadowDom.to.equal(
      `
        <label id="input-date">
        Conversion Rate Date
        <input
          min="1999-01-01"
          type="date"
        >
      </label>
      Loading currencies...
    `,
      {
        ignoreAttributes: ['max'],
      },
    );
  });

  it('throws an error when the fetch to Rates API was unsuccessful', async () => {
    const stub = sinon.stub(window, 'fetch');
    stub.onCall(0).returns(return404());

    await expectThrowsAsync(() => fetchRates(), {
      errorMessage: 'Something went wrong fetching the rates',
    });

    window.fetch.restore();
  });

  it('allows converting from one currency to another', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await el.loadRatesComplete;

    const sourceAmount = 1;
    const sourceCurrency = 'GBP';
    el.source.value.querySelector('label select').value = sourceCurrency;
    const targetCurrency = 'TRY';
    el.target.value.querySelector('label select').value = targetCurrency;
    el.source.value.querySelector('label input').value = sourceAmount;

    const convertBtn = el.shadowRoot.getElementById('convert-btn');
    convertBtn.click();

    const expectedTargetAmount =
      (sourceAmount / rates[sourceCurrency]) * rates[targetCurrency];

    await expect(
      parseFloat(el.target.value.querySelector('label input').value),
    ).to.be.closeTo(expectedTargetAmount, 0.001);
  });

  it('allows converting back from target to source', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await el.loadRatesComplete;

    const targetAmount = 12;
    const sourceCurrency = 'GBP';
    el.source.value.querySelector('label select').value = sourceCurrency;
    const targetCurrency = 'TRY';
    el.target.value.querySelector('label select').value = targetCurrency;
    el.target.value.querySelector('label input').value = targetAmount;

    const convertBackBtn = el.shadowRoot.getElementById('convert-back-btn');
    convertBackBtn.click();

    const expectedTargetAmount =
      (targetAmount / rates[targetCurrency]) * rates[sourceCurrency];

    await expect(
      parseFloat(el.source.value.querySelector('label input').value),
    ).to.be.closeTo(expectedTargetAmount, 0.001);
  });

  it('allows setting different conversion rate date', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await el.loadRatesComplete;

    // mimic user changing date
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    el.dateInput.value.value = oneYearAgo.toISOString().slice(0, 10);
    el.dateInput.value.dispatchEvent(new Event('change'));

    await el.updateComplete;
    await el.loadRatesComplete;

    const sourceAmount = 1;
    const sourceCurrency = 'GBP';
    el.source.value.querySelector('label select').value = sourceCurrency;
    const targetCurrency = 'TRY';
    el.target.value.querySelector('label select').value = targetCurrency;
    el.source.value.querySelector('label input').value = sourceAmount;

    const convertBtn = el.shadowRoot.getElementById('convert-btn');
    convertBtn.click();

    const expectedTargetAmount =
      (sourceAmount / ratesOneYearAgo[sourceCurrency]) *
      ratesOneYearAgo[targetCurrency];

    await expect(
      parseFloat(el.target.value.querySelector('label input').value),
    ).to.be.closeTo(expectedTargetAmount, 0.001);
  });

  it('allows adding and removing conversions', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await el.loadRatesComplete;

    expect(
      Array.from(el.source.value.querySelectorAll('label input')).length,
    ).to.equal(1);
    expect(
      Array.from(el.target.value.querySelectorAll('label input')).length,
    ).to.equal(1);

    const addBtn = el.shadowRoot.getElementById('add-conversion-btn');
    const removeBtn = el.shadowRoot.getElementById('remove-conversion-btn');

    addBtn.click();
    await el.updateComplete;

    expect(
      Array.from(el.source.value.querySelectorAll('label input')).length,
    ).to.equal(2);
    expect(
      Array.from(el.target.value.querySelectorAll('label input')).length,
    ).to.equal(2);

    removeBtn.click();
    await el.updateComplete;

    expect(
      Array.from(el.source.value.querySelectorAll('label input')).length,
    ).to.equal(1);
    expect(
      Array.from(el.target.value.querySelectorAll('label input')).length,
    ).to.equal(1);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await expect(el).shadowDom.to.be.accessible();
  });
});

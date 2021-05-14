import { fixture, expect } from '@open-wc/testing';
import { html } from 'lit';
// import sinon from 'sinon';

import { fetchRates } from '../currency-converter.js';

// function return404(body) {
//   const mockResponse = new Response(JSON.stringify({}), {
//     status: 404,
//     headers: {
//       'Content-type': 'application/json',
//     },
//   });

//   return Promise.resolve(mockResponse);
// }

let rates;

describe('CurrencyConverter', () => {
  before(async () => {
    rates = (await fetchRates()).rates;
  });

  it('displays a loading message while fetching rates', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await expect(el).shadowDom.to.equal(`Loading currencies...`);
  });

  // TODO: Re-enable later, gonna have to look up how to expect async functions to throw in Chai.js
  // it.only('throws an error when the fetch to Rates API was unsuccessful', async () => {
  //   const stub = sinon.stub(window, 'fetch');
  //   stub.onCall(0).returns(return404());

  //   await expect(fetchRates).to.throw();

  //   window.fetch.restore();
  // });

  it('allows converting from one currency to another', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await el.loadRatesComplete;

    const sourceCurrency = 'GBP';
    el.sourceCurrency.value.value = sourceCurrency;
    const targetCurrency = 'TRY';
    el.targetCurrency.value.value = targetCurrency;
    el.sourceAmount.value.value = 1;

    const convertBtn = el.shadowRoot.getElementById('convert-btn');
    convertBtn.click();

    const expectedTargetAmount =
      (1 / rates[sourceCurrency]) * rates[targetCurrency];

    await expect(parseFloat(el.targetAmount.value.value)).to.be.closeTo(
      expectedTargetAmount,
      0.001,
    );
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);
    await expect(el).shadowDom.to.be.accessible();
  });
});

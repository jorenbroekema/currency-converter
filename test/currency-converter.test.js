import { fixture, expect } from '@open-wc/testing';
import { html } from 'lit';

import '../currency-converter.js';

describe('CurrencyConverter', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture(html`<currency-converter></currency-converter>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});

import * as React from 'react';
import { mount } from 'cypress/react';
import { VisynApp, VisynAppProvider } from 'visyn_core';

describe('Health check for Cypress component test', () => {
  it('should mount App', () => {
    mount(
      <VisynAppProvider appName="app_template">
        <VisynApp loginMenu={null}>Hello app_template!</VisynApp>
      </VisynAppProvider>,
    );
    cy.get('div').should('include.text', 'Hello app_template!');
  });
});

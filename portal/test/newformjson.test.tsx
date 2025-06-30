import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { Formio } from '@formio/js';
import { FormioProvider } from '@formio/react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { InfoPanelProvider } from '../src/hooks/useInfoPanelContext';
import App from '../src/components/App';

const server = setupServer(
  http.get('http://localhost:3002/current', () => {
    return HttpResponse.json({});
  }),
  http.get('http://localhost:3002/form', () => {
    return HttpResponse.json([]);
  })
);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  localStorage.setItem('formioToken', '12345');
  render(
    <FormioProvider baseUrl="http://localhost:3002">
      <InfoPanelProvider>
        <App />
      </InfoPanelProvider>
    </FormioProvider>
  );
});

test('Clicking on + New Form with JSON button navigates to the new form json page', async () => {
  const newFormButton = await screen.findByText('+ New Form with JSON');
  await userEvent.click(newFormButton);
  expect(await screen.findByText('Create Form via JSON'));
  expect(await screen.findByPlaceholderText('Form Title'));
  expect(window.location.href).to.include('/newformjson');
});

test('Creating a form with JSON should take you to edit form', async () => {
  server.use(
    http.post('http://localhost:3002/form', async ({ request }) => {
      const body = await request.json();
      return HttpResponse.json({ _id: '679999999999999999999999', ...body });
    }),
    http.get('/form/679999999999999999999999', () => {
      return HttpResponse.json({
        _id: '679999999999999999999999',
        title: 'My Form',
        name: 'myForm',
        path: 'myForm',
        type: 'form',
        display: 'form',
        components: []
      });
    })
  );

  await userEvent.click(await screen.findByText('+ New Form with JSON'));
  await userEvent.type(screen.getByPlaceholderText('Form Title'), 'My Form');
  await userEvent.type(screen.getByPlaceholderText('Form Name'), 'myForm');
  await userEvent.type(screen.getByPlaceholderText('Path'), 'myForm');
  await userEvent.type(screen.getByPlaceholderText('Paste form JSON here...'), '{"components": []}');
  await userEvent.click(screen.getByText('Create Form'));
  const editFormTab = await screen.findByText('Edit Form');
  expect(Array.from(editFormTab.classList)).contains('active');
});

afterEach(() => {
  server.resetHandlers();
  Formio.clearCache();
  Formio.tokens = {};
  localStorage.clear();
  window.location.href = '';
});

afterAll(() => {
  server.close();
});

import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { Formio } from '@formio/js';
import { FormioProvider } from '@formio/react';
import { render, screen, fireEvent } from '@testing-library/react';
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

test('Clicking on + New Form with JSON button navigates to the JSON page', async () => {
  const newJsonButton = await screen.findByText('+ New Form with JSON');
  await userEvent.click(newJsonButton);
  expect(await screen.findByText('Create Form via JSON'));
  expect(window.location.href).to.include('/newformjson');
});

test('Submitting valid JSON creates a form and redirects to edit page', async () => {
  server.use(
    http.get('/form/1234567890abcdef12345678', () => {
      return HttpResponse.json({ _id: '1234567890abcdef12345678', title: 'test', name: 'test', path: 'test', type: 'form', display: 'form', components: [] });
    }),
    http.post('http://localhost:3002/form', () => {
      return HttpResponse.json({ _id: '1234567890abcdef12345678', title: 'test', name: 'test', path: 'test', type: 'form', display: 'form', components: [] });
    })
  );
  const newJsonButton = await screen.findByText('+ New Form with JSON');
  await userEvent.click(newJsonButton);
  await userEvent.type(screen.getByPlaceholderText('Paste form JSON here...'), '{"title":"test","name":"test","path":"test","display":"form","type":"form","components":[]}');
  const createButton = await screen.findByText('Create Form');
  fireEvent.click(createButton);
  expect(await screen.findByText('Edit Form'));
});

test('Invalid JSON shows error message', async () => {
  const newJsonButton = await screen.findByText('+ New Form with JSON');
  await userEvent.click(newJsonButton);
  await userEvent.type(screen.getByPlaceholderText('Paste form JSON here...'), '{invalid');
  const createButton = await screen.findByText('Create Form');
  fireEvent.click(createButton);
  expect(await screen.findByRole('alert')).to.have.text('Invalid JSON');
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

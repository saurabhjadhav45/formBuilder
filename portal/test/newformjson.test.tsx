import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { Formio } from '@formio/js';
import { FormioProvider } from '@formio/react';
import { fireEvent, render, screen } from '@testing-library/react';
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

test('Clicking on + New Form with JSON shows metadata fields', async () => {
  const newJsonButton = await screen.findByText('+ New Form with JSON');
  await userEvent.click(newJsonButton);
  expect(await screen.findByText('Create Form via JSON'));
  expect(await screen.findByText('Form Title'));
  expect(await screen.findByText('Form Name'));
});

test('Creating a form with JSON navigates to edit form', async () => {
  server.use(
    http.get('/form/679bc82961e9293dee60f88a', () => {
      return HttpResponse.json({
        '_id': '679bc82961e9293dee60f88a',
        'title': 'test',
        'name': 'test',
        'path': 'test',
        'type': 'form',
        'display': 'form',
        'tags': [''],
        'owner': '679bc6e961e9293dee60f7fd',
        'components': [],
        'pdfComponents': [],
        'access': [{ 'type': 'read_all', 'roles': ['679bc6de61e9293dee60f7aa'] }],
        'submissionAccess': [],
        'created': '2025-01-30T18:42:49.240Z',
        'modified': '2025-01-30T18:42:49.243Z',
        'machineName': 'test'
      });
    }),
    http.post('http://localhost:3002/form', () => {
      return HttpResponse.json({
        '_id': '679bc82961e9293dee60f88a',
        'title': 'test',
        'name': 'test',
        'path': 'test',
        'type': 'form',
        'display': 'form',
        'tags': [''],
        'owner': '679bc6e961e9293dee60f7fd',
        'components': [],
        'pdfComponents': [],
        'access': [{ 'type': 'read_all', 'roles': ['679bc6de61e9293dee60f7aa'] }],
        'submissionAccess': [],
        'created': '2025-01-30T18:42:49.240Z',
        'modified': '2025-01-30T18:42:49.243Z',
        'machineName': 'test'
      });
    })
  );
  await userEvent.click(await screen.findByText('+ New Form with JSON'));
  await userEvent.type(document.querySelector('[name="data[title]"]')!, 'test');
  await userEvent.type(document.querySelector('[name="data[name]"]')!, 'test');
  await userEvent.type(document.querySelector('[name="data[path]"]')!, 'test');
  await userEvent.type(await screen.findByPlaceholderText('Paste form JSON here...'), '{"components":[]}');
  fireEvent.click(await screen.findByText('Create Form'));
  const editFormTab = await screen.findByText('Edit Form');
  expect(Array.from(editFormTab.classList)).contains('active');
});

test('Submitting invalid JSON shows server error', async () => {
  server.use(
    http.post('http://localhost:3002/form', () => {
      return HttpResponse.json({
        'status': 400,
        'message': 'form validation failed: path: Path `path` is required., name: Path `name` is required., title: Path `title` is required.'
      }, { status: 400 });
    })
  );
  await userEvent.click(await screen.findByText('+ New Form with JSON'));
  await userEvent.type(await screen.findByPlaceholderText('Paste form JSON here...'), '{"components":[]}');
  await userEvent.click(await screen.findByText('Create Form'));
  expect(await screen.findByRole('alert'));
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

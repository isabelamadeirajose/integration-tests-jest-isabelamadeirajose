import pactum from 'pactum';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Restful-Booker API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  let token = '';
  let bookingId = 0;

  const reserva = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 1000 }),
    depositpaid: true,
    bookingdates: {
      checkin: '2026-11-10',
      checkout: '2026-11-15'
    },
    additionalneeds: 'Breakfast'
  };

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(rep);

    token = await p
      .spec()
      .post(`${baseUrl}/auth`)
      .withHeaders('Accept', 'application/json')
      .withJson({
        username: 'admin',
        password: 'password123'
      })
      .expectStatus(StatusCodes.OK)
      .returns('token');
  });

  afterAll(() => p.reporter.end());

  describe('Disponibilidade e autenticação', () => {
    it('Deve confirmar que a API está no ar (health check)', async () => {
      await p.spec().get(`${baseUrl}/ping`).expectStatus(StatusCodes.CREATED);
    });

    it('Não deve gerar token com credenciais inválidas', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth`)
        .withHeaders('Accept', 'application/json')
        .withJson({
          username: faker.internet.username(),
          password: faker.string.alphanumeric(8)
        })
        .expectStatus(StatusCodes.OK)
        .expectJson({ reason: 'Bad credentials' });
    });
  });

  describe('CRUD de reservas', () => {
    it('Deve criar uma nova reserva com dados válidos', async () => {
      bookingId = await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withHeaders('Accept', 'application/json')
        .withJson(reserva)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ booking: reserva })
        .expectJsonSchema({
          type: 'object',
          properties: {
            bookingid: { type: 'number' },
            booking: { type: 'object' }
          },
          required: ['bookingid', 'booking']
        })
        .returns('bookingid');
    });

    it('Deve listar as reservas e retornar um array', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking`)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: {
            type: 'object',
            properties: { bookingid: { type: 'number' } },
            required: ['bookingid']
          }
        });
    });

    it('Deve buscar a reserva criada pelo id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/{id}`)
        .withPathParams('id', bookingId)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: reserva.firstname,
          lastname: reserva.lastname,
          totalprice: reserva.totalprice
        });
    });

    it('Deve atualizar a reserva inteira (PUT) com token válido', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/{id}`)
        .withPathParams('id', bookingId)
        .withHeaders('Accept', 'application/json')
        .withHeaders('Cookie', `token=${token}`)
        .withJson({
          ...reserva,
          totalprice: 999,
          additionalneeds: 'Lunch'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: reserva.firstname,
          totalprice: 999,
          additionalneeds: 'Lunch'
        });
    });

    it('Deve atualizar parcialmente a reserva (PATCH) com token válido', async () => {
      const novoNome = faker.person.firstName();

      await p
        .spec()
        .patch(`${baseUrl}/booking/{id}`)
        .withPathParams('id', bookingId)
        .withHeaders('Accept', 'application/json')
        .withHeaders('Cookie', `token=${token}`)
        .withJson({ firstname: novoNome })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ firstname: novoNome });
    });

    it('Não deve atualizar a reserva sem token de autenticação', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/{id}`)
        .withPathParams('id', bookingId)
        .withHeaders('Accept', 'application/json')
        .withJson(reserva)
        .expectStatus(StatusCodes.FORBIDDEN);
    });

    it('Deve excluir a reserva com token válido', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/booking/{id}`)
        .withPathParams('id', bookingId)
        .withHeaders('Cookie', `token=${token}`)
        .expectStatus(StatusCodes.CREATED);
    });

    it('Deve retornar 404 ao buscar a reserva excluída', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/{id}`)
        .withPathParams('id', bookingId)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });
});
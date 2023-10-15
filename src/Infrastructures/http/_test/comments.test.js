const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  let accessToken;
  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    accessToken = await ServerTestHelper.getAccessToken('user-123');
    await ThreadsTableTestHelper.addThread({ owner: 'user-123' });
  });

  describe('when POST /thread/{threadId}/comments', () => {
    it('should response 201 and persisted comment ', async () => {
      const payload = { content: 'comment content' };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/threadId/comments',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const payload = { content: 'comment content' };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-12345/comments',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
      const server = await createServer(container);

      await CommentsTableTestHelper.addComment({
        userId: 'user-123',
        threadId: 'threadId',
      });

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/threadId/comments/commentId',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when comment it is not the owner', async () => {
      const server = await createServer(container);
      const otherAccessToken = await ServerTestHelper.getAccessToken('user-123', 'desi');

      await CommentsTableTestHelper.addComment({
        userId: 'user-123',
        threadId: 'threadId',
      });

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/threadId/comments/commentId',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Halaman tidak ditemukan');
    });

    it('should response 404 when thread is not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-6546/comments/commetsId',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'thread tidak ditemukan',
      );
    });

    it('should response 404 when comment not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-id_test/comments/comment-id_test',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'comment tidak ditemukan',
      );
    });
  });
});

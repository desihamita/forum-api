const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist Add Thread and return thread correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'userId',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
        username: 'dicoding',
      });

      const addThread = new AddThread('userId', {
        title: 'thread title',
        body: 'thread body',
      });

      const fakeIdGenerator = () => 'Id'; // Menghasilkan ID yang sesuai
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addThread(addThread);

      const threads = await ThreadsTableTestHelper.findThreadById('threadId');
      expect(threads).toHaveLength(1);
    });

    it('should return addThread correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'userId',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
        username: 'dicoding',
      });

      const addThread = new AddThread('userId', {
        title: 'thread title',
        body: 'thread body',
      });

      const fakeIdGenerator = () => 'Id'; // Menghasilkan ID yang sesuai
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(addThread);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'threadId',
        title: 'thread title',
        owner: 'userId',
      }));
    });
  });

  describe('CheckAvailabilityThread', () => {
    it('should throw error when given thread id not found', async () => {
      const threadId = 'threadId';
      const fakeIdGenerator = () => 'Id';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId)).rejects.toThrow(NotFoundError);
    });

    it('should not throw error when given thread id is found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'userId',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
        username: 'dicoding',
      });

      const addThread = new AddThread('userId', {
        title: 'thread title',
        body: 'thread body',
      });

      const fakeIdGenerator = () => 'Id';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(addThread);
      await expect(threadRepositoryPostgres.checkAvailabilityThread('threadId')).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThread function', () => {
    it('should return Detail Thread correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'userId',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
        username: 'dicoding',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'threadId',
        title: 'thread title',
        body: 'thread body',
        owner: 'userId',
      });

      await CommentsTableTestHelper.addComment({
        userId: 'userId',
        threadId: 'threadId',
        commentId: 'commentId',
        content: 'comment content',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const detailThread = await threadRepositoryPostgres.getThreadById('threadId');

      expect(detailThread.id).toEqual('threadId');
      expect(detailThread.title).toEqual('thread title');
      expect(detailThread.body).toEqual('thread body');
      expect(detailThread.date).toBeTruthy();
      expect(detailThread.username).toEqual('dicoding');
      expect(detailThread.comments).toHaveLength(1);
    });
  });
});

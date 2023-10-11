const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist addComment and return added thread correctly', async () => {
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

      const fakeIdGenerator = () => 'Id';
      const addComment = new AddComment('userId', 'threadId', {
        content: 'comment content',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(addComment);

      const comment = await CommentsTableTestHelper.findCommentById('commentId');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
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

      const fakeIdGenerator = () => 'Id';
      const addComment = new AddComment('userId', 'threadId', {
        content: 'comment content',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'commentId',
        content: 'comment content',
        owner: 'userId',
      }));
    });
  });

  describe('verifyUserComment', () => {
    it('should throw NotFoundError when comment with given id not found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'userId',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
        username: 'dicoding',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'threadId',
        title: 'thread title test',
        body: 'thread body test',
        owner: 'userId',
      });

      const fakeIdGenerator = () => 'Id';
      const addComment = new AddComment('userId', 'threadId', {
        content: 'comment content test',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);
      await expect(commentRepositoryPostgres.verifyUserComment('userId', 'comment-id-test')).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when comment delete by non owner', async () => {
      await UsersTableTestHelper.addUser({
        id: 'userId-1',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
        username: 'dicoding',
      });

      await UsersTableTestHelper.addUser({
        id: 'userId-2',
        password: 'secret',
        fullname: 'Desi Sihamita',
        username: 'desihamita',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'threadId',
        title: 'thread title test',
        body: 'thread body test',
        owner: 'userId-1',
      });

      const fakeIdGenerator = () => 'Id';
      const addComment = new AddComment('userId-1', 'threadId', {
        content: 'comment content',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);
      await expect(commentRepositoryPostgres.verifyUserComment('userId-2', 'commentId')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment deleted by the owner', async () => {
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

      const fakeIdGenerator = () => 'Id';
      const addComment = new AddComment('userId', 'threadId', {
        content: 'comment content',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);
      await expect(commentRepositoryPostgres.verifyUserComment('userId', 'commentId')).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should set is_delete to true', async () => {
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

      const fakeIdGenerator = () => 'Id';
      const addComment = new AddComment('userId', 'threadId', {
        content: 'comment content',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);
      await commentRepositoryPostgres.deleteComment('userId', 'threadId', 'commentId');
      const comments = await CommentsTableTestHelper.findCommentById('commentId');

      expect(comments[0].is_delete).toBeTruthy();
    });
  });
});

const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { userId, title, body } = newThread;
    const id = `thread${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO threads(id, title, body, owner) VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, userId],
    };
    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThreadById(threadId) {
    const threadQuery = {
      text: `SELECT 
                    threads.id AS id, 
                    threads.title AS 
                    title, threads.body AS body, 
                    threads.date AS date, 
                    users.username AS username
                    FROM threads INNER JOIN users ON threads.owner = users.id
                    WHERE threads.id = $1`,
      values: [threadId],
    };
    const threadResult = await this._pool.query(threadQuery);
    const threadDetail = threadResult.rows[0];

    const commentQuery = {
      text: `SELECT
                    comments.id AS id,
                    users.username AS username,
                    comments.date AS date,
                    comments.content AS content,
                    comments.is_delete AS "isDelete"
                    FROM comments INNER JOIN users on comments.owner = users.id
                    WHERE comments.thread = $1 ORDER BY date ASC`,
      values: [threadId],
    };
    const commentResult = await this._pool.query(commentQuery);
    threadDetail.comments = commentResult.rows;

    return threadDetail;
  }

  async checkAvailabilityThread(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;

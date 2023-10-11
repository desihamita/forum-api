const DetailThread = require('../DetailThread');
const DetailComment = require('../../../comments/entities/DetailComment');

describe('DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'threadId',
      title: 'thread title',
      body: 'thread body',
      date: '2023',
    };

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 1234,
      title: 'thread title',
      body: 'thread body',
      date: '2023',
      username: 'dicoding',
      comments: {},
    };

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread Correctly', () => {
    const payload = {
      id: 'threadId',
      title: 'thread title',
      body: 'thread body',
      date: '2023',
      username: 'dicoding',
      comments: [
        new DetailComment({
          id: 'commentId-1',
          username: 'Desi',
          date: '2023',
          content: 'comment content',
          isDelete: false,
        }),
        new DetailComment({
          id: 'commentId-2',
          username: 'Mita',
          date: '2023',
          content: 'comment content 2',
          isDelete: true,
        }),
      ],
    };

    const detailThread = new DetailThread(payload);

    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments.length).toEqual(payload.comments.length);
    expect(detailThread.comments.length).toEqual(2);
    expect(detailThread.comments[0]).toEqual(payload.comments[0]);
    expect(detailThread.comments[1]).toEqual(payload.comments[1]);
  });
});

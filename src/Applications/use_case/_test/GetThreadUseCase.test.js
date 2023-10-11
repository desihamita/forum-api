const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('GetThreadUseCase', () => {
  it('should orchestrating the GetThread action correctly', async () => {
    const expectedThread = new DetailThread({
      id: 'threadId',
      title: 'thread title',
      body: 'thread body',
      date: '2023',
      username: 'desi',
      comments: [
        new DetailComment({
          id: 'commentId-1',
          content: 'comment content',
          date: '2023',
          username: 'desi',
          isDelete: false,
        }),
        new DetailComment({
          id: 'commentId-2',
          content: 'comment content 2',
          date: '2023',
          username: 'mita',
          isDelete: true,
        }),
      ],
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(expectedThread));

    mockThreadRepository.checkAvailabilityThread = jest.fn().mockImplementation(() => Promise.resolve());

    const getThreadUseCase = new GetThreadUseCase({ threadRepository: mockThreadRepository });

    const getThread = await getThreadUseCase.execute('threadId');

    expect(getThread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith('threadId');
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalled();
  });
});

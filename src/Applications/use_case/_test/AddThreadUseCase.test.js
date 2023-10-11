const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the AddThread action correctly', async () => {
    const useCaseUserId = 'userId';
    const useCasePayload = {
      title: 'thread title',
      body: 'thread body',
    };

    const expectedAddedThread = new AddedThread({
      id: 'threadId',
      title: useCasePayload.title,
      owner: useCaseUserId,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(new AddedThread({
      id: 'threadId',
      title: useCasePayload.title,
      owner: useCaseUserId,
    })));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addThread = await addThreadUseCase.execute(useCaseUserId, useCasePayload);

    expect(addThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread(useCaseUserId, {
      title: useCasePayload.title,
      body: useCasePayload.body,
    }));
  });
});

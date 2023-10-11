const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const userId = 'userId';
    const threadId = 'threadId';
    const commentId = 'commentId';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailabilityThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyUserComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(
      deleteCommentUseCase.execute(userId, threadId, commentId),
    ).resolves.not.toThrowError();
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(
      threadId,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      userId,
      threadId,
      commentId,
    );
    expect(mockCommentRepository.verifyUserComment).toBeCalledWith(
      userId,
      commentId,
    );
  });
});

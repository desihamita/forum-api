class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    const detailThread = await this._threadRepository.getThreadById(threadId);
    detailThread.comments.forEach((part, index, commentArray) => {
      if (part.isDelete) {
        commentArray[index].content = 'Komentar telah dihapus';
      }
      delete commentArray[index].isDelete;
    });
    return detailThread;
  }
}

module.exports = GetThreadUseCase;

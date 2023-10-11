const AddThread = require('../AddThread');

describe('AddThread entities', () => {
  it('should throw error when "payload" did not contain needed property', () => {
    const userId = 'userId';
    const payload = {
      title: 'thread title',
    };

    expect(() => new AddThread(userId, payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when "payload" did not meet data type specification', () => {
    const userId = 'userId';
    const payload = {
      title: 1234,
      body: 'thread body',
    };

    expect(() => new AddThread(userId, payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThread object correctly', () => {
    const expectedUserId = 'userId';
    const payload = {
      title: 'thread title',
      body: 'thread body',
    };

    const { userId, title, body } = new AddThread(expectedUserId, payload);

    expect(userId).toEqual(expectedUserId);
    expect(title).toEqual(title);
    expect(body).toEqual(body);
  });
});

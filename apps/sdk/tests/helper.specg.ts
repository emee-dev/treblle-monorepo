import { maskBody } from '../src/utils/utils';

describe('Treblle Utility Functions', () => {
  it('should mask data', () => {
    let data = { name: 'emee', password: '123', email: 'emee@treblle.com' };
    let blackList = ['api', 'email'];
    let maskedData = maskBody(data, blackList);

    expect(maskedData).toMatchSnapshot();
  });
});

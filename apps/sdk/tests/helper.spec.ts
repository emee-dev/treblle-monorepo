import { maskBody, isValidJsonString, RoundRobinBalancer } from '../src/utils/utils';

describe('Utility Functions', () => {
  let data = { name: 'emee', password: '123', email: 'emee@treblle.com' };
  let blackList = ['api', 'email'];

  it('should mask object and return it', () => {
    let emptyObject = {};
    let stringArgs = 'Hello world';
    let numberArgs = 2000;

    let resultA = maskBody(data, blackList);
    let resultB = maskBody(emptyObject, blackList);
    let resultC = maskBody(stringArgs, blackList);
    let resultD = maskBody(numberArgs, blackList);

    expect(resultA).toMatchInlineSnapshot(`
      {
        "email": "****************",
        "name": "emee",
        "password": "123",
      }
    `);
    expect(resultB).toStrictEqual({});
    expect(resultC).toStrictEqual(stringArgs);
    expect(resultD).toStrictEqual(numberArgs);
  });

  it('should validate a string to be json', () => {
    let validJson = JSON.stringify(data);
    let inValidJson = 'emee';

    let resultA = isValidJsonString(validJson);
    let resultB = isValidJsonString(inValidJson);

    expect(resultA).toBe(true);
    expect(resultB).toBe(false);
  });

  it('should evenly distribute request to urls when called', async () => {
    let urls = ['https://rocknrolla.treblle.com', 'https://punisher.treblle.com', 'https://sicario.treblle.com'];

    let loadBalancer = new RoundRobinBalancer(urls);
    let firstRequest = await loadBalancer.getTreblleBaseUrl();
    let secondRequest = await loadBalancer.getTreblleBaseUrl();
    let thirdRequest = await loadBalancer.getTreblleBaseUrl();
    let fourthRequest = await loadBalancer.getTreblleBaseUrl();
    let fifthRequest = await loadBalancer.getTreblleBaseUrl();

    expect(firstRequest).toBe(urls[0]);
    expect(secondRequest).toBe(urls[1]);
    expect(thirdRequest).toBe(urls[2]);
    expect(fourthRequest).toBe(urls[0]);
    expect(fifthRequest).toBe(urls[1]);
  });
});

import { NoopStateRepository } from '../../lib/spi/NoopStateRepository';
import { aHandlerContext, aUUID } from '../mocks';

describe('NoopStateRepository', () => {
  test('should return the specified entity', async () => {
    const repository = new NoopStateRepository<string, unknown>();
    const value = aUUID();

    await expect(repository.update(value, aHandlerContext())).resolves.toEqual(value);
  });
});

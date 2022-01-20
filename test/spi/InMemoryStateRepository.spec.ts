import { InMemoryStateRepository } from '../../lib/spi/InMemoryStateRepository';
import { aHandlerContext, aUUID } from '../mocks';

describe('InMemoryStateRepository', () => {
  test('should maintain an entity state', async () => {
    const repository = new InMemoryStateRepository<string, unknown>();
    const firstValue = aUUID();
    const secondValue = aUUID();

    await expect(repository.update(firstValue, aHandlerContext())).resolves.toEqual(firstValue);
    expect(repository.entity).toEqual(firstValue);

    await expect(repository.update(secondValue, aHandlerContext())).resolves.toEqual(secondValue);
    expect(repository.entity).toEqual(secondValue);
  });
});

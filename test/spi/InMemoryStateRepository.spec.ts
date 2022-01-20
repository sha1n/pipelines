import { InMemoryStateRepository } from '../../lib/spi/InMemoryStateRepository';
import { aHandlerContext, aUUID } from '../mocks';

describe('InMemoryStateRepository', () => {
  test('should maintain an entity state', async () => {
    const repository = new InMemoryStateRepository<{ id: string }, unknown>();
    const firstValue = { id: aUUID() };
    const secondValue = { id: aUUID() };

    await expect(repository.update(firstValue, aHandlerContext())).resolves.toEqual(firstValue);
    expect(repository.get(firstValue.id)).toEqual(firstValue);

    await expect(repository.update(secondValue, aHandlerContext())).resolves.toEqual(secondValue);
    expect(repository.get(secondValue.id)).toEqual(secondValue);
  });
});

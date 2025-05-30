import { ChildService } from './child-service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Define a type for our mock Supabase client chainable methods
type MockSupabaseChain = {
  select: jest.Mock<any, any>;
  insert: jest.Mock<any, any>;
  update: jest.Mock<any, any>;
  delete: jest.Mock<any, any>;
  eq: jest.Mock<any, any>;
  order: jest.Mock<any, any>;
  single: jest.Mock<any, any>;
};

// Helper function to create a mock Supabase client and its chainable methods
const createMockDb = () => {
  const chainableMocks: MockSupabaseChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(), // This is usually a terminal operation
  };

  const mockDb = {
    from: jest.fn(() => chainableMocks),
  } as unknown as SupabaseClient<Database>;

  return { mockDb, chainableMocks };
};

describe('ChildService', () => {
  let childService: ChildService;
  let mockDb: SupabaseClient<Database>;
  let chainableMocks: MockSupabaseChain;

  beforeEach(() => {
    const mocks = createMockDb();
    mockDb = mocks.mockDb;
    chainableMocks = mocks.chainableMocks;
    childService = new ChildService(mockDb);
  });

  describe('getAllChildren', () => {
    it('should fetch all children ordered by name', async () => {
      const mockChildren = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }];
      chainableMocks.order.mockResolvedValue({ data: mockChildren, error: null });

      const result = await childService.getAllChildren();

      expect(mockDb.from).toHaveBeenCalledWith('Child');
      expect(chainableMocks.select).toHaveBeenCalledWith('*');
      expect(chainableMocks.order).toHaveBeenCalledWith('name');
      expect(result).toEqual(mockChildren);
    });

    it('should throw an error if fetching children fails', async () => {
      const dbError = new Error('Failed to fetch');
      chainableMocks.order.mockResolvedValue({ data: null, error: dbError });

      await expect(childService.getAllChildren()).rejects.toThrow(dbError);
    });
  });

  describe('createChild', () => {
    const childInput = { name: 'Charlie' };
    const createdChild = { id: '3', ...childInput };

    it('should create a child and return it', async () => {
      chainableMocks.single.mockResolvedValue({ data: createdChild, error: null });

      const result = await childService.createChild(childInput);

      expect(mockDb.from).toHaveBeenCalledWith('Child');
      expect(chainableMocks.insert).toHaveBeenCalledWith([childInput]);
      expect(chainableMocks.select).toHaveBeenCalledTimes(1); // Default select after insert
      expect(chainableMocks.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdChild);
    });

    it('should throw an error if creating a child fails', async () => {
      const dbError = new Error('Failed to create');
      chainableMocks.single.mockResolvedValue({ data: null, error: dbError });

      await expect(childService.createChild(childInput)).rejects.toThrow(dbError);
    });
  });

  describe('updateChild', () => {
    const childId = '1';
    const childUpdateInput = { name: 'Alicia Updated' };
    const updatedChild = { id: childId, name: childUpdateInput.name };

    it('should update a child and return it', async () => {
      chainableMocks.single.mockResolvedValue({ data: updatedChild, error: null });

      const result = await childService.updateChild(childId, childUpdateInput);

      expect(mockDb.from).toHaveBeenCalledWith('Child');
      expect(chainableMocks.update).toHaveBeenCalledWith(childUpdateInput);
      expect(chainableMocks.eq).toHaveBeenCalledWith('id', childId);
      expect(chainableMocks.select).toHaveBeenCalledTimes(1);
      expect(chainableMocks.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedChild);
    });

    it('should throw an error if updating a child fails', async () => {
      const dbError = new Error('Failed to update');
      chainableMocks.single.mockResolvedValue({ data: null, error: dbError });

      await expect(childService.updateChild(childId, childUpdateInput)).rejects.toThrow(dbError);
    });

    it('should return null if update affects no rows and no error occurs (e.g. not found)', async () => {
      // Supabase's .single() returns null if no row matches and there's no other error.
      chainableMocks.single.mockResolvedValue({ data: null, error: null });
      const result = await childService.updateChild('non-existent-id', { name: 'Ghost' });
      expect(result).toBeNull();
       expect(mockDb.from).toHaveBeenCalledWith('Child');
      expect(chainableMocks.update).toHaveBeenCalledWith({ name: 'Ghost' });
      expect(chainableMocks.eq).toHaveBeenCalledWith('id', 'non-existent-id');
    });
  });

  describe('deleteChild', () => {
    const childId = '1';

    it('should delete a child', async () => {
      chainableMocks.eq.mockResolvedValue({ error: null }); // .delete().eq() doesn't typically return data with .single()

      await childService.deleteChild(childId);

      expect(mockDb.from).toHaveBeenCalledWith('Child');
      expect(chainableMocks.delete).toHaveBeenCalledTimes(1);
      expect(chainableMocks.eq).toHaveBeenCalledWith('id', childId);
    });

    it('should throw an error if deleting a child fails', async () => {
      const dbError = new Error('Failed to delete');
      chainableMocks.eq.mockResolvedValue({ error: dbError });

      await expect(childService.deleteChild(childId)).rejects.toThrow(dbError);
    });
  });
});

import { CompletedTaskService } from './completed-task-service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { startOfDay, endOfDay } from 'date-fns'; // For verification

// Using the same mock helper structure
type MockSupabaseChain = {
  select: jest.Mock<any, any>;
  insert: jest.Mock<any, any>;
  delete: jest.Mock<any, any>;
  eq: jest.Mock<any, any>;
  gte: jest.Mock<any, any>;
  lte: jest.Mock<any, any>;
  single: jest.Mock<any, any>;
};

const createMockDb = () => {
  const chainableMocks: MockSupabaseChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  const mockDb = {
    from: jest.fn(() => chainableMocks),
  } as unknown as SupabaseClient<Database>;
  return { mockDb, chainableMocks };
};

describe('CompletedTaskService', () => {
  let service: CompletedTaskService;
  let mockDb: SupabaseClient<Database>;
  let chainableMocks: MockSupabaseChain;

  const childId = 'child-123';
  const taskId = 'task-abc';
  const testDateStr = '2023-10-26'; // Use a fixed date for predictable start/end
  const testDate = new Date(testDateStr);
  const expectedDayStartISO = startOfDay(testDate).toISOString();
  const expectedDayEndISO = endOfDay(testDate).toISOString();

  beforeEach(() => {
    const mocks = createMockDb();
    mockDb = mocks.mockDb;
    chainableMocks = mocks.chainableMocks;
    service = new CompletedTaskService(mockDb);
  });

  describe('getCompletedTasksByChildAndDate', () => {
    it('should fetch completed tasks for a child and date range', async () => {
      const mockCompletedTasks = [{ id: 'ct1', taskId, childId, date: new Date(testDateStr).toISOString() }];
      // The final call in the chain for getCompletedTasksByChildAndDate is .lte()
      chainableMocks.lte.mockResolvedValue({ data: mockCompletedTasks, error: null });

      const result = await service.getCompletedTasksByChildAndDate(childId, testDateStr);

      expect(mockDb.from).toHaveBeenCalledWith('CompletedTask');
      expect(chainableMocks.select).toHaveBeenCalledWith('*');
      expect(chainableMocks.eq).toHaveBeenCalledWith('childId', childId);
      expect(chainableMocks.gte).toHaveBeenCalledWith('date', expectedDayStartISO);
      expect(chainableMocks.lte).toHaveBeenCalledWith('date', expectedDayEndISO);
      expect(result).toEqual(mockCompletedTasks);
    });

    it('should return an empty array if no tasks are found', async () => {
      chainableMocks.lte.mockResolvedValue({ data: [], error: null });
      const result = await service.getCompletedTasksByChildAndDate(childId, testDateStr);
      expect(result).toEqual([]);
    });

    it('should throw an error if fetching fails', async () => {
      const dbError = new Error('Fetch failed');
      chainableMocks.lte.mockResolvedValue({ data: null, error: dbError });
      await expect(service.getCompletedTasksByChildAndDate(childId, testDateStr)).rejects.toThrow(dbError);
    });
  });

  describe('toggleTaskCompletion', () => {
    const completedTaskRecord = { id: 'ct-record-1', taskId, childId, date: new Date(testDateStr).toISOString() };

    // Scenario 1: Task is not yet completed, should create a new record
    describe('when task is not yet completed', () => {
      beforeEach(() => {
        // Simulate find query returning no existing tasks
        chainableMocks.lte.mockResolvedValueOnce({ data: [], error: null });
      });

      it('should create a new completed task record', async () => {
        chainableMocks.single.mockResolvedValueOnce({ data: completedTaskRecord, error: null });

        const result = await service.toggleTaskCompletion(taskId, childId, testDateStr);

        // Check find query
        expect(mockDb.from).toHaveBeenNthCalledWith(1, 'CompletedTask');
        expect(chainableMocks.select).toHaveBeenNthCalledWith(1, '*');
        expect(chainableMocks.eq).toHaveBeenCalledWith('taskId', taskId); // These will be called multiple times
        expect(chainableMocks.eq).toHaveBeenCalledWith('childId', childId);
        expect(chainableMocks.gte).toHaveBeenCalledWith('date', expectedDayStartISO);
        expect(chainableMocks.lte).toHaveBeenCalledWith('date', expectedDayEndISO);

        // Check insert query
        expect(mockDb.from).toHaveBeenNthCalledWith(2, 'CompletedTask');
        expect(chainableMocks.insert).toHaveBeenCalledWith([{ taskId, childId, date: new Date(testDateStr).toISOString() }]);
        expect(chainableMocks.select).toHaveBeenNthCalledWith(2); // select() is called with no args
        expect(chainableMocks.single).toHaveBeenCalledTimes(1);
        expect(result).toEqual(completedTaskRecord);
      });

      it('should throw error if find query fails', async () => {
        const findDbError = new Error('Find failed');
        // Reset lte mock from beforeEach and set it for this specific test
        chainableMocks.lte.mockReset().mockResolvedValueOnce({ data: null, error: findDbError });

        await expect(service.toggleTaskCompletion(taskId, childId, testDateStr)).rejects.toThrow(findDbError);
      });

      it('should throw error if insert query fails', async () => {
        const insertDbError = new Error('Insert failed');
        chainableMocks.single.mockResolvedValueOnce({ data: null, error: insertDbError });

        await expect(service.toggleTaskCompletion(taskId, childId, testDateStr)).rejects.toThrow(insertDbError);
      });
    });

    // Scenario 2: Task is already completed, should delete existing record
    describe('when task is already completed', () => {
      beforeEach(() => {
        // Simulate find query returning an existing task
        chainableMocks.lte.mockResolvedValueOnce({ data: [completedTaskRecord], error: null });
      });

      it('should delete the existing completed task record', async () => {
        // The SELECT query calls eq twice (taskId, childId). These must return `this` for chaining.
        // The DELETE query calls eq once (id). This should resolve with the delete operation's result.
        chainableMocks.eq.mockReset()
                         .mockImplementationOnce(function() { return this; }) // For SELECT's eq('taskId',...)
                         .mockImplementationOnce(function() { return this; }) // For SELECT's eq('childId',...)
                         .mockResolvedValueOnce({ error: null }); // For DELETE's eq('id',...)


        const result = await service.toggleTaskCompletion(taskId, childId, testDateStr);

        // Find query (lte is mocked in beforeEach for the select part)
        expect(mockDb.from).toHaveBeenNthCalledWith(1, 'CompletedTask');
        expect(chainableMocks.select).toHaveBeenNthCalledWith(1,'*');
        expect(chainableMocks.eq).toHaveBeenCalledWith('taskId', taskId);
        expect(chainableMocks.eq).toHaveBeenCalledWith('childId', childId);
        expect(chainableMocks.gte).toHaveBeenCalledWith('date', expectedDayStartISO);
        expect(chainableMocks.lte).toHaveBeenCalledWith('date', expectedDayEndISO);


        // Delete query
        expect(mockDb.from).toHaveBeenNthCalledWith(2, 'CompletedTask');
        expect(chainableMocks.delete).toHaveBeenCalledTimes(1);
        expect(chainableMocks.eq).toHaveBeenLastCalledWith('id', completedTaskRecord.id); // Correctly checks the last call to eq
        expect(result).toEqual({ message: 'Task uncompleted' });
      });

      it('should throw error if find query fails (even when expecting to find)', async () => {
        const findDbError = new Error('Find failed during toggle');
        // Ensure eq calls for the SELECT part are chainable, then lte (end of SELECT chain) fails
        chainableMocks.eq.mockReset()
                         .mockImplementationOnce(function() { return this; })
                         .mockImplementationOnce(function() { return this; });
        chainableMocks.lte.mockReset().mockResolvedValueOnce({ data: null, error: findDbError });

        await expect(service.toggleTaskCompletion(taskId, childId, testDateStr)).rejects.toThrow(findDbError);
      });

      it('should throw error if delete query fails', async () => {
        const deleteDbError = new Error('Delete failed');
        // SELECT's eq calls should be chainable.
        // DELETE's eq call (the third eq call overall) should resolve with an error.
        chainableMocks.eq.mockReset()
                         .mockImplementationOnce(function() { return this; }) // For SELECT's eq('taskId',...)
                         .mockImplementationOnce(function() { return this; }) // For SELECT's eq('childId',...)
                         .mockResolvedValueOnce({ error: deleteDbError }); // For DELETE's eq('id',...)

        await expect(service.toggleTaskCompletion(taskId, childId, testDateStr)).rejects.toThrow(deleteDbError);
      });
    });
  });
});

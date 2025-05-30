import { TaskService } from './task-service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Task, TaskInput } from '@/types/task';

// Using the same mock helper structure as in child-service.test.ts
type MockSupabaseChain = {
  select: jest.Mock<any, any>;
  insert: jest.Mock<any, any>;
  update: jest.Mock<any, any>;
  delete: jest.Mock<any, any>;
  eq: jest.Mock<any, any>;
  order: jest.Mock<any, any>;
  single: jest.Mock<any, any>;
  rpc: jest.Mock<any, any>; // For potential stored procedures
};

const createMockDb = () => {
  const chainableMocks: MockSupabaseChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    rpc: jest.fn(),
  };
  const mockDb = {
    from: jest.fn(() => chainableMocks),
    rpc: chainableMocks.rpc, // Attach rpc mock directly to db mock
  } as unknown as SupabaseClient<Database>;
  return { mockDb, chainableMocks };
};

describe('TaskService', () => {
  let taskService: TaskService;
  let mockDb: SupabaseClient<Database>;
  let chainableMocks: MockSupabaseChain;

  beforeEach(() => {
    const mocks = createMockDb();
    mockDb = mocks.mockDb;
    chainableMocks = mocks.chainableMocks;
    taskService = new TaskService(mockDb);
  });

  describe('getAllTasks', () => {
    it('should fetch all tasks ordered by "order"', async () => {
      const mockTasks = [{ id: '1', name: 'Task 1', order: 1 }];
      chainableMocks.order.mockResolvedValue({ data: mockTasks, error: null });

      const result = await taskService.getAllTasks();

      expect(mockDb.from).toHaveBeenCalledWith('Task');
      expect(chainableMocks.select).toHaveBeenCalledWith('*');
      expect(chainableMocks.order).toHaveBeenCalledWith('order', { ascending: true });
      expect(result).toEqual(mockTasks);
    });

    it('should throw an error if fetching tasks fails', async () => {
      const dbError = new Error('Failed to fetch tasks');
      chainableMocks.order.mockResolvedValue({ data: null, error: dbError });

      await expect(taskService.getAllTasks()).rejects.toThrow(dbError);
    });
  });

  describe('createTask', () => {
    const taskInput: TaskInput = { name: 'New Task', description: 'A cool task', child_id: 'child1', order: 1 };
    const createdTask: Task = { id: 'task1', created_at: 'some-date', ...taskInput };

    it('should create a task and return it', async () => {
      chainableMocks.single.mockResolvedValue({ data: createdTask, error: null });

      const result = await taskService.createTask(taskInput);

      expect(mockDb.from).toHaveBeenCalledWith('Task');
      expect(chainableMocks.insert).toHaveBeenCalledWith([taskInput]);
      expect(chainableMocks.select).toHaveBeenCalledTimes(1);
      expect(chainableMocks.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdTask);
    });

    it('should throw an error if creating a task fails', async () => {
      const dbError = new Error('Failed to create task');
      chainableMocks.single.mockResolvedValue({ data: null, error: dbError });

      await expect(taskService.createTask(taskInput)).rejects.toThrow(dbError);
    });
  });

  describe('updateTask', () => {
    const taskId = 'task1';
    const taskUpdateInput: Partial<TaskInput> = { name: 'Updated Task Name' };
    const updatedTask: Task = { id: taskId, name: 'Updated Task Name', child_id: 'child1', order: 1, description: '', created_at: 'some-date' };

    it('should update a task and return it', async () => {
      chainableMocks.single.mockResolvedValue({ data: updatedTask, error: null });

      const result = await taskService.updateTask(taskId, taskUpdateInput);

      expect(mockDb.from).toHaveBeenCalledWith('Task');
      expect(chainableMocks.update).toHaveBeenCalledWith(taskUpdateInput);
      expect(chainableMocks.eq).toHaveBeenCalledWith('id', taskId);
      expect(chainableMocks.select).toHaveBeenCalledTimes(1);
      expect(chainableMocks.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedTask);
    });

    it('should throw an error if updating a task fails', async () => {
      const dbError = new Error('Failed to update task');
      chainableMocks.single.mockResolvedValue({ data: null, error: dbError });

      await expect(taskService.updateTask(taskId, taskUpdateInput)).rejects.toThrow(dbError);
    });

    it('should return null if update affects no rows (e.g. not found)', async () => {
      chainableMocks.single.mockResolvedValue({ data: null, error: null });
      const result = await taskService.updateTask('non-existent-id', { name: 'Ghost Task' });
      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    const taskId = 'task1';

    it('should delete a task', async () => {
      chainableMocks.eq.mockResolvedValue({ error: null });

      await taskService.deleteTask(taskId);

      expect(mockDb.from).toHaveBeenCalledWith('Task');
      expect(chainableMocks.delete).toHaveBeenCalledTimes(1);
      expect(chainableMocks.eq).toHaveBeenCalledWith('id', taskId);
    });

    it('should throw an error if deleting a task fails', async () => {
      const dbError = new Error('Failed to delete task');
      chainableMocks.eq.mockResolvedValue({ error: dbError });

      await expect(taskService.deleteTask(taskId)).rejects.toThrow(dbError);
    });
  });

  describe('updateTasksOrder', () => {
    const tasksToUpdate: Partial<Task>[] = [
      { id: 'task1', order: 2 },
      { id: 'task2', order: 1 },
    ];
    const updatedTask1 = { id: 'task1', name: 'Task 1', order: 2, child_id: 'c1', created_at: 'date', description: '' };
    const updatedTask2 = { id: 'task2', name: 'Task 2', order: 1, child_id: 'c1', created_at: 'date', description: '' };

    it('should update the order of multiple tasks successfully', async () => {
      // Mock implementation for the loop
      chainableMocks.select.mockImplementation(async () => {
        // Check which task is being updated based on the .eq() call
        const currentId = chainableMocks.eq.mock.calls[chainableMocks.eq.mock.calls.length -1][1];
        if (currentId === 'task1') return { data: [updatedTask1], error: null };
        if (currentId === 'task2') return { data: [updatedTask2], error: null };
        return { data: [], error: new Error('Task not found in mock')};
      });

      const results = await taskService.updateTasksOrder(tasksToUpdate);

      expect(mockDb.from).toHaveBeenCalledWith('Task'); // Called for each task
      expect(chainableMocks.update).toHaveBeenCalledTimes(tasksToUpdate.length);
      expect(chainableMocks.eq).toHaveBeenCalledWith('id', tasksToUpdate[0].id);
      expect(chainableMocks.update).toHaveBeenCalledWith({ order: tasksToUpdate[0].order });
      expect(chainableMocks.eq).toHaveBeenCalledWith('id', tasksToUpdate[1].id);
      expect(chainableMocks.update).toHaveBeenCalledWith({ order: tasksToUpdate[1].order });
      expect(results).toEqual([updatedTask1, updatedTask2]);
    });

    it('should throw a custom error if any task update fails', async () => {
      const dbError = new Error('DB update failed');
      // First call succeeds, second fails
      chainableMocks.select
        .mockResolvedValueOnce({ data: [updatedTask1], error: null })
        .mockResolvedValueOnce({ data: null, error: dbError });

      await expect(taskService.updateTasksOrder(tasksToUpdate))
        .rejects.toThrow('Erro ao atualizar a ordem das tarefas: Error: DB update failed');
    });

    it('should return an empty array if an empty array of tasks is provided', async () => {
      const results = await taskService.updateTasksOrder([]);
      expect(results).toEqual([]);
      expect(mockDb.from).not.toHaveBeenCalled();
    });
  });
});

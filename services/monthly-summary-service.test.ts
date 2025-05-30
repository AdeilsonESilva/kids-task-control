import { MonthlySummaryService } from './monthly-summary-service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { startOfMonth, endOfMonth, getDate } from 'date-fns'; // getDate for daysInMonth

// Mock helper
type MockSupabaseChain = {
  select: jest.Mock<any, any>;
  eq: jest.Mock<any, any>;
  gte: jest.Mock<any, any>;
  lte: jest.Mock<any, any>;
};

const createMockDb = () => {
  const chainableMocks: MockSupabaseChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn(), // Terminal for the select query
  };
  const mockDb = {
    from: jest.fn(() => chainableMocks),
  } as unknown as SupabaseClient<Database>;
  return { mockDb, chainableMocks };
};

describe('MonthlySummaryService', () => {
  let service: MonthlySummaryService;
  let mockDb: SupabaseClient<Database>;
  let chainableMocks: MockSupabaseChain;

  const childId = 'child-monthly-123';
  // Use a date in a month with a known number of days, e.g., Nov 2023 (30 days)
  const testDateStr = '2023-11-15';
  const testDate = new Date(testDateStr);
  const daysInTestMonth = 30;

  const expectedMonthStartISO = startOfMonth(testDate).toISOString();
  const expectedMonthEndISO = endOfMonth(testDate).toISOString();

  beforeEach(() => {
    const mocks = createMockDb();
    mockDb = mocks.mockDb;
    chainableMocks = mocks.chainableMocks;
    service = new MonthlySummaryService(mockDb);
  });

  // Mock Task data structure based on the select query in the service
  const createTaskData = (value: string, isDiscount: boolean, isBonus: boolean) => ({
    value, isDiscount, isBonus,
    // Add other Task fields if they were part of the select, but service only uses these three
  });

  const mockCompleted = (id: string, Task: any, date?: string) => ({
    id, childId, taskId: `task-${id}`,
    date: date || expectedMonthStartISO, // Default to start of month if not specified
    Task, // Joined Task data
  });

  describe('getMonthlySummary', () => {
    it('should calculate summary correctly with a mix of tasks', async () => {
      const tasksData = [
        mockCompleted('ct1', createTaskData('20.00', false, false)), // Paying
        mockCompleted('ct2', createTaskData('10.00', false, false)), // Paying
        mockCompleted('ct3', createTaskData('5.00', true, false)),   // Discount
        mockCompleted('ct4', createTaskData('7.00', false, true)),   // Bonus
      ];
      chainableMocks.lte.mockResolvedValue({ data: tasksData, error: null });

      const summary = await service.getMonthlySummary(childId, testDateStr);

      expect(mockDb.from).toHaveBeenCalledWith('CompletedTask');
      expect(chainableMocks.select).toHaveBeenCalledWith(expect.stringContaining("Task"));
      expect(chainableMocks.eq).toHaveBeenCalledWith('childId', childId);
      expect(chainableMocks.gte).toHaveBeenCalledWith('date', expectedMonthStartISO);
      expect(chainableMocks.lte).toHaveBeenCalledWith('date', expectedMonthEndISO);

      // totalValue = (20 + 10 + 7) - 5 = 32
      expect(summary.totalValue).toBe(32.00);
      // totalDiscounts = 5
      expect(summary.totalDiscounts).toBe(5.00);
      // completedTasks (non-discount, non-bonus) = 2 (ct1, ct2)
      expect(summary.completedTasks).toBe(2);
      expect(summary.dailyAverageValue).toBeCloseTo(32.00 / daysInTestMonth);
    });

    it('should handle no completed tasks in the month', async () => {
      chainableMocks.lte.mockResolvedValue({ data: [], error: null });
      const summary = await service.getMonthlySummary(childId, testDateStr);

      expect(summary.totalValue).toBe(0);
      expect(summary.totalDiscounts).toBe(0);
      expect(summary.completedTasks).toBe(0);
      expect(summary.dailyAverageValue).toBe(0 / daysInTestMonth);
    });

    it('should handle only paying tasks', async () => {
      const tasksData = [
        mockCompleted('ct1', createTaskData('15.00', false, false)),
        mockCompleted('ct2', createTaskData('25.00', false, false)),
      ];
      chainableMocks.lte.mockResolvedValue({ data: tasksData, error: null });
      const summary = await service.getMonthlySummary(childId, testDateStr);

      expect(summary.totalValue).toBe(40.00);
      expect(summary.totalDiscounts).toBe(0);
      expect(summary.completedTasks).toBe(2);
      expect(summary.dailyAverageValue).toBeCloseTo(40.00 / daysInTestMonth);
    });

    it('should handle only discount tasks', async () => {
      const tasksData = [
        mockCompleted('ct1', createTaskData('5.00', true, false)),
        mockCompleted('ct2', createTaskData('3.00', true, false)),
      ];
      chainableMocks.lte.mockResolvedValue({ data: tasksData, error: null });
      const summary = await service.getMonthlySummary(childId, testDateStr);

      expect(summary.totalValue).toBe(-8.00); // 0 - 5 - 3
      expect(summary.totalDiscounts).toBe(8.00); // 5 + 3
      expect(summary.completedTasks).toBe(0);
      expect(summary.dailyAverageValue).toBeCloseTo(-8.00 / daysInTestMonth);
    });

    it('should handle only bonus tasks', async () => {
      const tasksData = [
        mockCompleted('ct1', createTaskData('10.00', false, true)),
        mockCompleted('ct2', createTaskData('4.00', false, true)),
      ];
      chainableMocks.lte.mockResolvedValue({ data: tasksData, error: null });
      const summary = await service.getMonthlySummary(childId, testDateStr);

      expect(summary.totalValue).toBe(14.00); // Bonus tasks add to totalValue
      expect(summary.totalDiscounts).toBe(0);
      expect(summary.completedTasks).toBe(0); // But not to this count
      expect(summary.dailyAverageValue).toBeCloseTo(14.00 / daysInTestMonth);
    });


    it('should throw an error if fetching fails', async () => {
      const dbError = new Error('Monthly fetch failed');
      chainableMocks.lte.mockResolvedValue({ data: null, error: dbError });
      await expect(service.getMonthlySummary(childId, testDateStr)).rejects.toThrow(dbError);
    });
  });
});

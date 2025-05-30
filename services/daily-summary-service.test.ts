import { DailySummaryService } from './daily-summary-service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

// Mock helper
type MockSupabaseChain = {
  select: jest.Mock<any, any>; // Can be chainable or terminal depending on context
  eq: jest.Mock<any, any>;
  gte: jest.Mock<any, any>;
  lte: jest.Mock<any, any>; // Often terminal for .select()...lte() chains
};

const createMockDb = () => {
  const chainableMocks: MockSupabaseChain = {
    select: jest.fn(), // Behavior defined in tests or advanced mock below
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn(),
  };
  const mockDb = {
    from: jest.fn(), // Advanced mock implementation will be set in beforeEach
  } as unknown as SupabaseClient<Database>;
  return { mockDb, chainableMocks };
};

describe('DailySummaryService', () => {
  let service: DailySummaryService;
  let mockDb: SupabaseClient<Database>;
  let chainableMocks: MockSupabaseChain;

  const childId = 'child-123';
  const testDateStr = '2023-10-26'; // A Thursday
  const testDate = new Date(testDateStr);

  // Expected date ranges based on testDateStr
  const expectedDayStartISO = startOfDay(testDate).toISOString();
  const expectedDayEndISO = endOfDay(testDate).toISOString();
  const expectedWeekStartISO = startOfWeek(testDate, { weekStartsOn: 1 }).toISOString();
  const expectedWeekEndISO = endOfWeek(testDate, { weekStartsOn: 1 }).toISOString();

  beforeEach(() => {
    const mocks = createMockDb();
    mockDb = mocks.mockDb;
    chainableMocks = mocks.chainableMocks;
    service = new DailySummaryService(mockDb);
  });

  describe('getWeekBoundaries', () => {
    it('should return correct ISO strings for start (Monday) and end (Sunday) of the week', () => {
      const { firstDay, lastDay } = service.getWeekBoundaries(testDate);
      expect(firstDay).toBe(expectedWeekStartISO);
      expect(lastDay).toBe(expectedWeekEndISO);
    });
  });

  describe('getDailySummary', () => {
    // Mock data structures
    const mockTaskPaying = { id: 'task-p1', name: 'Paying Task 1', value: '10.00', isDiscount: false, isBonus: false };
    const mockTaskPaying2 = { id: 'task-p2', name: 'Paying Task 2', value: '5.00', isDiscount: false, isBonus: false };
    const mockTaskDiscount = { id: 'task-d1', name: 'Discount Task 1', value: '2.00', isDiscount: true, isBonus: false };
    const mockTaskBonus = { id: 'task-b1', name: 'Bonus Task 1', value: '3.00', isDiscount: false, isBonus: true };

    const mockCompletedTaskPaying = { id: 'ct-p1', childId, date: expectedDayStartISO, taskId: mockTaskPaying.id, task: mockTaskPaying };
    const mockCompletedTaskPaying2 = { id: 'ct-p2', childId, date: expectedDayStartISO, taskId: mockTaskPaying2.id, task: mockTaskPaying2 };
    const mockCompletedTaskDiscountDaily = { id: 'ct-d1', childId, date: expectedDayStartISO, taskId: mockTaskDiscount.id, task: mockTaskDiscount };
    const mockCompletedTaskBonusDaily = { id: 'ct-b1', childId, date: expectedDayStartISO, taskId: mockTaskBonus.id, task: mockTaskBonus };

    // For weekly discount summary
    const mockCompletedTaskDiscountWeekly = { id: 'ct-d-week', childId, date: expectedWeekStartISO, taskId: mockTaskDiscount.id, task: mockTaskDiscount };

    it('should calculate summary correctly for a mix of tasks', async () => {
      const dailyCompletedChain = {
        select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValueOnce({
          data: [mockCompletedTaskPaying, mockCompletedTaskDiscountDaily, mockCompletedTaskBonusDaily], error: null
        }),
      };
      const weeklyDiscountChain = {
        select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValueOnce({ data: [mockCompletedTaskDiscountWeekly], error: null }),
      };
      const mockCountSelectTerminal = jest.fn().mockResolvedValue({ count: 3, error: null });
      const totalTasksChain = {
        eq: jest.fn().mockReturnThis(), select: mockCountSelectTerminal,
      };

      let fromCallOrder = 0;
      (mockDb.from as jest.Mock).mockImplementation((tableName: string) => {
        fromCallOrder++;
        if (tableName === 'CompletedTask') {
          if (fromCallOrder === 1) return dailyCompletedChain; // Daily completed tasks
          if (fromCallOrder === 3) return weeklyDiscountChain; // Weekly discount tasks
        }
        if (tableName === 'Task' && fromCallOrder === 2) {
          totalTasksChain.eq.mockClear().mockReturnThis().mockReturnThis(); // for the two .eq calls
          return totalTasksChain;
        }
        throw new Error(`Unexpected call to mockDb.from with table: ${tableName} at call order ${fromCallOrder}`);
      });

      const summary = await service.getDailySummary(childId, testDateStr);

      // Assertions for DB Call 1 (Daily Completed)
      expect(mockDb.from).toHaveBeenNthCalledWith(1, "CompletedTask");
      expect(dailyCompletedChain.select).toHaveBeenCalledWith(expect.stringContaining("task:Task(*)"));
      expect(dailyCompletedChain.eq).toHaveBeenCalledWith("childId", childId);
      expect(dailyCompletedChain.gte).toHaveBeenCalledWith("date", expectedDayStartISO);
      expect(dailyCompletedChain.lte).toHaveBeenCalledWith("date", expectedDayEndISO);

      // Assertions for DB Call 2 (Total Tasks Count)
      expect(mockDb.from).toHaveBeenNthCalledWith(2, "Task");
      expect(totalTasksChain.eq).toHaveBeenCalledWith("isDiscount", false);
      expect(totalTasksChain.eq).toHaveBeenCalledWith("isBonus", false);
      expect(mockCountSelectTerminal).toHaveBeenCalledWith("*", { count: "exact", head: true });

      // Assertions for DB Call 3 (Weekly Discounts)
      expect(mockDb.from).toHaveBeenNthCalledWith(3, "CompletedTask");
      expect(weeklyDiscountChain.select).toHaveBeenCalledWith(expect.stringContaining("task:Task!inner(value)"));
      expect(weeklyDiscountChain.eq).toHaveBeenCalledWith("task.isDiscount", true);
      expect(weeklyDiscountChain.eq).toHaveBeenCalledWith("childId", childId); // Also called for weekly
      expect(weeklyDiscountChain.gte).toHaveBeenCalledWith("date", expectedWeekStartISO);
      expect(weeklyDiscountChain.lte).toHaveBeenCalledWith("date", expectedWeekEndISO);

      expect(summary.totalValue).toBe(10.00);
      expect(summary.completedTasks).toBe(1);
      expect(summary.totalTasks).toBe(3);
      expect(summary.totalDiscountWeek).toBe(2.00);
    });

    it('should handle no completed tasks today', async () => {
      const dailyCompletedChain = { lte: jest.fn().mockResolvedValueOnce({ data: [], error: null }) };
      const weeklyDiscountChain = { lte: jest.fn().mockResolvedValueOnce({ data: [], error: null }) };
      const mockCountSelectTerminal = jest.fn().mockResolvedValue({ count: 2, error: null });
      const totalTasksChain = { eq: jest.fn().mockReturnThis(), select: mockCountSelectTerminal };

      // Simplified from mock for this case, only terminal lte matters for CT, and select for Task
      let fromCallOrder = 0;
      (mockDb.from as jest.Mock).mockImplementation((tableName: string) => {
        fromCallOrder++;
        if (tableName === 'CompletedTask') {
          // Attach other chainable methods if they are called before lte
          const chain = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), gte: jest.fn().mockReturnThis() };
          if (fromCallOrder === 1) return { ...chain, lte: dailyCompletedChain.lte };
          if (fromCallOrder === 3) return { ...chain, lte: weeklyDiscountChain.lte };
        }
        if (tableName === 'Task' && fromCallOrder === 2) {
          totalTasksChain.eq.mockClear().mockReturnThis().mockReturnThis();
          return totalTasksChain;
        }
        return { select: jest.fn(), eq: jest.fn(), gte: jest.fn(), lte: jest.fn() }; // Default empty mock
      });

      const summary = await service.getDailySummary(childId, testDateStr);
      expect(summary.totalValue).toBe(0);
      expect(summary.completedTasks).toBe(0);
      expect(summary.totalTasks).toBe(2);
      expect(summary.totalDiscountWeek).toBe(0);
    });

    it('should handle zero total tasks', async () => {
      const dailyCompletedChain = { lte: jest.fn().mockResolvedValueOnce({ data: [], error: null }) };
      const weeklyDiscountChain = { lte: jest.fn().mockResolvedValueOnce({ data: [], error: null }) };
      const mockCountSelectTerminal = jest.fn().mockResolvedValue({ count: 0, error: null });
      const totalTasksChain = { eq: jest.fn().mockReturnThis(), select: mockCountSelectTerminal };

      let fromCallOrder = 0;
      (mockDb.from as jest.Mock).mockImplementation((tableName: string) => {
        fromCallOrder++;
        if (tableName === 'CompletedTask') {
          const chain = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), gte: jest.fn().mockReturnThis() };
          if (fromCallOrder === 1) return { ...chain, lte: dailyCompletedChain.lte };
          if (fromCallOrder === 3) return { ...chain, lte: weeklyDiscountChain.lte };
        }
        if (tableName === 'Task' && fromCallOrder === 2) {
          totalTasksChain.eq.mockClear().mockReturnThis().mockReturnThis();
          return totalTasksChain;
        }
        return { select: jest.fn(), eq: jest.fn(), gte: jest.fn(), lte: jest.fn() };
      });

      const summary = await service.getDailySummary(childId, testDateStr);
      expect(summary.totalValue).toBe(0);
      expect(summary.completedTasks).toBe(0);
      expect(summary.totalTasks).toBe(0);
      expect(summary.totalDiscountWeek).toBe(0);
    });

    it('should throw if fetching daily completed tasks fails', async () => {
      const dbError = new Error('Daily fetch failed');
      const dailyCompletedChain = { lte: jest.fn().mockResolvedValueOnce({ data: null, error: dbError }) };
      // Other chains don't matter as it should throw early
      (mockDb.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'CompletedTask') {
          return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), gte: jest.fn().mockReturnThis(), lte: dailyCompletedChain.lte };
        }
        return { select: jest.fn().mockResolvedValue({ count: 0, error: null}), eq: jest.fn().mockReturnThis() }; // for Task
      });
      await expect(service.getDailySummary(childId, testDateStr)).rejects.toThrow(dbError);
    });

    it('should throw if fetching total tasks count fails', async () => {
      const dbError = new Error('Count fetch failed');
      const dailyCompletedChain = { lte: jest.fn().mockResolvedValueOnce({ data: [], error: null }) }; // Succeeds
      const totalTasksChain = { eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ count: null, error: dbError }) }; // Fails

      let fromCallOrder = 0;
      (mockDb.from as jest.Mock).mockImplementation((tableName: string) => {
        fromCallOrder++;
        if (tableName === 'CompletedTask' && fromCallOrder === 1) {
          return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), gte: jest.fn().mockReturnThis(), lte: dailyCompletedChain.lte };
        }
        if (tableName === 'Task' && fromCallOrder === 2) {
          return totalTasksChain;
        }
        return { select: jest.fn(), eq: jest.fn(), gte: jest.fn(), lte: jest.fn() }; // Default empty mock
      });
      await expect(service.getDailySummary(childId, testDateStr)).rejects.toThrow(dbError);
    });

    it('should throw if fetching weekly discount tasks fails', async () => {
      const dbError = new Error('Weekly discount fetch failed');
      const dailyCompletedChain = { lte: jest.fn().mockResolvedValueOnce({ data: [], error: null }) }; // Succeeds
      const totalTasksChain = { eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ count: 0, error: null }) }; // Succeeds
      const weeklyDiscountChain = { lte: jest.fn().mockResolvedValueOnce({ data: null, error: dbError }) }; // Fails

      let fromCallOrder = 0;
      (mockDb.from as jest.Mock).mockImplementation((tableName: string) => {
        fromCallOrder++;
        if (tableName === 'CompletedTask') {
          const chain = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), gte: jest.fn().mockReturnThis() };
          if (fromCallOrder === 1) return { ...chain, lte: dailyCompletedChain.lte };
          if (fromCallOrder === 3) return { ...chain, lte: weeklyDiscountChain.lte };
        }
        if (tableName === 'Task' && fromCallOrder === 2) {
          return totalTasksChain;
        }
        return { select: jest.fn(), eq: jest.fn(), gte: jest.fn(), lte: jest.fn() };
      });
      await expect(service.getDailySummary(childId, testDateStr)).rejects.toThrow(dbError);
    });
  });
});

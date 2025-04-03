import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const dateStr = searchParams.get("date");

    if (!childId || !dateStr) {
      return NextResponse.json(
        { error: "Child ID and date are required" },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const completedTasks = await prisma.completedTask.findMany({
      where: {
        childId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        task: true,
      },
    });

    const totalValue = completedTasks.reduce(
      (sum, ct) => sum + ct.task.value,
      0
    );

    const daysInMonth = monthEnd.getDate();
    const dailyAverageValue = totalValue / daysInMonth;

    return NextResponse.json({
      totalValue,
      completedTasks: completedTasks.length,
      dailyAverageValue,
    });
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    return NextResponse.json(
      { error: "Error fetching monthly summary" },
      { status: 500 }
    );
  }
}
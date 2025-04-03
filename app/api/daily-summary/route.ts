import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

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
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const completedTasks = await prisma.completedTask.findMany({
      where: {
        childId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        task: true,
      },
    });

    const totalTasks = await prisma.task.count();
    const totalValue = completedTasks.reduce(
      (sum, ct) => sum + ct.task.value,
      0
    );

    return NextResponse.json({
      totalValue,
      completedTasks: completedTasks.length,
      totalTasks,
    });
  } catch (error) {
    console.error("Error fetching daily summary:", error);
    return NextResponse.json(
      { error: "Error fetching daily summary" },
      { status: 500 }
    );
  }
}
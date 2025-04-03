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
    });

    return NextResponse.json(completedTasks);
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    return NextResponse.json(
      { error: "Error fetching completed tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, childId, date } = body;

    // Verificar se a tarefa já foi completada neste dia
    const existingTask = await prisma.completedTask.findFirst({
      where: {
        taskId,
        childId,
        date: {
          gte: startOfDay(new Date(date)),
          lte: endOfDay(new Date(date)),
        },
      },
    });

    if (existingTask) {
      // Se já existe, remove a tarefa completada
      await prisma.completedTask.delete({
        where: { id: existingTask.id },
      });
      return NextResponse.json({ message: "Task uncompleted" });
    } else {
      // Se não existe, cria uma nova tarefa completada
      const completedTask = await prisma.completedTask.create({
        data: {
          taskId,
          childId,
          date: new Date(date),
        },
      });
      return NextResponse.json(completedTask);
    }
  } catch (error) {
    console.error("Error managing completed task:", error);
    return NextResponse.json(
      { error: "Error managing completed task" },
      { status: 500 }
    );
  }
}
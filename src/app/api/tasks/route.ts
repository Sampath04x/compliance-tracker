import { NextResponse } from 'next/server';
import { readData, writeData, Task } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    const data = await readData();
    let tasks = data.tasks;

    if (clientId) {
      tasks = tasks.filter(task => task.client_id === clientId);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.client_id || !body.title || !body.category || !body.due_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = await readData();
    
    const newTask: Task = {
      id: randomUUID(),
      client_id: body.client_id,
      title: body.title,
      description: body.description || '',
      category: body.category,
      due_date: body.due_date,
      status: 'Pending',
      priority: body.priority || 'Medium',
    };

    data.tasks.push(newTask);
    await writeData(data);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

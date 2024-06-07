// src/stores/tasks.js
import { writable } from 'svelte/store';

export const tasks = writable({});

export async function fetchTasks() {
  try {
    const response = await fetch('/api/task');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const data = await response.json();

    // Assuming the API returns a flat array of tasks
//    const tasksByList = data.reduce((acc, task) => {
//      const listName = `List ${task.list_id}`; // or however you want to name the lists
//      if (!acc[listName]) {
//        acc[listName] = [];
//      }
//      acc[listName].push(task);
//      return acc;
//    }, {});

    tasks.set(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

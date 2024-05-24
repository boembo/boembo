import { writable } from 'svelte/store';

export const tasks = writable({
  list1: [{ id: 1, title: 'Task 1' }, { id: 2, title: 'Task 2' }],
  list2: [{ id: 3, title: 'Task 3' }, { id: 4, title: 'Task 4' }]
});
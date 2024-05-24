<script>
  import Task from './Task.svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { tasks as storeTasks } from '../stores/tasks'; // Rename import
  const flipDurationMs = 200;
  export let listName;
  export let tasks; // Consider renaming this export to avoid conflict

  function handleSort(e) {
		tasks = e.detail.items;
	}
</script>

<div class="bg-white rounded-lg shadow-md p-4 w-64">
  <h2 class="font-bold text-lg mb-2">{listName}</h2>
  <ul
    class="space-y-2 min-h-[100px]"
    use:dndzone={{ items: tasks, flipDurationMs }}
    on:consider={handleSort}
    on:finalize={handleSort}
  >
    {#each tasks as task (task.id)}
      <Task  {task} />
    {/each}
  </ul>
</div>

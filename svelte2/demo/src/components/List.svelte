<script>
  import Task from './Task.svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { tasks as storeTasks } from '../stores/tasks'; // Rename import
  const flipDurationMs = 200;
  export let list;
  export let tasks; // Consider renaming this export to avoid conflict

  function handleSort(e) {
		tasks = e.detail.items;
console.log("On consider ");

	}

async function updateList(e) {
		tasks = e.detail.items;
console.log("Update new tasks" + list.id);
console.log(tasks);

        const lists = { tasks: tasks, list_id: list.id};
        try {
              // Call the API to update tasks on the server
              await fetch('/api/task/sort', { // Or your actual API endpoint
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(lists),
              });
            } catch (error) {
              console.error('Error updating task order:', error);
              // Handle errors (e.g., display an error message to the user)
            }

	}
</script>

<div class="bg-white rounded-lg shadow-md p-4 w-64">
  <h2 class="font-bold text-lg mb-2">{list.list_name}</h2>
  <ul
    class="space-y-2 min-h-[100px]"
    use:dndzone={{ items: tasks, flipDurationMs }}
    on:consider={handleSort}
    on:finalize={updateList}
  >
    {#each tasks as task (task.id)}
      <Task  {task} />
    {/each}
  </ul>
</div>

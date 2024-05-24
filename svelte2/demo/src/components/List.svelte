<script>
  import Task from './Task.svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { tasks as storeTasks } from '../stores/tasks'; // Rename import

  export let listName;
  export let tasks; // Consider renaming this export to avoid conflict

  function handleTaskDrop(event) {
    const { items: newTasks, source, destination } = event.detail;
    if (source.id !== destination.id) {
      storeTasks.update(allTasks => {
        const sourceTasks = allTasks[source.id];
        const destinationTasks = allTasks[destination.id];
        const [movedTask] = sourceTasks.splice(source.index, 1);
        destinationTasks.splice(destination.index, 0, movedTask);
        return allTasks;
      });
    } else {
      storeTasks.update(allTasks => {
        allTasks[listName] = newTasks;
        return allTasks;
      });
    }
  }
</script>

<div class="bg-white rounded-lg shadow-md p-4 w-64">
  <h2 class="font-bold text-lg mb-2">{listName}</h2>
  <ul
    class="space-y-2"
    use:dndzone={{ items: tasks, flipDurationMs: 150 }}
    on:consider={handleTaskDrop}
  >
    {#each tasks as task (task.id)}
      <Task {task} />
    {/each}
  </ul>
</div>

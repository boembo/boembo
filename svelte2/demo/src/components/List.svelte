<script>
  import Task from './Task.svelte';
  export let listName;
  export let tasks;
</script>

<div class="bg-white rounded-lg shadow-md p-4 w-64">
  <h2 class="font-bold text-lg mb-2">{listName}</h2>
  <ul class="space-y-2">
    {#each tasks as task (task.id)}
      <Task {task} />
    {/each}
  </ul>
</div>

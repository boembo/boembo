<script>
  import Task from './Task.svelte';
  export let listName;
  export let tasks;
</script>

<div class="list">
  <h2>{listName}</h2>
  <ul>
    {#each tasks as task (task.id)}
      <Task {task} />
    {/each}
  </ul>
</div>

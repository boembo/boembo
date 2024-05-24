<script>
  import List from './List.svelte';
  import { tasks, fetchTasks } from '../stores/tasks';
  import { onMount } from 'svelte';

  onMount(() => {
    fetchTasks();
  });
</script>

<div class="board">
  {#each Object.keys($tasks) as listName}
    <List listName={listName} tasks={$tasks[listName]} />
  {/each}
</div>

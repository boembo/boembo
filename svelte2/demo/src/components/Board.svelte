<script>
  import List from './List.svelte';
  import { tasks, fetchTasks } from '../stores/tasks';
  import { onMount } from 'svelte';

  onMount(() => {
    fetchTasks();
  });
</script>

<div class="flex space-x-4 p-4 bg-gray-100">
  {#each Object.keys($tasks) as listName}
    <List {listName} tasks={$tasks[listName]} />
  {/each}
</div>

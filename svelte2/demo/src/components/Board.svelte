<script>
  import List from './List.svelte';
  import { tasks, fetchTasks } from '../stores/tasks';
  import { onMount } from 'svelte';

  onMount(() => {
    fetchTasks();
  });
</script>

<div class="flex space-x-4 p-4 bg-gray-100 justify-start">
  {#each $tasks as list}
    <List {list} tasks={list.tasks} />
  {/each}
</div>

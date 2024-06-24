<script>
  export let settings;
  export let onClose;

  function deleteWidget() {
    // Add logic to delete the widget
    onClose(); // Close the modal after deleting
  }
</script>

<div class="modal">
  <div class="modal-content">
    <span class="close" on:click={onClose}>&times;</span>
    <h2>{settings.title}</h2>
    <ul>
      {#each settings.sampleSettings as setting}
        <li>{setting}</li>
      {/each}
    </ul>
    <button on:click={deleteWidget}>Delete Widget</button>
  </div>
</div>

<style>
  /* Add modal styles */
  .modal {
    display: block;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  button {
    margin-top: 10px;
  }
</style>

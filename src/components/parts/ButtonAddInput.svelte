<script lang="ts">
  type Text = {
    begin: string;
    confirm: string;
    cancel: string;
    placeholder: string;
    ifEmptyPlaceholder: string;
  };

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let text: Text;

  let inputRef;
  let isAdding: boolean = false;

  const handleAddNewClick = () => {
    dispatch("addNewClicked");
    isAdding = true;
    setTimeout(() => {
      inputRef.focus();
    }, 0); // asenkron işlemlerden sonra çalışsın diye
  };

  const handleConfirmClick = () => {
    if (inputRef.value) {
      dispatch("confirmClicked", {
        text: inputRef.value,
      });
      isAdding = false;
    } else {
      inputRef.placeholder = text.ifEmptyPlaceholder;
    }
  };

  const handleCancelClick = () => {
    dispatch("cancelClicked");
    inputRef.value = "";
    isAdding = false;
  };

  const handleKeypress = (e) => {
    if (e.which == 13 || e.charCode == 13 || e.keyCode == 13) {
      handleConfirmClick();
      return;
    }
  };
</script>

{#if isAdding}
  <input
    bind:this={inputRef}
    type="text"
    class="addInput"
    placeholder={text.placeholder}
    on:keypress={handleKeypress}
  />

  <input
    type="button"
    class="blue"
    value={text.confirm}
    on:click={handleConfirmClick}
  />
  <input type="button" value={text.cancel} on:click={handleCancelClick} />
{:else}
  <input type="button" value={text.begin} on:click={handleAddNewClick} />
{/if}

<style>
  .addInput {
    flex: 1;
    min-width: 0;
    margin: 0;
    margin-right: 10px;
  }

  input[type="button"] {
    cursor: pointer;
    background: crimson;
    color: white;
    font-size: 12px;
    border-radius: 4px;
    font-weight: 300;
    padding: 4px 10px;
    margin: 0px;
  }

  input[type="text"]::placeholder {
    font-size: 14px;
  }

  input[type="text"]::placeholder {
    font-size: 14px;
  }

  .blue {
    background: steelblue !important;
  }
</style>

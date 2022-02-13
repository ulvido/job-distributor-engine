<script lang="ts">
  type Text = {
    begin: string;
    confirm: string;
    cancel: string;
  };

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let text: Text;
  export let elements: string[];
  export let comperators: string[];

  let selectMetalRef;
  let selectComperatorRef;
  let selectPriceRef;
  let isAdding: boolean = false;

  const handleAddNewClick = () => {
    dispatch("addNewClicked");
    isAdding = true;
  };

  const handleConfirmClick = () => {
    if (
      selectMetalRef.value ??
      selectComperatorRef.value ??
      parseInt(selectPriceRef.value)
    ) {
      dispatch("confirmClicked", {
        condition: {
          element: selectMetalRef.value,
          comperator: selectComperatorRef.value,
          price: parseInt(selectPriceRef.value),
        },
      });
      isAdding = false;
    }
  };

  const handleCancelClick = () => {
    dispatch("cancelClicked");
    isAdding = false;
  };

  const handleKeypress = (e) => {
    if (e.which < 48 || e.which > 57) {
      e.preventDefault();
    } else if (e.which == 13 || e.charCode == 13 || e.keyCode == 13) {
      handleConfirmClick();
      return;
    }
  };
</script>

{#if isAdding}
  <!-- GOLD | SILVER | PLATIN | IRON | COPPER -->
  <select bind:this={selectMetalRef}>
    {#each elements as element (element)}
      <option value={element}>{element}</option>
    {/each}
  </select>
  <!-- LESS | EQUAL | GREATER -->
  <select bind:this={selectComperatorRef}>
    {#each comperators as cmp (cmp)}
      <option value={cmp}>{cmp}</option>
    {/each}
  </select>
  <input
    type="number"
    bind:this={selectPriceRef}
    value={0}
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

  input[type="number"] {
    max-width: 88px;
    text-align: center;
  }

  .blue {
    background: steelblue !important;
  }
</style>

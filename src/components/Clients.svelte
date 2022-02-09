<script lang="ts">
  // STORE
  import { users } from "../store";

  let isAddingUser: boolean = false;
  let addUserInputRef;

  const handleSaveClick = () => {
    if (addUserInputRef.value) {
      users.addUser(addUserInputRef.value);
      isAddingUser = false;
    } else {
      addUserInputRef.placeholder = "Username can not be empty!";
    }
  };

  const handleCancelClick = () => {
    addUserInputRef.value = "";
    isAddingUser = false;
  };
  const handleAddNewUserClick = () => {
    isAddingUser = true;
    setTimeout(() => {
      addUserInputRef.focus();
    }, 0); // asenkron işlemlerden sonra çalışsın diye
  };
</script>

<div class="wrapper">
  {#each Object.values($users) as user (user.id)}
    <div class="user">
      <div class="title">{user.name}</div>
    </div>
  {/each}
  <div class="add-user">
    {#if isAddingUser}
      <input
        bind:this={addUserInputRef}
        type="text"
        class="addUserInput"
        name="add-user"
        id="add-user"
        placeholder="User Name"
      />

      <input type="button" value="SAVE" on:click={() => handleSaveClick()} />
      <input type="button" value="CANCEL" on:click={handleCancelClick} />
    {:else}
      <input
        type="button"
        value="ADD NEW USER"
        on:click={handleAddNewUserClick}
      />
    {/if}
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
  }

  .add-user {
    display: flex;
    justify-content: center;
    padding: 20px 10px 0;
  }

  .addUserInput {
    flex: 1;
    min-width: 0;
  }

  input[type="button"] {
    cursor: pointer;
    background: crimson;
    color: white;
    font-size: 12px;
    border-radius: 4px;
    font-weight: 300;
    padding: 4px 10px;
  }

  input[type="text"]::placeholder {
    font-size: 14px;
  }
</style>

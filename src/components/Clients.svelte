<script lang="ts">
  // STORE
  import { users, metaller, operators } from "../store";
  // TRANSITION
  import { scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  // COMPONENTS
  import ButtonAddInput from "./parts/ButtonAddInput.svelte";
  import ButtonAddCondition from "./parts/ButtonAddCondition.svelte";
</script>

<div class="wrapper">
  {#each Object.values($users) as user (user.id)}
    <div
      class="user"
      transition:scale|local={{ duration: 200, easing: expoOut }}
    >
      <div class="title sky">
        <div class="text">{user.name}</div>
        <div class="grey-id">{user.id}</div>
        <div class="delete">
          <input
            type="button"
            value="DEL"
            on:click={() =>
              // @ts-expect-error: removeUser yok diyor ama var. önemsiz
              users.removeUser(user.id)}
          />
        </div>
      </div>
      <div class="alarms-wrapper">
        <div class="alarms-title">
          <div class="alarms-text">ALARMS</div>
        </div>
        <div class="alarms">
          {#each Object.values(user.alarms) as alarm (alarm.id)}
            <div class="alarm">
              <div class="title">
                <div class="text">{alarm.name}</div>
                <div class="grey-id">{alarm.id}</div>
                <div class="delete">
                  <input
                    type="button"
                    value="DEL"
                    on:click={() =>
                      // @ts-expect-error: removeAlarm yok diyor ama var. önemsiz
                      users.removeAlarm({ userId: user.id, alarmId: alarm.id })}
                  />
                </div>
              </div>
              <div class="conditions-wrapper">
                <div class="conditions-title">
                  <div class="conditions-text">CONDITIONS</div>
                </div>
                <div class="conditions">
                  {#each Object.keys(alarm.conditions) as id (id)}
                    <div class="condition">
                      <div class="grey-id">{id}</div>
                      <div class="condition-name">
                        {alarm.conditions[id].element}
                      </div>
                      <div class="condition-operator">
                        {alarm.conditions[id].operator}
                      </div>
                      <div class="condition-price">
                        {alarm.conditions[id].price}
                      </div>
                      <div
                        class="delete"
                        on:click={() =>
                          // @ts-expect-error: removeCondition yok diyor ama var. önemsiz
                          users.removeCondition({
                            userId: user.id,
                            alarmId: alarm.id,
                            conditionId: id,
                          })}
                      >
                        X
                      </div>
                    </div>
                  {/each}
                </div>
                <div class="add-condition">
                  <ButtonAddCondition
                    text={{
                      begin: "ADD CONDITION",
                      confirm: "SAVE",
                      cancel: "CANCEL",
                    }}
                    elements={$metaller.map((metal) => metal.name)}
                    operators={$operators}
                    on:confirmClicked={(e) => {
                      // console.log(e.detail.condition);
                      // @ts-expect-error: addCondition yok diyor ama var. önemsiz
                      users.addCondition({
                        userId: user.id,
                        alarmId: alarm.id,
                        condition: e.detail.condition,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          {/each}
        </div>
        <div class="add-alarm">
          <ButtonAddInput
            text={{
              begin: "ADD NEW ALARM",
              confirm: "SAVE",
              cancel: "CANCEL",
              placeholder: "Alarm Name",
              ifEmptyPlaceholder: "Alarm Name can not be empty!",
            }}
            on:confirmClicked={(e) =>
              // @ts-expect-error: addAlarm yok diyor ama var. önemsiz
              users.addAlarm({
                userId: user.id,
                alarmName: e.detail.text,
              })}
          />
        </div>
      </div>
    </div>
  {/each}
  <div class="add-user">
    <ButtonAddInput
      text={{
        begin: "ADD NEW USER",
        confirm: "SAVE",
        cancel: "CANCEL",
        placeholder: "User Name",
        ifEmptyPlaceholder: "User Name can not be empty!",
      }}
      on:confirmClicked={(e) =>
        // @ts-expect-error: addUser yok diyor ama var. önemsiz
        users.addUser(e.detail.text)}
    />
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    padding: 10px 4px 40px;
    overflow: hidden auto;
    max-height: 65vh;
  }

  .add-user {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 10px 0;
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

  .user {
    padding: 4px;
    background: linen;
    margin-bottom: 10px;
    border-radius: 4px;
    border: 2px solid cornflowerblue;
  }

  .title {
    display: flex;
    align-items: center;
    background: lightsteelblue;
    border-radius: 2px;
    padding: 4px;
  }

  .text {
    flex: 1;
    padding: 0 8px;
  }

  .grey-id {
    font-size: 10px;
    color: grey;
    padding-right: 20px;
  }

  /* ALARMS */
  .alarms-wrapper {
    padding: 0 20px;
  }

  .add-alarm {
    text-align: center;
    margin: 20px 0;
  }

  .alarms-title,
  .conditions-title {
    font-size: 12px;
    font-weight: 700;
    padding: 8px 0;
  }

  .alarms {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .alarm {
    min-height: 60px;
    background: lavender;
  }

  .conditions-wrapper {
    padding: 0 10px;
  }

  .add-condition {
    margin: 10px 0;
  }

  .condition {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    gap: 8px;
  }

  .condition:hover {
    background: aliceblue;
  }

  .delete {
    cursor: pointer;
  }

  .sky {
    background: skyblue;
  }
</style>

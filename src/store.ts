import { writable } from "svelte/store"
import type { Writable } from "svelte/store"

// EXTERNAL NPM PACKAGES
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmopqrstuvwxyz0123456789", 6)

type ElementName = "GOLD" | "SILVER" | "PLATIN" | "IRON" | "COPPER";

type Element = {
  name: ElementName,
  price: number,
}

let initialElements: Element[] = [
  {
    name: "GOLD",
    price: 0,
  },
  {
    name: "SILVER",
    price: 0,
  },
  {
    name: "PLATIN",
    price: 0,
  },
  {
    name: "IRON",
    price: 0,
  },
  {
    name: "COPPER",
    price: 0,
  },
]

export const metaller: Writable<Element[]> = writable(initialElements);

type Alarm = {
  id: string,
  name: string,
  conditions: Conditions | {},
}

type User = {
  id: string,
  name: string,
  alarms: Alarms | {},
}

type Users = {
  [id: string]: User,
}

type Alarms = {
  [id: string]: Alarm,
}

type Conditions = {
  [id: string]: Condition,
}

type Operator = "LESS" | "EQUAL" | "GREATOR"

type Condition = {
  element: ElementName,
  operator: Operator,
  price: number,
}

export const operators: Writable<Operator[]> = writable(["LESS", "EQUAL", "GREATOR"])

const createUsers = (initial) => {

  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    set,
    update,
    addUser: (name: string) => update(a => {
      let newUserId = nanoid();
      let newUsers = { ...a }
      newUsers[newUserId] = {
        id: newUserId,
        name,
        alarms: {},
      }
      return newUsers;
    }),
    removeUser: (userId: string) => update(a => {
      let newUsers = { ...a }
      delete newUsers[userId]
      return newUsers;
    }),
    addAlarm: ({ userId, alarmName }) => update(a => {
      let newAlarmId = nanoid();
      let newUsers = { ...a }
      newUsers[userId].alarms = {
        ...newUsers[userId].alarms,
        [newAlarmId]: {
          id: newAlarmId,
          name: alarmName,
          conditions: {},
        }
      }
      return newUsers;
    }),
    removeAlarm: ({ userId, alarmId }) => update(a => {
      let newUsers = { ...a }
      delete newUsers[userId].alarms[alarmId]
      return newUsers;
    }),
    addCondition: ({ userId, alarmId, condition }) => update(a => {
      let newConditionId = nanoid();
      let newUsers = { ...a }
      newUsers[userId].alarms[alarmId].conditions = {
        ...newUsers[userId].alarms[alarmId].conditions,
        [newConditionId]: condition,
      }
      return newUsers;
    }),
    removeCondition: ({ userId, alarmId, conditionId }) => update(a => {
      let newUsers = { ...a }
      delete newUsers[userId].alarms[alarmId].conditions[conditionId]
      return newUsers;
    }),
    reset: () => set(initial),
  }
}

export const users: Writable<Users> = createUsers({});

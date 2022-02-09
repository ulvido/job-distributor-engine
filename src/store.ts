import { writable } from "svelte/store"
import type { Writable } from "svelte/store"

// EXTERNAL NPM PACKAGES
import { nanoid } from "nanoid";

type Element = {
  name: string,
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
  elements: Element[] | [],
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

const createUsers = (initial) => {

  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    set,
    update,
    addUser: (name: string) => update(a => {
      let newUserId = nanoid(6);
      return {
        ...a,
        [newUserId]: {
          id: newUserId,
          name,
          alarms: {},
        }
      }
    }),
    removeUser: (userId: string) => update(a => {
      let newUsers = a.delete(userId);
      return { ...newUsers };
    }),
    addAlarm: (userId: string) => update(a => {
      let newAlarmId = nanoid(4);
      a[userId].alarms = {
        ...a[userId].alarms,
        [newAlarmId]: {
          id: newAlarmId,
          elements: [],
        }
      }
      return {
        ...a
      }
    }),
    removeAlarm: ({ userId, alarmId }) => update(a => {
      a[userId].delete(alarmId);
      return {
        ...a
      }
    }),
    reset: () => set(initial),
  }
}

export const users: Writable<Users> = createUsers({});

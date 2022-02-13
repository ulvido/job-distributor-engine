import { Observable, BehaviorSubject, Subject } from "rxjs";

// OBJECTS { id: observable }
let users = {}
let alarms = {}
let conditions = {}
let jobs = {} // bunu obj değil de stream yapabilirsen daha iyi olur.

/**
 *    --  TYPES  --
 */

type ElementName = "GOLD" | "SILVER" | "PLATIN" | "IRON" | "COPPER";

type Comperator = "LESS" | "EQUAL" | "GREATOR"

type Condition = {
  element: ElementName,
  comperator: Comperator,
  price: number,
}

interface AlarmCreatedParams {
  userId: string,
  alarmId: string,
}

interface ConditionCreatedParams extends AlarmCreatedParams {
  conditionId: string,
  condition: Condition,
}

/**
 *    --  EXPORTED FUNCTIONS  --
 */

export const alarmCreated = ({ userId, alarmId }: AlarmCreatedParams) => {
  alarms[alarmId] = {
    userId,
    alarmId,
  };
};

export const conditionCreated =
  ({ userId, alarmId, conditionId, condition }:
    ConditionCreatedParams) => {
    conditions[conditionId] = {
      userId,
      alarmId,
      conditions: [
        ...conditions[conditionId].conditions,
        condition,
      ],
    };
  };

/**
 *   --  OPERATORS  --
 */

// save to redisJSON (async action)
const saveConditionToCache =
  ({ userId, alarmId, conditionId, condition }:
    ConditionCreatedParams) => new Promise((resolve, reject) => {
      try {
        let key = JSON.stringify(condition);
        if (jobs.hasOwnProperty(key)) {
          resolve(jobs[key]);
        } else {
          jobs[key] = new Subject;
          resolve(jobs[key]);
        }
      } catch (error) {
        reject(error);
      }
    });



export const alarmObservable = () =>
  new Observable(subscriber => {

  })
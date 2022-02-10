import { Observable, BehaviorSubject, Subject } from "rxjs";

// OBJECTS { id: observable }
let users = {}
let alarms = {}
let jobs = {} // bunu obj değil de stream yapabilirsen daha iyi olur.

type ElementName = "GOLD" | "SILVER" | "PLATIN" | "IRON" | "COPPER";

type Operator = "LESS" | "EQUAL" | "GREATOR"

type Condition = {
  element: ElementName,
  operator: Operator,
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

export const alarmCreated = ({ userId, alarmId }: AlarmCreatedParams) => {
  alarms[alarmId] = {
    userId,
    alarmId,
    conditions: {},
  };
};

export const conditionCreated =
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

      // create new condition observable and subscribe to it.

    });


export const alarmObservable = () =>
  new Observable(subscriber => {

  })
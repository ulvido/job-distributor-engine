import { Observable, BehaviorSubject, Subject } from "rxjs";

// OBJECTS { id: observable }
let users = {}
let alarms = {}
let conditions = {}

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
    ConditionCreatedParams) => {
    alarms[alarmId] = {
      userId,
      alarmId,
      conditions: {
        [conditionId]: condition
      },
    };

    // create new condition observable and subscribe to it.

  };

export const alarmObservable = () =>
  new Observable(subscriber => {

  })
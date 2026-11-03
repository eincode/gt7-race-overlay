import { CAR_LIST, CAR_MAKERS } from "../../../lib/carList";

/** "Mercedes-AMG GT3 '20"-style label from the car list; null for an unknown car. */
export function carName(carCode: number | undefined) {
  const car = CAR_LIST.find((c) => c.id === carCode);
  if (!car) return null;
  const maker = (CAR_MAKERS as Record<number, string>)[car.makerId];
  return maker ? `${maker} ${car.name}` : car.name;
}

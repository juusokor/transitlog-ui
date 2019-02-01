import get from "lodash/get";
import operators from "../operators.json";

export function getOperatorName(operatorId) {
  return get(operators, operatorId, operatorId);
}

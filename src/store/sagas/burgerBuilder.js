import { put } from "redux-saga/effects";

import axios from "../../axios-orders";
import * as actions from "../actions/index";

export function* initIngredientsSaga(action) {
  try {
    const response = yield axios.get(
      "https://react-burger-becec.firebaseio.com/ingredients.json"
    );
    yield put(actions.setIngredients(response.data));
  } catch (err) {
    yield put(actions.fetchIngredientsFailed(err));
  }
}

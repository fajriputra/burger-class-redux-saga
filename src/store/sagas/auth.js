import axios from "axios";

import { delay } from "redux-saga/effects";
import { put } from "redux-saga/effects";

import * as actions from "../actions/index";

export function* logoutSaga(action) {
  yield localStorage.removeItem("token");
  yield localStorage.removeItem("expirationDate");
  yield localStorage.removeItem("userId");
  yield put(actions.logoutSucceed());
}

export function* checkAuthTimeoutSaga(action) {
  yield delay(action.expirationTime * 1000);
  yield put(actions.logout());
}

// handling authentication with saga
export function* authUserSaga(action) {
  yield put(actions.authStart());
  const authData = {
    email: action.email,
    password: action.password,
    returnSecureToken: true,
  };
  // Getting token from the backend (firebase)
  let url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDzwRvDUU7ayCdk2BL0mocqS3v5t2JwM90`;
  // if sign up is false will return sign in
  if (!action.isSignUp) {
    url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDzwRvDUU7ayCdk2BL0mocqS3v5t2JwM90`;
  }
  try {
    const response = yield axios.post(url, authData);
    // update new date
    const expirationDate = yield new Date(
      new Date().getTime() + response.data.expiresIn * 1000
    );
    // saving date expired in localstorage every us get a token
    yield localStorage.setItem("token", response.data.idToken);
    yield localStorage.setItem("expirationDate", expirationDate);
    yield localStorage.setItem("userId", response.data.localId);
    yield put(
      actions.authSuccess(response.data.idToken, response.data.localId)
    );
    yield put(actions.checkAuthTimeOut(response.data.expiresIn));
  } catch (err) {
    yield put(actions.authFail(err.response.data.error));
  }
}

export function* authCheckStateSaga(action) {
  const token = yield localStorage.getItem("token");
  // a little logic here, if token is null || cannot validates to be true is
  if (!token) {
    // just one return
    yield put(actions.logout());
  } else {
    // if getting a token, we also fetch expirationDate & store it within the const expirationDate
    const expirationDate = yield new Date(
      localStorage.getItem("expirationDate")
    );
    // we get the token which is stored in the const, now we can use both of that information and i want to dispatch actionCreators
    if (expirationDate <= new Date()) {
      yield put(actions.logout());
    } else {
      // fetch userId when we login
      const userId = yield localStorage.getItem("userId");
      yield put(actions.authSuccess(token, userId));
      // dispatch action checkAuthTimeOut
      yield put(
        actions.checkAuthTimeOut(
          (expirationDate.getTime() - new Date().getTime()) / 1000
        )
      );
    }
  }
}
export default logoutSaga;

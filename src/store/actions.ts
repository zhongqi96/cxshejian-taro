import {
  ADD,
  MINUS,
  RESET_GOODS_AND_PRICE,
  SET_USER_INFO,
  ADD_GOODS,
  SET_TOTAL_PRICE,
  CHANGE_AUTH_TYPE,
  SET_TRAIN_INFO,
  SET_USER_STATION,
  SET_TICKET_LIST
} from './constants'

export const add = () => {
  return {
    type: ADD
  }
}
export const minus = () => {
  return {
    type: MINUS
  }
}

// 异步的action
export function asyncAdd () {
  return dispatch => {
    setTimeout(() => {
      dispatch(add())
    }, 2000)
  }
}

export const resetGoodsAndPrice = () => {
  return {
    type: RESET_GOODS_AND_PRICE
  }
}

export const setUserInfo = (payload) => {
  return {
    type: SET_USER_INFO,
    payload
  }
}

export const addGoods = (payload) => {
  return {
    type: ADD_GOODS,
    payload
  }
}

export const setTotalPrice = (payload) => {
  return {
    type: SET_TOTAL_PRICE,
    payload
  }
}

export const changeAuthType = (payload) => {
  return {
    type: CHANGE_AUTH_TYPE,
    payload
  }
}

export const setTrainInfo = (payload) => {
  return {
    type: SET_TRAIN_INFO,
    payload
  }
}

export const setUserStation = (payload) => {
  return {
    type: SET_USER_STATION,
    payload
  }
}


export const setTicketList = (payload) => {
  return {
    type: SET_TICKET_LIST,
    payload
  }
}

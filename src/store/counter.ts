import moment from 'dayjs'
import {
  ADD,
  MINUS,
  RESET_GOODS_AND_PRICE,
  SET_USER_INFO,
  ADD_GOODS,
  SET_TOTAL_PRICE,
  SET_TRAIN_INFO,
  SET_USER_STATION,
  SET_TICKET_LIST
} from './constants'

const INITIAL_STATE = {
  num: 0,
  isShowAuthButton: false,
  userInfo: '',
  train: 'D1112',
  trainInfo: {},
  date: moment().format('YYYY-MM-DD'),
  userStationInfo: {},
  carriage: null,
  carriageNum: 0,
  isLink: false,
  selectedGoodsList: [],
  totalPrice: 0,
  ticketList: []
}

export default function counter (state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD:
      return {
        ...state,
        num: state.num + 1
      }
    case MINUS:
     return {
       ...state,
       num: state.num - 1
     }
    case RESET_GOODS_AND_PRICE:
      return {
        ...state,
        selectedGoodsList: [],
        totalPrice: 0
      }
    case SET_USER_INFO:
      return {
        ...state,
        userInfo: action.payload
      }
    case ADD_GOODS:
      return {
        ...state,
        selectedGoodsList: [...action.payload]
      }
    case SET_TOTAL_PRICE:
      return {
        ...state,
        totalPrice: action.payload
      }
    case SET_TRAIN_INFO:
      return {
        ...state,
        trainInfo: action.payload
      }
    case SET_USER_STATION:
      return {
        ...state,
        userStationInfo: action.payload
      }
    case SET_TICKET_LIST:
      return {
        ...state,
        ticketList: action.payload
      }
     default:
       return state
  }
}

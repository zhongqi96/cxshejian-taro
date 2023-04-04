import { createStore, applyMiddleware, compose } from 'redux'
import Taro from '@tarojs/taro'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducers'
import { setUserInfo } from '@/store/actions'
import API from '@/api'

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose

const middlewares = [
  thunkMiddleware
]

// 全局用户信息
let sessionState: object = {}
  // Taro.getStorage({
  //   key: 'userInfo',
  //   success: res => {
  //     sessionState = {
  //       userInfo: JSON.parse(res.data)
  //     }
  //   },
  //   fail: res => {
  //     console.log(res, '读取缓存失败')
  //   }
  // })
let initialState: object = sessionState ? sessionState : {}

if (process.env.NODE_ENV === 'development' && process.env.TARO_ENV !== 'quickapp') {
  middlewares.push(require('redux-logger').createLogger())
}

const enhancer = composeEnhancers(
  applyMiddleware(...middlewares),
  // other store enhancers if any
)

// 静默授权
// Taro.login({
//   success: val => {
//     console.log(456)
//     let code = val.code
//     API.Global.login({code})
//       .then(res => {
//         console.log(789)
//         Taro.setStorageSync('token', res.data)
//         API.Global.getUserInfo()
//           .then(info => {
//             console.log(10)
//             info.data.openId && Taro.setStorageSync('openId', info.data.openId)
//           })
//       })
//   },
//   fail: data => {
//     console.log(data, '静默授权失败')
//   }
// })

// Taro.checkSession({
//   success: () => {
//     Taro.login({
//       success: val => {
//         let code = val.code
//         API.Global.login({code})
//           .then(res => {
//             Taro.setStorageSync('token', res.data)
//           })
//       },
//       fail: data => {
//         console.log(data, '静默授权失败')
//       }
//     })
//   },
//   fail: () => {
//     Taro.login({
//       success: val => {
//         let code = val.code
//         API.Global.login({code})
//           .then(res => {
//             Taro.setStorageSync('token', res.data)
//           })
//       },
//       fail: data => {
//         console.log(data, '静默授权失败')
//       }
//     })
//   }
// })


export default function configStore () {
  const store = createStore(rootReducer, initialState, enhancer)
  return store
}

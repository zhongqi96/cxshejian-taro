import Taro from '@tarojs/taro'
import React, { useState, useEffect, useRef } from 'react'
import { Image, Text, View } from '@tarojs/components'

// js
import moment from "dayjs";
import API from "@/api";

import './order_item.scss'

import Order from "@/common/Order";

interface Props {
  order: Order;
  afterUrgeOrder(): void;
}

//订单状态
const STATUS_TIP = ['未支付', '已支付', '已退款', '部分退款', '已取消', '超时取消'];

const OrderItem = (props: Props): JSX.Element => {

  const [urgeTime_, setUrgeTime_] = useState<string | null>(null);
  const [isDisabledUrgeBtn, setIsDisabledUrgeBtn] = useState<boolean>(true);
  const TimerRef = useRef<any>();

  const {
    id,
    status,
    train,
    orderList,
    isShowUrge,
    payStatus,
    urgeTime,
    urged,
    settlementAmount,
  } = props.order;

  useEffect(() => {
    if (status === 2 && moment(urgeTime).isAfter(moment())) {
      TimerRef.current = setInterval(() => {
        calcUrgeTime();
      }, 1000);
    } else {
      clearInterval(TimerRef.current);
      setUrgeTime_('00:00');
      setIsDisabledUrgeBtn(false);
    }

    return () => {
      clearInterval(TimerRef.current);
    }
  }, [urgeTime_, status, isShowUrge, urged]);

  // 计算倒计时时间
  const calcUrgeTime = (): void => {
    let mistiming = moment(urgeTime).diff(moment(), 's');
    let minutes = `${Math.abs(Math.floor(mistiming / 60)).toString().padStart(2, '0')}`;
    let second = `${(mistiming % 60).toString().padStart(2, '0')}`;

    setUrgeTime_(`${minutes}:${second}`);
    setIsDisabledUrgeBtn(true);
  }

  // 跳转详情
  const toDetail = (): void => {
    Taro.navigateTo({
      url: `/pages/orderDetail/index?orderId=${id}`
    });
  }

  // 催单
  const urgeOrder = e => {
    e.stopPropagation();
    if (isDisabledUrgeBtn) {
      Taro.showToast({ title: '催单时间未到，请在催单计时结束后催单！', icon: 'none', mask: true});
      return;
    }
    if (urged) {
      Taro.showToast({ title: '你已催单，请勿重复操作！', icon: 'none', mask: true});
      return;
    }
    API.Order.reminder(id.toString()).then(res => {
      if (res) {
        props.afterUrgeOrder();
      }
    });
  }

  return (
    <View className='order-item' onClick={toDetail}>
      <View className='header'>
        <Text>{train}</Text>
        <Text className='order-status'>{STATUS_TIP[status]}</Text>
      </View>
      {
        orderList.map((item, index) => {
          return (
            <View className='order-content' key={index * 1000}>
              <View className='product-img'>
                <Image src={item.thumbImg} />
              </View>
              <View className='product-info'>
                <View className='name'>{item.productName}</View>
                <View className='price'>
                  <Text>￥{item.price / 100}/份</Text>
                  <Text>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          )
        })
      }
      <View className='total-price'>
        合计：
        <Text>￥{settlementAmount / 100}</Text>
      </View>
      {
        status === 2 && payStatus === 1 && isShowUrge === 1 &&
        <View className='urge-container'>
          <Text className='time'>催单倒计时 {urgeTime_}</Text>
          <View
            className={`urge-btn ${isDisabledUrgeBtn ? 'disabled' : ''}`}
            onClick={urgeOrder}
          >
            催单
          </View>
        </View>
      }
    </View>
  )

}

OrderItem.defaultProps = {
  order: {
    id: 1,
    status: 1,
    train: 'G101',
    orderList: [],
    totalPrice: 0.01,
    discountPrice: 0.01,
    isShowUrge: false,
    payStatus: 1,
  },
  afterUrgeOrder() {}
}

export default OrderItem;

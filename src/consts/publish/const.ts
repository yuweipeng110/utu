export const PublishDetailAction = {
  0: '新增',
  1: '修改',
  2: '删除',
  3: '合并',
  4: '重启',
  5: '变更白名单',
  6: '变更流量'
}

export const PublishStatus = {
  0: '待发布',
  200: '发布中',
  250: '发布到日常',
  300: '发布到预发',
  400: '发布到线上',
  600: '发布失败',
  800: '已关闭',
  1000: '待审批',
}

export const PublishFlowStatus = {
  '0': '审批中', //url
  '1': '通过',
  '2': '拒绝',
  '3': '撤销',
  'CHECK_PASS': '通过',
  'CHECK_HOLD': '变更检测有风险',//url
  'CHECK_WAIT': '风险检测中', //url
  'CHECK_REFUSE': '审批被拒绝',
  'CHECK_CANCEL': '变更取消', //url
  'CHECK_UNKNOWN': '未知状态', //url
  'ORDER_PASS': '审批通过',
  'ORDER_CANCEL': '审批取消',
  'ORDER_APPROVING': '审批中', //url
  'ORDER_REFUSE': '审批被拒绝',
};


export const PublishSource = {
  0: '实验',
  1: '分支',
  2: '策略',
  3: '回滚',
};

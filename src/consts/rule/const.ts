export const RuleType = {
  1: '引导式规则',
  2: '脚本式规则'
};

export const RuleNullValueHandle = {
  '-1': '不处理',
  '0': '子条件为假',
  '1': '子条件为真',
};

export const RuleOpen = {
  0: { text: '否', status: 'Error' },
  1: { text: '是', status: 'Success' },
};

/*
 * --------------------------------------------
 * RuleOptionType const
 */
// 类型操作符
export const RuleOptionStringOperator = [
  {
    value: 'isNil()',
    label: '为空',
    source: 0,
    option_type: 1,
  },
  {
    value: '!isNil()',
    label: '不为空',
    source: 0,
    option_type: 1,
  },
  // {
  //   value: '== ""',
  //   label: '为空',
  //   source: 0,
  //   option_type: 1,
  // },
  // {
  //   value: '!= ""',
  //   label: '不为空',
  //   source: 0,
  //   option_type: 1,
  // },
  {
    value: 'HasPrefix',
    label: '前缀匹配',
    source: 0,
    option_type: 2,
  },
  {
    value: 'HasSuffix',
    label: '后缀匹配',
    source: 0,
    option_type: 2,
  },
  {
    value: 'Contains',
    label: '是否包含',
    source: 0,
    option_type: 2,
  },
  {
    value: 'ContainsIgnoreCase',
    label: '是否包含(忽略大小写)',
    source: 0,
    option_type: 2,
  },
  {
    value: 'InArray',
    label: '是否被包含在集合中',
    source: 0,
    option_type: 2,
  },
  {
    value: '==',
    label: '等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '!=',
    label: '不等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '#==',
    label: '等于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#!=',
    label: '不等于(变量)',
    source: 1,
    option_type: 3,
  },
];

// 数字类型操作符
export const RuleOptionNumberOperator = [
  {
    value: 'isNil()',
    label: '为空',
    source: 0,
    option_type: 1,
  },
  {
    value: '!isNil()',
    label: '不为空',
    source: 0,
    option_type: 1,
  },
  {
    value: '==',
    label: '等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '!=',
    label: '不等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '>',
    label: '大于',
    source: 0,
    option_type: 2,
  },
  {
    value: '>=',
    label: '大于等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '<',
    label: '小于',
    source: 0,
    option_type: 2,
  },
  {
    value: '<=',
    label: '小于等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '#==',
    label: '等于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#!=',
    label: '不等于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#>',
    label: '大于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#>=',
    label: '大于等于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#<',
    label: '小于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#<=',
    label: '小于等于(变量)',
    source: 1,
    option_type: 3,
  },
];

//浮点类型操作符
export const RuleOptionFloatOperator = [
  {
    value: 'isNil()',
    label: '为空',
    source: 0,
    option_type: 1,
  },
  {
    value: '!isNil()',
    label: '不为空',
    source: 0,
    option_type: 1,
  },
  {
    value: '==',
    label: '等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '!=',
    label: '不等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '>',
    label: '大于',
    source: 0,
    option_type: 2,
  },
  {
    value: '>=',
    label: '大于等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '<',
    label: '小于',
    source: 0,
    option_type: 2,
  },
  {
    value: '<=',
    label: '小于等于',
    source: 0,
    option_type: 2,
  },
  {
    value: '#==',
    label: '等于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#!=',
    label: '不等于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#>',
    label: '大于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#>=',
    label: '大于等于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#<',
    label: '小于(变量)',
    source: 1,
    option_type: 3,
  },
  {
    value: '#<=',
    label: '小于等于(变量)',
    source: 1,
    option_type: 3,
  },
];

// 布尔类型操作符
export const RuleOptionBoolOperator = [
  {
    value: 'isNil()',
    label: '为空',
    source: 0,
    option_type: 1,
  },
  {
    value: '!isNil()',
    label: '不为空',
    source: 0,
    option_type: 1,
  },
  {
    value: '',
    label: '为真',
    source: 0,
    option_type: 1,
  },
  {
    value: '!',
    label: '为假',
    source: 0,
    option_type: 1,
  },
  // {
  //   value: '==',
  //   label: '等于',
  //   source: 0,
  //   option_type: 2,
  // },
  // {
  //   value: '!=',
  //   label: '不等于',
  //   source: 0,
  //   option_type: 2,
  // },
  {
    value: '#==',
    label: '等于变量',
    source: 1,
    option_type: 3,
  },
  {
    value: '#!=',
    label: '不等于变量',
    source: 1,
    option_type: 3,
  },
];

//对象类型操作符
export const RuleOptionObjectOperator = [
  {
    value: 'isNil()',
    label: '为空',
    source: 0,
    option_type: 1,
  },
  {
    value: '!isNil()',
    label: '不为空',
    source: 0,
    option_type: 1,
  },
];

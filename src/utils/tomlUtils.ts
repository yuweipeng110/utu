import TOML from '@iarna/toml';
import { BranchRule, BranchStage } from '@/models/rule';

/**
 * ********************************************************
 * TOML格式校验
 */

/**
 * stages.rules格式校验：
 * 1. 校验name
 * 2. 校验priority
 * 3. 校验exec
 * @param toml
 */
const validateRules = (stages: BranchStage, rules: BranchRule[]) => {
  for (let idx = 0; idx < rules.length; idx += 1) {
    if (typeof rules[idx].name !== 'string' || rules[idx].name.trim().length <= 0) {
      return {
        code: -1,
        message: `[[stages.rules]] [${rules[idx].name}] name格式无效，仅允许非空字符串`,
        formatMessage: `[${stages.name}] [${rules[idx].name}] 名称格式无效，仅允许非空字符串`,
      };
    }

    if (typeof rules[idx].priority !== 'number') {
      return {
        code: -1,
        message: `[[stages.rules]] [${rules[idx].name}] priority格式无效，仅允许整数类型`,
        formatMessage: `[${stages.name}] [${rules[idx].name}] 优先级格式无效，仅允许整数类型`,
      };
    }

    // if (typeof rules[idx].exec !== 'string' || rules[idx].exec.length <= 0) {
    //   return {
    //     code: -1,
    //     message: `[[stages.rules]] [${rules[idx].name}] exec格式无效，仅允许非空字符串`,
    //     formatMessage: `[${stages.name}] [${rules[idx].name}] 规则内容不允许为空`,
    //   };
    // }
  }

  return { code: 1 };
};

/**
 * stages格式校验：
 * 1. 校验name
 * 2. 校验priority
 * 3. 校验excutor
 * @param toml
 */
const validateStages = (stages: BranchStage[], isStrategy: boolean = false) => {
  if (!stages || !stages.length) {
    return { code: -1, message: '[[stages]]不能为空', formatMessage: `规则阶段不能为空` };
  }

  for (let idx = 0; idx < stages.length; idx += 1) {
    if (typeof stages[idx].name !== 'string' || stages[idx].name.trim().length <= 0) {
      return {
        code: -1,
        message: '[[stages]] name格式无效，仅允许非空字符串',
        formatMessage: `${stages[idx].name} 名称格式无效，仅允许非空字符串`,
      };
    }

    if (isStrategy) {
      if (!stages[idx].packageName || stages[idx].packageName.length <= 0) {
        return {
          code: -1,
          message: `[[stages]]  [${stages[idx].name}] packageName不能为空，切换sourceCode，请点击分支升级后重试`,
          formatMessage: `[${stages[idx].name}] 包名称不能为空，请点击分支升级后重试`,
        };
      }
    }

    if (typeof stages[idx].priority !== 'number') {
      return {
        code: -1,
        message: `[[stages]] [${stages[idx].name}] priority格式无效，仅允许整数类型`,
        formatMessage: `[${stages[idx].name}] 优先级格式无效，仅允许整数类型`,
      };
    }

    if (
      stages[idx].executor !== 'ConcurrencyExecutor' &&
      stages[idx].executor !== 'SequentialExecutor'
    ) {
      return {
        code: -1,
        message: `[[stages]] [${stages[idx].name}] executor格式无效，仅允许SequentialExecutor、ConcurrencyExecutor两种执行器类型`,
        formatMessage: `[${stages[idx].name}] 执行方式格式无效，仅允许SequentialExecutor、ConcurrencyExecutor两种执行器类型`,
      };
    }

    if (!stages[idx].rules || stages[idx].rules.length <= 0) {
      return {
        code: -1,
        message: `[[stages]] [${stages[idx].name}] rules不能为空`,
        formatMessage: `[${stages[idx].name}] 规则不能为空`,
      };
    }

    const res = validateRules(stages[idx], stages[idx].rules);
    if (res?.code !== 1) {
      return res;
    }
  }

  return { code: 1 };
};

/**
 * 规则内容格式校验：
 * 1. 校验name
 * 2. 校验priority
 * 3. 校验excutor
 * @param toml
 * @isStrategy  boolean
 *    是否为引用策略类型:多一个packageName的校验
 */
const validateString = (toml: string, isStrategy: boolean = false) => {
  try {
    return validateStages(TOML.parse(toml)?.stages as BranchStage[], isStrategy);
  } catch (e) {
    return { code: -1, data: {}, message: e, formatMessage: e };
  }
};

/**
 * ********************************************************
 * 规则内容自动格式化
 */

// 格式化rules
const formatRules = (rules: BranchRule[]) => {
  if (!rules) {
    return rules;
  }

  const newRules = [];
  for (let idx1 = 0; idx1 < rules.length; idx1 += 1) {
    const newRule = { ...rules[idx1] };
    newRule.priority = idx1 + 1;
    delete newRule.collapsed;
    newRules[idx1] = newRule;
  }
  return newRules;
};

// 格式化stages
const formatStages = (stages: BranchStage[]) => {
  if (!stages) {
    return stages;
  }

  const newStages = [];
  for (let idx = 0; idx < stages.length; idx += 1) {
    const stage = { ...stages[idx] };
    stage.priority = idx + 1;

    // ConcurrencyExecutor 不排序
    // 其他情况如SequentialExecutor等，强制排序
    if (stages[idx].executor !== 'ConcurrencyExecutor') {
      stage.rules = formatRules(stages[idx].rules);
    }

    newStages[idx] = stage;
  }
  return newStages;
};

// 格式化stages【packageName】
const formatStagesPackage = (stages: BranchStage[], branchStrategyList: any) => {
  if (!stages) {
    return stages;
  }

  const newStages = [];
  for (let idx = 0; idx < stages.length; idx += 1) {
    const stage = { ...stages[idx] };

    // 拼接strategyPackage
    let packageName = '';
    if (!stage.packageName) {
      for (let i = 0; i < branchStrategyList.length; i++) {
        const branchStrategy = { ...branchStrategyList[i] };
        if (stage.name === branchStrategy.name) {
          packageName = branchStrategy.packageName;
        }
      }
      stage.packageName = packageName;
    }

    newStages[idx] = { packageName: stage.packageName, ...stage };
  }
  return newStages;
};

// 格式化Toml数据
const formatString = (toml: string) => {
  try {
    return { code: 1, data: { stages: formatStages(TOML.parse(toml)?.stages as BranchStage[]) } };
  } catch (e) {
    return { code: -1, data: {}, message: e };
  }
};
// 格式化Object对象
const formatObject = (object: any) => {
  return { code: 1, data: { stages: formatStages(object.stages) } };
};

// 格式化Toml数据
const formatStringPackage = (toml: string, branchStrategyList: any) => {
  try {
    return {
      code: 1,
      data: {
        stages: formatStagesPackage(TOML.parse(toml)?.stages as BranchStage[], branchStrategyList),
      },
      message: '格式化数据成功',
    };
  } catch (e) {
    return { code: -1, data: {}, message: e };
  }
};

export { formatString, formatObject, validateString, formatStagesPackage, formatStringPackage };

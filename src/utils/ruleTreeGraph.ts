import { PublishAction, RuleBranchState, RuleBranchType, RunType } from "@/consts/const";

const colors = {
  B: '#5B8FF9',
  R: '#F46649',
  Y: '#EEBC20',
  G: '#5BD8A6',
  DI: '#A7A7A7',
  C: '#C2CC37',
};

export const CalleArr = (data: any) => {
  for (const i in data) {
    const currentData = data[i];
    const colorsArr = Object.keys(colors);
    const colorsIndex = Math.floor((Math.random() * colorsArr.length));
    currentData.id = currentData.id.toString();
    currentData.branchType = RuleBranchType[currentData.branchType];
    currentData.branchStatus = RuleBranchState[currentData.branchStatus];
    currentData.publishState = PublishAction[currentData.publishState];
    currentData.runType = RunType[currentData.runType];
    currentData.status = colorsArr[colorsIndex];
    currentData.rate = 1;
    if (currentData.children) {
      CalleArr(currentData.children);
    }
  }
};

import type { BranchStage } from '@/models/rule';
import _ from 'lodash';

/**
 * --------------------------------------------
 * ProCard collapsed
 */

export const allCollapsedLength = (ruleObject: any) => {
  let rulesLength = -1;
  if (ruleObject?.stages) {
    ruleObject?.stages.forEach((stage: any) => {
      if (_.filter(stage.rules, { collapsed: true }).length > 0) {
        rulesLength = 1;
      }
    });
  }
  return rulesLength;
};

export const allExpand = (ruleObject: any, onGroupsFormChange: (groups: BranchStage[]) => void) => {
  ruleObject?.stages.forEach((stage: any) => {
    stage.rules.forEach((item: any) => {
      // eslint-disable-next-line no-param-reassign
      item.collapsed = false;
    });
  });
  onGroupsFormChange(ruleObject?.stages);
};

export const allCollapse = (
  ruleObject: any,
  onGroupsFormChange: (groups: BranchStage[]) => void,
) => {
  ruleObject?.stages.forEach((stage: any) => {
    stage.rules.forEach((item: any) => {
      // eslint-disable-next-line no-param-reassign
      item.collapsed = true;
    });
  });
  onGroupsFormChange(ruleObject?.stages);
};

/**
 * --------------------------------------------
 * EditorCode Theme
 */

export const CodeThemeList = [
  { name: 'Visual Studio', value: 'vs' },
  { name: 'Visual Studio Dark', value: 'vs-dark' },
  { name: 'High Contrast Dark', value: 'hc-black' },
];

export const EditorCodeTheme = localStorage.getItem('codeTheme') || 'vs';

export const handleEditorCodeTheme = (value: string, setCodeTheme: (value: string) => void) => {
  setCodeTheme(value);
  localStorage.setItem('codeTheme', value);
};


export const uuid =() => {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  let uuid = s.join("");
  return uuid;
}
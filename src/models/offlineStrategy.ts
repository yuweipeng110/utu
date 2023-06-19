export type OfflineStrategyInfo = {
    id: number;
    name: string;
    description: string;
    type: number;
    appId: number;
    // packageId: number;
    contentType: number;
    params?: any;
    strategyDetail: string;
    stableVersion: number;
    contentId: number;
    contentVersion: number;
    baseVersion: number;
    contentCreateUser: string;
    packageId: number;
    packageName: string;
    packageDescription: string;
    upgradedFeature: any;
    strategyId: number;
    dispatchSetting: string;
  }  

  export type OfflineStrategyJob = {
    jobId: number;
    status: number;
    startTime: string;
    endTime:string;
    executor: string;
    result: string;
    strategyId: number;
    strategyName: string;
  }
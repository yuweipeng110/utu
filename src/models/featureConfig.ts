export type DataSourceInfo = {
  id: number;
  type: number;
  name: string;
  englishName: string;
  serverAddress: string;
  port: string;
  requestMethod: string;
  url: string;
  inParams: DataSourceParamsType[];
  secondaryInParams: DataSourceParamsType[];
  returnParams: DataSourceParamsType[];
  secondaryReturnParams: DataSourceParamsType[];
  isInParamsAlias: boolean;
  isReturnParamsAlias: boolean;
  isPrefixInParamsAlias: boolean;
  isPrefixReturnParamsAlias: boolean;
  dataSourceId?: number;
};

export type DataSourceParamsType = {
  id: number;
  metadataId?: number | null;
  name?: string;
  englishLabel?: string;
  alias?: string;
  prefixAlias?: string;
  index?: number;
};

export type MetadataInfo = {
  id: number;
  name: string;
  englishLabel: string;
  type: number;
  metadataType: number;
  sourceId: number;
  sourceInfo: Partial<DataSourceInfo>;
  initValue: string;
  valueRange: string;
  metadataId?: number;
};

export type FeatureInfo = {
  id: number;
  featureName: string;
  featureDesc: string;
  featureType: number;
  featureValue: string;
  featureTags: [];
  featureDeps: [];
  source: number;
  paramName?: string;
  params: [];
  expressionStruct: FeatureExpressionStructType;
  isModify: boolean;
  dependUpgraded: any;
  selfUpgraded: any;
  featureProperties: FeatureProperties[];
  featureValueType: number;
  readOnly: number;
};

type FeatureExpressionStructType = {
  dependenceList: string[];
  expression: string;
  resultType: number;
};

export type FeatureProperties = {
  id?: number | string;
  index: number;
  name: string;
  desc: string;
  type: number;
};

import { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Spin } from 'antd';
import { getStrategyPackageDiff } from '@/services/appDeploy';
import { MonacoDiffEditor } from 'react-monaco-editor';
import { getPageQuery } from '@/utils/utils';
import { EditorCodeTheme } from '@/utils/func';
import '../index.less';

export default () => {
  const queryParams = getPageQuery();
  const packageName = queryParams['package_name'];
  const contentId = queryParams['content_id'];
  const originalContentId = queryParams['original_content_id'];

  const [loading, setLoading] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState(Object.create(null));

  const loadStrategyPackageDiff = async () => {
    setLoading(true);
    const res = await getStrategyPackageDiff({
      packageName,
      contentId,
      originalContentId,
    });
    setCurrentData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadStrategyPackageDiff();
  }, []);

  return (
    <PageContainer>
      <Spin spinning={loading}>
        <Card title="包版本Diff">
          <div className="custom-diff-editor">
            <div className="custom-diff-editor-header">
              <div>
                旧版本【{currentData.packageName}】V{currentData.originalVersion}
              </div>
              <div>
                新版本【{currentData.packageName}】V{currentData.version}
              </div>
            </div>
            <MonacoDiffEditor
              original={currentData.originalContent || ''}
              value={currentData.content || ''}
              width="100%"
              height={600}
              theme={EditorCodeTheme as any}
              options={{
                readOnly: true,
                renderWhitespace: 'boundary',
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
              language="go"
            />
          </div>
        </Card>
      </Spin>
    </PageContainer>
  );
};

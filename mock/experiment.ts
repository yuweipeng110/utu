// export default {
//   // get list experiment
//   'POST /api/v1/experiment/list': {
//     currentPage: 0,
//     pageSize: 10,
//     pages: 1,
//     totalCount: 10,
//     datas: [
//       {
//         id: 1,
//         appId: 44,
//         sceneId: 111,
//         name: '实验名称',
//         flag: 'fe',
//         type: 0,
//         flowRatio: 20,
//         publishStatus: 0,
//         createUser: "张三",
//         createTime: "2021-05-18T09:59:31.000+0000",
//         publishTime: "2021-05-19T09:59:31.000+0000",
//         experimentGroups: [
//           {
//             id: 1,
//             name: '实验组名称1',
//             mark: 0,
//             flowRatio: 20,
//           },
//           {
//             id: 2,
//             name: '实验组名称2',
//             mark: 1,
//             flowRatio: 30,
//           },
//         ],
//       },
//       {
//         id: 2,
//         appId: 44,
//         sceneId: 111,
//         name: '实验名称1',
//         flag: 'fe',
//         type: 0,
//         flowRatio: 20,
//         publishStatus: 200,
//         createUser: "李四",
//         createTime: "2021-05-18T09:59:31.000+0000",
//         publishTime: "2021-05-19T09:59:31.000+0000",
//         experimentGroups: [
//           {
//             id: 3,
//             name: '实验组名称3',
//             mark: 1,
//             flowRatio: 20,
//           },
//           {
//             id: 4,
//             name: '实验组名称4',
//             mark: 0,
//             flowRatio: 30,
//           },
//           {
//             id: 5,
//             name: '实验组名称5',
//             mark: 0,
//             flowRatio: 30,
//           },
//         ],
//       },
//       {
//         id: 3,
//         appId: 44,
//         sceneId: 111,
//         name: '实验名称2',
//         flag: 'fe',
//         type: 0,
//         flowRatio: 20,
//         publishStatus: 400,
//         createUser: "王五",
//         createTime: "2021-05-18T09:59:31.000+0000",
//         publishTime: "2021-05-19T09:59:31.000+0000",
//         experimentGroups: [],
//       },
//       {
//         id: 4,
//         appId: 44,
//         sceneId: 111,
//         name: '实验名称3',
//         flag: 'fe',
//         type: 0,
//         flowRatio: 20,
//         publishStatus: 600,
//         createUser: "赵六",
//         createTime: "2021-05-18T09:59:31.000+0000",
//         publishTime: "2021-05-19T09:59:31.000+0000",
//         experimentGroups: [],
//       }
//     ]
//   },
//
//   // add experiment
//   'POST /api/v1/ruleExperimentState/add': {
//     code: 1,
//     message: '调用成功',
//     success: true,
//     data: {
//       experimentId: 1
//     }
//   },
//
//   // get experiment
//   'POST /api/v1/experiment/get': {
//     code: 1,
//     message: "调用成功",
//     success: true,
//     data: {
//       id: 1,
//       appId: 1,
//       sceneId: 1,
//       name: "实验名称",
//       flag: "fe",
//       type: 0,
//       flowRatio: 20,
//       publishStatus: 0,
//       experimentGroups: [
//         {
//           id: 1,
//           name: "实验组名称1",
//           mark: 1,
//           flowRatio: 20,
//           createTime: "2021-02-01",
//           branchId: 1,
//           relationBranch: 0
//         },
//         {
//           id: 2,
//           name: "实验组名称2",
//           mark: 0,
//           flowRatio: 30,
//           createTime: "2021-02-01",
//           branchId: 2,
//           relationBranch: 0
//         }
//       ]
//     }
//   },
// };

// import { Request, Response } from 'express';
//
// const publishList = (req: Request, res: Response) => {
//   res.json({
//     code: 1,
//     message: '调用成功',
//     success: true,
//     data: {
//       appId: 44,
//       sceneId: 61,
//       name: '发布单名称',
//       status: 0,
//       createTime: new Date().getTime(),
//       createUser: '康康',
//       onlineList: [
//         {
//           branchId: 1,
//           branchName: '分支名称1',
//           version: 1,
//           contentMD5: 'sqhdvcbueqwozlf',
//         },
//         {
//           branchId: 2,
//           branchName: '分支名称2',
//           version: 2,
//           contentMD5: 'vwqpovgewhqjnc',
//         },
//         {
//           branchId: 3,
//           branchName: '分支名称2',
//           version: 3,
//           contentMD5: 'sqhdvcwqeaxzczlf',
//         },
//       ],
//       currentList: [
//         {
//           branchId: 1,
//           branchName: '分支名称1',
//           version: 1,
//           contentMD5: 'sqhdvcbueqwozlf',
//         },
//         {
//           branchId: 2,
//           branchName: '分支名称2',
//           version: 2,
//           contentMD5: 'vwqpovgewhqjnc',
//         },
//         {
//           branchId: 3,
//           branchName: '分支名称2',
//           version: 3,
//           contentMD5: 'sqhdvcwqeaxzczlf',
//         },
//         {
//           branchId: 4,
//           branchName: '分支名称4',
//           version: 4,
//           contentMD5: 'twqSDqweknfna',
//           action: 0,
//         },
//         {
//           branchId: 5,
//           branchName: '分支名称5',
//           version: 5,
//           contentMD5: 'rqierhajslcqwe',
//           action: 1,
//         },
//         {
//           branchId: 6,
//           branchName: '分支名称6',
//           version: 6,
//           contentMD5: 'eqewdaszxcd',
//           action: 2,
//         },
//         {
//           branchId: 7,
//           branchName: '分支名称7',
//           version: 7,
//           contentMD5: 'rwerweqeqweq',
//           action: 3,
//         },
//       ]
//     }
//   });
// }
//
//
// export default {
//   // submit publishOrder
//   'POST /api/v1/ruleExperimentState/generatePublishList/test': {
//     code: 1,
//     message: '调用成功',
//     success: true,
//     data: {
//       publishId: 1
//     }
//   },
//
//   // get publish data
//   'POST /api/v1/publish/order/queryPublishData': publishList,
//
//   // publishOrder start
//   'POST /api/v1/publish/start': {
//     code: 1,
//     message: '调用成功',
//     success: true,
//   },
//
//   // publishOrder close
//   'POST /api/v1/publish/close': {
//     code: 1,
//     message: '调用成功',
//     success: true,
//   },
// };


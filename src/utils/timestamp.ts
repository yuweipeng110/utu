type Module={
  [paramName: string]: number;
}
//定义一个函数,它接受一个联合类型的参数,和一个规定了返回的字符串格式
export function FormDate(time: number | Date, type: string = 'YYYY-MM-DD hh:mm:ss') {
  const date = new Date(time);
  //定义一个对象,必须是Module类型
  const module: Module = {
    Y: date.getFullYear(), //年
    M: date.getMonth() + 1, //月
    D: date.getDate(), //日
    h: date.getHours(), //时
    m: date.getMinutes(), //分
    s: date.getSeconds(), //秒
  };
  //type="YYYY-MM-DD hh:mm:ss"
  //通过正则匹配(Y+)一个或多个
  return type.replace(/(Y+|M+|D+|h+|m+|s+)/g, function (str: string): string {
    return ((str.length > 1 ? '0' : '') + module[str.slice(-1)]).slice(-str.length);
  });
}

export const parseData = (o: any) => {

    // 声明cache变量，便于匹配是否有循环引用的情况
    var cache: any[] | null = [];
    var str = JSON.stringify(o, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache?.indexOf(value) !== -1) {
                // 移除
                return;
            }
            // 收集所有的值
            cache.push(value);
        }
        return value;
    });
    cache = null; // 清空变量，便于垃圾回收机制回收

    return str;
}
/**
 * 洗牌
 * @param data 
 * @returns 
 */
export const shuffle = (data: Array<any>,) => {
    for (let i = 0; i < data.length; i++) {
        let index = Math.floor(Math.random() * (data.length - i)) + i
        let temp = data[i]
        data[i] = data[index]
        data[index] = temp;
    }
    return data
}


interface Type<T> extends Function {
    new(...args: any[]): T;
}
export class ReflectType {
    static cls<T>(value: Type<T>) {
        const ctx: any = new value();
        return Object.keys(ctx)
    }
    static convert(type: any, object: any) {
        const property = this.cls(type)
        const target = new type();
        property.forEach(m => {
            if (object.hasOwnProperty(m)) {
                target[m] = object[m];
            }
        })
        return target;
    }
}
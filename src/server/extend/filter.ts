type MethodDecorator = <T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

const login = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

    const original = descriptor.value;

    descriptor.value = function (...args: any) {
        console.log('params: ', ...args);
        const result = original.call(this, ...args);
        console.log('result: ', result);
        return result;

    }
}

export default login
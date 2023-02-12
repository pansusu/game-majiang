export default class Result {

    code: number;
    msg: string;

    isSuccess() {
        return this.code === 0
    }

    success(msg: string = 'success') {
        this.code = 0;
        this.msg = msg;
        return this
    }

    error(msg: string = 'error') {
        this.code = -1;
        this.msg = msg;
        return this
    }
}
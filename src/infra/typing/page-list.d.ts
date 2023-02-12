interface PageList<T> {
    current: number;
    pages: number;
    records: T[];
    size: number;
    total: number;
}
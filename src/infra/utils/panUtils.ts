import Mj from "@/server/entity/mj";

export const category_pan = (m: Mj[]) => {
    const map = new Map<string, Mj[]>();
    m.forEach((item) => {
        if (item) {
            if (map.has(String(item.type))) {
                map.get(String(item.type))?.push(item);
            } else {
                map.set(String(item.type), [item])
            }
        }
    })
    return Array.from(map.values())
}

export const sort_pan = (m: Mj[] | undefined) => {
    if (!m) return []
    let mj_sorted: Mj[] = [];
    category_pan(m).forEach((pans) => {
        mj_sorted = mj_sorted.concat(pans.sort((a, b) => a.num - b.num))
    })
    return mj_sorted
}
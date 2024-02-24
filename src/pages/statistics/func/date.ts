import {toDateString} from "xe-utils";
import {TreeNodeData} from "@arco-design/web-vue";

export interface DayCount {
    date: string,
    count: number
}

export function renderDayMap(ids: Array<number>): Map<string, number> {
    const dailyRecordMap = new Map<string, number>();

    for (let id of ids) {
        const time = toDateString(id, "yyyy-MM-dd");
        const count = dailyRecordMap.get(time);
        if (count) {
            dailyRecordMap.set(time, count + 1);
        } else {
            dailyRecordMap.set(time, 1);
        }
    }

    return dailyRecordMap;
}

export function renderDayCount(dailyRecordMap: Map<string, number>): Array<DayCount> {

    const list = new Array<DayCount>();

    dailyRecordMap.forEach((v, k) => {
        list.push({count: v, date: k});
    });

    return list;
}

export function renderAssignDayCount(days: Array<string>, dailyRecordMap: Map<string, number>): Array<DayCount> {
    const items = new Array<DayCount>();
    for (let day of days) {
        items.push({
            date: day,
            count: dailyRecordMap.get(day) || 0
        });
    }
    return items;
}


export function getDaysInMonth(year: number, month: number): Array<string> {
    let date = new Date(year, month - 1, 1);
    let days = [];

    while (date.getMonth() + 1 === month) {
        days.push(date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, '0'));
        date.setDate(date.getDate() + 1);
    }

    return days;
}

export function getMaxConsecutiveDays(arr: Array<DayCount>) {
    let maxCount = 0;
    let currentCount = 0;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].count > 0) {
            currentCount++;
            if (currentCount > maxCount) {
                maxCount = currentCount;
            }
        } else {
            currentCount = 0;
        }
    }

    return maxCount;
}

export function renderTagTree(tags: Array<string>): Array<TreeNodeData> {
    return tags.map(e => ({
        key: e,
        title: e
    }));
}

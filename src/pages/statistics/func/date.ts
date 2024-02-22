import {toDateString} from "xe-utils";
import {ISpec} from "@visactor/vchart";
import {useAppStore} from "@/store/AppStore";

export function render30Day(): Array<string> {
    const dateArray = new Array<string>();
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - i);
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1 < 10) ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
        var day = (currentDate.getDate() < 10) ? '0' + currentDate.getDate() : currentDate.getDate();
        dateArray.push(year + '-' + month + '-' + day);
    }
    return dateArray;
}

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

export function renderISpec(ids: Array<number>): ISpec {
    return {
        type: 'bar',
        data: [
            {
                id: 'barData',
                values: renderAssignDayCount(render30Day(), renderDayMap(ids))
            }
        ],
        xField: 'date',
        yField: 'count',
        background: useAppStore().isDarkColors() ? '#202020' : '',
        height: 300
    };
}

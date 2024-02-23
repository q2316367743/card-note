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

export function renderISpec(values: Array<DayCount>): ISpec {
    return {
        type: 'bar',
        data: [
            {
                id: 'barData',
                values: values
            }
        ],
        xField: 'date',
        yField: 'count',
        background: useAppStore().isDarkColors() ? '#202020' : '',
        height: 300,
        color: '#3C7EFF'
    };
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

function logScale(value: number, domain: Array<number>, range: Array<number>) {
    // 计算域和范围的对数
    const logDomain = domain.map(x => (x !== 0 ? Math.log10(x) : 0));
    const logRange = range.map(x => Math.log10(x));

    // 计算值在域内的位置，将其映射到范围内
    const t = (Math.log10(value) - logDomain[0]) / (logDomain[1] - logDomain[0]);
    const newValue = (logRange[1] - logRange[0]) * t + logRange[0];

    // 返回映射后的值，还原对数缩放
    return Math.pow(10, newValue);
}

export function renderWordCloud(tags: Array<string>): ISpec {
    return {
        type: 'wordCloud',
        width: 500,
        nameField: 'challenge_name',
        valueField: 'sum_count',
        seriesField: 'challenge_name',
        wordCloudConfig: {
            drawOutOfBound: 'clip'
        },
        data: {
            name: 'baseData',
            values: tags.map(tag => ({
                challenge_name: tag,
                sum_count: 0
            }))
        },
        background: useAppStore().isDarkColors() ? '#202020' : '',
        height: 200,
    };
}

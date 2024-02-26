import {StoreService} from "@/components/StoreService";
import {SyncSetting} from "@/entity/SyncSetting";

export class StoreServiceByWeb implements StoreService {

    private readonly syncSetting : SyncSetting;

    constructor(syncSetting : SyncSetting) {
        this.syncSetting = syncSetting;
    }


    delete(key: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    exist(key: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    get(key: string): Promise<string> {
        return Promise.resolve("");
    }

    set(key: string, content: string): Promise<boolean> {
        return Promise.resolve(false);
    }



}

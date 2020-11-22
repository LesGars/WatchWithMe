import get from "lodash/get";
import { browser } from "webextension-polyfill-ts";

const log = require("debug")("ext:utils");

export async function setStorageItem(item: string, value: any): Promise<void> {
    log(`Setting (sync) ${item} = `, value);
    return await browser.storage.sync.set({ [item]: value });
}

export async function getStorageItem(
    item: string,
    defaultValue: any = null
): Promise<any> {
    const storage = await browser.storage.sync.get(item);
    const value = get(storage, item, defaultValue);
    log(`Getting ${item} setting from storage : `, value);

    return value;
}

export async function getStorageItems(
    items: { [s: string]: any } | string[]
): Promise<{ [s: string]: any }> {
    return await browser.storage.sync.get(items);
}

export const isDevMode = (): boolean => {
    const devMode =
        !browser.runtime || !("update_url" in browser.runtime.getManifest());
    if (devMode) {
        localStorage.debug = "ext*";
    }
    return devMode;
};

import { browser } from "webextension-polyfill-ts";

export const getRoomId = async () => {
    const data = await browser.storage.sync.get("roomId");
    return data.roomId;
};

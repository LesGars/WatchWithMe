import { browser } from "webextension-polyfill-ts";

export const getRoomId = async () => {
    const data = await browser.storage.sync.get("roomId");
    return data.roomId;
};

export const getCurrentUrlWIthRoomId = async (
    roomId: string
): Promise<string> => {
    const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });
    const linkWithRoomId: URL = new URL(tabs[0].url!);
    linkWithRoomId.searchParams.set("roomId", roomId);
    return linkWithRoomId.href;
};

import { HumanFriendlyWatcher, Watcher, WatcherState } from "@/types";
import {
    adjectives,
    animals,
    colors,
    Config,
    uniqueNamesGenerator,
} from "unique-names-generator";

const customConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 2,
};

const friendlyNameForWatcher = (watcher: Watcher): string =>
    uniqueNamesGenerator({
        ...customConfig,
        seed: numberFromString(watcher.connectionId),
    });

const numberFromString = (string: string) =>
    parseInt(
        string
            .split("")
            .map((letter: string) => letter.charCodeAt(0))
            .join("")
    );

export const makeFriendlyWatchers = (
    watchers: Watcher[]
): HumanFriendlyWatcher[] =>
    watchers.map((watcher) => ({
        ...watcher,
        friendlyName: friendlyNameForWatcher(watcher),
    }));

export const STATUS_ICON_FOR_WATCHER_STATE = {
    [WatcherState.BUFFERING]: "⏳",
    [WatcherState.UNKNOWN]: "⏳",
    [WatcherState.PLAYING]: "🍿",
    [WatcherState.PLAY_SCHEDULED]: "⌛️",
    [WatcherState.READY]: "🤤",
};

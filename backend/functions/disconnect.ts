import { MessageFromServerToExtensionType } from '../../extension/src/communications/from-server-to-extension';
import { success } from '../libs/response';

export const main = async () => {
    return success({
        message: 'Successfully disconnected',
        type: MessageFromServerToExtensionType.SUCCESS,
    });
};

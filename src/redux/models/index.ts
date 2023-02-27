import { Models } from '@rematch/core';
import { stats } from './stats';
import { wallet } from './wallet';

export interface RootModel extends Models<RootModel> {
    wallet: typeof wallet;
    stats: typeof stats;
}

const models: RootModel = {
    wallet,
    stats,
};

export default models;

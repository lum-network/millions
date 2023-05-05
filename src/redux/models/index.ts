import { Models } from '@rematch/core';
import { app } from './app';
import { pools } from './pools';
import { stats } from './stats';
import { wallet } from './wallet';
import { prizes } from './prizes';

export interface RootModel extends Models<RootModel> {
    app: typeof app;
    pools: typeof pools;
    stats: typeof stats;
    wallet: typeof wallet;
    prizes: typeof prizes;
}

const models: RootModel = {
    app,
    pools,
    stats,
    wallet,
    prizes,
};

export default models;

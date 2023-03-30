import { Models } from '@rematch/core';
import { app } from './app';
import { pools } from './pools';
import { stats } from './stats';
import { wallet } from './wallet';

export interface RootModel extends Models<RootModel> {
    app: typeof app;
    pools: typeof pools;
    stats: typeof stats;
    wallet: typeof wallet;
}

const models: RootModel = {
    app,
    pools,
    stats,
    wallet,
};

export default models;

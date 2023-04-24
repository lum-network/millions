import { RematchDispatch, RematchRootState, init } from '@rematch/core';
import models, { RootModel } from '../models';
import loadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading';
import { ToastUtils } from 'utils';

type FullModel = ExtraModelsFromLoading<RootModel>;

const store = init<RootModel, FullModel>({
    models,
    redux: {
        rootReducers: {
            LOGOUT: () => {
                const backdrops = document.querySelectorAll('.modal-backdrop');

                backdrops.forEach((backdrop) => backdrop.remove());

                ToastUtils.showSuccessToast({ content: 'You have been logged out.' });
                return undefined;
            },
        },
    },
    plugins: [loadingPlugin()],
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel, FullModel>;

export default store;

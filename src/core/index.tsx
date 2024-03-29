import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import Assets from 'assets';

import { useColorScheme } from 'hooks';
import { router } from 'navigation';
import { Dispatch } from 'redux/store';

import Loader from './components/Loader/Loader';

import { Firebase } from '../utils';

const Core = () => {
    const dispatch = useDispatch<Dispatch>();
    const [progress, setProgress] = useState<number>(5);
    const [loading, setLoading] = useState<boolean>(true);
    const loadingStartsAt = useRef<Date>(new Date());
    const { isDark } = useColorScheme();

    useEffect(() => {
        if (progress >= 100) {
            const elapsed = new Date().getTime() - loadingStartsAt.current.getTime();
            setTimeout(
                () => {
                    setLoading(false);
                },
                elapsed >= 1500 ? 500 : 1500 - elapsed,
            );
        }
    }, [progress, setLoading]);

    useEffect(() => {
        if (!Firebase.auth) {
            return;
        }

        onAuthStateChanged(Firebase.auth, (user) => {
            if (user) {
                Firebase.setUserId(user.uid);
            } else {
                Firebase.setUserId(null);
            }
        });
    }, []);

    useEffect(() => {
        const allSrcs: string[] = [];
        for (const item of Object.entries(Assets.images)) {
            allSrcs.push(item[1]);
        }
        for (const item of Object.entries(Assets.chains)) {
            allSrcs.push(item[1]);
        }
        for (const item of Object.entries(Assets.testimonials)) {
            allSrcs.push(item[1]);
        }

        const inc = Math.ceil(95.0 / allSrcs.length);
        for (const src of allSrcs) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                const elapsed = new Date().getTime() - loadingStartsAt.current.getTime();
                setTimeout(
                    () => {
                        setProgress((p) => p + inc);
                    },
                    elapsed >= 500 ? 0 : 500 - elapsed + Math.random() * 500,
                );
            };
        }
    }, []);

    useEffect(() => {
        dispatch.app.init(null).finally(() => null);
    }, []);

    return (
        <>
            <Loader progress={progress} loading={loading} isDark={isDark} />
            {!loading ? <RouterProvider router={router} /> : null}
        </>
    );
};

export default Core;

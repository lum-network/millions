import React, { useLayoutEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import InfiniteScroll from 'react-infinite-scroller';
import { gsap } from 'gsap';

import { Button, Card, Loading, SmallerDecimal } from 'components';
import { Breakpoints, NavigationConstants } from 'constant';
import { useColorScheme, useWindowSize } from 'hooks';
import { LeaderboardItemModel, LumWalletModel, PoolModel } from 'models';
import { DenomsUtils, I18n, WalletProvidersUtils, NumbersUtils, StringsUtils } from 'utils';
import numeral from 'numeral';

import './Leaderboard.scss';

interface Props {
    pool: PoolModel;
    price: number | undefined;
    hasMore?: boolean;
    lumWallet?: LumWalletModel | null;
    totalDeposited?: number | null;
    userRank?: LeaderboardItemModel & {
        prev?: LeaderboardItemModel | null;
        next?: LeaderboardItemModel | null;
    };
    withSeeMoreBtn?: boolean;
    flat?: boolean;
    className?: string;
    limit?: number;
    enableAnimation?: boolean;
    onBottomReached?: () => void;
}

const Leaderboard = (props: Props) => {
    const { className, limit, lumWallet, price, pool, totalDeposited, flat, userRank, hasMore, enableAnimation, withSeeMoreBtn, onBottomReached } = props;

    const { width: windowWidth } = useWindowSize();
    const { isDark } = useColorScheme();

    const containerRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline>();

    const userRankList: LeaderboardItemModel[] = [];

    if (userRank) {
        if (userRank.prev) {
            userRankList.push(userRank.prev);
        }

        userRankList.push({
            amount: userRank.amount,
            address: userRank.address,
            rank: userRank.rank,
            nativeDenom: userRank.nativeDenom,
        });

        if (userRank.next) {
            userRankList.push(userRank.next);
        }
    }

    useLayoutEffect(() => {
        if (enableAnimation) {
            const ctx = gsap.context((self) => {
                const userCard = self.selector?.('.leaderboard-rank.animated');
                const otherUserCard = document.querySelectorAll('.leaderboard-rank.me:not(.animated)');
                const otherRanksCards = document.querySelectorAll('.leaderboard-rank:not(.user-rank)');

                if (userCard) {
                    const scrollTriggerConfig: ScrollTrigger.Vars = {
                        id: 'user-rank-trigger',
                        trigger: userCard,
                        start: () => 'bottom+=30px bottom',
                        end: () => (otherUserCard ? 'bottom-=47.5px bottom' : `bottom${windowWidth > Breakpoints.MD ? '' : '+=35px'} bottom`),
                        endTrigger: otherUserCard ? otherUserCard : containerRef.current,
                        pin: true,
                        pinSpacing: false,
                    };

                    tl.current = gsap.timeline({
                        scrollTrigger: scrollTriggerConfig,
                    });

                    const otherCardsTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: otherRanksCards[0],
                            start: 'top bottom',
                            end: 'bottom+=200px bottom',
                            scrub: true,
                        },
                    });

                    for (const otherCard of otherRanksCards) {
                        otherCardsTl.add(
                            gsap.fromTo(
                                otherCard,
                                {
                                    y: 0,
                                },
                                {
                                    y: -75,
                                },
                            ),
                            '<',
                        );
                    }

                    otherCardsTl.fromTo(
                        otherRanksCards[0],
                        {
                            zIndex: 1,
                            opacity: 0,
                        },
                        {
                            zIndex: 3,
                            opacity: 1,
                        },
                        '-=.2',
                    );
                }
            }, containerRef);

            return () => ctx.revert();
        }
    }, [userRank, pool]);

    const LeaderboardContainer = ({ children, containerClassName }: { children: React.ReactNode; containerClassName: string }) => {
        if (isMobile || windowWidth < Breakpoints.MD) {
            return (
                <div className={containerClassName} ref={containerRef}>
                    {children}
                </div>
            );
        }

        return (
            <Card flat={flat} withoutPadding className={containerClassName} ref={containerRef}>
                {children}
            </Card>
        );
    };

    const renderRow = (item: LeaderboardItemModel, index: number) => {
        const amount = NumbersUtils.convertUnitNumber(item.amount);
        const totalUserDeposits = userRank ? NumbersUtils.convertUnitNumber(userRank.amount) : null;

        return (
            <div
                key={`depositor-rank-${index}`}
                className={`position-relative d-flex flex-column flex-sm-row align-items-sm-center justify-content-between leaderboard-rank ${flat ? 'flat' : ''} ${isDark ? 'dark' : ''} ${
                    item.address === lumWallet?.address ? 'me' : !isDark && (isMobile || windowWidth < Breakpoints.MD) ? 'white-bg' : ''
                }`}
            >
                <div className='d-flex flex-row align-items-center'>
                    <div className={'me-3 rank' + ' ' + (item.rank === 1 ? 'first' : item.rank === 2 ? 'second' : item.rank === 3 ? 'third' : '')}>#{item.rank}</div>
                    <div className='address'>{StringsUtils.trunc(item.address, windowWidth > Breakpoints.SM ? 6 : windowWidth < 350 ? 3 : 8)}</div>
                </div>
                <div className='position-relative overflow-visible d-flex flex-row align-items-center justify-content-sm-end justify-content-between mt-2 mt-sm-0'>
                    <div className='crypto-amount me-3'>
                        <SmallerDecimal nb={NumbersUtils.formatTo6digit(amount, windowWidth < Breakpoints.MD ? 3 : 6)} /> {DenomsUtils.getNormalDenom(item.nativeDenom).toUpperCase()}
                    </div>
                    {price ? (
                        <div className='usd-amount'>
                            $<SmallerDecimal nb={numeral(amount * price).format('0,0.00')} />
                        </div>
                    ) : null}
                </div>
                {windowWidth > Breakpoints.SM ? (
                    <>
                        {!(lumWallet && item.address === lumWallet.address) && userRank && userRank.rank > item.rank && totalUserDeposits ? (
                            <Button
                                className='deposit-more-btn'
                                to={`${NavigationConstants.POOLS}/${DenomsUtils.getNormalDenom(item.nativeDenom)}/${pool.poolId.toString()}`}
                                locationState={{
                                    amountToDeposit: Math.ceil(amount - totalUserDeposits),
                                }}
                                forcePurple
                            >
                                {I18n.t('leaderboard.depositBtn', { amount: Math.ceil(amount - totalUserDeposits), denom: DenomsUtils.getNormalDenom(item.nativeDenom).toUpperCase() })}
                            </Button>
                        ) : null}
                        {!(lumWallet && item.address === lumWallet.address) &&
                        totalDeposited &&
                        userRank &&
                        userRank.rank > item.rank &&
                        NumbersUtils.convertUnitNumber(userRank.amount) !== totalDeposited ? (
                            <Button className='deposit-more-btn' forcePurple>
                                {I18n.t('leaderboard.newRanking')}
                            </Button>
                        ) : null}
                    </>
                ) : null}
            </div>
        );
    };

    const renderLeaderboardContent = () => {
        if (pool.leaderboard.items.length === 0) {
            return (
                <div className='d-flex flex-column align-items-center justify-content-center'>
                    <h3 className='mb-4'>{I18n.t('leaderboard.noDepositYet')}</h3>
                    <Button to={`${NavigationConstants.POOLS}/${DenomsUtils.getNormalDenom(pool.nativeDenom)}/${pool.poolId.toString()}`} forcePurple>
                        {I18n.t('mySavings.deposit')}
                    </Button>
                </div>
            );
        }

        return (
            <>
                {!enableAnimation && windowWidth < Breakpoints.MD && userRank && (
                    <div className={`user-rank leaderboard-rank me d-flex flex-column flex-sm-row align-items-sm-center justify-content-between`}>
                        <div className='d-flex flex-row align-items-center'>
                            <div className='me-3 rank'>#{userRank.rank}</div>
                            <div className='address'>{StringsUtils.trunc(userRank.address, windowWidth < Breakpoints.SM ? 3 : 6)}</div>
                        </div>
                        <div className='position-relative d-flex flex-row align-items-center justify-content-sm-end justify-content-between mt-2 mt-sm-0'>
                            <div className='crypto-amount me-3'>
                                <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(userRank.amount), 3)} /> {DenomsUtils.getNormalDenom(userRank.nativeDenom).toUpperCase()}
                            </div>
                            {price && (
                                <div className='usd-amount'>
                                    $<SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(userRank.amount) * price).format('0,0.00')} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {onBottomReached ? (
                    <InfiniteScroll hasMore={hasMore || false} loadMore={onBottomReached} loader={<Loading key={0} />} className='position-relative'>
                        {enableAnimation && userRank ? (
                            <div className={`user-rank leaderboard-rank animated me d-flex flex-column flex-sm-row align-items-sm-center justify-content-between`}>
                                <div className='d-flex flex-row align-items-center'>
                                    <div className='me-3 rank'>#{userRank.rank}</div>
                                    <div className='address'>{StringsUtils.trunc(userRank.address, windowWidth < Breakpoints.SM ? 3 : 6)}</div>
                                </div>
                                <div className='position-relative d-flex flex-row align-items-center justify-content-sm-end justify-content-between mt-2 mt-sm-0'>
                                    <div className='crypto-amount me-3'>
                                        <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(userRank.amount), windowWidth < Breakpoints.MD ? 3 : 6)} />{' '}
                                        {DenomsUtils.getNormalDenom(userRank.nativeDenom).toUpperCase()}
                                    </div>
                                    {price ? (
                                        <div className='usd-amount'>
                                            $
                                            <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(userRank.amount) * price).format('0,0.00')} />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                        {(limit ? pool.leaderboard.items.slice(0, limit) : pool.leaderboard.items).map(renderRow)}
                    </InfiniteScroll>
                ) : (
                    (limit ? pool.leaderboard.items.slice(0, limit) : pool.leaderboard.items).map(renderRow)
                )}
                {!enableAnimation && windowWidth > Breakpoints.MD && userRank && (
                    <>
                        <hr />
                        {userRankList.map(renderRow)}
                    </>
                )}
                {withSeeMoreBtn && (
                    <Button
                        className='mx-sm-auto my-4'
                        style={{
                            width: windowWidth < Breakpoints.MD ? '100%' : 'fit-content',
                        }}
                        {...(!lumWallet
                            ? {
                                  'data-bs-toggle': 'modal',
                                  'data-bs-target': WalletProvidersUtils.isAnyWalletInstalled() ? '#choose-wallet-modal' : '#get-keplr-modal',
                              }
                            : {
                                  to: NavigationConstants.MY_SAVINGS,
                                  locationState: {
                                      leaderboardPoolId: pool.poolId.toString(),
                                  },
                              })}
                    >
                        {I18n.t(lumWallet ? 'leaderboard.cta' : 'leaderboard.notConnectedCta')}
                    </Button>
                )}
            </>
        );
    };
    return <LeaderboardContainer containerClassName={`leaderboard ${enableAnimation && 'position-relative with-anim'} ${className}`}>{renderLeaderboardContent()}</LeaderboardContainer>;
};

export default Leaderboard;

import React, { useLayoutEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import InfiniteScroll from 'react-infinite-scroller';
import { gsap } from 'gsap';

import { Button, Card, Loading, SmallerDecimal } from 'components';
import { Breakpoints, NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { LeaderboardItemModel, LumWalletModel } from 'models';
import { DenomsUtils, I18n, KeplrUtils, NumbersUtils, StringsUtils } from 'utils';
import numeral from 'numeral';

import './Leaderboard.scss';

interface Props {
    items: LeaderboardItemModel[];
    price: number | undefined;
    poolId: string;
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
    const { items, className, limit, lumWallet, price, poolId, totalDeposited, flat, userRank, hasMore, enableAnimation, withSeeMoreBtn, onBottomReached } = props;

    const { width: windowWidth } = useWindowSize();
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

                if (userCard) {
                    const scrollTriggerConfig: ScrollTrigger.Vars = {
                        id: 'user-rank-trigger',
                        trigger: userCard,
                        start: 'bottom+=100px bottom',
                        end: 'bottom+=70px bottom',
                        endTrigger: containerRef.current,
                        pin: true,
                        pinSpacing: false,
                    };

                    tl.current = gsap.timeline({
                        scrollTrigger: scrollTriggerConfig,
                    });
                }
            }, containerRef);

            return () => ctx.revert();
        }
    }, [userRank]);

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
                className={`position-relative d-flex flex-row align-items-center justify-content-between leaderboard-rank ${
                    item.address === lumWallet?.address ? 'me' : flat || isMobile || windowWidth < Breakpoints.MD ? 'white-bg' : ''
                }`}
            >
                <div className='d-flex flex-row align-items-center'>
                    <div className={'me-3 rank' + ' ' + (item.rank === 1 ? 'first' : item.rank === 2 ? 'second' : item.rank === 3 ? 'third' : '')}>#{item.rank}</div>
                    <div className='address'>{StringsUtils.trunc(item.address, windowWidth < Breakpoints.SM ? 3 : 6)}</div>
                </div>
                <div className='position-relative overflow-visible d-flex flex-row align-items-center justify-content-end'>
                    <div className='crypto-amount me-3'>
                        <SmallerDecimal nb={NumbersUtils.formatTo6digit(amount, 3)} /> {DenomsUtils.getNormalDenom(item.nativeDenom).toUpperCase()}
                    </div>
                    {price ? (
                        <div className='usd-amount'>
                            $<SmallerDecimal nb={numeral(amount * price).format('0,0.00')} />
                        </div>
                    ) : null}
                </div>
                {!(lumWallet && item.address === lumWallet.address) && userRank && userRank.rank > item.rank && totalUserDeposits ? (
                    <Button
                        className='deposit-more-btn'
                        to={`${NavigationConstants.POOLS}/${DenomsUtils.getNormalDenom(item.nativeDenom)}/${poolId}`}
                        locationState={{
                            amountToDeposit: Math.ceil(amount - totalUserDeposits),
                        }}
                    >
                        {I18n.t('leaderboard.depositBtn', { amount: Math.ceil(amount - totalUserDeposits), denom: DenomsUtils.getNormalDenom(item.nativeDenom).toUpperCase() })}
                    </Button>
                ) : null}
                {!(lumWallet && item.address === lumWallet.address) && totalDeposited && userRank && userRank.rank > item.rank && NumbersUtils.convertUnitNumber(userRank.amount) !== totalDeposited ? (
                    <Button className='deposit-more-btn'>{I18n.t('leaderboard.newRanking')}</Button>
                ) : null}
            </div>
        );
    };

    return (
        <LeaderboardContainer containerClassName={`leaderboard ${className} ${enableAnimation && 'position-relative'}`}>
            {!enableAnimation && windowWidth < Breakpoints.MD && userRank && (
                <div className={`user-rank leaderboard-rank me d-flex flex-row justify-content-between align-items-center`}>
                    <div className='d-flex flex-row align-items-center'>
                        <div className='me-3 rank'>#{userRank.rank}</div>
                        <div className='address'>{StringsUtils.trunc(userRank.address, windowWidth < Breakpoints.SM ? 3 : 6)}</div>
                    </div>
                    <div className='position-relative d-flex flex-row align-items-center justify-content-end'>
                        <div className='crypto-amount me-3'>
                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(userRank.amount))} /> {DenomsUtils.getNormalDenom(userRank.nativeDenom).toUpperCase()}
                        </div>
                        {price && (
                            <div className='usd-amount'>
                                $<SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(userRank.amount) * price)} />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {onBottomReached ? (
                <InfiniteScroll hasMore={hasMore || false} loadMore={onBottomReached} loader={<Loading key={0} />} className='position-relative'>
                    {(limit ? items.slice(0, limit) : items).map(renderRow)}
                    {enableAnimation && userRank ? (
                        <div className={`user-rank leaderboard-rank animated me d-flex flex-row justify-content-between align-items-center`}>
                            <div className='d-flex flex-row align-items-center'>
                                <div className='me-3 rank'>#{userRank.rank}</div>
                                <div className='address'>{StringsUtils.trunc(userRank.address, windowWidth < Breakpoints.SM ? 3 : 6)}</div>
                            </div>
                            <div className='position-relative d-flex flex-row align-items-center justify-content-end'>
                                <div className='crypto-amount me-3'>
                                    <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(userRank.amount))} />{' '}
                                    {DenomsUtils.getNormalDenom(userRank.nativeDenom).toUpperCase()}
                                </div>
                                {price ? (
                                    <div className='usd-amount'>
                                        $
                                        <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(userRank.amount) * price)} />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </InfiniteScroll>
            ) : (
                (limit ? items.slice(0, limit) : items).map(renderRow)
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
                              'data-bs-target': !KeplrUtils.isKeplrInstalled() ? '#get-keplr-modal' : '#choose-wallet-modal',
                          }
                        : {
                              to: NavigationConstants.MY_SAVINGS,
                              locationState: {
                                  leaderboardPoolId: poolId,
                              },
                          })}
                >
                    {I18n.t(lumWallet ? 'leaderboard.cta' : 'leaderboard.notConnectedCta')}
                </Button>
            )}
        </LeaderboardContainer>
    );
};

export default Leaderboard;

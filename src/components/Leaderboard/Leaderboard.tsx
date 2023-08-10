import React from 'react';
import { isMobile } from 'react-device-detect';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Button, Card, Loading, SmallerDecimal } from 'components';
import { Breakpoints, NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { LeaderboardItemModel, LumWalletModel } from 'models';
import { DenomsUtils, I18n, KeplrUtils, NumbersUtils, StringsUtils } from 'utils';

import './Leaderboard.scss';

interface Props {
    items: LeaderboardItemModel[];
    price: number | undefined;
    poolId: string;
    hasMore?: boolean;
    lumWallet?: LumWalletModel | null;
    totalDeposited?: number | null;
    userRank?: LeaderboardItemModel & {
        prev?: LeaderboardItemModel;
        next?: LeaderboardItemModel;
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

    const list = limit ? items.slice(0, limit) : items;

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

    const LeaderboardContainer = ({ children }: { children: React.ReactNode }) => {
        const leaderboardContainerClassName = `leaderboard ${className} ${enableAnimation && 'position-relative'}`;

        if (isMobile || windowWidth < Breakpoints.MD) {
            return <div className={leaderboardContainerClassName}>{children}</div>;
        }

        return (
            <Card flat={flat} withoutPadding className={leaderboardContainerClassName}>
                {children}
            </Card>
        );
    };

    const renderRow = (item: LeaderboardItemModel, index: number) => {
        const rank = item.rank || index + 1;
        const amount = NumbersUtils.convertUnitNumber(item.amount);

        return (
            <div
                key={`depositor-rank-${index}`}
                className={`position-relative d-flex flex-row align-items-center justify-content-between leaderboard-rank ${
                    item.address === lumWallet?.address ? 'me' : flat || isMobile || windowWidth < Breakpoints.MD ? 'white-bg' : ''
                }`}
            >
                <div className='d-flex flex-row align-items-center'>
                    <div className={'me-3 rank' + ' ' + (rank === 1 ? 'first' : rank === 2 ? 'second' : rank === 3 ? 'third' : '')}>#{rank}</div>
                    <div className='address'>{StringsUtils.trunc(item.address, windowWidth < Breakpoints.SM ? 3 : 6)}</div>
                </div>
                <div className='position-relative overflow-visible d-flex flex-row align-items-center justify-content-end'>
                    <div className='crypto-amount me-3'>
                        <SmallerDecimal nb={NumbersUtils.formatTo6digit(amount, 3)} /> {DenomsUtils.getNormalDenom(item.nativeDenom).toUpperCase()}
                    </div>
                    {price && (
                        <div className='usd-amount'>
                            $<SmallerDecimal nb={NumbersUtils.formatTo6digit(amount * price)} />
                        </div>
                    )}
                </div>
                {!(lumWallet && item.address === lumWallet.address) && totalDeposited && userRank && userRank.rank > item.rank && (
                    <Button className='deposit-more-btn'>
                        Deposit {Math.ceil(amount - totalDeposited / (price || 1)) + 1} {DenomsUtils.getNormalDenom(item.nativeDenom).toUpperCase()} to take his place
                    </Button>
                )}
            </div>
        );
    };

    return (
        <LeaderboardContainer>
            {((enableAnimation && userRank) || (windowWidth < Breakpoints.MD && userRank)) && (
                <div className={`user-rank leaderboard-rank ${enableAnimation && 'animated'} me d-flex flex-row justify-content-between align-items-center`}>
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
                <InfiniteScroll dataLength={limit || items.length} hasMore={hasMore || false} next={onBottomReached} loader={<Loading />}>
                    {list.map(renderRow)}
                </InfiniteScroll>
            ) : (
                list.map(renderRow)
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
                    {I18n.t(lumWallet ? 'leaderboardCta' : 'leaderboardNotConnectedCta')}
                </Button>
            )}
        </LeaderboardContainer>
    );
};

export default Leaderboard;

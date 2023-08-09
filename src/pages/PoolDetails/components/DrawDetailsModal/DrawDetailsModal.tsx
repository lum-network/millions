import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { Draw } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/draw';

import Assets from 'assets';
import { Button, Card, Modal, SmallerDecimal, Table } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { NavigationConstants } from 'constant';
import { DenomsUtils, I18n, NumbersUtils, StringsUtils } from 'utils';
import { DrawModel } from 'models';

import './DrawDetailsModal.scss';

const DrawDetails = ({ draw, poolDenom, prices, modalRef }: { draw: DrawModel | null; poolDenom: string; prices: { [key: string]: number }; modalRef: React.RefObject<ModalHandlers> }) => {
    const [view, setView] = useState<'winners' | 'redelegated'>('winners');
    const [winnersPage, setWinnersPage] = useState(1);

    const navigate = useNavigate();

    return (
        <Modal id='drawDetailsModal' ref={modalRef} modalWidth={700}>
            {draw ? (
                <div className='d-flex flex-column align-items-center'>
                    <div className='d-flex flex-row align-items-center'>
                        <img src={DenomsUtils.getIconFromDenom(poolDenom)} alt={poolDenom} className='pool-icon' />
                        <h1 className='mb-0 ms-3 ms-md-4 text-nowrap'>
                            {poolDenom.toUpperCase()} {I18n.t('common.pool')}
                        </h1>
                    </div>
                    <div className='my-4'>
                        <div className='d-flex flex-row justify-content-evenly'>
                            <div className='d-flex flex-row align-items-baseline'>
                                <h4>{I18n.t('common.pool')}</h4>
                                <div className='d-flex align-items-center justify-content-center ms-2 index-container'>#{draw.poolId.toString()}</div>
                            </div>
                            <div className='d-flex flex-row align-items-baseline ms-4'>
                                <h4>{I18n.t('common.draw')}</h4>
                                <div className='d-flex align-items-center justify-content-center ms-2 index-container'>#{draw.drawId.toString()}</div>
                            </div>
                        </div>
                        <div className='mt-2 date'>{dayjs(draw.createdAt).format('dddd DD MMM YYYY - hh:mm A')}</div>
                    </div>
                    <div className='d-flex flex-row'>
                        <button
                            type='button'
                            className={`d-flex align-items-center justify-content-center py-1 px-4 w-100 selectable-btn ${view === 'winners' ? 'active' : ''}`}
                            onClick={() => (view !== 'winners' ? setView('winners') : null)}
                        >
                            {I18n.t('poolDetails.drawDetails.winnersBtn')}
                        </button>
                        <button
                            type='button'
                            className={`d-flex align-items-center justify-content-center text-nowrap py-1 px-4 w-100 ms-3 selectable-btn ${view === 'redelegated' ? 'active' : ''}`}
                            onClick={() => (view !== 'redelegated' ? setView('redelegated') : null)}
                        >
                            {I18n.t('poolDetails.drawDetails.redelegatedPrizeBtn')}
                        </button>
                    </div>
                    <div className='w-100 mt-4 draw-winners-table-container'>
                        {view === 'winners' ? (
                            <Table
                                className='draw-winners-table'
                                onPageChange={(page) => setWinnersPage(page)}
                                pagination={
                                    draw.prizesRefs.length > 5
                                        ? {
                                              pagesTotal: Math.ceil(draw.prizesRefs.length / 5),
                                              hasNextPage: winnersPage < Math.ceil(draw.prizesRefs.length / 5),
                                              hasPreviousPage: winnersPage > 1,
                                              page: winnersPage,
                                          }
                                        : undefined
                                }
                            >
                                {draw.prizesRefs.slice((winnersPage - 1) * 5, winnersPage * 5).map((winner, index) => (
                                    <tr key={`${draw.poolId.toString()}-${draw.drawId.toString()}-winner-${index}`}>
                                        <td>
                                            <div className='d-flex flex-row align-items-baseline winner-address'>
                                                <div className='tx-icon-container d-flex align-items-center justify-content-center me-3'>
                                                    <img src={Assets.images.trophyPurple} alt='' />
                                                </div>
                                                {StringsUtils.trunc(winner.winnerAddress)}
                                            </div>
                                        </td>
                                        <td className='text-md-end'>
                                            <div className='d-flex flex-column justify-content-center tx-amount'>
                                                <div className='amount text-nowrap'>
                                                    <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(winner.amount) * (draw.usdTokenValue || prices[poolDenom] || 0)).format('$0,0[.]00')} />
                                                </div>
                                                <span className='usd-price'>
                                                    <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(winner.amount)).format('0,0.000000')} /> {poolDenom.toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        ) : (
                            <>
                                <p className='next-pool-info my-3'>{I18n.t('poolDetails.drawDetails.nextPool')}</p>
                                <Card flat className='redelegated-prizes-card'>
                                    <div className='d-flex flex-row justify-content-between'>
                                        <div className='d-flex flex-column text-start'>
                                            <div className='display-6 prize-remaining-amount'>
                                                <SmallerDecimal
                                                    nb={numeral(
                                                        (NumbersUtils.convertUnitNumber(draw.prizePool?.amount || 0) - NumbersUtils.convertUnitNumber(draw.totalWinAmount)) *
                                                            (draw.usdTokenValue || prices[poolDenom] || 0),
                                                    ).format('$0,0[.]00')}
                                                />
                                            </div>
                                            <div>
                                                <SmallerDecimal
                                                    nb={numeral(NumbersUtils.convertUnitNumber(draw.prizePool?.amount || 0) - NumbersUtils.convertUnitNumber(draw.totalWinAmount)).format('0,0.000000')}
                                                />{' '}
                                                {poolDenom.toUpperCase()}
                                            </div>
                                        </div>
                                        <Button
                                            data-bs-dismiss='modal'
                                            data-bs-target='#drawDetailsModal'
                                            onClick={() => {
                                                setTimeout(() => navigate(`${NavigationConstants.POOLS}/${poolDenom}/${draw.poolId.toString()}`));
                                            }}
                                        >
                                            {I18n.t('poolDetails.drawDetails.tryBtn')}
                                        </Button>
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default DrawDetails;

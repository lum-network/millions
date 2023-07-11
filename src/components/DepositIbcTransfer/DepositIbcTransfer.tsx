import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LumConstants, LumTypes } from '@lum-network/sdk-javascript';

import Assets from 'assets';
import { AmountInput, AssetsSelect, Button, Card, Tooltip } from 'components';
import { OtherWalletModel, PoolModel } from 'models';
import { FormikProps } from 'formik';
import { RootState } from 'redux/store';
import { I18n, NumbersUtils, DenomsUtils, WalletUtils, PoolsUtils } from 'utils';

interface Props {
    currentPool: PoolModel;
    balances: LumTypes.Coin[];
    price: number;
    pools: PoolModel[];
    title: string;
    subtitle: string;
    nonEmptyWallets: OtherWalletModel[];
    form: FormikProps<{ amount: string }>;
    onTransfer: (amount: string) => void;
}

const DepositIbcTransfer = (props: Props) => {
    const { currentPool, balances, price, pools, form, nonEmptyWallets, title, subtitle, onTransfer } = props;

    const navigate = useNavigate();

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.ibcTransfer);
    const prizeStrat = currentPool.prizeStrategy;

    let avgPrize = 0;

    if (prizeStrat) {
        let avgPrizesDrawn = 0;
        for (const prizeBatch of prizeStrat.prizeBatches) {
            avgPrizesDrawn += (Number(currentPool.estimatedPrizeToWin?.amount || '0') * (prizeBatch.poolPercent.toNumber() / 100)) / prizeBatch.quantity.toNumber();
        }

        avgPrize = avgPrizesDrawn / prizeStrat.prizeBatches.length / prizeStrat.prizeBatches.length;
    }

    return (
        <div className='step-1'>
            <div className='d-flex flex-column mb-3 mb-sm-5 mb-lg-0'>
                <div className='card-step-title' dangerouslySetInnerHTML={{ __html: title }} />
                <div className='card-step-subtitle' dangerouslySetInnerHTML={{ __html: subtitle }} />
            </div>
            <form onSubmit={form.handleSubmit} className={isLoading ? 'd-flex flex-column align-items-stretch w-100' : ''}>
                <div className='w-100 mt-5'>
                    <AmountInput
                        isLoading={isLoading}
                        label={I18n.t('withdraw.amountInput.label')}
                        sublabel={I18n.t('withdraw.amountInput.sublabel', {
                            amount: NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balances.length > 0 ? balances[0].amount : '0')),
                            denom: DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase(),
                        })}
                        onMax={() => {
                            const amount = WalletUtils.getMaxAmount(currentPool.nativeDenom, balances, currentPool.internalInfos?.fees);
                            form.setFieldValue('amount', amount);
                        }}
                        inputProps={{
                            type: 'number',
                            min: 0,
                            max: balances.length > 0 ? balances[0].amount : '0',
                            step: 'any',
                            lang: 'en',
                            placeholder: (100 / price).toFixed(6),
                            ...form.getFieldProps('amount'),
                            onChange: (e) => {
                                const inputAmount = Number(e.target.value);
                                const maxAmount = Number(WalletUtils.getMaxAmount(currentPool.nativeDenom, balances, currentPool.internalInfos?.fees));

                                if (Number.isNaN(inputAmount) || inputAmount < 0) {
                                    e.target.value = '0';
                                } else if (inputAmount > maxAmount) {
                                    e.target.value = maxAmount > 0 ? maxAmount.toString() : '0';
                                }

                                form.handleChange(e);
                            },
                        }}
                        price={price}
                        error={form.touched.amount ? form.errors.amount : ''}
                    />
                </div>
                <div className='mt-5'>
                    {pools.filter((p) => p.nativeDenom !== LumConstants.MicroLumDenom).length > 1 && (
                        <AssetsSelect
                            isLoading={isLoading}
                            balances={nonEmptyWallets.reduce<{ amount: string; denom: string }[]>((result, { balances }) => {
                                if (balances.length > 0) {
                                    result.push({
                                        amount: balances[0].amount,
                                        denom: balances[0].denom,
                                    });
                                }
                                return result;
                            }, [])}
                            value={currentPool.nativeDenom}
                            onChange={(value) => {
                                navigate(`/pools/${DenomsUtils.getNormalDenom(value)}`, { replace: true });
                            }}
                            options={nonEmptyWallets.map((wallet) => ({
                                label: DenomsUtils.getNormalDenom(wallet.balances[0].denom),
                                value: wallet.balances[0].denom,
                            }))}
                        />
                    )}
                    <Card flat withoutPadding className='winning-chance-card mt-4 px-4'>
                        <div className='winning-chance d-flex flex-row justify-content-between'>
                            <div>
                                {I18n.t('deposit.chancesHint.winning.title')}
                                <span data-tooltip-id='winning-chance-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.winning.hint')} className='ms-2'>
                                    <img src={Assets.images.info} alt='info' />
                                    <Tooltip id='winning-chance-tooltip' />
                                </span>
                            </div>
                            <div>{NumbersUtils.float2ratio(PoolsUtils.getWinningChances(form.values.amount ? Number(form.values.amount) : 100 / price, currentPool))}</div>
                        </div>
                        <div className='average-prize d-flex flex-row justify-content-between mt-4'>
                            <div>
                                {I18n.t('deposit.chancesHint.averagePrize.title')}
                                <span data-tooltip-id='average-prize-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.averagePrize.hint')} className='ms-2'>
                                    <img src={Assets.images.info} alt='info' />
                                    <Tooltip id='average-prize-tooltip' />
                                </span>
                            </div>
                            <div>
                                {avgPrize.toFixed(2)} {DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase()}
                            </div>
                        </div>
                    </Card>
                    <Button
                        type={isLoading ? 'button' : 'submit'}
                        onClick={() => onTransfer(form.values.amount)}
                        className='position-relative deposit-cta w-100 mt-4'
                        disabled={isLoading || !form.values.amount || !!(form.touched.amount && form.errors.amount)}
                    >
                        <div className='position-absolute deposit-cta-bg w-100 h-100' style={{ backgroundColor: '#5634DE', borderRadius: 12 }} />
                        <div className='deposit-cta-text'>{I18n.t('deposit.transferBtn')}</div>
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DepositIbcTransfer;

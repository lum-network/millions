import React from 'react';
import numeral from 'numeral';

import Assets from 'assets';
import { Button, Card, Modal } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { DenomsUtils, I18n } from 'utils';

interface Props {
    modalRef: React.RefObject<ModalHandlers>;
    onConfirm: () => void;
    denom: string;
    prevAmount: string;
    nextAmount: string;
    price: number;
    isLoading: boolean;
}

const IbcTransfer = ({ modalRef, denom, price, prevAmount, nextAmount, isLoading, onConfirm }: Props) => {
    const formattedPrevAmount = numeral(prevAmount).format('0,0[.]000000');
    const formattedNextAmount = numeral(nextAmount).format('0,0[.]000000');

    return (
        <Modal id='ibcTransferModal' ref={modalRef} modalWidth={750} dataBsBackdrop={'static'} withCloseButton={!isLoading}>
            <img src={Assets.images.info} alt='info' width={42} height={42} />
            <h3 className='mt-4'>{I18n.t('deposit.ibcTransferModal.title')}</h3>
            <div className='row my-5 px-3'>
                <div className='col-5 px-0'>
                    <div className='d-flex flex-column align-items-start text-start flex-grow-1'>
                        <label className='amount-label'>{I18n.t('deposit.ibcTransferModal.prevAmountLabel', { denom: denom.toUpperCase() })}</label>
                        <div className='d-flex flex-row align-items-center w-100 amount-container px-3 py-2'>
                            <img src={DenomsUtils.getIconFromDenom(denom)} alt='cosmos icon' width={30} height={30} />
                            <div className='ms-3 text-nowrap'>
                                <div className='crypto-price'>
                                    {formattedPrevAmount} {denom.toUpperCase()}
                                </div>
                                <div className='fiat-price'>{numeral(Number(prevAmount) * price).format('$0,0[.]00')}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-2 position-relative'>
                    <div className='d-flex align-items-center justify-content-center position-absolute bottom-0 start-50 translate-middle arrow-container'>
                        <img src={Assets.images.arrow} alt='arrow' />
                    </div>
                </div>
                <div className='col-5 px-0'>
                    <div className='d-flex flex-column align-items-start text-start flex-grow-1'>
                        <label className='amount-label'>{I18n.t('deposit.ibcTransferModal.nextAmountLabel', { denom: denom.toUpperCase() })}</label>
                        <div className='d-flex flex-row align-items-center w-100 amount-container px-3 py-2'>
                            <img src={DenomsUtils.getIconFromDenom(denom)} alt='cosmos icon' width={30} height={30} />
                            <div className='ms-3 text-nowrap'>
                                <div className='crypto-price'>
                                    {formattedNextAmount} {denom.toUpperCase()}
                                </div>
                                <div className='fiat-price'>{numeral(Number(nextAmount) * price).format('$0,0[.]00')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Card flat withoutPadding className='deposit-warning my-4'>
                <div
                    dangerouslySetInnerHTML={{
                        __html: I18n.t('deposit.ibcTransferModal.subtitle', {
                            denom: denom.toUpperCase(),
                            prevAmount: numeral(prevAmount).subtract(nextAmount).format('0,0[.]000000'),
                            nextAmount: formattedNextAmount,
                        }),
                    }}
                />
            </Card>
            <div className='d-flex flex-row align-self-stretch justify-content-between'>
                <Button outline className='w-100' data-bs-dismiss='modal' loading={isLoading} disabled={isLoading}>
                    {I18n.t('deposit.ibcTransferModal.cancel')}
                </Button>
                <Button className='w-100 ms-4' loading={isLoading} disabled={isLoading} onClick={onConfirm}>
                    {I18n.t('deposit.ibcTransferModal.cta', { denom: denom.toUpperCase(), nextAmount: formattedNextAmount })}
                </Button>
            </div>
        </Modal>
    );
};

export default IbcTransfer;

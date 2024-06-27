import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone, ErrorCode } from 'react-dropzone';
import Papa from 'papaparse';

import Assets from 'assets';
import { Card } from 'components';
import { DenomsUtils, NumbersUtils, WalletUtils } from 'utils';

import './CsvFileInput.scss';

const isValidRow = (info: unknown): info is [string, string] => {
    return !!(Array.isArray(info) && info[0] && info[1]);
};

interface CsvFileInputProps {
    onValidCsv: (depositDrops: { amount: string; winnerAddress: string }[]) => void;
    onInvalidCsv: (error: string) => void;
    poolNativeDenom: string;
    minDepositAmount?: number;
    className?: string;
    disabled: boolean;
    limit: number;
}

const CsvFileInput = (props: CsvFileInputProps): JSX.Element => {
    const { className, poolNativeDenom, minDepositAmount, disabled, limit, onValidCsv, onInvalidCsv } = props;
    const { t } = useTranslation();

    const [innerLabel, setInnerLabel] = useState(t('depositDrops.depositFlow.fileInputLabel.pending'));
    const [innerSubLabel, setInnerSubLabel] = useState(t('depositDrops.depositFlow.fileInputSubLabel.pending'));
    const [status, setStatus] = useState<'accepted' | 'rejected' | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
        maxSize: 20000000,
        multiple: false,
        disabled,
        onDropAccepted: (files) => {
            Papa.parse(files[0], {
                skipEmptyLines: true,
                complete: (results) => {
                    const drops: {
                        amount: string;
                        winnerAddress: string;
                    }[] = [];
                    let error = '';

                    const data = results.data;
                    data.splice(0, 1);

                    for (let i = 0; i < data.length; i++) {
                        const r = data[i];

                        if (!isValidRow(r)) {
                            error = t('depositDrops.depositFlow.fileInputSubLabel.invalidRow', { row: i + 1 });
                            break;
                        }

                        const amount = r[0];
                        const winnerAddress = r[1];

                        const amountToNumber = Number(amount);

                        if (Number.isNaN(amountToNumber)) {
                            error = t('depositDrops.depositFlow.fileInputSubLabel.invalidAmount', { row: i + 1 });
                            break;
                        }

                        if (amountToNumber < (minDepositAmount || 0)) {
                            error = t('depositDrops.depositFlow.fileInputSubLabel.lessThanMinDeposit', { row: i + 1 });
                            break;
                        }

                        if (!WalletUtils.isAddressValid(winnerAddress, 'lum')) {
                            error = t('depositDrops.depositFlow.fileInputSubLabel.invalidAddress', { row: i + 1 });
                            break;
                        }

                        drops.push({
                            amount: NumbersUtils.convertUnitNumber(amount, DenomsUtils.getNormalDenom(poolNativeDenom), false).toString(),
                            winnerAddress,
                        });
                    }

                    if (error) {
                        setStatus('rejected');
                        setInnerLabel(t('depositDrops.depositFlow.fileInputLabel.pending'));
                        setInnerSubLabel(error);
                        onInvalidCsv(error);
                    } else {
                        setStatus('accepted');
                        setInnerLabel(t('depositDrops.depositFlow.fileInputLabel.success'));
                        setInnerSubLabel(t('depositDrops.depositFlow.fileInputSubLabel.success', { walletCount: drops.length, batchCount: Math.ceil(drops.length / limit) }));
                        onValidCsv([...drops]);
                    }
                },
            });
        },
        onDropRejected: (fileRejections) => {
            let error = '';

            switch (fileRejections[0].errors[0].code) {
                case ErrorCode.TooManyFiles: {
                    error = t('depositDrops.depositFlow.fileInputSubLabel.tooManyFileError');
                    break;
                }
                case ErrorCode.FileInvalidType: {
                    error = t('depositDrops.depositFlow.fileInputSubLabel.fileTypeError');
                    break;
                }
                case ErrorCode.FileTooLarge: {
                    error = t('depositDrops.depositFlow.fileInputSubLabel.fileTooBigError');
                    break;
                }
                default: {
                    error = t('depositDrops.depositFlow.fileInputSubLabel.invalidFile');
                    break;
                }
            }

            setStatus('rejected');
            setInnerLabel(t('depositDrops.depositFlow.fileInputLabel.pending'));
            setInnerSubLabel(error);
            onInvalidCsv(error);
        },
    });

    return (
        <div {...getRootProps()} className='csv-file-input'>
            <Card flat withoutPadding className={`file-input-container py-4 px-2 text-center ${isDragActive ? 'drag-entered' : ''} ${status === 'rejected' ? 'drag-rejected' : ''}  ${className}`}>
                <div className='d-flex flex-column align-items-center'>
                    <input {...getInputProps()} className='d-none' />
                    <div className='icon-container d-flex align-items-center justify-content-center'>
                        <img width={14} height={14} src={status === 'accepted' ? Assets.images.claim : Assets.images.download} className='file-input-icon' />
                    </div>
                    <label className='mt-3 mb-2 label'>{innerLabel}</label>
                    <label className='sublabel text-center mx-4'>{innerSubLabel}</label>
                </div>
            </Card>
        </div>
    );
};

export default CsvFileInput;

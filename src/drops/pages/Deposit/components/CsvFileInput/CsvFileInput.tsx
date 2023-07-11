import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone, ErrorCode } from 'react-dropzone';
import Papa from 'papaparse';
import { LumConstants, LumUtils } from '@lum-network/sdk-javascript';

import Assets from 'assets';
import { Card } from 'components';

import './CsvFileInput.scss';

type ValidCSVRow = { amount: string; winner_address: string };

// eslint-disable-next-line @typescript-eslint/ban-types
function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return Object.hasOwnProperty.call(obj, prop);
}

const isValidRow = (info: unknown): info is ValidCSVRow => {
    return !!(info && hasOwnProperty(info, 'amount') && hasOwnProperty(info, 'winner_address'));
};

interface CsvFileInputProps {
    onValidCsv: (depositDrops: { amount: string; winnerAddress: string }[]) => void;
    onInvalidCsv: (error: string) => void;
    minDepositAmount?: number;
    className?: string;
}

const CsvFileInput = (props: CsvFileInputProps): JSX.Element => {
    const { className, minDepositAmount, onValidCsv, onInvalidCsv } = props;
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
        onDropAccepted: (files) => {
            Papa.parse(files[0], {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const drops = [];
                    let error = '';

                    for (const r of results.data) {
                        if (!isValidRow(r)) {
                            error = t('depositDrops.depositFlow.fileInputSubLabel.invalidFile');
                            break;
                        }

                        if (!LumUtils.isAddressValid(r.winner_address, 'lum')) {
                            error = t('depositDrops.depositFlow.fileInputSubLabel.invalidAddress');
                            break;
                        }

                        const amountToNumber = Number(r.amount);

                        if (Number.isNaN(amountToNumber)) {
                            error = t('depositDrops.depositFlow.fileInputSubLabel.invalidAmount');
                            break;
                        }

                        if (amountToNumber < (minDepositAmount || 0)) {
                            error = t('depositDrops.depositFlow.fileInputSubLabel.lessThanMinDeposit');
                            break;
                        }

                        drops.push({
                            amount: LumUtils.convertUnit({ amount: r.amount, denom: LumConstants.LumDenom }, LumConstants.MicroLumDenom),
                            winnerAddress: r.winner_address,
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
                        setInnerSubLabel(t('depositDrops.depositFlow.fileInputSubLabel.success', { walletCount: drops.length, batchCount: Math.ceil(drops.length / 6) }));
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
                    <label className='sublabel'>{innerSubLabel}</label>
                </div>
            </Card>
        </div>
    );
};

export default CsvFileInput;

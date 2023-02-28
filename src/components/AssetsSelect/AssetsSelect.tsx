import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select, { GroupBase, OptionProps, components } from 'react-select';
import { RootState } from 'redux/store';
import { DenomsUtils, NumbersUtils } from 'utils';

import './AssetsSelect.scss';

interface Props {
    onChange: (value: string) => void;
    value: string;
    options: { value: string; label: string }[];
    label?: string;
    readonly?: boolean;
    className?: string;
}

const AssetOption = (
    props: OptionProps<
        {
            value: string;
            label: string;
        },
        false,
        GroupBase<{
            value: string;
            label: string;
        }>
    >,
) => {
    const assetIcon = DenomsUtils.getIconFromDenom(props.data.value);
    const balances = useSelector((state: RootState) => state.wallet.lumWallet?.balances);
    const balance = balances?.find((b) => b.denom === props.data.value);

    return (
        <components.Option {...props}>
            <div className='d-flex flex-row justify-content-between align-items-center custom-select-option'>
                <div className='d-flex flex-row align-items-center'>
                    {assetIcon && <img src={assetIcon} className='asset-icon me-2' />} {props.data.label}
                </div>
                {balance && <div className='d-flex flex-row align-items-center asset-amount'>{NumbersUtils.formatUnit(balance)}</div>}
            </div>
        </components.Option>
    );
};

const AssetsSelect = ({ options, onChange, value, readonly, label, className }: Props): JSX.Element => {
    const [selectedOptionLabel, setSelectedOptionLabel] = useState<string>(options.find((opt) => opt.value === value)?.label || '');

    useEffect(() => {
        setSelectedOptionLabel(options.find((opt) => opt.value === value)?.label || '');
    }, [value]);

    return (
        <div className={`custom-select ${readonly && 'readonly'} ${className}`}>
            {label && (
                <label htmlFor='custom-select-input' className='form-label ms-2 fw-semibold'>
                    {label}
                </label>
            )}
            {readonly ? (
                <p>
                    {selectedOptionLabel || value}
                    <br />
                    {selectedOptionLabel && <small>({value})</small>}
                </p>
            ) : (
                <Select
                    id='custom-select-input'
                    defaultValue={{ value, label: selectedOptionLabel }}
                    value={{ value, label: selectedOptionLabel }}
                    components={{
                        Option: AssetOption,
                    }}
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            borderRadius: 15,
                            borderColor: 'rgba(86, 52, 222, 0.2)',
                            borderWidth: 2,
                            paddingLeft: '0.5rem',
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem',
                            textTransform: 'uppercase',
                            textAlign: 'left',
                            color: '#5634DE',
                            fontSize: 22,
                        }),
                        option: (provided, state) => ({
                            ...provided,
                            textTransform: 'uppercase',
                            color: '#5634DE',
                            textAlign: 'left',
                            backgroundColor: state.isFocused ? '#F1EDFF' : state.isSelected ? '#000' : '#fff',
                            fontSize: 22,
                        }),
                        dropdownIndicator: (provided) => ({
                            ...provided,
                            color: '#5634DE',
                        }),
                        indicatorSeparator: (provided) => ({
                            ...provided,
                            display: 'none',
                        }),
                    }}
                    options={options}
                    onChange={(val) => {
                        onChange(val?.value || '');
                    }}
                />
            )}
        </div>
    );
};

export default AssetsSelect;

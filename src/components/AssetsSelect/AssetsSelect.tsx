import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import Select, { GroupBase, OptionProps, components, SingleValueProps } from 'react-select';
import { DenomsUtils, NumbersUtils } from 'utils';

import './AssetsSelect.scss';

interface Props {
    onChange: (value: string) => void;
    value: string;
    options: { value: string; label: string }[];
    balances: { denom: string; amount: string }[];
    isLoading?: boolean;
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
    > & {
        balances: { denom: string; amount: string }[];
    },
) => {
    const { balances, ...rest } = props;
    const assetIcon = DenomsUtils.getIconFromDenom(props.data.value);
    const balance = balances?.find((b) => b.denom === props.data.value);

    return (
        <components.Option {...rest}>
            <div className='d-flex flex-row justify-content-between align-items-center custom-select-option'>
                <div className='d-flex flex-row align-items-center'>
                    {assetIcon && <img src={assetIcon} className='menu-asset-icon me-2' />} {props.data.label}
                </div>
                {balance && <div className='d-flex flex-row align-items-center asset-amount'>{NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balance.amount))}</div>}
            </div>
        </components.Option>
    );
};

const AssetValue = (
    props: SingleValueProps<
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
    const icon = DenomsUtils.getIconFromDenom(props.data.value);

    return (
        <components.SingleValue {...props}>
            <div className='d-flex flex-row justify-content-between align-items-center custom-select-option'>
                <div className='d-flex flex-row align-items-center'>
                    {icon && <img src={icon} className='value-asset-icon me-2' />} {props.data.label}
                </div>
            </div>
        </components.SingleValue>
    );
};

const AssetsSelect = ({ balances, options, onChange, value, readonly, label, className, isLoading }: Props): JSX.Element => {
    const [selectedOptionLabel, setSelectedOptionLabel] = useState<string>(options.find((opt) => opt.value === value)?.label || '');

    useEffect(() => {
        setSelectedOptionLabel(options.find((opt) => opt.value === value)?.label || '');
    }, [value, options]);

    return (
        <div className={`custom-select ${readonly && 'readonly'} ${className}`}>
            {label && (
                <label htmlFor='custom-select-input' className='form-label ms-2 fw-semibold'>
                    {isLoading ? <Skeleton width={120} /> : label}
                </label>
            )}
            {readonly ? (
                <p>
                    {selectedOptionLabel || value}
                    <br />
                    {selectedOptionLabel && <small>({value})</small>}
                </p>
            ) : isLoading ? (
                <Skeleton height={60} />
            ) : (
                <Select
                    id='custom-select-input'
                    value={{ value, label: selectedOptionLabel }}
                    components={{
                        Option: (props) => <AssetOption {...props} balances={balances} />,
                        SingleValue: AssetValue,
                    }}
                    isSearchable={false}
                    isClearable={false}
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            borderRadius: 15,
                            borderColor: 'rgba(86, 52, 222, 0.2)',
                            borderWidth: 2,
                            paddingLeft: '0.5rem',
                            paddingTop: '0.5rem',
                            paddingBottom: '0.5rem',
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
                            backgroundColor: state.isFocused ? 'rgba(86, 52, 222, 0.2)' : state.isSelected ? '#F1EDFF' : '#fff',
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
                        singleValue: (provided) => ({
                            ...provided,
                            color: '#5634DE',
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

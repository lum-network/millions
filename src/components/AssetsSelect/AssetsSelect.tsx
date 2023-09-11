import { SmallerDecimal } from 'components';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import Select, { GroupBase, OptionProps, components, SingleValueProps } from 'react-select';

import { useColorScheme } from 'hooks';
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
    disabled?: boolean;
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
                    {assetIcon && <img src={assetIcon} className='menu-asset-icon me-2 no-filter' />} {props.data.label}
                </div>
                {balance && <SmallerDecimal className='asset-amount' nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balance.amount))} />}
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
                    {icon && <img src={icon} className='value-asset-icon me-3 no-filter' />} {props.data.label}
                </div>
            </div>
        </components.SingleValue>
    );
};

const AssetsSelect = ({ balances, options, onChange, value, readonly, label, className, isLoading, disabled }: Props): JSX.Element => {
    const [selectedOptionLabel, setSelectedOptionLabel] = useState<string>(options.find((opt) => opt.value === value)?.label || '');
    const [colorBg, setColorBg] = useState(getComputedStyle(document.body).getPropertyValue('--color-white'));
    const [colorText, setColorText] = useState(getComputedStyle(document.body).getPropertyValue('--color-primary'));

    const { isDark } = useColorScheme();

    useEffect(() => {
        setColorBg(getComputedStyle(document.body).getPropertyValue('--color-white'));
        setColorText(getComputedStyle(document.body).getPropertyValue('--color-primary'));
    }, [isDark]);

    useEffect(() => {
        setSelectedOptionLabel(options.find((opt) => opt.value === value)?.label || '');
    }, [value, options]);

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
                    isDisabled={disabled}
                    styles={{
                        menu: (provided) => ({
                            ...provided,
                            backgroundColor: colorBg,
                        }),
                        control: (provided) => ({
                            ...provided,
                            borderRadius: 12,
                            borderColor: 'rgba(86, 52, 222, 0.2)',
                            borderWidth: 2,
                            paddingTop: '0.75rem',
                            paddingLeft: '1.5rem',
                            paddingRight: '1.5rem',
                            paddingBottom: '0.75rem',
                            textTransform: 'uppercase',
                            textAlign: 'left',
                            color: colorText,
                            fontSize: 22,
                            backgroundColor: colorBg,
                        }),
                        option: (provided, state) => ({
                            ...provided,
                            textTransform: 'uppercase',
                            color: colorText,
                            textAlign: 'left',
                            backgroundColor: state.isFocused ? (isDark ? '#9277FF' : 'rgba(86, 52, 222, 0.2)') : state.isSelected ? (isDark ? '#482673' : '#F1EDFF') : colorBg,
                            fontSize: 22,
                        }),
                        dropdownIndicator: (provided) => ({
                            ...provided,
                            color: colorText,
                        }),
                        indicatorSeparator: (provided) => ({
                            ...provided,
                            display: 'none',
                        }),
                        singleValue: (provided) => ({
                            ...provided,
                            color: colorText,
                        }),
                        valueContainer: (provided) => ({
                            ...provided,
                            paddingLeft: 0,
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

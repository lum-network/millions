import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import Select, { GroupBase, OptionProps, components, SingleValueProps } from 'react-select';
import { DenomsUtils } from 'utils';
import { PoolModel } from 'models';

interface Props {
    onChange: (value: string) => void;
    value: string;
    options: { value: string; label: string }[];
    pools: PoolModel[];
    isLoading?: boolean;
    label?: string;
    readonly?: boolean;
    className?: string;
    disabled?: boolean;
    backgroundColor?: string;
}

const PoolOption = (
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
        pools: PoolModel[];
    },
) => {
    const assetIcon = DenomsUtils.getIconFromDenom(props.pools.find((pool) => pool.poolId.toString() === props.data.value)?.nativeDenom || '');

    return (
        <components.Option {...props}>
            <div className='d-flex flex-row justify-content-between align-items-center custom-select-option'>
                <div className='d-flex flex-row align-items-center'>
                    {assetIcon && <img src={assetIcon} className='menu-asset-icon me-2' />} {props.data.label}
                </div>
            </div>
        </components.Option>
    );
};

const PoolValue = (
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
    > & {
        pools: PoolModel[];
    },
) => {
    const icon = DenomsUtils.getIconFromDenom(props.pools.find((pool) => pool.poolId.toString() === props.data.value)?.nativeDenom || '');

    return (
        <components.SingleValue {...props}>
            <div className='d-flex flex-row justify-content-between align-items-center custom-select-option'>
                <div className='d-flex flex-row align-items-center'>
                    {icon && <img src={icon} className='value-asset-icon me-3' />} {props.data.label}
                </div>
            </div>
        </components.SingleValue>
    );
};

const PoolSelect = ({ pools, options, onChange, value, readonly, label, className, isLoading, disabled, backgroundColor = '#FFF' }: Props): JSX.Element => {
    const [selectedOptionLabel, setSelectedOptionLabel] = useState<string>(options.find((opt) => opt.value === value)?.label || '');

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
                        Option: (props) => <PoolOption {...props} pools={pools} />,
                        SingleValue: (props) => <PoolValue {...props} pools={pools} />,
                    }}
                    isSearchable={false}
                    isClearable={false}
                    isDisabled={disabled}
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            borderRadius: 12,
                            borderColor: 'rgba(86, 52, 222, 0.2)',
                            borderWidth: 2,
                            paddingTop: '0.75rem',
                            paddingLeft: '1.5rem',
                            paddingRight: '1.5rem',
                            paddingBottom: '0.75rem',
                            textAlign: 'left',
                            color: '#5634DE',
                            fontSize: 22,
                            backgroundColor,
                        }),
                        option: (provided, state) => ({
                            ...provided,
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

export default PoolSelect;

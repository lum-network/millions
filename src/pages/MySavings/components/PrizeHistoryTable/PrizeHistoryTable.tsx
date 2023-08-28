import React from 'react';
import { MetadataModel, PrizeModel } from 'models';
import { Table } from 'components';

interface IProps {
    prizes: PrizeModel[];
    onPageChange: (page: number) => void;
    pagination: Partial<MetadataModel>;
}

const PrizeHistoryTable = ({ prizes, onPageChange, pagination }: IProps) => {
    const renderRow = (prize: PrizeModel, index: number) => {
        return (
            <tr key={`prize-${prize.id}-${index}`}>
                <td data-label='Date' className='align-middle'>
                    1
                </td>
                <td data-label='Prize' className='align-middle'>
                    2
                </td>
                <td data-label='Amount' className='align-middle'>
                    3
                </td>
                <td data-label='Status' className='align-middle'>
                    4
                </td>
            </tr>
        );
    };

    return (
        <Table pagination={pagination} onPageChange={onPageChange}>
            {prizes.map((prize, index) => renderRow(prize, index))}
        </Table>
    );
};

export default PrizeHistoryTable;

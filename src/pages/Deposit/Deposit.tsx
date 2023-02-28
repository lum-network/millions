import React from 'react';
import { useParams } from 'react-router-dom';

const Deposit = () => {
    const { denom } = useParams();
    return (
        <div>
            <h1>Deposit {denom}</h1>
        </div>
    );
};

export default Deposit;

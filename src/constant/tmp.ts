export {};

// import { Deposit, DepositState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';
// import { DrawState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/draw';
// import { Pool, PoolState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/pool';
// import { Prize, PrizeState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
// import Long from 'long';
//
// export const POOLS: Pool[] = [
//     {
//         poolId: Long.fromNumber(1),
//         denom: 'ibc/1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F',
//         nativeDenom: 'uatom',
//         chainId: 'cosmoshub-4',
//         connectionId: 'connection-1',
//         transferChannelId: 'channel-1',
//         controllerPortId: 'controller-port-1',
//         validators: {
//             ['val1']: {
//                 operatorAddress: 'cosmosvaloper1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
//                 isEnabled: true,
//                 bondedAmount: '100000000000000000000000000',
//             },
//         },
//         bech32PrefixAccAddr: 'cosmos',
//         bech32PrefixValAddr: 'cosmosvaloper',
//         minDepositAmount: '1000000',
//         drawSchedule: {
//             initialDrawAt: new Date('2023-17-01T00:00:00.000Z'),
//             drawDelta: {
//                 seconds: Long.fromNumber(10),
//                 nanos: 0,
//             },
//         },
//         prizeStrategy: {
//             prizeBatches: [
//                 {
//                     poolPercent: Long.fromNumber(10),
//                     quantity: Long.fromNumber(10),
//                     drawProbability: '1/1000',
//                 },
//                 {
//                     poolPercent: Long.fromNumber(10),
//                     quantity: Long.fromNumber(500),
//                     drawProbability: '1/1000',
//                 },
//                 {
//                     poolPercent: Long.fromNumber(10),
//                     quantity: Long.fromNumber(100),
//                     drawProbability: '1/1000',
//                 },
//                 {
//                     poolPercent: Long.fromNumber(10),
//                     quantity: Long.fromNumber(10),
//                     drawProbability: '1/1000',
//                 },
//             ],
//         },
//         moduleAccountAddress: 'cosmos1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
//         icaAccountAddress: 'cosmos1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
//         nextDrawId: new Long(1),
//         tvlAmount: '1000000000000',
//         depositorsCount: Long.fromNumber(10),
//         lastDrawCreatedAt: new Date('2023-03-12T00:00:00.000Z'),
//         lastDrawState: DrawState.DRAW_STATE_UNSPECIFIED,
//         state: PoolState.POOL_STATE_CREATED,
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//     },
//     {
//         poolId: Long.fromNumber(2),
//         denom: 'ibc/1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F',
//         nativeDenom: 'uosmo',
//         chainId: 'osmosis-1',
//         connectionId: 'connection-1',
//         transferChannelId: 'channel-115',
//         controllerPortId: 'controller-port-1',
//         validators: {
//             ['val1']: {
//                 operatorAddress: 'osmovaloper1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
//                 isEnabled: true,
//                 bondedAmount: '100000000000000000000000000',
//             },
//         },
//         bech32PrefixAccAddr: 'osmo',
//         bech32PrefixValAddr: 'osmovaloper',
//         minDepositAmount: '1000000',
//         drawSchedule: {
//             initialDrawAt: new Date('2023-08-01T00:00:00.000Z'),
//             drawDelta: {
//                 seconds: Long.fromNumber(10),
//                 nanos: 0,
//             },
//         },
//         prizeStrategy: {
//             prizeBatches: [
//                 {
//                     poolPercent: Long.fromNumber(10),
//                     quantity: Long.fromNumber(10),
//                     drawProbability: '1/1000',
//                 },
//                 {
//                     poolPercent: Long.fromNumber(10),
//                     quantity: Long.fromNumber(500),
//                     drawProbability: '1/1000',
//                 },
//                 {
//                     poolPercent: Long.fromNumber(10),
//                     quantity: Long.fromNumber(100),
//                     drawProbability: '1/1000',
//                 },
//                 {
//                     poolPercent: Long.fromNumber(10),
//                     quantity: Long.fromNumber(10),
//                     drawProbability: '1/1000',
//                 },
//             ],
//         },
//         moduleAccountAddress: 'osmo1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
//         icaAccountAddress: 'osmo1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
//         nextDrawId: Long.fromNumber(10),
//         tvlAmount: '1000000000000',
//         depositorsCount: Long.fromNumber(10),
//         //lastDrawCreatedAt: new Date('2023-03-17T00:00:00.000Z'),
//         lastDrawState: DrawState.DRAW_STATE_UNSPECIFIED,
//         state: PoolState.POOL_STATE_CREATED,
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//     },
// ];
//
// export const USER_DEPOSITS: Deposit[] = [
//     {
//         poolId: Long.fromNumber(1),
//         depositId: Long.fromNumber(1),
//         state: DepositState.DEPOSIT_STATE_IBC_TRANSFER,
//         errorState: DepositState.DEPOSIT_STATE_UNSPECIFIED,
//         depositorAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         amount: {
//             amount: '1000000000',
//             denom: 'uatom',
//         },
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//         isSponsor: false,
//     },
//     {
//         poolId: Long.fromNumber(2),
//         depositId: Long.fromNumber(2),
//         state: DepositState.DEPOSIT_STATE_SUCCESS,
//         errorState: DepositState.DEPOSIT_STATE_UNSPECIFIED,
//         depositorAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         amount: {
//             amount: '1000000000',
//             denom: 'uosmo',
//         },
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//         isSponsor: false,
//     },
//     {
//         poolId: Long.fromNumber(2),
//         depositId: Long.fromNumber(3),
//         state: DepositState.DEPOSIT_STATE_FAILURE,
//         errorState: DepositState.DEPOSIT_STATE_UNSPECIFIED,
//         depositorAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         amount: {
//             amount: '1000000',
//             denom: 'uosmo',
//         },
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//         isSponsor: false,
//     },
// ];
//
// export const ATOM_POOL_PRIZES: Prize[] = [
//     {
//         poolId: Long.fromNumber(1),
//         drawId: Long.fromNumber(1),
//         prizeId: Long.fromNumber(1),
//         amount: {
//             amount: '1000000000',
//             denom: 'uatom',
//         },
//         state: PrizeState.PRIZE_STATE_UNSPECIFIED,
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//     },
//     {
//         poolId: Long.fromNumber(1),
//         drawId: Long.fromNumber(1),
//         prizeId: Long.fromNumber(2),
//         amount: {
//             amount: '1000000000',
//             denom: 'uatom',
//         },
//         state: PrizeState.PRIZE_STATE_UNSPECIFIED,
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//     },
//     {
//         poolId: Long.fromNumber(1),
//         drawId: Long.fromNumber(1),
//         prizeId: Long.fromNumber(3),
//         amount: {
//             amount: '1000000000',
//             denom: 'uatom',
//         },
//         state: PrizeState.PRIZE_STATE_UNSPECIFIED,
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//     },
// ];
//
// export const OSMO_POOL_PRIZES: Prize[] = [
//     {
//         poolId: Long.fromNumber(2),
//         drawId: Long.fromNumber(1),
//         prizeId: Long.fromNumber(1),
//         amount: {
//             amount: '1000000000',
//             denom: 'uosmo',
//         },
//         state: PrizeState.PRIZE_STATE_UNSPECIFIED,
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//     },
//     {
//         poolId: Long.fromNumber(2),
//         drawId: Long.fromNumber(1),
//         prizeId: Long.fromNumber(2),
//         amount: {
//             amount: '1000000000',
//             denom: 'uosmo',
//         },
//         state: PrizeState.PRIZE_STATE_UNSPECIFIED,
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//     },
//     {
//         poolId: Long.fromNumber(2),
//         drawId: Long.fromNumber(1),
//         prizeId: Long.fromNumber(3),
//         amount: {
//             amount: '1000000000',
//             denom: 'uosmo',
//         },
//         state: PrizeState.PRIZE_STATE_UNSPECIFIED,
//         winnerAddress: 'lum1unz5900lu4hcp542x8lc97fquehpxurklscagh',
//         createdAtHeight: Long.fromNumber(10),
//         updatedAtHeight: Long.fromNumber(10),
//         createdAt: new Date('2021-08-03T00:00:00.000Z'),
//         updatedAt: new Date('2023-03-03T00:00:00.000Z'),
//     },
// ];

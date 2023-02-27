import atom from 'assets/images/chains/atom.svg';
import osmo from 'assets/images/chains/osmo.svg';
import lum from 'assets/images/chains/lum.svg';
import evmos from 'assets/images/chains/evmos.svg';
import cre from 'assets/images/chains/cre.svg';

export const getLogoFromId = (id: string) => {
    switch (id) {
        case 'atom':
            return atom;
        case 'osmo':
            return osmo;
        case 'lum':
            return lum;
        case 'evmos':
            return evmos;
        case 'cre':
            return cre;
        default:
            return atom;
    }
};

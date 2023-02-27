import atom from 'assets/images/chains/atom.svg';
import cre from 'assets/images/chains/cre.svg';
import evmos from 'assets/images/chains/evmos.svg';
import osmo from 'assets/images/chains/osmo.svg';
import lum from 'assets/images/chains/lum.svg';

interface DenomsIcons {
    [key: string]: string;
    atom: string;
    cre: string;
    evmos: string;
    lum: string;
    osmo: string;
}

export const DENOMS_ICONS: DenomsIcons = {
    atom,
    cre,
    evmos,
    lum,
    osmo,
};

export const ALLOWED_DENOMS = ['atom', 'evmos', 'lum', 'cre', 'osmo'];

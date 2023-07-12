import { FirebaseConstants, NavigationConstants } from 'constant';
import React from 'react';
import { Firebase, I18n } from 'utils';

const Footer = () => {
    return (
        <footer>
            <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-4 gy-4'>
                <div className='col'>
                    <div className='footer-title'>{I18n.t('landing.footer.learn.title')}</div>
                    <div className='d-flex flex-column mt-2'>
                        <a href={NavigationConstants.INTERCHAIN_WALLETS_DOC} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LEARN_CLICK)}>
                            {I18n.t('landing.footer.learn.wallet')}
                        </a>
                        <a
                            className='my-2'
                            href={NavigationConstants.INTERCHAIN_TOKENS_DOC}
                            target='_blank'
                            rel='noreferrer'
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LEARN_CLICK)}
                        >
                            {I18n.t('landing.footer.learn.tokens')}
                        </a>
                        <a href={NavigationConstants.FAQ_DOC} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LEARN_CLICK)}>
                            {I18n.t('landing.footer.learn.faq')}
                        </a>
                    </div>
                </div>
                <div className='col'>
                    <div className='footer-title'>{I18n.t('landing.footer.documentation.title')}</div>
                    <div className='d-flex flex-column mt-2'>
                        <a href={NavigationConstants.LEXICON_DOC} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DOCUMENTATION_CLICK)}>
                            {I18n.t('landing.footer.documentation.lexicon')}
                        </a>
                        <a
                            className='my-2'
                            href={NavigationConstants.MAIN_RULES_DOC}
                            target='_blank'
                            rel='noreferrer'
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DOCUMENTATION_CLICK)}
                        >
                            {I18n.t('landing.footer.documentation.rules')}
                        </a>
                        <a href={NavigationConstants.POOL_MANAGEMENT_DOC} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DOCUMENTATION_CLICK)}>
                            {I18n.t('landing.footer.documentation.pool')}
                        </a>
                        <a
                            className='my-2'
                            href={NavigationConstants.DEPOSITS_AND_WITHDRAWALS_DOC}
                            target='_blank'
                            rel='noreferrer'
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DOCUMENTATION_CLICK)}
                        >
                            {I18n.t('landing.footer.documentation.deposits')}
                        </a>
                        <a href={NavigationConstants.DRAW_MECHANISM_DOC} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DOCUMENTATION_CLICK)}>
                            {I18n.t('landing.footer.documentation.drawMechanism')}
                        </a>
                        <a
                            className='my-2'
                            href={NavigationConstants.DOCUMENTATION}
                            target='_blank'
                            rel='noreferrer'
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DOCUMENTATION_CLICK)}
                        >
                            {I18n.t('landing.footer.documentation.allDoc')}
                        </a>
                    </div>
                </div>
                <div className='col'>
                    <div className='footer-title'>{I18n.t('landing.footer.community.title')}</div>
                    <div className='d-flex flex-column mt-2'>
                        <a href={NavigationConstants.TWITTER} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.TWITTER_CLICK)}>
                            {I18n.t('landing.footer.community.twitter')}
                        </a>
                        <a className='my-2' href={NavigationConstants.DISCORD} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DISCORD_CLICK)}>
                            {I18n.t('landing.footer.community.discord')}
                        </a>
                        <a href={NavigationConstants.GITHUB} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.GITHUB_CLICK)}>
                            {I18n.t('landing.footer.community.github')}
                        </a>
                        <a className='my-2' href={NavigationConstants.MEDIUM} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.MEDIUM_CLICK)}>
                            {I18n.t('landing.footer.community.medium')}
                        </a>
                    </div>
                </div>
                <div className='col'>
                    <div className='footer-title'>{I18n.t('landing.footer.builtOn.title')}</div>
                    <div className='d-flex flex-column mt-2'>
                        <a href={NavigationConstants.TANDC} target='_blank' rel='noreferrer' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.TERMS_CLICK)}>
                            {I18n.t('landing.footer.builtOn.tAndC')}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

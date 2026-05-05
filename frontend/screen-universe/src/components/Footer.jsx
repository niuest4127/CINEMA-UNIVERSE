// Footer.jsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import fbIcon from "/facebook.png"
import igIcon from "/instagram.png"
import ttIcon from "/tiktok.png"
import ytIcon from "/youtube.png"

function Footer() {
  const { t } = useTranslation();

  return (

    <footer className="global-footer"> 
      <div className="left">
        <Link to="/">
          <h4><strong>SCR<span className='shadow'>EE</span>N UNIVERSE</strong></h4>
          <h6>© 2026, {t('footer.rights')}</h6>
        </Link>
      </div>
      <div className="right">
        <div className="socialMedia">
          <h5><strong>{t('footer.followUs')}</strong></h5>
          <div className='socialIcons'>
            <img src={fbIcon} className='socialIcon' alt=""/>
            <img src={igIcon} className='socialIcon' alt="" />
            <img src={ttIcon} className='socialIcon' alt=""/>
            <img src={ytIcon} className='socialIcon' alt="" />
          </div>
        </div>
        <div className="visitUs">
          <h5><strong>{t('footer.visitUs')}</strong></h5>

          <h6>Łodź Wroblewskiego 19</h6>
        </div>
        <div className="contactUs">
          <h5><strong>{t('footer.contactUs')}</strong></h5>
          <h6>{t('footer.phone')}: +48 634 124 645</h6>
          <h6>{t('footer.mail')}: screen_universee@cinema.pl</h6>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
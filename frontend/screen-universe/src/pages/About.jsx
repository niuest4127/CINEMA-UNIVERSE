import React from 'react';
import { useTranslation } from 'react-i18next'; 
import './About.css';

const About = () => {
  const { t } = useTranslation(); 

  return (
    <div className="about-container">
      
      <div className="about-header">
        <h1> SCR<span className='shadow'>EE</span>N UNIVERSE</h1>
  
        <p>{t('about.subtitle')}</p> 
      </div>

      <div className="about-content glass-panel">
        
        <div className="about-text-section">
          <h2>{t('about.historyTitle')}</h2>
          <p dangerouslySetInnerHTML={{ __html: t('about.historyP1') }}></p>
          <p>{t('about.historyP2')}</p>
        </div>

        <hr className="about-divider" />

        <div className="about-location-section">
          <div className="location-info">
            <h2>{t('about.locationTitle')}</h2>
            <p><strong>{t('about.addressLabel')}</strong> ul. Piotrkowska 100, 90-001 Łódź</p>
            <p><strong>{t('about.hoursLabel')}</strong> {t('about.days')}: 09:00 - 23:30</p>
            <p><strong>{t('about.contactLabel')}</strong> kontakt@screenuniverse.pl | +48 123 456 789</p>
          </div>

          <div className="map-wrapper">
            <iframe 
              title="Kino Location"
              src="https://maps.google.com/maps?q=Piotrkowska%20100,%20%C5%81%C3%B3d%C5%BA&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
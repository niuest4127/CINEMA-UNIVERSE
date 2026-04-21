import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next"; // 1. Dodany import
import "./Home.css";
import videoBg from "../assets/videoBg.webm";
import audioIcon from "/audioIcon/icons8-audio-wave-gradient-96.png";
import lightIcon from "/lightIcon/icons8-light-gradient-96.png";
import engineIcon from "/engineIcon/icons8-processor-gradient-96.png";
import Footer from "../components/Footer";
import movieIcon from "/movieicon/icons8-video-gradient-96.png";
import userIcon from "/usericon/icons8-user-default-gradient-96.png";
import starIcon from "/staricon/icons8-star-gradient-96.png";
import videoBottom from "../assets/videoBottom.webm";

// --- IMPORTUJEMY NASZ LOADER ---
import GlobalCinemaLoader from "../components/GlobalCinemaLoader"; 

const VideoScroller = () => {
  const { t } = useTranslation(); // 2. Inicjalizacja hooka

  const [movies, setMovies] = useState([]); 
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0); 
  
  // --- NOWY STAN: Czy strona pobiera dane? ---
  const [isPageLoading, setIsPageLoading] = useState(true); 

  // Pobieranie filmów i sterowanie Loaderem
  useEffect(() => {
    setIsPageLoading(true); // Na starcie zawsze włączamy loader

    fetch('http://localhost:8080/api/movies')
      .then((res) => res.json())
      .then((data) => {
        const sortedMovies = data.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        setMovies(sortedMovies.slice(0, 4));
        
        // WYŁĄCZAMY LOADER po poprawnym pobraniu!
        // Używamy minimalnego opóźnienia (np. 500ms), by zredukować "mruganie" loadera 
        // przy bardzo szybkim internecie i upewnić się, że wideo w tle zdąży załadować klatkę.
        setTimeout(() => setIsPageLoading(false), 1500);
      })
      .catch((err) => {
        console.error("Błąd pobierania filmów:", err);
        setIsPageLoading(false); // W przypadku błędu też musimy go wyłączyć, by strona nie zacięła się na zawsze
      });
  }, []); // [] oznacza, że wykona się za każdym razem, gdy użytkownik wejdzie na tę stronę


  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const statsRef = useRef(null);
  const statsStarted = useRef(false);
  const activeSectionRef = useRef(0);
  const videoStateRef = useRef({
    phase: "looping",
    currentSection: 0
  });

  const config = [
    { transitionIn: 0,    loop: [0, 4] },
    { transitionIn: 4,    loop: [5.5, 10] },
    { transitionIn: 5.5,  loop: [5.5, 10] },
    { transitionIn: 11.5, loop: [13.5, 18] },
    { transitionIn: 18,   loop: [18, 19], isOutro: true }
  ];

  const rewindSpeed = 0.05;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSectionRef.current = Number(entry.target.dataset.index);
          }
        });
      },
      { threshold: 0.3 } 
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId;

    const updateVideo = () => {
      const state = videoStateRef.current;
      const targetSec = activeSectionRef.current;

      if (state.phase === "looping" && state.currentSection !== targetSec) {
        const currentConfig = config[state.currentSection];
        const targetConfig = config[targetSec];
        
        const isSameVideoState = 
          currentConfig.loop[0] === targetConfig.loop[0] && 
          currentConfig.loop[1] === targetConfig.loop[1];

        if (isSameVideoState) {
          state.currentSection = targetSec;
        } else if (targetSec > state.currentSection) {
          state.phase = "transition_down";
          video.currentTime = config[targetSec].transitionIn; 
          video.play();
        } else {
          state.phase = "transition_up";
          video.pause();
          video.currentTime = config[state.currentSection].loop[0]; 
        }
      }

      const currentConfig = config[state.currentSection];
      const targetConfig = config[targetSec];

      if (state.phase === "looping") {
        if (currentConfig.isOutro) {
          if (video.currentTime >= currentConfig.loop[1]) {
            video.pause();
          } else if (video.paused) {
            video.play();
          }
        } else {
          if (video.currentTime >= currentConfig.loop[1] || video.currentTime < currentConfig.loop[0]) {
            video.currentTime = currentConfig.loop[0];
          }
          if (video.paused) video.play();
        }
      } 
      else if (state.phase === "transition_down") {
        if (video.paused) video.play(); 
        if (video.currentTime >= targetConfig.loop[1]) {
          state.phase = "looping";
          state.currentSection = targetSec;
          if (!targetConfig.isOutro) {
            video.currentTime = targetConfig.loop[0];
          }
        }
      } 
      else if (state.phase === "transition_up") {
        video.pause();
        video.currentTime -= rewindSpeed;
        if (video.currentTime <= targetConfig.loop[1]) {
          state.phase = "looping";
          state.currentSection = targetSec;
          video.currentTime = targetConfig.loop[0]; 
          video.play();
        }
      }

      animationFrameId = requestAnimationFrame(updateVideo);
    };

    animationFrameId = requestAnimationFrame(updateVideo);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

useEffect(() => {
  const section = statsRef.current;
  if (!section) return;

  const numbers = section.querySelectorAll(".number");

const animateNumbers = () => {
  numbers.forEach((num) => {
    const target = +num.getAttribute("data-target");

    // 🔥 różne starty
    let start = 0;

    if (target >= 11000) start = target - 1000;   // 10000 → 12000
    else if (target >= 300) start = target - 50;  // 300 → 350
    else start = 1; // rating

    const duration = 3000; // ms
    const startTime = performance.now();

    const update = (currentTime) => {
      const progress = (currentTime - startTime) / duration;

      // 🔥 easing (zwalnia na końcu)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const current = start + (target - start) * easeOut;

      if (progress < 1) {
        if (target >= 1000) {
          num.textContent = Math.floor(current).toLocaleString();
        } else if (target < 10) {
          num.textContent = current.toFixed(1); // rating np 4.9
        } else {
          num.textContent = Math.floor(current);
        }

        requestAnimationFrame(update);
      } else {
        num.textContent =
          target >= 1000
            ? target.toLocaleString()
            : target;
      }
    };

    requestAnimationFrame(update);
  });
};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsStarted.current) {
          section.classList.add("show");
          animateNumbers();
          statsStarted.current = true;
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(section);

  return () => observer.disconnect();
}, []);


return (
  <>
  {/* 1. EKRAN ŁADOWANIA NA WIERZCHU:
        Wyświetla się na absolutnej górze (z-index) tylko wtedy, gdy isPageLoading === true.
        Nie blokuje renderowania reszty komponentów pod spodem!
      */}
      {isPageLoading && <GlobalCinemaLoader />}
    <div className="video-scroller-container">
      
      <video
        ref={videoRef}
        src={videoBg}
        className="video-background"
        muted
        playsInline
        autoPlay
      />
      
      {/* Kontener na Twoje sekcje nakładające się na wideo */}
      <div ref={containerRef} className="HomeSectionContainer">
        
        {/* SEKCJA 1 */}
        <div 
          data-index={0} 
          ref={(el) => (sectionRefs.current[0] = el)} 
          className="section1"
        >
          <div className="sec1Container">
            <h6>{t('home.welcomeTo')}</h6>
            {/* Zostawiłem logo SCREEN UNIVERSE jako brand name */}
            <h1>SCR<span className="shadow">EE</span>N UNIVERSE</h1>
            <h5>{t('home.sec1Subtitle')}</h5>
            <button className="glassBtn">{t('home.whatIsBtn')}</button>
          </div>
        </div>

        {/* SEKCJA 2 */}
        <div 
          data-index={1} 
          ref={(el) => (sectionRefs.current[1] = el)} 
          className="section2"
        >
          <div className="sec2container">
            <h5>{t('home.sec2Title')}</h5>
            {/* Podzieliłem tekst, by zachować efekt 'shadow' */}
            <h1>{t('home.sec2Heading_part1')}<span className="shadow">{t('home.sec2Heading_shadow')}</span>{t('home.sec2Heading_part2')}</h1>
          </div>
            <div className="sec2container flex-row">
              <section><img src={lightIcon} alt="" /><h5>{t('home.feature1')}</h5></section>
              <section><img src={audioIcon} alt="" /><h5>{t('home.feature2')}</h5></section>
              <section><img src={engineIcon} alt="" /><h5>{t('home.feature3')}</h5></section>
          </div>
       
        </div>

        {/* SEKCJA 3 */}
        <div 
          data-index={2} 
          ref={(el) => (sectionRefs.current[2] = el)} 
          className="section3"
        >
           <div className="sec3container">
            <h6>{t('home.sec3Title')}</h6>
            <div>
              <h1>{t('home.sec3Heading_part1')}<span className="shadow">{t('home.sec3Heading_shadow')}</span>{t('home.sec3Heading_part2')}</h1>
              <h6>{t('home.sec3Subtitle')}</h6>
            </div>
            <div>
              <button className="glassBtn">{t('home.exploreBtn')}</button>
            </div>
          </div>
         
        </div>

        {/* SEKCJA 4 */}
        <div 
          data-index={3} 
          ref={(el) => (sectionRefs.current[3] = el)} 
          className="section4"
        >
              <div className="sec4Container">
            <h6> {t('home.sec4Title')}</h6>
            <div>
          <h1>{t('home.sec4Heading_part1')}<span className="shadow">{t('home.sec4Heading_shadow')}</span>{t('home.sec4Heading_part2')}</h1>
          <h6>{t('home.sec4Subtitle')}</h6>
          </div>
          <button className="glassBtn">{t('home.registerBtn')}</button>
          </div>
        </div>

      </div>

    {/* SEKCJA 5 - NAJNOWSZE PREMIERY */}
      <div 
        data-index={4} 
        ref={(el) => (sectionRefs.current[4] = el)} 
        className="section5"
      >
     
           <h1>
           {t('home.sec5Heading_part1')}<span className="shadow">{t('home.sec5Heading_shadow')}</span>{t('home.sec5Heading_part2')}
          </h1>
          
          <div className="movie-buttons" >
            {movies.map((movie, index) => (
              <button 
                  key={movie.id} 
                  className={`premiereBtn ${selectedMovieIndex === index ? "hovered" : ""}`}
                  onClick={() => setSelectedMovieIndex(index)}
                >
                  {movie.title}
                </button>
            ))}
          </div>

          {/* Renderujemy zawartość TYLKO jeśli filmy się już pobrały */}
          {movies.length > 0 && (
            <div key={selectedMovieIndex} className="homeMain fade-in" >
              
              {/* LEWA STRONA: Informacje */}
              <div className="left" >
                <h2 >{movies[selectedMovieIndex].title}</h2>
                <h6 >
                   {t('home.runTime')} {movies[selectedMovieIndex].durationMin} min
                </h6>
                <p >{movies[selectedMovieIndex].shortDescription}</p>
                <p><strong>{t('home.director')}</strong> {movies[selectedMovieIndex].director}</p>
                <p><strong>{t('home.cast')}</strong> {movies[selectedMovieIndex].mainCast}</p>
                <p><strong>{t('home.releaseDate')} </strong>{movies[selectedMovieIndex].releaseDate} </p>
                <p><strong>{t('home.age')}</strong> {movies[selectedMovieIndex].minimumAge}+</p>
                <p><strong>{t('home.genres')}</strong> {movies[selectedMovieIndex].genres} </p>
                
                {/* Opcjonalny przycisk do przejścia do Repertuaru */}
                <button className="glassBtn">{t('home.buyTicketBtn')}</button>
              </div>

              {/* PRAWA STRONA: Plakat */}
              <div className="right">
                  <img src={movies[selectedMovieIndex].posterUrl} alt="" />
                  <div className="blurBg"><img src={movies[selectedMovieIndex].posterUrl} alt="" /></div>
              </div>

            </div>
          )}
        </div>
    <div 
        data-index={4} 
        ref={(el) => (sectionRefs.current[4] = el)} 
        className="section6"
      >
              <video
    autoPlay
    muted
    loop
    playsInline
    className="section6-video"
  >
    <source src={videoBottom} type="video/mp4" />
  </video>
           <div ref={statsRef} className="statsSection">
              <h1>{t('home.statsTitle')}</h1>

              <div className="statsGrid">
                
                <div className="stat">
                  <div className="left">
                    <img src={starIcon} alt=""  />
                  </div>
                  <div className="right">
                    <div className="statTop">
                    <span className="number" data-target="5">1</span>{t('home.googleReviews')}
                  </div>
                  <p>{t('home.stat1Desc')}</p>
                </div>

                  </div>
                  
                <div className="stat">
             
                    <div className="left">
                      <img src={userIcon} alt=""  />
                    </div>
                    <div className="right">
                           <div className="statTop">
              <span className="number" data-target="12000">0</span> {t('home.visitors')}
                  </div>
                  <p>{t('home.stat2Desc')}</p>
                    </div>
      
                </div>

                <div className="stat">

                    <div className="left">
                      <img src={movieIcon} alt="" />
                    </div>
                    <div className="right">
                                        <div className="statTop">
                            <span className="number" data-target="350">0</span> {t('home.screenings')}
                      </div>
                  <p>{t('home.stat3Desc')}</p>
                    </div>
                   
                </div>

            </div>
        </div>
          <Footer></Footer>
        </div>
      

      
    </div>
    </>
  );
};

export default VideoScroller;
import React, { useEffect, useRef, useState } from "react";
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
        setTimeout(() => setIsPageLoading(false), 1000);
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
          {/* TUTAJ WRZUCASZ CO CHCESZ */}
          <div className="sec1Container">
            <h6> Welcome to the </h6>
          <h1>SCR<span className="shadow">EE</span>N UNIVERSE</h1>
          <h5>Where every scene is a masterpiece, and every moment is an unforgettable spectacle. Immerse yourself with more brightness, more color, and more contrast on the big screen.</h5>
          <button className="glassBtn">WHAT IS SCREEN UNIVERSE</button>
          </div>
        </div>

        {/* SEKCJA 2 */}
        <div 
          data-index={1} 
          ref={(el) => (sectionRefs.current[1] = el)} 
          className="section2"
        >
          {/* TUTAJ WRZUCASZ CO CHCESZ */}
          <div className="sec2container">
            <h5>LIGHTS, SPEAKERS, ENGINE</h5>
            <h1>EMBRACE AN UNFORGE<span className="shadow">TT</span>ABLE JOURNEY INTO THE UNKNOWN</h1>
          </div>
            <div className="sec2container flex-row">
              <section><img src={lightIcon} alt="" /><h5>Powered by cutting-edge display technology delivering exceptional brightness, contrast, and color accuracy.</h5></section>
              <section><img src={audioIcon} alt="" /><h5>Advanced audio systems engineered for precise, high-fidelity sound and deep spatial immersion.</h5></section>
              <section><img src={engineIcon} alt="" /><h5>A high-performance system integrating image and sound into one seamless cinematic experience.</h5></section>
          </div>
       
        </div>

        {/* SEKCJA 3 */}
        <div 
          data-index={2} 
          ref={(el) => (sectionRefs.current[2] = el)} 
          className="section3"
        >
           <div className="sec3container">
            <h6>IMMERSE YOURSELF IN THE HEART OF THE ACTION</h6>
            <div>
              <h1>F<span className="shadow">EE</span>L EVERY SECOND</h1>
              <h6>We've blurred the line between screen and reality. Step into a world where every scene surrounds you and every moment pulls you deeper.</h6>
            </div>
            <div>
              <button className="glassBtn">EXPLORE SHOWTIMES</button>
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
            <h6> JOIN THE UNIVERSE</h6>
            <div>
          <h1>EXPERIENCE THE IMPO<span className="shadow">SS</span>IBLE - EVERY DAY</h1>
          <h6>Join a distinguished circle of enthusiasts who refuse to settle for the ordinary. By entering the Universe Cinema community, you are not merely observing a screen; you are investing in a legacy of visual perfection and unrivaled sensory depth.</h6>
          </div>
          <button className="glassBtn">Register</button>
          </div>
        </div>

      </div>

      {/* SEKCJA 5 - DALSZA CZĘŚĆ STRONY (bez wideo) */}
    {/* SEKCJA 5 - NAJNOWSZE PREMIERY */}
      <div 
        data-index={4} 
        ref={(el) => (sectionRefs.current[4] = el)} 
        className="section5"
      >
     
           <h1>
            THE HO<span className="shadow">TT</span>EST WORLD PREMIERES
          </h1>
          
          {/* Przyciski z nazwami filmów wygenerowane pętlą z bazy! */}
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
                   Run Time: {movies[selectedMovieIndex].durationMin} min
                </h6>
                <p >{movies[selectedMovieIndex].shortDescription}</p>
                <p><strong>Director:</strong> {movies[selectedMovieIndex].director}</p>
                <p><strong>Cast:</strong> {movies[selectedMovieIndex].mainCast}</p>
                <p><strong>Release Date: </strong>{movies[selectedMovieIndex].releaseDate} </p>
                <p><strong>Age:</strong> {movies[selectedMovieIndex].minimumAge}+</p>
                <p><strong>Generes:</strong> {movies[selectedMovieIndex].genres} </p>
                
                {/* Opcjonalny przycisk do przejścia do Repertuaru */}
                <button className="glassBtn">Buy ticket</button>
              </div>

              {/* PRAWA STRONA: Plakat */}
              <div className="right">
                {/* Na ten moment używamy sztucznego tła jako plakatu, dopóki nie dodamy wgrywania plików */}
               
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
              <h1>Trusted by movie lovers worldwide</h1>

              <div className="statsGrid">
                
                <div className="stat">
                  <div className="left">
                    <img src={starIcon} alt=""  />
                  </div>
                  <div className="right">
                    <div className="statTop">
                    <span className="number" data-target="5">1</span>/5 Google Reveiews
                  </div>
                  <p>reflects our commitment to delivering exceptional visual quality, immersive sound, and a truly next-generation cinematic experience.</p>
                </div>

                  </div>
                  
                <div className="stat">
             
                    <div className="left">
                      <img src={userIcon} alt=""  />
                    </div>
                    <div className="right">
                           <div className="statTop">
              <span className="number" data-target="12000">0</span> + visitors
                  </div>
                  <p> monthly choose our cinema for cutting-edge technology, premium comfort, and a more immersive way to experience film.</p>
                    </div>
      
                </div>

                <div className="stat">

                    <div className="left">
                      <img src={movieIcon} alt="" />
                    </div>
                    <div className="right">
                                        <div className="statTop">
                            <span className="number" data-target="350">0</span> + screenings
                      </div>
                  <p>every month bring you the latest premieres and unforgettable productions in outstanding audiovisual quality.</p>
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

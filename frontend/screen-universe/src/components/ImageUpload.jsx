import React, { useState } from 'react';

const ImageUpload = ({ onImageUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // 🔴 TUTAJ WPISZ SWOJE DANE Z CLOUDINARY 🔴
  const CLOUD_NAME = "dfhjg3okc"; 
  const UPLOAD_PRESET = "kino_preset"; // Np. kino_preset

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    // Tworzymy paczkę z plikiem i hasłem(presetem) dla chmury
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    try {
      // Uderzamy prosto do API Cloudinary!
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });

      const uploadedImage = await res.json();
      
      // Cloudinary oddaje nam piękny, bezpieczny URL (secure_url)
      setPreview(uploadedImage.secure_url);
      
      // Przekazujemy ten URL wyżej (do formularza dodawania filmu)
      onImageUploaded(uploadedImage.secure_url);

    } catch (err) {
      console.error("Błąd podczas wgrywania obrazka:", err);
      alert("Nie udało się wgrać plakatu do chmury.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <input 
        type="file" 
        accept="image/*" 
        onChange={uploadImage} 
        disabled={loading}
        style={{
          padding: '10px',
          background: '#222',
          color: 'white',
          border: '1px solid #444',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      />
      
      {loading && <p style={{ color: 'gold', fontSize: '14px' }}>Wgrywanie plakatu do chmury...</p>}
      
      {preview && (
        <div>
          <p style={{ color: 'green', fontSize: '14px', marginBottom: '5px' }}>Sukces! Podgląd:</p>
          <img 
            src={preview} 
            alt="Podgląd plakatu" 
            style={{ width: '150px', height: '225px', objectFit: 'cover', borderRadius: '8px' }} 
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [legoPieces, setLegoPieces] = useState([]);
  const [recommendedPlans, setRecommendedPlans] = useState([]); // State to hold recommended build plans

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setError(null);
  };

  const detectLegos = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post('/api/detect-legos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLegoPieces(response.data.predictions || []);
      // Call the recommendation function after detecting LEGOs
      await getRecommendations(response.data.predictions);
    } catch (error) {
      setError('Error detecting LEGO pieces. Please try again.');
    }
  };

  const getRecommendations = async (detectedPieces) => {
    const identifiedPieces = detectedPieces.map(piece => piece.class); // Extract class names
    try {
      const response = await axios.post('/api/recommend-buildplans', { identifiedPieces });
      setRecommendedPlans(response.data); // Store recommended plans in state
    } catch (error) {
      setError('Error fetching recommendations. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image to upload.');
      return;
    }

    setUploading(true);
    setSuccess(null);

    try {
      const response = await axios.post('/api/upload-image', image, {
        headers: {
          'Content-Type': 'image/*',
        },
      });

      setSuccess('Image uploaded successfully!');
      await detectLegos(image); // Call detectLegos after successful upload
      setImage(null);
    } catch (error) {
      setError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      {legoPieces.length > 0 && (
        <div>
          <h3>Detected LEGO Pieces:</h3>
          <ul>
            {legoPieces.map((piece, index) => (
              <li key={index}>
                {piece.class} - Confidence: {(piece.confidence * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendedPlans.length > 0 && (
        <div>
          <h3>Recommended Build Plans:</h3>
          <ul>
            {recommendedPlans.map((plan) => (
              <li key={plan._id}>
                <a href={`/buildplans/${plan._id}`}>{plan.title}</a> - {plan.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
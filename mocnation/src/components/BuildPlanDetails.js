import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BuildPlanDetails = ({ match }) => {
  const [buildPlan, setBuildPlan] = useState(null);

  useEffect(() => {
    const fetchBuildPlan = async () => {
      try {
        const response = await axios.get(`/api/buildplans/${match.params.id}`);
        setBuildPlan(response.data);
      } catch (error) {
        console.error('Error fetching build plan:', error);
      }
    };

    fetchBuildPlan();
  }, [match.params.id]);

  const downloadInstructables = async () => {
    if (!buildPlan) return;

    // Create a PDF document
    const pdf = new jsPDF();

    // Capture the build plan details
    const buildPlanDetails = document.getElementById('build-plan-details');

    // Use html2canvas to capture the content
    const canvas = await html2canvas(buildPlanDetails);
    const imgData = canvas.toDataURL('image/png');

    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', 10, 10);
    pdf.save(`${buildPlan.title}.pdf`); // Save the PDF with the title of the build plan
  };

  if (!buildPlan) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{buildPlan.title}</h2>
      <div id="build-plan-details">
        <p>{buildPlan.description}</p>
        {buildPlan.images.map((image, index) => (
          <img key={index} src={image} alt={`Build Plan ${index}`} style={{ width: '100%', maxWidth: '600px' }} />
        ))}
        <p>Created by: {buildPlan.user.username}</p>
        <h4>Instructions:</h4>
        <ol>
          {buildPlan.instructions.map((instruction, index) => (
            <li key={index}>
              {instruction.description}
              {instruction.image && <img src={instruction.image} alt={`Step ${index}`} style={{ width: '100%', maxWidth: '300px' }} />}
            </li>
          ))}
        </ol>
      </div>
      <button onClick={downloadInstructables}>Download Instructables as PDF</button>
    </div>
  );
};

export default BuildPlanDetails;
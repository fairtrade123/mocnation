// mocnationserver.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Create an instance of Express
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mocnation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define BuildPlan schema
const buildPlanSchema = new mongoose.Schema({
  title: String,
  description: String,
  images: [String],
  instructions: [
    {
      stepNumber: Number,
      description: String,
      image: String,
    },
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  tags: [String],
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      comment: String,
      createdDate: { type: Date, default: Date.now },
    },
  ],
});

// Create BuildPlan model
const BuildPlan = mongoose.model('BuildPlans', buildPlanSchema);

// API Endpoints

// GET /api/buildplans
app.get('/api/buildplans', async (req, res) => {
  try {
    const buildPlans = await BuildPlan.find().populate('user', 'username profilePicture');
    res.status(200).json(buildPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching build plans', error });
  }
});

// GET /api/buildplans/:id
app.get('/api/buildplans/:id', async (req, res) => {
  try {
    const buildPlan = await BuildPlan.findById(req.params.id).populate('user', 'username profilePicture');
    if (!buildPlan) {
      return res.status(404).json({ message: 'Build plan not found' });
    }
    res.status(200).json(buildPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching build plan', error });
  }
});

// POST /api/buildplans
app.post('/api/buildplans', async (req, res) => {
  const { title, description, images, instructions, user, tags } = req.body;

  const newBuildPlan = new BuildPlan({
    title,
    description,
    images,
    instructions,
    user,
    tags,
  });

  try {
    const savedBuildPlan = await newBuildPlan.save();
    res.status(201).json(savedBuildPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating build plan', error });
  }
});

// PUT /api/buildplans/:id
app.put('/api/buildplans/:id', async (req, res) => {
  try {
    const updatedBuildPlan = await BuildPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBuildPlan) {
      return res.status(404).json({ message: 'Build plan not found' });
    }
    res.status(200).json(updatedBuildPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating build plan', error });
  }
});

// DELETE /api/buildplans/:id
app.delete('/api/buildplans/:id', async (req, res) => {
  try {
    const deletedBuildPlan = await BuildPlan.findByIdAndDelete(req.params.id);
    if (!deletedBuildPlan) {
      return res.status(404).json({ message: 'Build plan not found' });
    }
    res.status(200).json({ message: 'Build plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting build plan', error });
  }
});

// GET /api/buildplans/user/:userId
app.get('/api/buildplans/user/:userId', async (req, res) => {
  try {
    const buildPlans = await BuildPlan.find({ user: req.params.userId }).populate('user', 'username profilePicture');
    res.status(200).json(buildPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching build plans for user', error });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dfn2vdshs',
  api_key: '553794691964252',
  api_secret: 'MEV4DMDx7Y5ok43nDfsUHa9gMzY',
});
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mocnation_images', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed formats
  },
});

// Initialize multer
const upload = multer({ storage: storage });
// POST /api/buildplans/:id/upload-image
app.post('/api/buildplans/:id/upload-image', upload.single('image'), async (req, res) => {
  try {
    const buildPlanId = req.params.id;
    const imageUrl = req.file.path; // Get the URL of the uploaded image

    // Find the build plan and update it with the new image URL
    const updatedBuildPlan = await BuildPlan.findByIdAndUpdate(
      buildPlanId,
      { $push: { images: imageUrl } }, // Add the image URL to the images array
      { new: true }
    );

    if (!updatedBuildPlan) {
      return res.status(404).json({ message: 'Build plan not found' });
    }

    res.status(200).json(updatedBuildPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error });
  }
});
// POST /api/detect-legos
app.post('/api/detect-legos', upload.single('image'), async (req, res) => {
  try {
    const imageFile = req.file;

    // Call the LEGO detection API
    const formData = new FormData();
    formData.append('file', imageFile.buffer);

    const response = await axios.post('https://api.roboflow.com/detect', formData, {
      headers: {
        'Authorization': `Bearer YOUR_API_KEY`, // Replace with your actual API key
        'Content-Type': 'multipart/form-data',
      },
    });

    res.status(200).json(response.data); // Send the detected LEGO pieces back to the client
  } catch (error) {
    res.status(500).json({ message: 'Error detecting LEGO pieces', error });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Function to recommend build plans based on identified pieces
const recommendBuildPlans = async (identifiedPieces) => {
  try {
    const buildPlans = await BuildPlan.find(); // Fetch all build plans

    // Filter build plans that can be built with the identified pieces
    const recommendations = buildPlans.filter(plan => {
      // Check if all required pieces are available in identified pieces
      return plan.requiredPieces.every(piece => identifiedPieces.includes(piece));
    });

    return recommendations;
  } catch (error) {
    console.error('Error fetching build plans for recommendations:', error);
    throw error;
  }
};
// POST /api/recommend-buildplans
app.post('/api/recommend-buildplans', async (req, res) => {
  const { identifiedPieces } = req.body; // Expecting an array of identified pieces

  try {
    const recommendations = await recommendBuildPlans(identifiedPieces);
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations', error });
  }
});
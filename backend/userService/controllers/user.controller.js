const UserProfile = require('../models/user.model');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const redisClient = require('../utils/redis'); // Import Redis client


// AWS S3 Configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Utility Function: Upload File to S3
const uploadFileToS3 = async (fileBuffer, fileName, mimeType) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error('Error uploading file to S3:', error.message);
        throw new Error('File upload failed');
    }
};

// Create or Update User Profile
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { id: authId } = req.user; // Extract authId from middleware
        const { firstName, lastName, dob, gender, contactNumber, address } = req.body;
        let profilePictureUrl;

        // Handle profile picture upload
        if (req.file) {
            const fileName = `${authId}/profile_picture_${Date.now()}_${req.file.originalname}`;
            profilePictureUrl = await uploadFileToS3(req.file.buffer, fileName, req.file.mimetype);
        }

        const profileData = {
            firstName,
            lastName,
            dob,
            gender,
            contactNumber,
            address,
            ...(profilePictureUrl && { profilePictureUrl }), // Only add if picture is uploaded
        };

        const profile = await UserProfile.findOneAndUpdate(
            { authId },
            profileData,
            { new: true, upsert: true } // Create if not exists
        );

        res.status(200).json({
            message: 'Profile saved successfully',
            profile,
        });
    } catch (err) {
        console.error('Error creating/updating profile:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const { id: authId } = req.user; // Extract authId from middleware

        // Check if profile exists in Redis cache
        const cachedProfile = await redisClient.get(`userProfile:${authId}`);
        if (cachedProfile) {
            console.log('Cache hit: Returning profile from Redis');
            return res.status(200).json(JSON.parse(cachedProfile));
        }

        // If not in cache, fetch from MongoDB
        const profile = await UserProfile.findOne({ authId });

        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Save the fetched profile to Redis cache
        await redisClient.setEx(`userProfile:${authId}`, 3600, JSON.stringify(profile)); // Cache for 1 hour

        console.log('Cache miss: Returning profile from MongoDB and caching it');
        res.status(200).json(profile);
    } catch (err) {
        console.error('Error retrieving profile:', err.message);
        res.status(500).json({ error: err.message });
    }
};


// Upload Resume
exports.uploadResume = async (req, res) => {
    try {
        const { id: authId } = req.user;
        const file = req.file;

        if (!file) throw new Error('No file uploaded');

        const fileName = `${authId}/resume_${Date.now()}_${file.originalname}`;
        const fileUrl = await uploadFileToS3(file.buffer, fileName, file.mimetype);

        const updatedProfile = await UserProfile.findOneAndUpdate(
            { authId },
            { resumeUrl: fileUrl },
            { new: true }
        );

        res.status(200).json({
            message: 'Resume uploaded successfully',
            fileUrl,
            updatedProfile,
        });
    } catch (err) {
        console.error('Error uploading resume:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Upload Profile Picture or Resume
exports.uploadFile = async (req, res) => {
    try {
        const { id: authId } = req.user; // Extract authId from middleware
        const file = req.file;

        if (!file) throw new Error('No file uploaded');

        const fileName = `${authId}/${Date.now()}_${file.originalname}`;
        const fileUrl = await uploadFileToS3(file.buffer, fileName, file.mimetype);

        const updateField = req.query.type === 'resume' ? { resumeUrl: fileUrl } : { profilePictureUrl: fileUrl };

        const updatedProfile = await UserProfile.findOneAndUpdate({ authId }, updateField, { new: true });

        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl,
            updatedProfile,
        });
    } catch (err) {
        console.error('Error uploading file:', err.message);
        res.status(500).json({ error: err.message });
    }
};


exports.addEducation = async (req, res) => {
    try {
        const { id: authId } = req.user;
        const educationEntries = req.body; // Expecting an array of education objects

        // Validate input: Ensure it is an array and each entry has required fields
        if (!Array.isArray(educationEntries)) {
            return res.status(400).json({ error: 'Request body must be an array of education entries' });
        }
        for (const entry of educationEntries) {
            const { degree, institution, startYear } = entry;
            if (!degree || !institution || !startYear) {
                return res.status(400).json({
                    error: 'Each education entry must include degree, institution, and startYear',
                });
            }
        }

        // Add multiple education entries
        const profile = await UserProfile.findOneAndUpdate(
            { authId },
            { $push: { education: { $each: educationEntries } } }, // Add multiple entries at once
            { new: true }
        );

        res.status(200).json({
            message: 'Education entries added successfully',
            profile,
        });
    } catch (err) {
        console.error('Error adding education:', err.message);
        res.status(500).json({ error: err.message });
    }
};



// Add Work Experience
exports.addWorkExperience = async (req, res) => {
    try {
        const { id: authId } = req.user;
        const workEntries = req.body; // Expecting an array of work experience objects

        // Validate input: Ensure it is an array and each entry has required fields
        if (!Array.isArray(workEntries)) {
            return res.status(400).json({ error: 'Request body must be an array of work experience entries' });
        }
        for (const entry of workEntries) {
            const { companyName, position, startDate } = entry;
            if (!companyName || !position || !startDate) {
                return res.status(400).json({
                    error: 'Each work experience entry must include companyName, position, and startDate',
                });
            }
        }

        // Add multiple work experience entries
        const profile = await UserProfile.findOneAndUpdate(
            { authId },
            { $push: { workExperience: { $each: workEntries } } }, // Add multiple entries at once
            { new: true }
        );

        res.status(200).json({
            message: 'Work experience entries added successfully',
            profile,
        });
    } catch (err) {
        console.error('Error adding work experience:', err.message);
        res.status(500).json({ error: err.message });
    }
};



// Get User Profile by ID
exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await UserProfile.findOne({ authId: id });

        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        res.status(200).json(profile);
    } catch (err) {
        console.error('Error retrieving profile by ID:', err.message);
        res.status(500).json({ error: err.message });
    }
};
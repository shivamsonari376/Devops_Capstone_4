const Company = require('../models/company.model');
const redisClient = require('../utils/redis');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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

// Controllers

// Create a New Company
exports.createOrUpdateCompany = async (req, res) => {
    try {
        const { id: authId } = req.user; // Extract authId from middleware
        const { name, contactNumber, website, address } = req.body;

        // Check if the company already exists
        const existingCompany = await Company.findOne({ authId });

        if (existingCompany) {
            // Update the existing company
            const updatedCompany = await Company.findOneAndUpdate(
                { authId },
                { name, contactNumber, website, address },
                { new: true }
            );

            return res.status(200).json({
                message: 'Company updated successfully',
                company: updatedCompany,
            });
        }

        // Create a new company
        const newCompany = new Company({
            name,
            contactNumber,
            website,
            address,
            authId,
            createdBy: authId,
        });

        const savedCompany = await newCompany.save();

        res.status(201).json({
            message: 'Company created successfully',
            company: savedCompany,
        });
    } catch (err) {
        console.error('Error creating/updating company:', err.message);
        res.status(500).json({ error: err.message });
    }
};


// Get Company Details
exports.getCompany = async (req, res) => {
    try {
        const { id: authId } = req.user; // Use logged-in user's authId

        // Check Redis cache
        const cachedCompany = await redisClient.get(`company:${authId}`);
        if (cachedCompany) {
            console.log('Cache hit: Returning company from Redis');
            return res.status(200).json(JSON.parse(cachedCompany));
        }

        // Fetch from MongoDB if not in cache
        const company = await Company.findOne({ authId }).populate('authId createdBy', 'email role');
        if (!company) return res.status(404).json({ error: 'Company not found' });

        // Cache the result
        await redisClient.setEx(`company:${authId}`, 3600, JSON.stringify(company));

        res.status(200).json(company);
    } catch (err) {
        console.error('Error retrieving company:', err.message);
        res.status(500).json({ error: err.message });
    }
};


// Upload Company Logo
exports.uploadLogo = async (req, res) => {
    try {
        const { id: authId } = req.user; // Use logged-in user's authId
        const file = req.file;

        if (!file) throw new Error('No file uploaded');

        const fileName = `${authId}/logo_${Date.now()}_${file.originalname}`;
        const logoUrl = await uploadFileToS3(file.buffer, fileName, file.mimetype);

        const updatedCompany = await Company.findOneAndUpdate(
            { authId },
            { logoUrl },
            { new: true }
        );

        if (!updatedCompany) return res.status(404).json({ error: 'Company not found' });

        res.status(200).json({
            message: 'Logo uploaded successfully',
            logoUrl,
            company: updatedCompany,
        });
    } catch (err) {
        console.error('Error uploading logo:', err.message);
        res.status(500).json({ error: err.message });
    }
};


// Delete Company
exports.deleteCompany = async (req, res) => {
    try {
        const { id: companyId } = req.params;

        const deletedCompany = await Company.findByIdAndDelete(companyId);

        if (!deletedCompany) return res.status(404).json({ error: 'Company not found' });

        // Remove from Redis cache
        await redisClient.del(`company:${companyId}`);

        res.status(200).json({
            message: 'Company deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting company:', err.message);
        res.status(500).json({ error: err.message });
    }
};

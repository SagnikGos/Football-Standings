require("dotenv").config();
const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.FOOTBALL_API_KEY;

// Redis Client
const redisClient = redis.createClient({
    url: process.env.REDIS_URL, 
});

redisClient.connect().catch(console.error);

// Middleware
app.use(express.json());

// Get Standings with Caching
app.get("/standings/:competitionId", async (req, res) => {
    const { competitionId } = req.params;
    const redisKey = `standings:${competitionId}`;

    try {
        // Check Redis Cache
        const cachedData = await redisClient.get(redisKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        // Fetch from API
        const response = await axios.get(
            `https://api.football-data.org/v4/competitions/${competitionId}/standings`,
            { headers: { "X-Auth-Token": API_KEY } }
        );

        // Store in Redis for 15 minutes
        await redisClient.setEx(redisKey, 900, JSON.stringify(response.data));

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch standings" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

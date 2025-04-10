# Football Standings App

A modern and responsive web application to view live football league standings using the [Football-Data.org](https://www.football-data.org/) API.

## Features

- Live standings for major football leagues
- Dark/light theme toggle using `shadcn/ui`
- Fast, responsive, and accessible UI with React and Tailwind CSS
- Modular and scalable codebase using TypeScript
- API caching support with Redis (backend)

## Tech Stack

**Frontend**
- React
- Tailwind CSS
- TypeScript
- shadcn/ui

**Backend**
- Node.js
- Express.js
- Redis (for caching)
- Football-Data.org API

## Getting Started

### Prerequisites

- Node.js and npm
- API key from [football-data.org](https://www.football-data.org/client/register)
- MongoDB database (e.g., MongoDB Atlas)
- Redis instance (e.g., Redis Cloud or local)

### Installation

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/your-username/football-standings.git](https://github.com/SagnikGos/football-standings.git)
    cd football-standings
    ```

2.  **Install frontend dependencies**

    ```bash
    cd client
    npm install
    ```

3.  **Install backend dependencies**

    ```bash
    cd ../server
    npm install
    ```

4.  **Setup environment variables**

    Create a `.env` file in the `server/` directory:

    ```dotenv
    PORT=5000
    FOOTBALL_API_KEY=your_api_key_here
    REDIS_URL=your_redis_connection_string
    ```

5.  **Run the application**

    Start the backend server:

    ```bash
    # Navigate to the server directory if not already there
    cd server
    npm run dev
    ```

    Start the frontend:

    ```bash
    # Navigate to the client directory
    cd ../client
    npm run dev
    ```

    Visit the app at `http://localhost:5173`

## Deployment

-   **Frontend:** Vercel
-   **Backend:**  Render
-   **Cache:**  Upstash

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

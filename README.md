# 🎉 Fest Management System - Admin Dashboard

Welcome to the Fest Management System, a powerful and efficient platform for managing college events. This full-stack solution integrates event management with advanced Machine Learning (ML) capabilities to streamline event planning, analyze user feedback, and recommend optimized events based on available budget.

## 📚 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
  - [Machine Learning Pipeline](#machine-learning-pipeline)
- [Installation and Setup](#installation-and-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Machine Learning Setup](#machine-learning-setup)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 📝 Introduction

The **Fest Management System** is an **Admin Dashboard** built to optimize and manage college events seamlessly. It offers a powerful combination of event management, ticketing, sentiment analysis, and AI-based recommendations that consider your budget and feedback. From handling user authentication to providing insightful analytics and event recommendations, this platform covers it all!

---

## 🚀 Features

- **User Authentication & Authorization**: Secure login and user profile management for admins.
- **Event Management**: Create, update, view, and delete events with comprehensive event analytics.
- **Budget Optimization**: AI-powered recommendations that maximize event experiences within budget constraints.
- **Sentiment Analysis**: Process user feedback (comments) to classify sentiment as positive or negative.
- **Dashboard & Analytics**: Visualize event performance, ticket sales, and user sentiment in real-time.
- **Ticket Management**: Handle ticket bookings and payments effortlessly.

---

## 💻 Technology Stack

### Frontend
- **React** (with Vite for optimized builds)
- **Tailwind CSS** (for modern, responsive design)
- **Axios** (for making API calls)

### Backend
- **Node.js** & **Express** (for server-side logic)
- **Multer** (for handling file uploads)
- **JWT** (for authentication)

### Database
- **MongoDB** & **Mongoose** (for data storage)

### Machine Learning
- **Python** with:
  - **Transformers Library** (for Natural Language Processing)
  - **Pandas** & **Torch** (for data processing)
  - **Models**: GPT-2 (for event extraction), DistilBERT (for sentiment analysis)

---

## 🏗️ Project Structure

<img width="336" alt="image" src="https://github.com/user-attachments/assets/264ccb9d-ef94-4fdf-9922-91059f9ee82c">


Frontend
- DashboardPage.jsx: Displays event summaries and analytics.
- CreateEvent.jsx & AddEvent.jsx: Forms for creating and managing events.
- LoginPage.jsx & RegisterPage.jsx: Handles admin authentication.
- CalendarView.jsx: Visualizes scheduled events.
- EventPage.jsx: Displays event details and user feedback.

Backend
- index.js: Core server and routing logic.
- Models: Includes schemas for Ticket and User.
- API Endpoints: Handles requests for user and event management, as well as ML-based event recommendations.

🧠 Machine Learning Pipeline
- Data Extraction and Sentiment Analysis (main.py)
  - Data Loading: Loads user comments from College_Fest_Review_data_set.csv.
  - Event Name Extraction: Uses GPT-2 to extract event names from user comments.
  - Sentiment Analysis: Analyzes sentiment using DistilBERT (Positive or Negative classification).
  
- Event Recommendation Based on Budget (run.py)
  - Load Data: Reads processed data from processed_with_scores.csv containing event costs and sentiment scores.
  - Event Filtering: Filters positive sentiment events and sorts by sentiment and social media trend scores.
  - Budget Optimization: Recommends events that fit within a specified budget.

⚙️ Installation and Setup
- Prerequisites:
  - Node.js
  - Python 3.x
  - MongoDB

- Backend Setup:
  cd api
  npm install
  node index.js


Frontend Setup:
cd client
npm install
npm run dev

Machine Learning Setup:
cd ML
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

📡 API Endpoints

Method   Endpoint            Description
POST     /api/register       Register a new admin
POST     /api/login          Admin login
GET      /api/getEvents      Fetch all events
POST     /api/ml/recommend   Get event recommendations based on budget

🏄 Usage

Admin Dashboard: Log in to manage events, view analytics, and handle ticket bookings.
AI Recommendations: Enter a budget to get optimized event recommendations within your financial constraints.

📸 Screenshots 
Screenshots showcasing the dashboard, event management, and ML outputs will be displayed here.
<img width="1380" alt="Screenshot 2024-11-18 at 5 56 36 PM" src="https://github.com/user-attachments/assets/64f9dabc-39fe-4630-8daf-3443efdae933">

<img width="1380" alt="Screenshot 2024-11-18 at 5 57 01 PM" src="https://github.com/user-attachments/assets/bb911d60-5a15-488f-b708-13b5065b13e9">
<img width="1456" alt="Screenshot 2024-11-18 at 5 57 55 PM" src="https://github.com/user-attachments/assets/3bc3266b-71cb-4048-ac30-9334c1d3c92a">
<img width="1456" alt="Screenshot 2024-11-18 at 5 57 43 PM" src="https://github.com/user-attachments/assets/16e9fea3-4491-4dc0-b4dc-9badd6427978">
<img width="1456" alt="Screenshot 2024-11-18 at 5 57 32 PM" src="https://github.com/user-attachments/assets/f6a95fc9-3726-406b-8e66-caca9134837c">
<img width="1456" alt="Screenshot 2024-11-18 at 5 57 25 PM" src="https://github.com/user-attachments/assets/c0c5040c-5eb3-4bde-89f7-4718e0636cac">
<img width="1456" alt="Screenshot 2024-11-18 at 5 57 14 PM" src="https://github.com/user-attachments/assets/e0aaacb1-3fdb-40f2-b137-f24b72be7cee">



🤝 Contributing 
We welcome contributions! Feel free to open issues or submit pull requests to improve the system.

📝 License 
This project is licensed under the MIT License. See the LICENSE file for details.

Note: This README is a work in progress. Contributions and improvements are welcome! 😊

# FEST_FINAL_REPO

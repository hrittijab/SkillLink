# SkillLink 

SkillLink is a mobile-first skill-exchange platform that empowers users to showcase their talents, find collaborators, and connect with others for mutual learning or service exchange. Built with **React Native (frontend)** and **Spring Boot with AWS (backend)**, the app supports real-time messaging, secure authentication, and customizable skill listings.

---

## ✨ Features

-  **User Authentication**
  - Secure signup/login with bcrypt-hashed passwords
  - JWT-based session handling
  - Optional profile picture uploads

-  **Profile Management**
  - Add bio, offered skills, and desired skills
  - Upload and edit profile picture
  - View other users’ profiles

-  **Skill Posts**
  - Create, edit, and delete skill exchange posts
  - Add preferences like:
    - Skill type (e.g., offering or seeking)
    - Payment type (paid, exchange, or free)
    - Price and exchangeable skills
  - Filter and explore posts

-  **Messaging**
  - Real-time chat using WebSockets
  - View all conversations in a dedicated screen
  - Message users directly from posts (except your own)

-  **Backend Integration**
  - Spring Boot REST APIs
  - DynamoDB for user, post, and message data
  - WebSocket-based message handling
  - AWS S3 support for profile image uploads (planned/in progress)

---

##  Tech Stack

| Layer        | Technologies                                                    | 
|--------------|-----------------------------------------------------------------|
| Frontend     | React Native, Expo, React Navigation, AsyncStorage, SecureStore |
| Backend      | Spring Boot, WebSocket (STOMP), JWT, BCrypt                     |
| Database     | AWS DynamoDB                                                    |
| Cloud Storage| AWS S3 (for profile images)                                     |
| Dev Tools    | Git, GitHub, Postman, VS Code, Android Studio                   |



Upcoming Features
- Push notifications for new messages

- Email Verification (Currently working on)

- Video uploading options for skills

- AI integration to give users suggestions for learning new skills based on their current interests.


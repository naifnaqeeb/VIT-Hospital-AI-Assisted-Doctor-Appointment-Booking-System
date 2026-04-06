<p align="center">
  <img src="https://img.shields.io/badge/VitCare-AI%20Powered-5F6FFF?style=for-the-badge&logo=hospital&logoColor=white" alt="VitCare Badge"/>
</p>

<h1 align="center">🏥 VitCare — AI-Assisted Doctor Appointment Booking System and Pharmacy Platform</h1>

<p align="center">
  A full-stack hospital management system with an integrated <strong>AI Medical Assistant</strong> powered by a multi-agent <strong>LangGraph</strong> pipeline, enabling symptom-based diagnosis, automated doctor booking, appointment management, and campus pharmacy delivery — built for VIT Vellore.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-LangGraph-1C3C3C?style=flat-square&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-Llama%203-F55036?style=flat-square&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [AI Agent Pipeline](#-ai-agent-pipeline-langgraph)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🌟 Overview

**VitCare** is a comprehensive healthcare platform built for the VIT Vellore campus hospital. It goes beyond a simple doctor booking system by integrating a **conversational AI medical assistant** that can:

- 🩺 Analyze patient symptoms through multi-turn diagnostic conversations
- 🔍 Retrieve medical knowledge from multiple sources (RAG, Wikipedia, Tavily Web Search)
- 👨‍⚕️ Automatically recommend relevant specialists based on diagnosed conditions
- 📅 Book, view, and cancel appointments — all within the chat interface
- 💊 Browse and order medicines from the campus pharmacy with hostel delivery

The AI assistant is embedded as a **persistent floating chat widget** across the entire hospital website, providing 24/7 medical guidance without disrupting the user experience.

---

## ✨ Key Features

### 🏨 Hospital Management (MERN Stack)
| Feature | Description |
|---------|-------------|
| **Doctor Discovery** | Browse doctors by speciality with detailed profiles, fees, and availability |
| **Smart Scheduling** | Dynamic time slot generation with real-time availability checking |
| **Appointment Booking** | Secure booking with JWT authentication and slot conflict prevention |
| **My Appointments** | View upcoming appointments, cancel bookings, and track status |
| **User Profiles** | Registration, login, profile management with Cloudinary image uploads |
| **Admin Dashboard** | Add doctors, manage appointments, view platform analytics |
| **Doctor Portal** | Doctors can manage their availability, view patients, and update profiles |

### 🤖 VitCare AI Assistant (LangGraph + RAG)
| Feature | Description |
|---------|-------------|
| **Multi-Turn Diagnosis** | Conversational symptom analysis with progressive question refinement |
| **RAG Pipeline** | Medical document retrieval using Chroma vector store with PDF embeddings |
| **Multi-Source Retrieval** | Cascading fallback: RAG → LLM → Wikipedia → Tavily Web Search |
| **Specialist Mapping** | Automatic symptom-to-speciality classification for 14+ medical departments |
| **Agentic Booking** | Book appointments with recommended doctors directly in the chat |
| **Appointment Management** | View and cancel existing appointments through natural language |
| **Session Isolation** | Per-user chat history with client ID tracking — no cross-session bleeding |
| **Persistent Widget** | Floating glassmorphism chat panel that persists across all pages |

### 💊 Campus Pharmacy *(Planned)*
| Feature | Description |
|---------|-------------|
| **Medicine Catalog** | Browse medicines with search, category filters, and stock tracking |
| **Cart & Checkout** | Add to cart, adjust quantities, and place COD orders |
| **Prescription Upload** | Upload doctor prescriptions for restricted medicines |
| **Hostel Delivery** | Deliver medicines directly to student hostel rooms |
| **Order Tracking** | Real-time order status updates (Placed → Out for Delivery → Delivered) |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  Hospital UI  │  │  Admin Panel  │  │  VitCare AI Chat Widget   │ │
│  │  (Port 5173)  │  │  (Port 5174)  │  │  (Floating, Persistent)   │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬─────────────┘ │
└─────────┼─────────────────┼────────────────────────┼───────────────┘
          │                 │                        │
          ▼                 ▼                        ▼
┌─────────────────────────────┐     ┌────────────────────────────────┐
│   EXPRESS.JS BACKEND        │     │   FASTAPI AI BACKEND           │
│   (Port 4000)               │     │   (Port 8000)                  │
│                             │     │                                │
│  • User Auth (JWT + Bcrypt) │     │  • LangGraph StateGraph        │
│  • Doctor CRUD              │◄────│  • Groq LLM (Llama 3)         │
│  • Appointment Management   │     │  • Chroma Vector Store (RAG)   │
│  • Cloudinary Image Upload  │     │  • Wikipedia API               │
│                             │     │  • Tavily Web Search           │
│                             │     │  • SQLite Chat Persistence     │
└──────────┬──────────────────┘     └────────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│       MONGODB ATLAS         │
│                             │
│  • Users Collection         │
│  • Doctors Collection       │
│  • Appointments Collection  │
└─────────────────────────────┘
```

---

## 🧠 AI Agent Pipeline (LangGraph)

The AI assistant uses a **LangGraph StateGraph** with 10 specialized agent nodes that work together to process each user message:

```
                              ┌─────────┐
                              │  START  │
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │ Memory  │  ← Loads conversation history
                              └────┬────┘
                                   │
                              ┌────▼─────┐
                              │ Planner  │  ← Intent classification
                              └────┬─────┘
                                   │
                    ┌──────────────┼──────────────┬────────────────┐
                    │              │              │                │
               ┌────▼────┐  ┌─────▼─────┐ ┌─────▼──────┐  ┌─────▼──────────┐
               │Retriever│  │ LLM Agent │ │  Booking   │  │  Appointment   │
               │  (RAG)  │  │  (Groq)   │ │   Agent    │  │     Agent      │
               └────┬────┘  └─────┬─────┘ └─────┬──────┘  └─────┬──────────┘
                    │              │              │                │
                    │         ┌────▼─────┐       END              END
                    │         │Wikipedia │
                    │         └────┬─────┘
                    │              │
                    │         ┌────▼────┐
                    │         │ Tavily  │  ← Web search fallback
                    │         └────┬────┘
                    │              │
                    └──────┬───────┘
                           │
                      ┌────▼─────┐
                      │ Executor │  ← Diagnosis + Specialist suggestion
                      └────┬─────┘
                           │
                          END
```

### Agent Descriptions

| Agent | Role |
|-------|------|
| **MemoryAgent** | Appends current message to conversation history for multi-turn context |
| **PlannerAgent** | Classifies intent (medical query, booking, appointment management, general) and routes accordingly |
| **RetrieverAgent** | Performs RAG retrieval against a Chroma vector store built from medical PDF documents |
| **LLMAgent** | Generates responses using Groq's Llama 3 model for general medical and non-medical queries |
| **WikipediaAgent** | Falls back to Wikipedia's medical knowledge base when RAG yields insufficient results |
| **TavilyAgent** | Performs live web search via Tavily API as the final retrieval layer |
| **ExecutorAgent** | Aggregates outputs, manages diagnostic turn counting, and triggers specialist recommendations |
| **BookingAgent** | Multi-phase state machine handling doctor recommendation → selection → slot picking → confirmation |
| **AppointmentAgent** | Fetches and displays user appointments, handles cancellation with confirmation flow |
| **ExplanationAgent** | Formats and enhances final responses for clarity and readability |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool and dev server |
| React Router v7 | Client-side routing |
| Tailwind CSS 3 | Utility-first styling |
| Axios | HTTP client |
| React Toastify | Toast notifications |
| React Markdown | Rendering AI responses in Markdown |
| Lucide React | Icon library |
| Font Awesome 6 | Chat widget icons |

### Hospital Backend (Express.js)
| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose 9 | Database and ODM |
| JWT | Stateless authentication |
| Bcrypt | Password hashing |
| Cloudinary | Image upload and storage |
| Multer | Multipart form handling |
| Razorpay | Payment integration |

### AI Backend (FastAPI)
| Technology | Purpose |
|------------|---------|
| Python + FastAPI | Async AI API server |
| LangChain | LLM orchestration framework |
| LangGraph | Multi-agent state graph workflow |
| Groq (Llama 3) | Fast LLM inference |
| ChromaDB | Vector store for RAG embeddings |
| HuggingFace Embeddings | Document vectorization |
| Tavily API | Real-time web search |
| Wikipedia API | Medical knowledge fallback |
| SQLAlchemy + SQLite | Chat history persistence |

---

## 📁 Project Structure

```
VitCare/
├── frontend/                    # Patient-facing React app
│   └── src/
│       ├── pages/               # Home, Doctors, Appointment, Login, MyAppointments, etc.
│       ├── components/          # Navbar, Header, Footer, ChatWidget, etc.
│       ├── context/             # AppContext (global state)
│       └── assets/              # Images, icons
│
├── admin/                       # Admin + Doctor dashboard (React)
│   └── src/
│       └── pages/
│           ├── Admin/           # Dashboard, AddDoctor, AllAppointments, DoctorsList
│           └── Doctor/          # DoctorDashboard, DoctorAppointments, DoctorProfile
│
├── backend/                     # Express.js REST API
│   ├── server.js                # Entry point (Port 4000)
│   ├── config/                  # MongoDB & Cloudinary connections
│   ├── controllers/             # adminController, doctorController, userController
│   ├── models/                  # userModel, doctorModel, appointmentModel
│   ├── routes/                  # adminRoute, doctorRoute, userRoute
│   └── middleware/              # authUser, authAdmin, authDoctor, multer
│
└── ai-medical-assistant/        # AI Subsystem
    ├── run.py                   # FastAPI launcher
    └── backend/
        └── app/
            ├── main.py          # FastAPI app factory (Port 8000)
            ├── agents/          # LangGraph agent nodes
            │   ├── planner.py         # Intent classifier & router
            │   ├── retriever.py       # RAG document retriever
            │   ├── llm_agent.py       # Groq LLM responder
            │   ├── wikipedia.py       # Wikipedia fallback
            │   ├── tavily.py          # Web search fallback
            │   ├── executor.py        # Diagnosis aggregator
            │   ├── booking_agent.py   # Appointment booking flow
            │   ├── appointment_agent.py # View & cancel appointments
            │   ├── memory.py          # Conversation history manager
            │   └── explanation.py     # Response formatter
            ├── tools/           # Utility tools
            │   ├── booking_tool.py    # Hospital API client (httpx)
            │   ├── doctor_tool.py     # Doctor fetching & formatting
            │   ├── vector_store.py    # Chroma vector store
            │   ├── pdf_loader.py      # Medical PDF ingestion
            │   ├── speciality_mapper.py # Symptom → Speciality mapping
            │   ├── tavily_search.py   # Tavily API wrapper
            │   └── wikipedia_search.py # Wikipedia API wrapper
            ├── core/            # Configuration & workflow
            │   ├── config.py          # Environment variables
            │   ├── state.py           # AgentState TypedDict
            │   └── langgraph_workflow.py # StateGraph definition
            ├── services/        # Business logic
            │   ├── chat_service.py    # Message processing orchestrator
            │   └── database_service.py # SQLite CRUD operations
            └── api/v1/endpoints/ # FastAPI routes
                ├── chat.py            # /chat, /clear, /new-chat
                └── session.py         # /sessions, /history, /session/{id}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account
- **Groq API Key** ([console.groq.com](https://console.groq.com))
- **Tavily API Key** ([tavily.com](https://tavily.com))

### 1. Clone the Repository

```bash
git clone https://github.com/naifnaqeeb/VIT-Hospital-AI-Assisted-Doctor-Appointment-Booking-System.git
cd VIT-Hospital-AI-Assisted-Doctor-Appointment-Booking-System
```

### 2. Install Dependencies

```bash
# Hospital Backend
cd backend && npm install

# Patient Frontend
cd ../frontend && npm install

# Admin Dashboard
cd ../admin && npm install

# AI Assistant
cd ../ai-medical-assistant
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r backend/requirements.txt
```

### 3. Configure Environment Variables

Create `.env` files in each directory (see [Environment Variables](#-environment-variables) below).

### 4. Start All Services

Open **4 terminal windows** and run:

```bash
# Terminal 1: Hospital Backend (Port 4000)
cd backend && npm run server

# Terminal 2: Patient Frontend (Port 5173)
cd frontend && npm run dev

# Terminal 3: Admin Dashboard (Port 5174)
cd admin && npm run dev

# Terminal 4: AI Assistant (Port 8000)
cd ai-medical-assistant && python run.py
```

---

## 🔐 Environment Variables

### `backend/.env`
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vitcare
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@vitcare.com
ADMIN_PASSWORD=your_admin_password
```

### `frontend/.env`
```env
VITE_BACKEND_URL=http://localhost:4000
```

### `admin/.env`
```env
VITE_BACKEND_URL=http://localhost:4000
```

### `ai-medical-assistant/.env`
```env
GROQ_API_KEY=gsk_your_groq_api_key
TAVILY_API_KEY=tvly-your_tavily_api_key
```

---
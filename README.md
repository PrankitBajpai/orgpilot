# OrgPilot 🚀

### *Intelligent Workspace & Roster Management Automation Engine*

OrgPilot is a modern, full-stack enterprise automation portal built to streamline workforce management, internal scheduling, and communication pipelines. By combining an asynchronous Python backend, a reactive web dashboard, and automated notification layers, OrgPilot transforms how business units manage their user rosters and daily operations.

---

## 🎯 Selected Problem Statement

Modern businesses frequently struggle with fragmented administrative tooling. Managing employee records, authenticating manager nodes, scheduling organizational milestones, and tracking corporate communications often require multiple disjointed applications. 

**The Goal:** Build a centralized, secure, and ultra-fast workspace portal that unifies user authentication, dynamic roster management, automated notifications, and background scheduling into a single cohesive interface, dropping infrastructure overhead completely.

---

## 🛠️ Tech Stack Used

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js, React Router v6, Axios | Responsive UI, Single Page Application routing, API fetching |
| **Backend** | FastAPI (Python 3.11), Uvicorn | High-performance Asynchronous ASGI API engine |
| **Database** | MongoDB Atlas, Motor | Non-relational cloud document storage, Async DB driver |
| **Security** | JSON Web Tokens (JWT), Passlib (Bcrypt) | Cryptographically secure token signing, salted password hashing |
| **AI Integration** | Gemini API | Intelligent text parsing and core structural processing |
| **Mailing Service** | Resend API | Enterprise transactional automated mail delivery |

---

## 📐 Backend Architecture & System Design

OrgPilot utilizes an asynchronous decoupled architecture designed to ensure near-zero latency processing. 

* **State Persistence Layer:** Powered by **MongoDB Atlas**, utilizing non-blocking asynchronous streaming via **Motor** to execute high-throughput database operations.
* **API Ingress Boundary:** Built on **FastAPI**, implementing a highly scalable modular router layout (`/api/auth`, `/api/employees`, `/api/email`, `/api/scheduler`).
* **Cross-Origin Crosstalk:** Enabled securely via strict CORS middleware configurations, allowing local frontends to safely access localized or cloud backend parameters.

```text
[ React Frontend (Vite/Local) ] 
               │
               ▼  (HTTP JSON Payloads / JWT Bearer Auth)
    [ FastAPI Ingress Layer ]
               │
      ┌────────┼────────┬────────┐
      ▼        ▼        ▼        ▼
   [Auth] [Employee] [Email] [Scheduler]
      │        │        │        │
      └────────┼────────┴────────┘
               ▼
   [ Motor Async Driver ] ──────► [ Cloud MongoDB Atlas ]
               │
               ├────────────────► [ Resend Mailing Service ]
               └────────────────► [ Gemini Core AI Engine ]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
from .openAiApi import router as openAiRouter

app = FastAPI()

# Autoriser les requêtes CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Remplacez par les origines autorisées si nécessaire
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Créer un routeur

app.include_router(openAiRouter, prefix="/api", tags=["OpenAI"])


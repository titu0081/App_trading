from fastapi import FastAPI

#Inicializar la aplicacion FastAPI
app = FastAPI(
    title="Trading Backend API",
    description="API para el backend de trading",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de Trading Backend"}
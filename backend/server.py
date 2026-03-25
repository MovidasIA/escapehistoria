from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ BASIC MODELS ============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# ============ ESCAPE ROOM MODELS ============

class GroupProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    group_id: str
    group_name: str
    stations_completed: List[bool] = Field(default_factory=lambda: [False, False, False, False])

class GameState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timer_seconds: int = 600
    timer_running: bool = False
    timer_started_at: Optional[str] = None
    current_phase: int = 1
    groups: Dict[str, GroupProgress] = Field(default_factory=dict)
    help_requests: List[Dict] = Field(default_factory=list)
    sound_enabled: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class HelpRequest(BaseModel):
    group_id: str
    group_name: str
    message: str = "Solicitud de ayuda"

class StationUpdate(BaseModel):
    group_id: str
    station_index: int
    completed: bool

class TimerUpdate(BaseModel):
    timer_seconds: Optional[int] = None
    timer_running: Optional[bool] = None

class PhaseUpdate(BaseModel):
    phase: int

# ============ GAME STATE ============

GAME_STATE: Optional[GameState] = None

GROUPS = {
    "comerrocas": GroupProgress(group_id="comerrocas", group_name="Los Comerrocas"),
    "silfos": GroupProgress(group_id="silfos", group_name="Los Silfos Nocturnos"),
    "fuegos": GroupProgress(group_id="fuegos", group_name="Los Fuegos Fatuos"),
    "diminutenses": GroupProgress(group_id="diminutenses", group_name="Los diminutenses"),
}

ORACLE_MESSAGES = {
    1: {
        "title": "Estación 1: El Alfabeto del Desván",
        "riddle": "Buscadores de historias, estáis en el desván donde todo comenzó. Pero la Nada ha pasado por aquí y ha desordenado los recuerdos de Atreyu: las imágenes de sus aventuras se han separado de sus nombres y el tiempo se ha roto.\n\nVuestras órdenes son claras:\n\n🔗 El Vínculo: Emparejad cada ilustración con su título correcto. Observad los detalles, pues el engaño acecha en cada sombra.\n\n📜 La Cronología: Ordenad las 13 parejas desde el principio de la historia hasta el encuentro con el Viejo de la Montaña Errante.\n\n🪞 El Reflejo: ¡No giréis las cartas todavía! Solo cuando estéis seguros del orden, dadles la vuelta. Si la frase resultante tiene sentido, habréis ganado.",
        "hint": "Vuestro Botín: Mirad el reverso de las imágenes. Allí encontraréis el 'Reflejo del Espejo'. Anotad en vuestro Diario qué letra real corresponde a cada letra cifrada. Sin ese código, estaréis perdidos en la siguiente etapa."
    },
    2: {
        "title": "Estación 2: El Susurro de la Nada",
        "riddle": "¡Habéis restaurado el orden! Pero el tiempo corre y la Nada sigue avanzando. Tenéis ante vosotros un mensaje que parece ruido, palabras rotas enviadas por la Emperatriz Infantil antes de que su voz se apague.\n\nPara avanzar debéis recordar:\n\n🪞 La Ley del Espejo: Usad el código que descubristeis en el desván. Recordad que un espejo funciona en dos direcciones: si vuestra tabla dice que la A es la Z, en este pergamino la Z será siempre una A.\n\n📜 El Mensaje Oculto: Traducid con paciencia quirúrgica. Un solo error y el mensaje perderá su poder.\n\nVO HRONXRL VH OZ OOZVE WVO LIZXFOL",
        "hint": "Cuando tengáis la frase completa, no la gritéis. Acercaos al Maestro en absoluto silencio y susurradle la respuesta al oído. Solo así recibiréis la llave del Oráculo."
    },
    3: {
        "title": "Estación 3: El Viaje de Atreyu",
        "riddle": "¡Buscadores! Atreyu y Fújur se encuentran ya muy cerca de su destino, pero la Nada está borrando los límites del mapa y el cansancio empieza a pasar factura. Para llegar a la Torre de Marfil, no solo necesitan valor; necesitan gestionar con precisión de sabio sus recursos.\n\nUn ser de Fantasía les ha dado las coordenadas exactas, pero están protegidas por un enigma de medidas. Si falláis en el cálculo de sus provisiones o de la distancia que les separa de la Emperatriz, el Dragón de la Suerte perderá el rumbo.\n\nVuestro Desafío Matemático:\n\n💧 El Agua Mágica: Llevan 3 cantimploras de 750 ml cada una. ¿Cuántos litros de agua llevan en total?\n\n🍞 El Alimento del Guerrero: Llevan 2 sacos de comida de 1,5 kg cada uno. ¿Cuántos gramos de comida tienen para el camino?\n\n🗺️ La Última Etapa: Desde su posición hasta la Torre de Marfil hay 4 km y 350 m. Ya han recorrido 1 km y 750 m. ¿Cuántos metros exactos les faltan por recorrer?",
        "hint": "La Clave del Oráculo: Una vez resueltos los tres enigmas, sumad la cifra de las unidades de los litros, el primer número de los gramos y el primer número de los metros. Ese será el número que debéis llevar a la siguiente estación."
    },
    4: {
        "title": "La voz de Uyulala",
        "riddle": "Habéis llegado a las Ruinas de Cristal, donde habita Uyulala. Ella conoce el secreto para salvar nuestro mundo, pero su existencia es pura música y solo habla mediante rimas. Si vuestro corazón no tiene ritmo, sus palabras se las llevará el viento.\n\nVuestro último desafío antes del cofre:\n\n🔮 La Palabra Perdida: La Nada ha borrado el final de la profecía. Debéis encontrar la palabra que falta para que el poema rime y recupere su magia.\n\n🎵 El Ritmo de la Sinalefa: Uyulala desliza las palabras unas con otras. Encontrad todas las sinalefas del poema para obtener la primera cifra del candado.\n\n📏 La Métrica y el Nombre: Calculad las sílabas del último verso y contad los nombres (sustantivos) de la segunda estrofa para obtener el resto del código.",
        "hint": "Atención: Si el candado no abre al primer intento, revisad vuestra métrica. El Oráculo no perdona ni una sola sílaba de más.",
        "has_code": True,
        "correct_code": "986"
    }
}

FINAL_CLUES = {
    "comerrocas": {
        "title": "La Pista del Oráculo",
        "message": "Para salvar Fantasía, hay que cruzar el umbral. Volved al libro prohibido y buscad la página exacta donde Bastian dejó de ser un lector para convertirse en un héroe. Entre sus hojas, el destino os aguarda."
    },
    "silfos": {
        "title": "La Pista del Oráculo", 
        "message": "Incluso en el rincón más seco del desván, la vida intenta brotar. Buscad entre las hojas de la selva verde que oxigena vuestra clase. En las raíces de la naturaleza está escondida vuestra recompensa."
    },
    "diminutenses": {
        "title": "La Pista del Oráculo",
        "message": "El conocimiento empieza con una pregunta, pero la Nada se alimenta de la duda. Buscad el símbolo del gran interrogante que vigila el aula. Mirad por encima de la duda y hallaréis la certeza."
    },
    "fuegos": {
        "title": "La Pista del Oráculo",
        "message": "En las tierras de la Gentuza crecen frutos extraños y anaranjados. Buscad en el corazón de la cosecha del desván; una de las calabazas guarda un secreto que no es de este mundo."
    }
}

async def get_or_create_game_state() -> GameState:
    global GAME_STATE
    if GAME_STATE is None:
        doc = await db.game_state.find_one({}, {"_id": 0})
        if doc:
            GAME_STATE = GameState(**doc)
        else:
            GAME_STATE = GameState(groups=GROUPS)
            await db.game_state.insert_one(GAME_STATE.model_dump())
    return GAME_STATE

async def save_game_state():
    global GAME_STATE
    if GAME_STATE:
        await db.game_state.replace_one(
            {"id": GAME_STATE.id},
            GAME_STATE.model_dump(),
            upsert=True
        )

# ============ BASIC ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "La Historia Interminable - Escape Room API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ============ ESCAPE ROOM ROUTES ============

@api_router.get("/game-state")
async def get_game_state():
    state = await get_or_create_game_state()
    return state.model_dump()

@api_router.post("/game-state/reset")
async def reset_game_state():
    global GAME_STATE
    await db.game_state.delete_many({})
    GAME_STATE = GameState(groups=GROUPS.copy())
    await save_game_state()
    return GAME_STATE.model_dump()

@api_router.patch("/game-state/timer")
async def update_timer(update: TimerUpdate):
    state = await get_or_create_game_state()
    if update.timer_seconds is not None:
        state.timer_seconds = update.timer_seconds
    if update.timer_running is not None:
        state.timer_running = update.timer_running
        if update.timer_running:
            state.timer_started_at = datetime.now(timezone.utc).isoformat()
        else:
            state.timer_started_at = None
    await save_game_state()
    return state.model_dump()

@api_router.patch("/game-state/phase")
async def update_phase(update: PhaseUpdate):
    state = await get_or_create_game_state()
    if 1 <= update.phase <= 5:
        state.current_phase = update.phase
        await save_game_state()
        return state.model_dump()
    raise HTTPException(status_code=400, detail="Phase must be between 1 and 5")

@api_router.patch("/game-state/station")
async def update_station(update: StationUpdate):
    state = await get_or_create_game_state()
    if update.group_id in state.groups:
        if 0 <= update.station_index < 4:
            state.groups[update.group_id].stations_completed[update.station_index] = update.completed
            await save_game_state()
            return state.model_dump()
    raise HTTPException(status_code=400, detail="Invalid group_id or station_index")

@api_router.post("/game-state/help-request")
async def request_help(request: HelpRequest):
    state = await get_or_create_game_state()
    help_req = {
        "id": str(uuid.uuid4()),
        "group_id": request.group_id,
        "group_name": request.group_name,
        "message": request.message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "resolved": False
    }
    state.help_requests.append(help_req)
    await save_game_state()
    return {"success": True, "request": help_req}

@api_router.patch("/game-state/help-request/{request_id}/resolve")
async def resolve_help_request(request_id: str):
    state = await get_or_create_game_state()
    for req in state.help_requests:
        if req["id"] == request_id:
            req["resolved"] = True
            await save_game_state()
            return {"success": True}
    raise HTTPException(status_code=404, detail="Help request not found")

@api_router.delete("/game-state/help-requests")
async def clear_help_requests():
    state = await get_or_create_game_state()
    state.help_requests = []
    await save_game_state()
    return {"success": True}

@api_router.get("/oracle/{station}")
async def get_oracle_message(station: int):
    if 1 <= station <= 4:
        return ORACLE_MESSAGES.get(station, {})
    raise HTTPException(status_code=400, detail="Station must be between 1 and 4")

@api_router.post("/oracle/verify-code")
async def verify_oracle_code(group_id: str, code: str):
    station_4 = ORACLE_MESSAGES.get(4, {})
    correct_code = station_4.get("correct_code", "")
    
    if code == correct_code:
        state = await get_or_create_game_state()
        if group_id in state.groups:
            state.groups[group_id].stations_completed[3] = True
            await save_game_state()
        
        final_clue = FINAL_CLUES.get(group_id, {})
        return {"success": True, "final_clue": final_clue}
    return {"success": False, "message": "Código incorrecto. El Oráculo no perdona los errores."}

@api_router.get("/oracle/final-clue/{group_id}")
async def get_final_clue(group_id: str):
    if group_id in FINAL_CLUES:
        return FINAL_CLUES[group_id]
    raise HTTPException(status_code=404, detail="Group not found")

@api_router.patch("/game-state/sound")
async def toggle_sound(enabled: bool):
    state = await get_or_create_game_state()
    state.sound_enabled = enabled
    await save_game_state()
    return {"sound_enabled": state.sound_enabled}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

from fastapi import APIRouter
from .staging.api import router as staging_router
from .agent import router as agent_router
from .library.api import router as library_router

router = APIRouter(
    prefix="/question",
    tags=["question"]
)

router.include_router(staging_router, prefix="/staging")
router.include_router(agent_router, prefix="/agent")
router.include_router(library_router, prefix="/library")

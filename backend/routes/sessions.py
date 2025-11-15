from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from database import get_session
from db_models import SaunaSession

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.get("/", response_model=List[SaunaSession])
async def list_sessions(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    sauna_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    """
    Get list of sauna sessions
    
    Parameters:
    - skip: Number of records to skip (for pagination)
    - limit: Maximum number of records to return (default: 100)
    - user_id: Filter by user ID (optional)
    - sauna_id: Filter by sauna ID (optional)
    """
    statement = select(SaunaSession)
    
    if user_id:
        statement = statement.where(SaunaSession.user_id == user_id)
    if sauna_id:
        statement = statement.where(SaunaSession.sauna_id == sauna_id)
    
    statement = statement.offset(skip).limit(limit)
    sessions = session.exec(statement).all()
    return sessions


@router.get("/{session_id}", response_model=SaunaSession)
async def get_session(session_id: int, session: Session = Depends(get_session)):
    """Get a specific sauna session by ID"""
    sauna_session = session.get(SaunaSession, session_id)
    if not sauna_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return sauna_session


@router.post("/", response_model=SaunaSession, status_code=201)
async def create_session(
    sauna_session: SaunaSession,
    session: Session = Depends(get_session)
):
    """Create a new sauna session"""
    session.add(sauna_session)
    session.commit()
    session.refresh(sauna_session)
    return sauna_session


@router.delete("/{session_id}", status_code=204)
async def delete_session(session_id: int, session: Session = Depends(get_session)):
    """Delete a sauna session"""
    sauna_session = session.get(SaunaSession, session_id)
    if not sauna_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.delete(sauna_session)
    session.commit()
    return None
